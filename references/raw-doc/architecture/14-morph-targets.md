---
title: Morph Targets
source: https://doc.babylonjs.com/lite/architecture/14-morph-targets/
section: Architecture
---

[API](https://doc.babylonjs.com/lite/typedoc/)

[Babylon Lite](https://doc.babylonjs.com/lite/)\|

[Architecture](https://doc.babylonjs.com/lite/architecture/)\|

[Morph Targets](https://doc.babylonjs.com/lite/architecture/14-morph-targets/)

…\|

[Babylon Lite](https://doc.babylonjs.com/lite/)\|

[Architecture](https://doc.babylonjs.com/lite/architecture/)\|

[Morph Targets](https://doc.babylonjs.com/lite/architecture/14-morph-targets/)

[Babylon.js](https://doc.babylonjs.com/) [Babylon Lite](https://doc.babylonjs.com/lite/)

Filter

Filter

- [Welcome](https://doc.babylonjs.com/lite/)

- [Getting Started](https://doc.babylonjs.com/lite/01-getting-started/)

- [Feature Comparison](https://doc.babylonjs.com/lite/02-feature-comparison/)

- [Porting Guide](https://doc.babylonjs.com/lite/03-porting-guide/)

- [Playground](https://doc.babylonjs.com/lite/04-playground/)

- [Headless Null Engine](https://doc.babylonjs.com/lite/05-headless-null-engine/)

- [Architecture](https://doc.babylonjs.com/lite/architecture/00-overview/)


# Module: Morph Targets (Blend Shapes)

### Table Of Contents

[Module: Morph Targets (Blend Shapes)](https://doc.babylonjs.com/lite/architecture/14-morph-targets/#module-morph-targets-blend-shapes) [Purpose](https://doc.babylonjs.com/lite/architecture/14-morph-targets/#purpose) [Public API Surface](https://doc.babylonjs.com/lite/architecture/14-morph-targets/#public-api-surface) [Interfaces](https://doc.babylonjs.com/lite/architecture/14-morph-targets/#interfaces) [Data on Existing Types](https://doc.babylonjs.com/lite/architecture/14-morph-targets/#data-on-existing-types) [Feature Flag](https://doc.babylonjs.com/lite/architecture/14-morph-targets/#feature-flag) [Internal Architecture](https://doc.babylonjs.com/lite/architecture/14-morph-targets/#internal-architecture) [Data Flow](https://doc.babylonjs.com/lite/architecture/14-morph-targets/#data-flow) [Tiled Texture Layout](https://doc.babylonjs.com/lite/architecture/14-morph-targets/#tiled-texture-layout) [Weights UBO Layout — 32 bytes](https://doc.babylonjs.com/lite/architecture/14-morph-targets/#weights-ubo-layout--32-bytes) [Pipeline Configuration](https://doc.babylonjs.com/lite/architecture/14-morph-targets/#pipeline-configuration) [Feature Flag Effects (`MSH_HAS_MORPH_TARGETS = 1 << 3`)](https://doc.babylonjs.com/lite/architecture/14-morph-targets/#feature-flag-effects-msh_has_morph_targets--1--3) [Bind Group Integration (Group 1 — Per-Mesh)](https://doc.babylonjs.com/lite/architecture/14-morph-targets/#bind-group-integration-group-1--per-mesh) [Shader Logic](https://doc.babylonjs.com/lite/architecture/14-morph-targets/#shader-logic) [WGSL Morph Struct](https://doc.babylonjs.com/lite/architecture/14-morph-targets/#wgsl-morph-struct) [Vertex Shader Morph Blending](https://doc.babylonjs.com/lite/architecture/14-morph-targets/#vertex-shader-morph-blending) [State Machine / Lifecycle](https://doc.babylonjs.com/lite/architecture/14-morph-targets/#state-machine--lifecycle) [Initialization (in `load-gltf.ts`)](https://doc.babylonjs.com/lite/architecture/14-morph-targets/#initialization-in-load-gltfts) [Per-Frame (in `skeleton-updater.ts`)](https://doc.babylonjs.com/lite/architecture/14-morph-targets/#per-frame-in-skeleton-updaterts) [Rendering (in `pbr-shader.ts` vertex stage)](https://doc.babylonjs.com/lite/architecture/14-morph-targets/#rendering-in-pbr-shaderts-vertex-stage) [Babylon.js Equivalence Map](https://doc.babylonjs.com/lite/architecture/14-morph-targets/#babylonjs-equivalence-map) [Dependencies](https://doc.babylonjs.com/lite/architecture/14-morph-targets/#dependencies) [Test Specification](https://doc.babylonjs.com/lite/architecture/14-morph-targets/#test-specification) [File Manifest](https://doc.babylonjs.com/lite/architecture/14-morph-targets/#file-manifest) [Limitations](https://doc.babylonjs.com/lite/architecture/14-morph-targets/#limitations)

> Package path: `packages/babylon-lite/src/` (cross-cutting: loader, animation, material)

## Purpose

Morph targets (aka blend shapes) allow per-vertex position and normal deltas to deform a mesh at runtime, driven by weight values from glTF animations. Used for facial animation, mouth shapes, and other fine-grained mesh deformation. Weights are evaluated per-frame from glTF animation channels and uploaded to a uniform buffer; the vertex shader blends morph deltas before skeletal deformation.

* * *

## Public API Surface

### Interfaces

```typescript
/** Morph binding — links a node to its morph target weights buffer. */
export interface MorphBinding {
    nodeIdx: number; // glTF node index this binding belongs to
    targetCount: number; // number of morph targets (max 4)
    weightsBuffer: GPUBuffer; // 32-byte UBO: vec4<f32> weights + u32 count + u32 texWidth + u32 rowsPerBand + u32 pad
}
```

### Data on Existing Types

```typescript
// GltfAnimationData (animation/types.ts) — extended with:
export interface GltfAnimationData {
    // ...existing fields...
    morphBindings: MorphBinding[]; // alongside skeletons
}

// MeshGPU (mesh/mesh.ts) — extended with morph fields:
interface MeshGPU {
    // ...existing fields...
    morphTexture?: GPUTexture; // rgba32float tiled texture with all deltas
    morphTextureView?: GPUTextureView;
    morphWeightsBuffer?: GPUBuffer; // 32-byte UBO
    morphTargetCount?: number;
}
```

### Feature Flag

```typescript
// mesh-features.ts
export const MSH_HAS_MORPH_TARGETS = 1 << 3;
```

* * *

## Internal Architecture

### Data Flow

```javascript
glTF file
  ↓
load-gltf.ts: parse primitive.targets[]
  ├── Each target has POSITION + NORMAL accessors → Float32Array deltas
  ├── Initial weights from mesh.weights[]
  ├── Pack all deltas into a single rgba32float 2D texture (tiled layout)
  └── Create 32-byte weights UBO with initial values
  ↓
MeshGPU.morphTexture + MeshGPU.morphWeightsBuffer
  ↓
skeleton-updater.ts: per-frame PATH_WEIGHTS evaluation
  └── Writes to first 16 bytes of weights UBO (vec4 weights)
  ↓
pbr-shader.ts: vertex shader blends deltas before skeletal deformation
```

### Tiled Texture Layout

The morph texture uses a 2D tiled layout to handle meshes with more vertices than the WebGPU max texture dimension (8192 default):

| Parameter | Formula |
| --- | --- |
| Parameter<br>`texWidth` | Formula<br>`min(vertexCount, 2048)` |
| Parameter<br>`rowsPerBand` | Formula<br>`ceil(vertexCount / texWidth)` |
| Parameter<br>Band order | Formula<br>target0-position, target0-normal, target1-position, target1-normal, ... |
| Parameter<br>Total height | Formula<br>`numTargets × 2 × rowsPerBand` |
| Parameter<br>Vertex lookup | Formula<br>`col = v % texWidth`, `row = bandBase + floor(v / texWidth)` |

GPU format: `rgba32float`, unfilterable-float sample type (same approach as the bone texture).

### Weights UBO Layout — 32 bytes

| Offset (bytes) | Size | Content |
| --- | --- | --- |
| Offset (bytes)<br>0 | Size<br>16B | Content<br>`vec4<f32> weights` — morph target weights (max 4) |
| Offset (bytes)<br>16 | Size<br>4B | Content<br>`u32 count` — number of active morph targets |
| Offset (bytes)<br>20 | Size<br>4B | Content<br>`u32 texWidth` — texture row width in texels |
| Offset (bytes)<br>24 | Size<br>4B | Content<br>`u32 rowsPerBand` — rows per (target, attribute) band |
| Offset (bytes)<br>28 | Size<br>4B | Content<br>`u32 pad` — padding to 32-byte alignment |

Per-frame updates write only the first 16 bytes (weights). The `count`, `texWidth`, and `rowsPerBand` fields are immutable after creation.

* * *

## Pipeline Configuration

### Feature Flag Effects (`MSH_HAS_MORPH_TARGETS = 1 << 3`)

When the flag is set:

1. **Shader composition** — Adds morph struct definition, morph texture binding, and blending code to the vertex shader.
2. **Bind group layout** — Adds morph texture entry (unfilterable-float, 2d) and morph weights UBO entry to the per-mesh bind group layout.
3. **Bind group creation** — Adds morph texture view and morph weights buffer to the per-mesh bind group.

### Bind Group Integration (Group 1 — Per-Mesh)

| Binding | Resource | Condition |
| --- | --- | --- |
| Binding<br>0 | Resource<br>Mesh UBO | Condition<br>Always |
| Binding<br>1 | Resource<br>Bone texture | Condition<br>If skeleton |
| Binding<br>2 | Resource<br>Morph texture | Condition<br>If morph targets |
| Binding<br>3 | Resource<br>Morph weights UBO | Condition<br>If morph targets |
| Binding<br>4+ | Resource<br>Material textures | Condition<br>Follow |

Exact binding slot indices shift depending on which optional entries are present.

* * *

## Shader Logic

### WGSL Morph Struct

```wgsl
struct MorphUniforms {
  weights: vec4<f32>,
  count: u32,
  texWidth: u32,
  rowsPerBand: u32,
  pad: u32,
};
```

### Vertex Shader Morph Blending

Applied **before** skeletal deformation:

```wgsl
var morphedPos = position;
var morphedNorm = normal;
let vid = vertexIndex;  // @builtin(vertex_index) — returns index buffer value
let col = i32(vid % morph.texWidth);
let rowInBand = i32(vid / morph.texWidth);
for (var i = 0u; i < morph.count; i = i + 1u) {
    let w = morph.weights[i];
    let posRow = i32(i * 2u) * i32(morph.rowsPerBand) + rowInBand;
    let normRow = i32(i * 2u + 1u) * i32(morph.rowsPerBand) + rowInBand;
    morphedPos += w * textureLoad(morphTargets, vec2<i32>(col, posRow), 0).xyz;
    morphedNorm += w * textureLoad(morphTargets, vec2<i32>(col, normRow), 0).xyz;
}
// Then proceed with skeletal deformation on morphedPos / morphedNorm
```

**Key detail**: `@builtin(vertex_index)` returns the index buffer value for indexed draws, so `vid` correctly maps to the per-vertex morph delta stored in the texture.

* * *

## State Machine / Lifecycle

### Initialization (in `load-gltf.ts`)

1. Parse `primitive.targets[]` — each target has POSITION and NORMAL accessors
2. Read initial weights from `mesh.weights[]` (default all zeros)
3. Compute tiled layout: `texWidth`, `rowsPerBand`, total height
4. Allocate `rgba32float` 2D texture (`texWidth × totalHeight`)
5. Fill texture row-by-row: for each target, write position band then normal band
6. Create 32-byte weights UBO, write initial weights + immutable layout params
7. Store on `MeshGPU`: `morphTexture`, `morphTextureView`, `morphWeightsBuffer`, `morphTargetCount`
8. Create `MorphBinding` entries for animation system

### Per-Frame (in `skeleton-updater.ts`)

```javascript
For each PATH_WEIGHTS animation channel:
  1. Evaluate weight sampler at current time → vec4 weights
  2. Look up MorphBinding[] by nodeIdx
  3. Write first 16 bytes of weightsBuffer (vec4 weights only)
```

### Rendering (in `pbr-shader.ts` vertex stage)

```javascript
1. Read morphedPos = base position
2. Read morphedNorm = base normal
3. For each active morph target (i < count):
   a. Compute texture coordinates from vertex_index + tiled layout
   b. textureLoad position delta, accumulate weighted
   c. textureLoad normal delta, accumulate weighted
4. Pass morphedPos/morphedNorm to skeletal deformation (if any)
5. Continue with standard vertex transform
```

* * *

## Babylon.js Equivalence Map

| Babylon Lite | Babylon.js |
| --- | --- |
| Babylon Lite<br>`MorphBinding` interface | Babylon.js<br>`MorphTargetManager` class |
| Babylon Lite<br>`morphTexture` (rgba32float tiled) | Babylon.js<br>`MorphTargetManager._textureFloat` |
| Babylon Lite<br>`morphWeightsBuffer` (32B UBO) | Babylon.js<br>`MorphTargetManager._influences` uniform |
| Babylon Lite<br>Vertex shader `textureLoad` loop | Babylon.js<br>`morphTargets.vertex.fx` shader include |
| Babylon Lite<br>`MSH_HAS_MORPH_TARGETS` flag | Babylon.js<br>`#define MORPHTARGETS` in shader defines |
| Babylon Lite<br>PATH\_WEIGHTS in `skeleton-updater.ts` | Babylon.js<br>`Animation.AllowMatricesInterpolation` \+ `MorphTargetManager.getTarget().influence` |
| Babylon Lite<br>Max 4 targets (vec4 weights) | Babylon.js<br>Configurable via `MorphTargetManager.numTargets` |
| Babylon Lite<br>Flat data + functions | Babylon.js<br>Full class hierarchy (`MorphTarget`, `MorphTargetManager`) |

**Same math, minimal code.** No class hierarchy — just a texture, a UBO, and a shader loop.

* * *

## Dependencies

- WebGPU `rgba32float` texture support (unfilterable-float)
- `@builtin(vertex_index)` in WGSL (returns index buffer value for indexed draws)
- Existing bone texture pattern (same unfilterable-float approach, same bind group slot strategy)
- glTF 2.0 morph target specification (`primitive.targets[]`, `mesh.weights[]`)

* * *

## Test Specification

| Test | Description |
| --- | --- |
| Test<br>Tiled layout math | Description<br>`vertexCount=5000, texWidth=2048, rowsPerBand=3` — verify dimensions |
| Test<br>Texture dimensions | Description<br>2 targets, 5000 verts → width=2048, height=2×2×3=12 |
| Test<br>Vertex lookup | Description<br>Vertex 4097 → col=1, rowInBand=2 (for texWidth=2048) |
| Test<br>Band ordering | Description<br>Target 1 normal band starts at row `(1×2+1)×rowsPerBand` |
| Test<br>UBO layout | Description<br>Total 32 bytes: 16B weights + 4B count + 4B texWidth + 4B rowsPerBand + 4B pad |
| Test<br>Initial weights | Description<br>`mesh.weights = [0.5, 0.3]` → UBO bytes 0–15 contain `[0.5, 0.3, 0, 0]` |
| Test<br>Immutable fields | Description<br>Per-frame update writes only first 16 bytes, not count/texWidth/rowsPerBand |
| Test<br>Feature flag | Description<br>`MSH_HAS_MORPH_TARGETS = 1 << 3 = 8` |
| Test<br>Morph-only animation | Description<br>Animation with PATH\_WEIGHTS but no skeleton plays correctly |
| Test<br>Max targets | Description<br>More than 4 targets in glTF → only first 4 used |

* * *

## File Manifest

| File | Role |
| --- | --- |
| File<br>`src/animation/types.ts` | Role<br>`MorphBinding` interface definition |
| File<br>`src/mesh/mesh.ts` | Role<br>`MeshGPU` morph fields (`morphTexture`, `morphWeightsBuffer`, etc.) |
| File<br>`src/loader-gltf/load-gltf.ts` | Role<br>Parse `primitive.targets[]`, create tiled texture + weights UBO |
| File<br>`src/animation/skeleton-updater.ts` | Role<br>PATH\_WEIGHTS evaluation, per-frame weight upload |
| File<br>`src/animation/animation-group.ts` | Role<br>Morph-only animation support (no skeleton required) |
| File<br>`src/material/pbr/pbr-shader.ts` | Role<br>Morph blending in vertex shader, feature flag, WGSL generation |
| File<br>`src/material/pbr/pbr-pipeline.ts` | Role<br>Morph entries in bind group layout and bind group |
| File<br>`src/material/pbr/pbr-renderable.ts` | Role<br>Morph detection and wiring during renderable creation |

* * *

## Limitations

- **Max 4 morph targets per mesh** — limited by `vec4<f32>` weights in the UBO.
- **POSITION and NORMAL deltas only** — TANGENT deltas from glTF are ignored.
- **PBR pipeline only** — morph targets are not supported in the standard material pipeline.

[![Babylon.js logo](https://doc.babylonjs.com/img/babylonidentity.svg)](https://doc.babylonjs.com/lite/)

[Babylon.js](https://doc.babylonjs.com/) [Babylon Lite](https://doc.babylonjs.com/lite/)

Filter

Filter

- [Welcome](https://doc.babylonjs.com/lite/)

- [Getting Started](https://doc.babylonjs.com/lite/01-getting-started/)

- [Feature Comparison](https://doc.babylonjs.com/lite/02-feature-comparison/)

- [Porting Guide](https://doc.babylonjs.com/lite/03-porting-guide/)

- [Playground](https://doc.babylonjs.com/lite/04-playground/)

- [Headless Null Engine](https://doc.babylonjs.com/lite/05-headless-null-engine/)

- [Architecture](https://doc.babylonjs.com/lite/architecture/00-overview/)