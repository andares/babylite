---
title: Standard Material
source: https://doc.babylonjs.com/lite/architecture/08-standard-material/
section: Architecture
---

[API](https://doc.babylonjs.com/lite/typedoc/)

[Babylon Lite](https://doc.babylonjs.com/lite/)\|

[Architecture](https://doc.babylonjs.com/lite/architecture/)\|

[Standard Material](https://doc.babylonjs.com/lite/architecture/08-standard-material/)

…\|

[Babylon Lite](https://doc.babylonjs.com/lite/)\|

[Architecture](https://doc.babylonjs.com/lite/architecture/)\|

[Standard Material](https://doc.babylonjs.com/lite/architecture/08-standard-material/)

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


# Module: Standard Material (Blinn-Phong)

### Table Of Contents

[Module: Standard Material (Blinn-Phong)](https://doc.babylonjs.com/lite/architecture/08-standard-material/#module-standard-material-blinn-phong) [Purpose](https://doc.babylonjs.com/lite/architecture/08-standard-material/#purpose) [ShaderFragment Composition System](https://doc.babylonjs.com/lite/architecture/08-standard-material/#shaderfragment-composition-system) [Composition Flow (Standard)](https://doc.babylonjs.com/lite/architecture/08-standard-material/#composition-flow-standard) [Opt-in Standard Mesh Feature Contract](https://doc.babylonjs.com/lite/architecture/08-standard-material/#opt-in-standard-mesh-feature-contract) [`_buildGroup` Pattern](https://doc.babylonjs.com/lite/architecture/08-standard-material/#_buildgroup-pattern) [Dynamic Feature Flags](https://doc.babylonjs.com/lite/architecture/08-standard-material/#dynamic-feature-flags) [Public API Surface](https://doc.babylonjs.com/lite/architecture/08-standard-material/#public-api-surface) [Types (`standard-material.ts`)](https://doc.babylonjs.com/lite/architecture/08-standard-material/#types-standard-materialts) [Vertex Colors (`enable-standard-vertex-colors.ts`)](https://doc.babylonjs.com/lite/architecture/08-standard-material/#vertex-colors-enable-standard-vertex-colorsts) [Optional texture setters](https://doc.babylonjs.com/lite/architecture/08-standard-material/#optional-texture-setters) [Opt-in root exports](https://doc.babylonjs.com/lite/architecture/08-standard-material/#opt-in-root-exports) [Pipeline (`standard-pipeline.ts`)](https://doc.babylonjs.com/lite/architecture/08-standard-material/#pipeline-standard-pipelinets) [Template (`standard-template.ts`)](https://doc.babylonjs.com/lite/architecture/08-standard-material/#template-standard-templatets) [Renderable (`standard-renderable.ts`)](https://doc.babylonjs.com/lite/architecture/08-standard-material/#renderable-standard-renderablets) [Material Views and Rebuild](https://doc.babylonjs.com/lite/architecture/08-standard-material/#material-views-and-rebuild) [Default Material Values](https://doc.babylonjs.com/lite/architecture/08-standard-material/#default-material-values) [Pipeline Configuration](https://doc.babylonjs.com/lite/architecture/08-standard-material/#pipeline-configuration) [Vertex Buffers (varies by features)](https://doc.babylonjs.com/lite/architecture/08-standard-material/#vertex-buffers-varies-by-features) [Pipeline State](https://doc.babylonjs.com/lite/architecture/08-standard-material/#pipeline-state) [Bind Group Layouts](https://doc.babylonjs.com/lite/architecture/08-standard-material/#bind-group-layouts) [Internal Architecture](https://doc.babylonjs.com/lite/architecture/08-standard-material/#internal-architecture) [Uniform Buffer Layouts](https://doc.babylonjs.com/lite/architecture/08-standard-material/#uniform-buffer-layouts) [Scene UBO (Group 0, Binding 0) — 352 bytes (canonical `SceneUniforms`)](https://doc.babylonjs.com/lite/architecture/08-standard-material/#scene-ubo-group-0-binding-0--352-bytes-canonical-sceneuniforms) [Mesh UBO (Group 1, Binding 0)](https://doc.babylonjs.com/lite/architecture/08-standard-material/#mesh-ubo-group-1-binding-0) [Lights UBO (Group 0, Binding 1) — 16-byte header + `MAX_LIGHTS × 64` bytes](https://doc.babylonjs.com/lite/architecture/08-standard-material/#lights-ubo-group-0-binding-1--16-byte-header--max_lights--64-bytes) [Material UBO (Group 1, Binding 1) — 96 bytes (24 floats)](https://doc.babylonjs.com/lite/architecture/08-standard-material/#material-ubo-group-1-binding-1--96-bytes-24-floats) [Shadow UBO (Group 1, Binding 5) — 96 bytes (if RECEIVE\_SHADOWS)](https://doc.babylonjs.com/lite/architecture/08-standard-material/#shadow-ubo-group-1-binding-5--96-bytes-if-receive_shadows) [UV UBO (Group 1, Binding 5) — 16 bytes (if NEEDS\_UV without shadow)](https://doc.babylonjs.com/lite/architecture/08-standard-material/#uv-ubo-group-1-binding-5--16-bytes-if-needs_uv-without-shadow) [Shader Template (`standard-template.ts`)](https://doc.babylonjs.com/lite/architecture/08-standard-material/#shader-template-standard-templatets) [Pipeline Caching (`standard-pipeline.ts`)](https://doc.babylonjs.com/lite/architecture/08-standard-material/#pipeline-caching-standard-pipelinets) [Renderable Builder (`standard-renderable.ts`)](https://doc.babylonjs.com/lite/architecture/08-standard-material/#renderable-builder-standard-renderablets) [Single-Mesh Rebuild Closure](https://doc.babylonjs.com/lite/architecture/08-standard-material/#single-mesh-rebuild-closure) [Fragment Modules](https://doc.babylonjs.com/lite/architecture/08-standard-material/#fragment-modules) [`normal-map-fragment.ts` — Bump/Normal Mapping](https://doc.babylonjs.com/lite/architecture/08-standard-material/#normal-map-fragmentts--bumpnormal-mapping) [`std-emissive-fragment.ts` — Emissive Texture](https://doc.babylonjs.com/lite/architecture/08-standard-material/#std-emissive-fragmentts--emissive-texture) [`std-specular-fragment.ts` — Specular Texture](https://doc.babylonjs.com/lite/architecture/08-standard-material/#std-specular-fragmentts--specular-texture) [`std-ambient-fragment.ts` — Ambient/Occlusion Texture](https://doc.babylonjs.com/lite/architecture/08-standard-material/#std-ambient-fragmentts--ambientocclusion-texture) [`std-lightmap-fragment.ts` — Lightmap Texture](https://doc.babylonjs.com/lite/architecture/08-standard-material/#std-lightmap-fragmentts--lightmap-texture) [`std-opacity-fragment.ts` — Opacity/Transparency Texture](https://doc.babylonjs.com/lite/architecture/08-standard-material/#std-opacity-fragmentts--opacitytransparency-texture) [`std-vertex-color-fragment.ts` — Mesh Vertex Colors](https://doc.babylonjs.com/lite/architecture/08-standard-material/#std-vertex-color-fragmentts--mesh-vertex-colors) [`std-reflection-fragment.ts` — Reflection Texture](https://doc.babylonjs.com/lite/architecture/08-standard-material/#std-reflection-fragmentts--reflection-texture) [`std-shadow-fragment.ts` — Shadow Receiving](https://doc.babylonjs.com/lite/architecture/08-standard-material/#std-shadow-fragmentts--shadow-receiving) [Shader Logic](https://doc.babylonjs.com/lite/architecture/08-standard-material/#shader-logic) [Vertex Shader (composed by template + fragments)](https://doc.babylonjs.com/lite/architecture/08-standard-material/#vertex-shader-composed-by-template--fragments) [Fragment Shader (composed by template + fragments)](https://doc.babylonjs.com/lite/architecture/08-standard-material/#fragment-shader-composed-by-template--fragments) [Blinn-Phong Lighting (`computeLighting`)](https://doc.babylonjs.com/lite/architecture/08-standard-material/#blinn-phong-lighting-computelighting) [ESM Shadow (if RECEIVE\_SHADOWS)](https://doc.babylonjs.com/lite/architecture/08-standard-material/#esm-shadow-if-receive_shadows) [Fog (`calcFogFactor`)](https://doc.babylonjs.com/lite/architecture/08-standard-material/#fog-calcfogfactor) [Final Composition](https://doc.babylonjs.com/lite/architecture/08-standard-material/#final-composition) [State Machine / Lifecycle](https://doc.babylonjs.com/lite/architecture/08-standard-material/#state-machine--lifecycle) [Babylon.js Equivalence Map](https://doc.babylonjs.com/lite/architecture/08-standard-material/#babylonjs-equivalence-map) [Dependencies](https://doc.babylonjs.com/lite/architecture/08-standard-material/#dependencies) [Test Specification](https://doc.babylonjs.com/lite/architecture/08-standard-material/#test-specification) [File Manifest](https://doc.babylonjs.com/lite/architecture/08-standard-material/#file-manifest)

> Package path: `packages/babylon-lite/src/material/standard/`
> Files: `standard-material.ts` (types), `create-standard-material.ts` (factory), `standard-group-builder.ts` (dynamic imports), `standard-template.ts` (shader template), `standard-pipeline.ts` (pipeline/binding/composed-shader caches), `standard-renderable.ts` (renderable builder and single-mesh rebuild closure), `standard-flags.ts` (feature flags and extension registry), `enable-standard-mesh-features.ts` (published opt-in API), `geometry-view.ts` / `standard-geometry-renderable.ts` / `standard-geometry-output-shader.ts` (geometry-pass reuse), `standard-geometry-feature-hooks.ts` (lazy geometry factories), `no-color-view.ts` (pass-specific material view)

## Purpose

The StandardMaterial module implements a Blinn-Phong shading model with point/directional light support, optional fog (linear, exponential, exponential-squared), optional diffuse texture, optional emissive texture, optional bump/normal-map texture, optional specular texture, optional ambient/occlusion texture, optional lightmap texture, optional opacity/transparency texture, optional reflection texture (spherical and planar modes), UV2 support for select texture channels, thin instances with per-instance color, `disableLighting` mode, and optional ESM/PCF shadow receiving. Explicit opt-ins add Standard-only mesh deformation/state for skeletal skinning and RGBA vertex color. The shared `enableMaterialUvTransform(material)` opt-in enables independent per-texture scale, offset, and rotation for Standard materials without retaining the UV-transform fragment in unrelated bundles. It matches the output of `BABYLON.StandardMaterial` with the corresponding defines active.

Shaders are **dynamically composed** via the `ShaderFragment` / `ShaderComposer` system — no raw `.wgsl` files. A `ShaderTemplate` (`standard-template.ts`) provides the base WGSL with slot markers; optional `ShaderFragment` modules (in `fragments/`) inject code into those slots. Only the fragments needed for a given mesh's features are composed, minimizing bundle size per the Size Pillar. Fragment modules are **dynamically imported** at build time so unused features are tree-shaken. The old `standard-textured-material.ts` was merged into this unified system.

## ShaderFragment Composition System

Standard material shaders are built using the same `ShaderComposer` architecture as PBR (defined in `src/shader/shader-composer.ts`):

1. **`ShaderTemplate`** (`standard-template.ts` → `createStandardTemplate()`) — provides base vertex/fragment WGSL with slot markers (e.g. `/*AC*/`, `/*AD*/`, `/*AT*/`, `/*BC*/`, `/*BA*/`, `/*SV*/`, `/*VB*/`), base UBO fields, base vertex attributes, base varyings, and base bindings for lights/material/diffuse.

2. **`ShaderFragment`** — each optional feature (normal mapping, emissive texture, specular texture, ambient texture, lightmap, opacity, reflection, shadows) is a fragment object with:
   - `id` — unique string identifier
   - `fragmentSlots` / `vertexSlots` — WGSL snippets keyed by slot name
   - `bindings` — `BindingDecl[]` for textures/samplers
   - `varyings` — additional inter-stage varyings (shadows)
   - `helperFunctions` / `vertexHelperFunctions` — WGSL helper code
3. **`composeShader(template, fragments)`** — topologically sorts fragments, merges UBO fields, assigns binding indices, replaces slot markers, and returns a `ComposedShader` with final WGSL + bind group layout descriptors.


### Composition Flow (Standard)

```javascript
standard-group-builder.ts:
  1. Scans meshes for needed features (bump, emissive, specular, etc.)
  2. Dynamically imports fog WGSL only when `scene.fog != null`
  3. Runs only mesh-feature dispatchers installed by explicit Standard enablers
  4. Dynamically imports only needed fragment modules
  5. Passes fragment factories plus the scene shader context to buildStandardMeshRenderables()

standard-renderable.ts (buildStandardMeshRenderables):
  1. Resolves MaterialOrView to source material state + render feature bits
  2. Lets registered mesh extensions contribute skeleton / 8-bone / vertex-color bits
  3. Per mesh: builds fragment list from material, mesh, shadow, morph, and instance features
  4. Calls composeStandardShader(features, meshFeatures, fragments, ..., sceneShader) → ComposedShader
  5. Calls getOrCreateStandardBindings() and getOrCreateStandardPipeline()
```

## Opt-in Standard Mesh Feature Contract

The deformation/vertex feature enablers are explicitly named exports from the root package entry:

```ts
import {
    enableStandardSkeleton,
    enableMaterialUvTransform,
    enableStandardVertexColors,
} from "@babylonjs/lite";
```

Call each enabler before `registerScene()` when the scene creates matching Standard meshes/material state. Enablers are idempotent and have no import-time registration side effects:

- `enableStandardSkeleton()` installs a mesh predicate and lazy fragment loader. The fragment reuses the material-agnostic shared skeleton shader fragment used by PBR; skeletal geometry velocity is a second lazy chunk loaded only by a velocity pass over a matching mesh.
- `enableStandardVertexColors()` installs RGBA vertex-color composition and draw-time color-buffer binding.
- `enableMaterialUvTransform(material)` marks a hand-built Standard material for independent texture transforms. Call it before `registerScene()`, then set `uScale`, `vScale`, `uOffset`, `vOffset`, or `uAng` on any bound `Texture2D`. The Standard group builder loads `std-uv-transform-fragment.ts` only when a marked material is present.
- `enableStandardUvOffset()` remains the lightweight shared-material translation path for `material.uvOffset`; absent offsets always resolve to `[0, 0]`.

The UV-transform fragment contributes one vertex-visible uniform buffer and only the varyings required by the material's active texture channels. Its fixed channel order is diffuse, emissive, bump, specular, ambient, lightmap, opacity. Each channel stores a 2x2 matrix plus translation; the matrix applies scale and `uAng` rotation around the UV origin, then translation. UV1 channels compose the existing `material.uvScale` / optional `material.uvOffset` first, while UV2 channels preserve the existing raw-UV2 behavior. `invertY` is folded into the channel transform. Texture transform fields are sampled when the renderable is built; later changes require `rebuildMaterial`.

The enablers register only scalar callbacks and lazy loaders. No module allocates a `Map`/`Set` or registers an extension at import time. If these root exports are unused, production scene bundles omit the deformation/offset chunks; a forward-only skeletal scene also does not load the geometry-velocity chunk.

## `_buildGroup` Pattern

`standard-material.ts` defines `standardGroupBuilder` (not exported), a `MeshGroupBuilder` function that dynamically imports `standard-renderable.js` and the needed fragment modules. This function is set as the `_buildGroup` field on every standard material created by `createStandardMaterial()`. At `startEngine()`, `scene.ts` groups meshes by builder identity so that all standard-material meshes are batched together for a single `buildStandardMeshRenderables()` call.

`standardGroupBuilder` detects which features are needed across all meshes and conditionally imports only the required fragment modules, plus `thin-instance-gpu.ts` when thin instances are present. Fog is a scene shader feature, not a material feature: the builder imports `std-fog-wgsl.ts` only for a fog-enabled scene and passes a `StandardSceneShaderContext` containing `STD_SCENE_FOG` plus the fog `ShaderFragment`. Mesh-feature fragment dispatch exists only after a published enabler installs it. This ensures zero bundle-size impact for unused features. The builder stores the `rebuildSingle` closure returned from `buildStandardMeshRenderables()` on `standardGroupBuilder._rebuildSingle` for material swaps, `rebuildMaterial()`, and per-pass material overrides.

Standard mesh vertex colors use a stricter opt-in seam because automatic color-buffer detection would add a dynamic-import predicate to every Standard scene. `enableStandardVertexColors()` installs the fragment factory before `registerScene()`. When the function is absent from a bundle, `_stdVertexColorFragment` is statically null and all color-buffer branches fold away, keeping non-feature scenes byte-identical.

## Dynamic Feature Flags

| Flag | Bit | Condition | Shader effect |
| --- | --- | --- | --- |
| Flag<br>`HAS_DIFFUSE_TEXTURE` | Bit<br>`1 << 0` | Condition<br>`material.diffuseTexture` | Shader effect<br>Diffuse texture sampling |
| Flag<br>`HAS_EMISSIVE_TEXTURE` | Bit<br>`1 << 1` | Condition<br>`material._emissiveTexture` | Shader effect<br>Emissive texture sampling |
| Flag<br>`HAS_BUMP_TEXTURE` | Bit<br>`1 << 2` | Condition<br>`material._bumpTexture` | Shader effect<br>Cotangent-frame normal mapping |
| Flag<br>`HAS_SPECULAR_TEXTURE` | Bit<br>`1 << 3` | Condition<br>`material._specularTexture` | Shader effect<br>Specular texture replaces specularColor |
| Flag<br>`HAS_AMBIENT_TEXTURE` | Bit<br>`1 << 4` | Condition<br>`material._ambientTexture` | Shader effect<br>Ambient occlusion multiply |
| Flag<br>`HAS_LIGHTMAP_TEXTURE` | Bit<br>`1 << 5` | Condition<br>`material._lightmapTexture` | Shader effect<br>Additive lightmap |
| Flag<br>`HAS_OPACITY_TEXTURE` | Bit<br>`1 << 6` | Condition<br>`material._opacityTexture` | Shader effect<br>Alpha/opacity texture |
| Flag<br>`LIGHTMAP_USES_UV2` | Bit<br>`1 << 7` | Condition<br>Lightmap on UV2 | Shader effect<br>UV2 attribute for lightmap |
| Flag<br>`AMBIENT_USES_UV2` | Bit<br>`1 << 8` | Condition<br>Ambient on UV2 | Shader effect<br>UV2 attribute for ambient |
| Flag<br>`DOUBLE_SIDED` | Bit<br>`1 << 9` | Condition<br>`!material.backFaceCulling` | Shader effect<br>`cullMode: 'none'` |
| Flag<br>`DIFFUSE_USES_UV2` | Bit<br>`1 << 10` | Condition<br>Diffuse on UV2 | Shader effect<br>UV2 attribute for diffuse |
| Flag<br>`SPECULAR_USES_UV2` | Bit<br>`1 << 11` | Condition<br>Specular on UV2 | Shader effect<br>UV2 attribute for specular |
| Flag<br>`OPACITY_FROM_RGB` | Bit<br>`1 << 12` | Condition<br>`material.opacityFromRGB` | Shader effect<br>Opacity from RGB luminance |
| Flag<br>`HAS_REFLECTION_TEXTURE` | Bit<br>`1 << 13` | Condition<br>`material._reflectionTexture` | Shader effect<br>Spherical/planar reflection |
| Flag<br>`DISABLE_LIGHTING` | Bit<br>`1 << 14` | Condition<br>`material.disableLighting` | Shader effect<br>Skip light loop, emissive-only output |
| Flag<br>`MATERIAL_ALPHA_BLEND` | Bit<br>`1 << 16` | Condition<br>`material.alpha < 1` | Shader effect<br>Alpha blend pipeline state |
| Flag<br>`HAS_CUBE_REFLECTION` | Bit<br>`1 << 17` | Condition<br>`material._reflectionCubeTexture` | Shader effect<br>Cube reflection sampling |
| Flag<br>`NO_COLOR_OUTPUT` | Bit<br>`1 << 18` | Condition<br>No-color material view | Shader effect<br>Fragment stage runs discard/alpha-test logic and writes no color |
| Flag<br>`HAS_DEPTH_EMISSIVE_TEXTURE` | Bit<br>`1 << 19` | Condition<br>Emissive texture has depth sample type | Shader effect<br>Depth texture emissive preview |
| Flag<br>`HAS_VERTEX_COLOR` | Bit<br>`1 << 23` | Condition<br>Enabler active + mesh color buffer | Shader effect<br>RGBA vertex color multiplies base color and alpha |
| Flag<br>`HAS_SKELETON` | Bit<br>`1 << 26` | Condition<br>Enabler active + mesh skeleton | Shader effect<br>Bone-texture skinning of position and normal |
| Flag<br>`HAS_SKELETON_8` | Bit<br>`1 << 27` | Condition<br>Skeleton has JOINTS\_1 / WEIGHTS\_1 | Shader effect<br>Adds the second four bone influences |
| Flag<br>`NEEDS_UV` | Bit<br>derived | Condition<br>Any texture present | Shader effect<br>UV vertex attribute |
| Flag<br>`NEEDS_UV2` | Bit<br>derived | Condition<br>Any `*_USES_UV2` flag | Shader effect<br>UV2 vertex attribute |

Thin-instance and shadow-receiver state are mesh feature bits in `material/mesh-features.ts`, separate from Standard material render features.

Vertex colors use `MSH_HAS_VERTEX_COLOR` plus the installed `_stdVertexColorFragment` factory rather than a Standard material bit. Once enabled via `enableStandardVertexColors()`, every Standard mesh with `mesh._gpu.colorBuffer` receives the vertex-color shader variant and buffer binding. RGB always multiplies the base color; the alpha channel is consumed (and folded into the alpha-test) only when the mesh opts in via `mesh.hasVertexAlpha` (Babylon `VERTEXALPHA`), which also sets `VERTEX_ALPHA | MATERIAL_ALPHA_BLEND` so the mesh source-over blends and sorts into the transparent phase. The dynamically loaded thin-instance fragment declares when per-instance RGBA is present, allowing the same `hasVertexAlpha` opt-in to set `MATERIAL_ALPHA_BLEND` without requiring a mesh vertex-color buffer. It deliberately does not set `VERTEX_ALPHA`, avoiding a redundant vertex-colour shader/cache variant when no such buffer or fragment exists. Standard geometry output remains vertex-color-only because thin-instance colors do not participate in that path's alpha classification.

`STD_SCENE_FOG` is a separate scene-feature bit. It is included in Standard binding/composed-shader cache keys but is never stored on a material.

Bindings and composed shaders are cached per `(features, meshFeatures, sceneFeatures, shadowVariant, stencilVariant)`. Pipelines are nested under those bindings and cached per complete render-target signature. A fog and non-fog scene sharing one `GPUDevice` therefore cannot share a composed shader, bind-group layout object, or pipeline even when all material and mesh feature bits match.

## Public API Surface

### Types (`standard-material.ts`)

```typescript
import type { MeshGroupBuilder } from "../../render/renderable.js";

/** StandardMaterial properties — plain data. */
export interface StandardMaterialProps extends Material {
    diffuseColor: [number, number, number];
    alpha: number;
    specularColor: [number, number, number];
    specularPower: number;
    emissiveColor: [number, number, number];
    ambientColor: [number, number, number];
    diffuseTexture: Texture2D | null;
    diffuseCoordIndex: 0 | 1;
    /** @internal Set via `setStandardEmissiveTexture()`. */
    _emissiveTexture?: Texture2D | null;
    /** @internal Set via `setStandardBumpTexture()`. */
    _bumpTexture?: Texture2D | null;
    bumpLevel: number;
    /** @internal Set via `setStandardSpecularTexture()`. */
    _specularTexture?: Texture2D | null;
    specularCoordIndex: 0 | 1;
    /** @internal Set via `setStandardAmbientTexture()`. */
    _ambientTexture?: Texture2D | null;
    ambientTexLevel: number;
    ambientCoordIndex: 0 | 1;
    /** @internal Set via `setStandardLightmapTexture()`. */
    _lightmapTexture?: Texture2D | null;
    lightmapLevel: number;
    lightmapCoordIndex: 0 | 1;
    /** @internal Set via `setStandardOpacityTexture()`. */
    _opacityTexture?: Texture2D | null;
    opacityLevel: number;
    opacityFromRGB: boolean;
    alphaCutOff: number;
    /** @internal Set via `setStandardReflectionTexture()`. */
    _reflectionTexture?: Texture2D | null;
    /** @internal Set via `setStandardReflectionCubeTexture()`. */
    _reflectionCubeTexture?: CubeTexture | null;
    reflectionLevel: number;
    reflectionCoordMode: 1 | 2;
    uvScale: [number, number];
    uvOffset?: [number, number];
    /** @internal True when enableMaterialUvTransform() enabled per-texture transforms. */
    _hasUvTx?: boolean;
    backFaceCulling: boolean;
    disableLighting: boolean;
}

/** Fog configuration — plain data. */
export interface FogConfig {
    mode: 0 | 1 | 2 | 3; // 0=off, 1=exp, 2=exp2, 3=linear
    density: number;
    start: number;
    end: number;
    color: [number, number, number];
}

/** Create StandardMaterial with Babylon defaults. Sets _buildGroup to standardGroupBuilder. */
export function createStandardMaterial(): StandardMaterialProps;

/** Collect all non-null textures for acquire/release tracking. */
export function collectStdBoundTextures(mat: StandardMaterialProps): Texture2D[];

/** Create a pass-specific no-color material view over a Standard source material. */
export function createStandardNoColorMaterialView(source: StandardMaterialProps): MaterialView;
```

### Vertex Colors (`enable-standard-vertex-colors.ts`)

```typescript
import { enableStandardVertexColors } from "babylon-lite";

/**
 * Enable RGBA mesh vertex colors for StandardMaterial.
 * Call once before registerScene().
 */
export function enableStandardVertexColors(): void;
```

The color buffer contract is four `f32` values per vertex. RGB always multiplies the Standard base color. Alpha is consumed only when the mesh opts in via `mesh.hasVertexAlpha` (Babylon `VERTEXALPHA`): the fragment then multiplies the running material alpha by `vColor.a`, folds `vColor.a` into the alpha-test cutoff, and the mesh source-over blends (depth-write off, transparent sort phase). Without the opt-in the vertex color is RGB-only. The same fragment participates in main-color, no-color/shadow, and Standard geometry-view shader composition. Per-thin-instance RGBA follows the same `hasVertexAlpha` opt-in for Standard forward transparency. Its lazy fragment marks the color as an alpha source, so the forward builder selects the transparent pipeline without enabling or binding the mesh vertex-color fragment; Standard geometry-view classification remains vertex-color-only.

### Optional texture setters

```typescript
export function setStandardEmissiveTexture(mat: StandardMaterialProps, texture: Texture2D | null): void;
export function setStandardBumpTexture(mat: StandardMaterialProps, texture: Texture2D | null): void;
export function setStandardSpecularTexture(mat: StandardMaterialProps, texture: Texture2D | null): void;
export function setStandardAmbientTexture(mat: StandardMaterialProps, texture: Texture2D | null): void;
export function setStandardLightmapTexture(mat: StandardMaterialProps, texture: Texture2D | null): void;
export function setStandardOpacityTexture(mat: StandardMaterialProps, texture: Texture2D | null): void;
export function setStandardReflectionTexture(mat: StandardMaterialProps, texture: Texture2D | null): void;
export function setStandardReflectionCubeTexture(mat: StandardMaterialProps, texture: CubeTexture | null): void;
```

Each setter lives in its own module and does exactly two things: stamp the `@internal` backing field and register its `StdExt`. **One setter per module is load-bearing** — a shared module's static imports would pull all eight shader fragments into every consumer and defeat the whole design.

Registration is synchronous and happens at call time; feature detection runs later, when the renderable is built, via the ext's `_detect(mat)`. Companion scalars (`bumpLevel`, `lightmapCoordIndex`, `opacityFromRGB`, …) can therefore be assigned in any order relative to the setter. Setting a texture after the material has already been built still requires `rebuildMaterial()`.

The backing fields are `@internal` (underscore-prefixed) so that a direct assignment — which would skip registration and silently render nothing — is a compile error. **The setter is the boundary:** every write to a backing field must go through it.

`_computeStandardMaterialFeatures` keeps only the always-present core bits (`HAS_DIFFUSE_TEXTURE`, `DIFFUSE_USES_UV2`, `DOUBLE_SIDED`, `DISABLE_LIGHTING`, `MATERIAL_ALPHA_BLEND`); every optional bit — including sub-bits such as `LIGHTMAP_USES_UV2`, `SPECULAR_USES_UV2`, `OPACITY_FROM_RGB`, and `HAS_DEPTH_EMISSIVE_TEXTURE` — is contributed by the owning extension's `_detect`. This mirrors `PbrExt.detect`.

`loadBabylon()` maps `.babylon` texture slots to these setters through per-slot dynamic imports, so a `.babylon` scene retains only the fragments its file actually references.

### Opt-in root exports

```typescript
export function enableStandardSkeleton(): void;
export function enableStandardUvOffset(): void;
export function enableMaterialUvTransform(material: PbrMaterialProps | StandardMaterialProps): boolean;
```

Skeletal skinning, UV translation, and RGBA vertex-color opt-ins are explicitly re-exported from the root `index.ts`. The source and emitted packages expose only the `"."` export; unused enablers and their lazy feature chunks are removed by tree-shaking.

### Pipeline (`standard-pipeline.ts`)

```typescript
// Feature flags (see Dynamic Feature Flags table above for full list)
export const HAS_DIFFUSE_TEXTURE = 1 << 0;
// ... (all flags as documented)

export function _computeStandardMaterialFeatures(mat: StandardMaterialProps): number;
export function getOrCreateStandardBindings(
    engine: EngineContextInternal,
    features: number,
    meshFeatures: number,
    fragments?: ShaderFragment[],
    shaderKey?: string,
    esmShadowDepthCode?: string,
    stencil?: StencilState | null,
    sceneShader?: StandardSceneShaderContext | null
): StandardShaderBindings;

export function getOrCreateStandardPipeline(engine: EngineContextInternal, sig: RenderTargetSignature, bindings: StandardShaderBindings): GPURenderPipeline;

export function clearStandardPipelineCache(): void;
export function releaseStandardPipelineVariant(variant: PipelineVariant): void;

// Re-exports from lights-ubo
export { LIGHTS_UBO_SIZE, getLightsUboSize, writeLightsUBO, refreshLightsUBO };
```

### Template (`standard-template.ts`)

```typescript
/** Configuration for standard shader template generation. */
export interface StandardTemplateConfig {
    _diffuse?: boolean;
    _needsUV: boolean;
    _needsUV2: boolean;
    _diffuseUsesUV2?: boolean;
    _disableLighting?: boolean;
    _noColorOutput?: boolean;
    _esmShadowOutput?: boolean;
    _hasMorph?: boolean;
}

/** Create a ShaderTemplate from standard material configuration. */
export function createStandardTemplate(config: StandardTemplateConfig, esmShadowDepthCode?: string): ShaderTemplate;
```

`StandardSceneShaderContext` is internal pure state:

```typescript
export interface StandardSceneShaderContext {
    readonly _features: number;
    readonly _fragments: readonly ShaderFragment[];
}
```

### Renderable (`standard-renderable.ts`)

```typescript
/** Fragment factories passed from standardGroupBuilder. */
export interface StdFragmentFactories {
    tiSync?: ThinInstanceSync;
    tiFragment?: ShaderFragment;
    bumpFragment?: ShaderFragment;
    shadowFragment?: (shadowLights: ShadowLightSlot[]) => ShaderFragment;
    emissiveFragment?: ShaderFragment;
    specularFragment?: (usesUV2: boolean) => ShaderFragment;
    ambientFragment?: (usesUV2: boolean) => ShaderFragment;
    lightmapFragment?: (usesUV2: boolean) => ShaderFragment;
    opacityFragment?: (fromRGB: boolean) => ShaderFragment;
    reflectionFragment?: ShaderFragment;
}

export function buildStandardMeshRenderables(scene: SceneContext, meshes: Mesh[], factories: StdFragmentFactories): MeshGroupBuildResult;
```

### Material Views and Rebuild

Standard renderables accept `MaterialOrView`. A plain material computes/stores `_renderFeatures = { features: _computeStandardMaterialFeatures(mat) }`. A view uses `view._renderFeatures` exactly while reading all uniform/texture state from `view.source`.

`createStandardNoColorMaterialView(source)` creates a view that ORs `NO_COLOR_OUTPUT` into the source material feature bits. This produces a Standard shader variant that runs discard/alpha-test code and writes no color, useful for passes that should execute the fragment stage without writing color.

The `rebuildSingle` closure returned from `buildStandardMeshRenderables()` is stored on `standardGroupBuilder._rebuildSingle`. It is used by material swaps, `rebuildMaterial()`, and `RenderTask.addMesh(mesh, { material })` per-pass overrides.

### Default Material Values

| Property | Default |
| --- | --- |
| Property<br>`diffuseColor` | Default<br>`[1, 1, 1]` |
| Property<br>`alpha` | Default<br>`1` |
| Property<br>`specularColor` | Default<br>`[1, 1, 1]` |
| Property<br>`specularPower` | Default<br>`64` |
| Property<br>`emissiveColor` | Default<br>`[0, 0, 0]` |
| Property<br>`ambientColor` | Default<br>`[0, 0, 0]` |
| Property<br>`diffuseTexture` | Default<br>`null` |
| Property<br>`diffuseCoordIndex` | Default<br>`0` |
| Property<br>`bumpLevel` | Default<br>`1` |
| Property<br>`specularCoordIndex` | Default<br>`0` |
| Property<br>`ambientTexLevel` | Default<br>`1` |
| Property<br>`ambientCoordIndex` | Default<br>`0` |
| Property<br>`lightmapLevel` | Default<br>`1` |
| Property<br>`lightmapCoordIndex` | Default<br>`1` |
| Property<br>`useLightmapAsShadowmap` | Default<br>`false` |
| Property<br>`opacityLevel` | Default<br>`1` |
| Property<br>`opacityFromRGB` | Default<br>`false` |
| Property<br>`alphaCutOff` | Default<br>`0` |
| Property<br>`reflectionLevel` | Default<br>`1` |
| Property<br>`reflectionCoordMode` | Default<br>`1` |
| Property<br>`uvScale` | Default<br>`[1, 1]` |
| Property<br>`backFaceCulling` | Default<br>`true` |
| Property<br>`disableLighting` | Default<br>`false` |

The eight optional texture fields have **no default** — they are absent (`undefined`) until the corresponding `setStandardXTexture()` runs. Omitting the `null` initializers is what lets a scene that never imports a setter drop the field, its extension, and its shader fragment entirely.

## Pipeline Configuration

### Vertex Buffers (varies by features)

**Base (always present):**

| Slot | Attribute | Format | Stride | Shader Location |
| --- | --- | --- | --- | --- |
| Slot<br>0 | Attribute<br>Position | Format<br>`float32x3` | Stride<br>12 bytes | Shader Location<br>`@location(0)` |
| Slot<br>1 | Attribute<br>Normal | Format<br>`float32x3` | Stride<br>12 bytes | Shader Location<br>`@location(1)` |

**Conditional (appended in order, slot numbers shift dynamically):**

| Attribute | Format | Stride | Step Mode | Shader Location(s) | When |
| --- | --- | --- | --- | --- | --- |
| Attribute<br>UV | Format<br>`float32x2` | Stride<br>8 bytes | Step Mode<br>`vertex` | Shader Location(s)<br>`@location(2)` | When<br>`NEEDS_UV` |
| Attribute<br>UV2 | Format<br>`float32x2` | Stride<br>8 bytes | Step Mode<br>`vertex` | Shader Location(s)<br>`@location(3)` | When<br>`NEEDS_UV2` |
| Attribute<br>Vertex color | Format<br>`float32x4` | Stride<br>16 bytes | Step Mode<br>`vertex` | Shader Location(s)<br>next free location | When<br>Vertex colors enabled and color buffer present |
| Attribute<br>Joints/weights | Format<br>`uint32x4` \+ `float32x4` | Stride<br>32 bytes across 2 buffers | Step Mode<br>`vertex` | Shader Location(s)<br>next 2 locations | When<br>`HAS_SKELETON` |
| Attribute<br>Joints1/weights1 | Format<br>`uint32x4` \+ `float32x4` | Stride<br>32 bytes across 2 buffers | Step Mode<br>`vertex` | Shader Location(s)<br>next 2 locations | When<br>`HAS_SKELETON_8` |
| Attribute<br>Instance matrix | Format<br>4× `float32x4` | Stride<br>64 bytes | Step Mode<br>`instance` | Shader Location(s)<br>`@location(N)..@location(N+3)` | When<br>`THIN_INSTANCES` |
| Attribute<br>Instance color | Format<br>`float32x4` | Stride<br>16 bytes | Step Mode<br>`instance` | Shader Location(s)<br>`@location(N+4)` | When<br>`THIN_INSTANCE_COLOR` |

### Pipeline State

| Setting | Value |
| --- | --- |
| Setting<br>Topology | Value<br>`triangle-list` |
| Setting<br>Cull mode | Value<br>`back` (or `none` if `DOUBLE_SIDED`) |
| Setting<br>Front face | Value<br>`ccw` |
| Setting<br>Depth format | Value<br>`depth24plus-stencil8` |
| Setting<br>Depth compare | Value<br>`greater-equal` |
| Setting<br>Depth write | Value<br>`true` |
| Setting<br>MSAA | Value<br>`count = msaaSamples` |
| Setting<br>Color target | Value<br>Canvas preferred format, no blend |

### Bind Group Layouts

**Group 0 — Scene**:

| Binding | Visibility | Type |
| --- | --- | --- |
| Binding<br>0 | Visibility<br>VERTEX \| FRAGMENT | Type<br>Uniform buffer (canonical Scene UBO, 352 bytes) |
| Binding<br>1 | Visibility<br>FRAGMENT | Type<br>Uniform buffer (scene-owned `LightsUniforms`) |

**Group 1 — Per-Mesh** (dynamic bindings based on features):

| Binding | Visibility | Type | Resource | When |
| --- | --- | --- | --- | --- |
| Binding<br>0 | Visibility<br>VERTEX \| FRAGMENT | Type<br>Uniform buffer | Resource<br>Mesh UBO (`world` \+ per-mesh light selection) | When<br>Always |
| Binding<br>1 | Visibility<br>FRAGMENT | Type<br>Uniform buffer | Resource<br>Material UBO (96B) | When<br>Always |
| Binding<br>2 | Visibility<br>FRAGMENT | Type<br>texture\_2d | Resource<br>Diffuse texture | When<br>HAS\_DIFFUSE\_TEXTURE |
| Binding<br>3 | Visibility<br>FRAGMENT | Type<br>sampler | Resource<br>Diffuse sampler | When<br>HAS\_DIFFUSE\_TEXTURE |
| Binding<br>4 | Visibility<br>VERTEX+FRAGMENT | Type<br>Uniform buffer | Resource<br>Shadow UBO (96B) or UV UBO (16B) | When<br>RECEIVE\_SHADOWS or NEEDS\_UV |
| Binding<br>next | Visibility<br>FRAGMENT | Type<br>texture/sampler pairs | Resource<br>Emissive, bump, specular, ambient, lightmap, opacity, reflection resources | When<br>Feature-dependent, assigned sequentially by the shader composer |
| Binding<br>next | Visibility<br>VERTEX | Type<br>texture\_2d | Resource<br>Skeleton bone matrix texture | When<br>`HAS_SKELETON` |

**Group 2 — Shadow Map** (only when RECEIVE\_SHADOWS):

| Binding | Visibility | Type | Resource |
| --- | --- | --- | --- |
| Binding<br>0 | Visibility<br>FRAGMENT | Type<br>texture\_2d | Resource<br>Shadow map texture |
| Binding<br>1 | Visibility<br>FRAGMENT | Type<br>sampler | Resource<br>Shadow map sampler |

## Internal Architecture

### Uniform Buffer Layouts

#### Scene UBO (Group 0, Binding 0) — 352 bytes (canonical `SceneUniforms`)

| Offset (bytes) | Floats | WGSL Type | Field |
| --- | --- | --- | --- |
| Offset (bytes)<br>0 | Floats<br>0–15 | WGSL Type<br>`mat4x4<f32>` | Field<br>`viewProjection` |
| Offset (bytes)<br>64 | Floats<br>16–31 | WGSL Type<br>`mat4x4<f32>` | Field<br>`view` |
| Offset (bytes)<br>128 | Floats<br>32–35 | WGSL Type<br>`vec4<f32>` | Field<br>`vEyePosition` (xyz + pad) |
| Offset (bytes)<br>144 | Floats<br>36–39 | WGSL Type<br>Scalars/padding | Field<br>environment rotation/padding |
| Offset (bytes)<br>160–303 | Floats<br>40–75 | WGSL Type<br>9 × SH vec3 + padding | Field<br>environment irradiance |
| Offset (bytes)<br>304 | Floats<br>76–79 | WGSL Type<br>Scalars/padding | Field<br>exposure, contrast, LOD scale |
| Offset (bytes)<br>320 | Floats<br>80–83 | WGSL Type<br>`vec4<f32>` | Field<br>`vFogInfos` (x=mode, y=start, z=end, w=density) |
| Offset (bytes)<br>336 | Floats<br>84–87 | WGSL Type<br>`vec4<f32>` | Field<br>`vFogColor` (rgb + pad) |

#### Mesh UBO (Group 1, Binding 0)

| Offset | WGSL Type | Field |
| --- | --- | --- |
| Offset<br>0 | WGSL Type<br>`mat4x4<f32>` | Field<br>`world` |
| Offset<br>64 | WGSL Type<br>`u32` | Field<br>`lc` |
| Offset<br>80.. | WGSL Type<br>`array<vec4<u32>, ceil(MAX_LIGHTS / 4)>` | Field<br>packed light indices into group-0 `LightsUniforms` |

#### Lights UBO (Group 0, Binding 1) — 16-byte header + `MAX_LIGHTS × 64` bytes

| Offset (bytes) | Type | Field |
| --- | --- | --- |
| Offset (bytes)<br>0–15 | Type<br>`u32 + padding` | Field<br>`count` header |
| Offset (bytes)<br>16 + N×64 + 0 | Type<br>`vec4<f32>` | Field<br>`vLightData` — xyz=position/dir, w=type |
| Offset (bytes)<br>16 + N×64 + 16 | Type<br>`vec4<f32>` | Field<br>`vLightDiffuse` — rgb=diffuse×intensity, a=range |
| Offset (bytes)<br>16 + N×64 + 32 | Type<br>`vec4<f32>` | Field<br>`vLightSpecular` — rgb=specular×intensity, a=spot exponent for spot lights |
| Offset (bytes)<br>16 + N×64 + 48 | Type<br>`vec4<f32>` | Field<br>`vLightDirection` — direction/cos half-angle for spot lights |

#### Material UBO (Group 1, Binding 1) — 96 bytes (24 floats)

| Offset (bytes) | Type | Field |
| --- | --- | --- |
| Offset (bytes)<br>0–15 | Type<br>`vec4<f32>` | Field<br>`vDiffuseColor` — rgb=diffuse, a=alpha |
| Offset (bytes)<br>16–31 | Type<br>`vec4<f32>` | Field<br>`vSpecularColor` — rgb=specular, a=specularPower |
| Offset (bytes)<br>32–43 | Type<br>`vec3<f32>` | Field<br>`vEmissiveColor` |
| Offset (bytes)<br>44–47 | Type<br>`f32` | Field<br>`bumpScale` (1.0 / bumpLevel) |
| Offset (bytes)<br>48–59 | Type<br>`vec3<f32>` | Field<br>`vAmbientColor` |
| Offset (bytes)<br>60–63 | Type<br>`f32` | Field<br>`textureLevel` (1.0 when NEEDS\_UV) |
| Offset (bytes)<br>64–67 | Type<br>`f32` | Field<br>`ambientTexLevel` |
| Offset (bytes)<br>68–71 | Type<br>`f32` | Field<br>`lightmapLevel` |
| Offset (bytes)<br>72–75 | Type<br>`f32` | Field<br>`opacityLevel` |
| Offset (bytes)<br>76–79 | Type<br>`f32` | Field<br>`alphaCutOff` |
| Offset (bytes)<br>80–83 | Type<br>`f32` | Field<br>`reflectionLevel` |
| Offset (bytes)<br>84–87 | Type<br>`f32` | Field<br>`reflectionCoordMode` (1=spherical, 2=planar) |
| Offset (bytes)<br>88–95 | Type<br>2× `f32` | Field<br>padding |

#### Shadow UBO (Group 1, Binding 5) — 96 bytes (if RECEIVE\_SHADOWS)

| Offset (bytes) | Type | Field |
| --- | --- | --- |
| Offset (bytes)<br>0–63 | Type<br>`mat4x4<f32>` | Field<br>`lightMatrix` |
| Offset (bytes)<br>64–79 | Type<br>`vec4<f32>` | Field<br>`depthValues` (x=near, y=far) |
| Offset (bytes)<br>80–95 | Type<br>`vec4<f32>` | Field<br>`uvScaleOffset` (x=uScale, y=vScale, z=uOffset, w=vOffset) |

#### UV UBO (Group 1, Binding 5) — 16 bytes (if NEEDS\_UV without shadow)

| Offset (bytes) | Type | Field |
| --- | --- | --- |
| Offset (bytes)<br>0–15 | Type<br>`vec4<f32>` | Field<br>`uvScaleOffset` (x=uScale, y=vScale, z=uOffset, w=vOffset); offset defaults to `[0, 0]` even when the opt-in is globally enabled but a material omits `uvOffset` |

### Shader Template (`standard-template.ts`)

`createStandardTemplate(config, esmShadowDepthCode?)` builds a `ShaderTemplate` with slot markers for fragment injection. The template provides:

**Always-present WGSL blocks (embedded in template):**

| Block | Contents | Included when |
| --- | --- | --- |
| Block<br>`LIGHTING_FN` | Contents<br>`computeLighting()` — Blinn-Phong over the mesh-selected subset of the scene-wide `MAX_LIGHTS` lights, shadow factors | Included when<br>Not `DISABLE_LIGHTING` |
| Block<br>`FOG_FN` | Contents<br>`calcFogFactor()` — linear/exp/exp2 from dynamically imported Standard fog WGSL | Included when<br>`STD_SCENE_FOG` and a color-producing pass |

**Template slot markers** (injected by `ShaderComposer`):

| Slot | Stage | Purpose |
| --- | --- | --- |
| Slot<br>`/*AC*/` | Stage<br>Fragment | Purpose<br>Normal perturbation (bump map) |
| Slot<br>`/*AD*/` | Stage<br>Fragment | Purpose<br>Ambient/shadow/reflection contributions |
| Slot<br>`/*AT*/` | Stage<br>Fragment | Purpose<br>Emissive/specular/opacity texture sampling |
| Slot<br>`/*BC*/` | Stage<br>Fragment | Purpose<br>Post-lighting composition (lightmap, instance color) |
| Slot<br>`/*BA*/` | Stage<br>Fragment | Purpose<br>Final alpha adjustments |
| Slot<br>`/*SV*/` | Stage<br>Fragment | Purpose<br>Variable initialization |
| Slot<br>`/*VB*/` | Stage<br>Vertex | Purpose<br>Shadow light-space transforms |
| Slot<br>`/*VR*/` | Stage<br>Vertex | Purpose<br>Pre-transform modifications |
| Slot<br>`/*VW*/` | Stage<br>Vertex | Purpose<br>World matrix override (skinning) |

**`disableLighting` path:** When `DISABLE_LIGHTING` is set, the template omits the lighting function, light loop, shadow factors, ambient, reflection, and lightmap. Output becomes `clamp(emissiveContrib * diffuseColor, 0, 1) * baseColor`.

**Per-instance color:** When `THIN_INSTANCE_COLOR` is set, a `vInstanceColor` varying passes from vertex to fragment. Applied after main composition in the `BC` slot as `color.rgb *= vInstanceColor.rgb`.

### Pipeline Caching (`standard-pipeline.ts`)

`getOrCreateStandardPipeline` keeps a per-`StandardShaderBindings``Map<targetSignatureKey(sig), GPURenderPipeline>`. BGLs are stable across signatures (only the pipeline depends on `sig`), so meshBGs validate against any pipeline produced for the same `(features, meshFeatures, sceneFeatures, variants)` bindings instance.

Composed shaders are also cached with that full shader key to avoid recomposition when only format/MSAA differs. Fog presence is mandatory in the key because fog changes emitted WGSL without changing material or mesh bits. The group-0 scene bind group is owned by `RenderTask`; Standard renderables bind only material/mesh/shadow groups.

Pipeline and composed shader caches are cleared on GPU device change.

### Renderable Builder (`standard-renderable.ts`)

`buildStandardMeshRenderables(scene, meshes, factories)`:

1. Resolves each mesh material or material view to source material state plus render features.
2. Applies enabled Standard mesh feature bits from the current mesh.
3. Builds fragment lists from feature flags + `StdFragmentFactories`.
4. Calls `composeStandardShader(features, meshFeatures, fragments, ..., sceneShader)`.
5. Creates/reuses sig-independent shader bindings and sig-specific pipelines.
6. Creates one `Renderable` per mesh (order = `mesh.renderOrder ?? (isTransparent ? 200 : 100)`).
7. Relies on `RenderTask` for the group-0 scene UBO and scene-owned lights UBO refresh.
8. Acquires textures for reference counting, registers cleanup disposables.

When thin instances are present, the draw function calls `tiSync(device, ti, pass, slot, hasInstanceColor)` to synchronize GPU buffers before each instanced draw, and uses `drawIndexed(indexCount, ti.count)` for instanced rendering.

### Single-Mesh Rebuild Closure

The `rebuildSingle(scene, mesh, materialOverride?)` closure returned from `buildStandardMeshRenderables()` rebuilds one mesh after a material swap or pass-specific override without rebuilding the entire scene. It accepts `MaterialOrView`, uses view render features with source material resources, computes material/mesh features and shader variant keys, creates/reuses shader bindings and pipelines, writes per-mesh light selections, builds optional shadow bind groups, and returns a `Renderable` that early-exits if the mesh material changed again unless it was built for an explicit override.

## Fragment Modules

All fragments live in `src/material/standard/fragments/` and export factory functions returning `ShaderFragment` objects.

### `normal-map-fragment.ts` — Bump/Normal Mapping

- **Factory**: `createNormalMapFragment(): ShaderFragment`
- **ID**: `"normal-map"`
- **Bindings**: `bumpTex` (texture2D), `bumpSampler` (sampler)
- **Helper WGSL**: `WGSL_PERTURB_NORMAL` — cotangent-frame normal perturbation from screen-space derivatives
- **Fragment slot**:

  - `AC` — `normalW = perturbNormal(input.vNormalW, input.vPositionW, input.vUV, mat.bumpScale)`

### `std-emissive-fragment.ts` — Emissive Texture

- **Factory**: `createStdEmissiveFragment(): ShaderFragment`
- **ID**: `"std-emissive"`
- **Bindings**: `emissiveTex` (texture2D), `emissiveSampler` (sampler)
- **Fragment slot**:

  - `AT` — `emissiveContrib = mat.vEmissiveColor * textureSample(emissiveTex, ..., input.vUV).rgb * mat.textureLevel`

### `std-specular-fragment.ts` — Specular Texture

- **Factory**: `createStdSpecularFragment(usesUV2: boolean): ShaderFragment`
- **ID**: `"std-specular"`
- **Bindings**: `specularTex` (texture2D), `specularSampler` (sampler)
- **Fragment slot**:

  - `AT` — `specularColor = textureSample(specularTex, ..., uv).rgb` (uses UV or UV2 based on `usesUV2`)

### `std-ambient-fragment.ts` — Ambient/Occlusion Texture

- **Factory**: `createStdAmbientFragment(usesUV2: boolean): ShaderFragment`
- **ID**: `"std-ambient"`
- **Bindings**: `ambientTex` (texture2D), `ambientSampler` (sampler)
- **Fragment slot**:

  - `AD` — `baseAmbientColor = textureSample(ambientTex, ..., uv).rgb * mat.ambientTexLevel`

### `std-lightmap-fragment.ts` — Lightmap Texture

- **Factory**: `createStdLightmapFragment(usesUV2: boolean): ShaderFragment`
- **ID**: `"std-lightmap"`
- **Bindings**: `lightmapTex` (texture2D), `lightmapSampler` (sampler)
- **Fragment slot**:

  - `BC` — additive lightmap: `color = vec4(color.rgb + textureSample(lightmapTex, ..., uv).rgb * mat.lightmapLevel, color.a)`

### `std-opacity-fragment.ts` — Opacity/Transparency Texture

- **Factory**: `createStdOpacityFragment(fromRGB: boolean): ShaderFragment`
- **ID**: `"std-opacity"`
- **Bindings**: `opacityTex` (texture2D), `opacitySampler` (sampler)
- **Fragment slot**:

  - `AT`— modulates alpha:

    - RGB mode (`fromRGB=true`): `alpha *= luminance(textureSample(...).rgb) * mat.opacityLevel`
    - Alpha mode: `alpha *= textureSample(...).a * mat.opacityLevel`

### `std-vertex-color-fragment.ts` — Mesh Vertex Colors

- **Factory**: `createStdVertexColorFragment(): ShaderFragment`
- **ID**: `"std-vertex-color"`
- **Vertex attribute**: `color: vec4<f32>` (`float32x4`, 16-byte stride)
- **Varying**: `vColor: vec4<f32>`
- **Vertex slot**:

  - `VB` — `out.vColor = color`
- **Fragment slot**:

  - `AT` — `baseColor *= input.vColor.rgb; alpha *= input.vColor.a`
- **Activation**: `enableStandardVertexColors()` installs the factory; only meshes with a color buffer use it.

### `std-reflection-fragment.ts` — Reflection Texture

- **Factory**: `createStdReflectionFragment(): ShaderFragment`
- **ID**: `"std-reflection"`
- **Bindings**: `reflectionTex` (texture2D), `reflectionSampler` (sampler)
- **Helper WGSL**: `computeSphericalCoords()`, `computePlanarCoords()`
- **Fragment slot**:

  - `AD` — chooses spherical vs planar coords via `mat.reflectionCoordMode`, samples reflection texture, writes `reflectionColor * mat.reflectionLevel`

### `std-shadow-fragment.ts` — Shadow Receiving

- **Factory**: `createStdShadowFragment(shadowLights: ShadowLightSlot[]): ShaderFragment`
- **ID**: `"std-shadow"`
- **Interface**: `ShadowLightSlot { lightIndex: number; shadowType: "esm" | "pcf" }`
- **Varyings**: per-light `vPosFromLight_<n>` (`vec4<f32>`), `vDepthMetric_<n>` (`f32`)
- **Bindings**: per-light shadow textures + samplers + `shadowInfo_<n>` uniform buffers (group `"shadow"`)
- **Helper WGSL**: per-light `shadowInfo_<n>Uniforms` struct, ESM (`computeShadowESM_<n>`, `computeFallOff_<n>`) and PCF (`computeShadowPCF_<n>`) functions
- **Vertex slot**:

  - `VB` — transforms world position into light space, computes depth metric
- **Fragment slot**:

  - `AD` — writes `shadowFactors[lightIndex]` per light via ESM or PCF

## Shader Logic

### Vertex Shader (composed by template + fragments)

```javascript
finalWorld = mesh.world
if skeleton: finalWorld = mesh.world × weightedBoneMatrix(joints, weights[, joints1, weights1])
worldPos = finalWorld × vec4(positionOrMorphedPosition, 1.0)
normalWorld = mat3x3(finalWorld[0].xyz, finalWorld[1].xyz, finalWorld[2].xyz)
vNormalW = normalize(normalWorld × normal)
clipPos = scene.viewProjection × worldPos
if scene fog: vFogDistance = (scene.view × worldPos).xyz
```

If NEEDS\_UV: `vDiffuseUV = uv × uvScaleOffset.xy + uvScaleOffset.zw`, where omitted `uvOffset` contributes `[0, 0]`.
If vertex colors are enabled and present: pass a `vec4<f32>``vColor` varying; fragment RGB always multiplies `baseColor`. Under the `mesh.hasVertexAlpha` opt-in (VERTEX\_ALPHA) alpha additionally multiplies the running `alpha` and the alpha-test comparison uses `vColor.a`; otherwise the vertex color is RGB-only.
If RECEIVE\_SHADOWS: `vPositionFromLight = shadow.lightMatrix × worldPos`, `vDepthMetric = (lightClip.z + near) / far`
If CSM: derive cascade-selection view Z from `(scene.view × vec4(vp, 1)).z` in the fragment shader; do not depend on the fog-only `vFogDistance` varying.

### Fragment Shader (composed by template + fragments)

#### Blinn-Phong Lighting (`computeLighting`)

```javascript
if lightData.w == 0:  // Point light
  direction = lightPos - fragmentPos
  attenuation = max(0, 1 - length(direction) / range)
  lightVectorW = normalize(direction)
else:                  // Directional light
  lightVectorW = normalize(-lightDir)
  attenuation = 1.0

NdotL = max(0, dot(N, L))
diffuse = NdotL × lightDiffuse × attenuation
H = normalize(V + L)
specComp = pow(max(0, dot(N, H)), max(1, glossiness))
specular = specComp × lightSpecular × attenuation
```

When vertex colors are enabled:

```javascript
baseColor *= vColor.rgb
alpha *= vColor.a
```

#### ESM Shadow (if RECEIVE\_SHADOWS)

```javascript
shadowPixelDepth = clamp(depthMetric, 0, 1)
shadowMapSample = textureSampleLevel(shadowTex, shadowSampler, uv, 0).x
esm = 1 - clamp(exp(min(87, depthScale × shadowPixelDepth)) × shadowMapSample, 0, 1 - darkness)
shadow = computeFallOff(esm, clipSpace.xy, frustumEdgeFalloff)
```

#### Fog (`calcFogFactor`)

```javascript
dist = length(vFogDistance)
mode 3 (linear):  fogCoeff = (end - dist) / (end - start)
mode 1 (exp):     fogCoeff = 1 / e^(dist × density)
mode 2 (exp2):    fogCoeff = 1 / e^(dist² × density²)
```

#### Final Composition

```javascript
baseColor = textureSample(diffuseTex, ...) × textureLevel     // if HAS_DIFFUSE_TEXTURE, else vec4(1)
emissiveTex = textureSample(emissiveTex, ...).rgb              // if HAS_EMISSIVE_TEXTURE
shadow = computeShadowWithESM(...)                             // if RECEIVE_SHADOWS, else 1.0

finalDiffuse = clamp(diffuseBase × shadow × diffuseColor + emissiveColor + ambientColor, 0, 1) × baseColor.rgb
finalSpecular = specularBase × shadow × specularColor
color = vec4(finalDiffuse + finalSpecular, alpha)
color = max(color, 0)
if fogMode > 0: color.rgb = mix(fogColor, color.rgb, fogCoeff)
```

## State Machine / Lifecycle

```javascript
addToScene(scene, mesh)            → mesh registered for deferred building
registerScene(scene)       → runs deferred builders and builds frame graph
  standardGroupBuilder()           → detects features, dynamically imports fragment modules
  buildStandardMeshRenderables()   → groups meshes by features, composes shaders
    composeStandardShader()        → createStandardTemplate() + composeShader(template, fragments)
    getOrCreatePipeline()          → cached pipeline + scene UBO
    createDynamicMeshGPU()         → per-mesh UBOs + bind groups
  → renderables + updater registered by buildScene
  render loop begins
    updater.update(engine)         → refreshes light/material state
    RenderTask updates each DrawBinding with its target dimensions
    DrawBinding.draw(pass, engine) → dispatches draw calls per mesh
  mesh.material = newMat           → triggers single-rebuild path
    buildSingleStandardRenderable()→ recomputes features, gets pipeline, creates mesh GPU resources
```

## Babylon.js Equivalence Map

| Babylon Lite | Babylon.js |
| --- | --- |
| Babylon Lite<br>`createStandardMaterial()` | Babylon.js<br>`new BABYLON.StandardMaterial("mat", scene)` |
| Babylon Lite<br>`HAS_DIFFUSE_TEXTURE` | Babylon.js<br>`#define DIFFUSE` |
| Babylon Lite<br>`HAS_EMISSIVE_TEXTURE` | Babylon.js<br>`#define EMISSIVE` |
| Babylon Lite<br>`RECEIVE_SHADOWS` | Babylon.js<br>`#define SHADOW0` |
| Babylon Lite<br>`HAS_BUMP_TEXTURE` | Babylon.js<br>`#define BUMP` |
| Babylon Lite<br>`HAS_SPECULAR_TEXTURE` | Babylon.js<br>`#define SPECULAR` |
| Babylon Lite<br>`HAS_AMBIENT_TEXTURE` | Babylon.js<br>`#define AMBIENT` |
| Babylon Lite<br>`HAS_LIGHTMAP_TEXTURE` | Babylon.js<br>`#define LIGHTMAP` |
| Babylon Lite<br>`HAS_OPACITY_TEXTURE` | Babylon.js<br>`#define OPACITY` |
| Babylon Lite<br>`HAS_REFLECTION_TEXTURE` | Babylon.js<br>`#define REFLECTION` |
| Babylon Lite<br>`THIN_INSTANCES` / `THIN_INSTANCE_COLOR` | Babylon.js<br>`mesh.thinInstanceSetBuffer(...)` |
| Babylon Lite<br>`material.disableLighting` | Babylon.js<br>`material.disableLighting` |
| Babylon Lite<br>`computeFeatures()` | Babylon.js<br>Internal define computation in `StandardMaterial._getEffect()` |
| Babylon Lite<br>`getOrCreatePipeline()` | Babylon.js<br>Pipeline cache in StandardMaterial |
| Babylon Lite<br>`createStandardTemplate()` \+ `composeShader()` | Babylon.js<br>GLSL shader generation from defines |
| Babylon Lite<br>`ShaderFragment` composition | Babylon.js<br>`#include` / `#define` preprocessor |
| Babylon Lite<br>`DrawBinding.update(context)` | Babylon.js<br>Per-mesh/material uniform refresh before draw |
| Babylon Lite<br>`buildSingleStandardRenderable()` | Babylon.js<br>`Material._markAllSubMeshesAsAllDirty()` |
| Babylon Lite<br>`computeLighting()` in shader | Babylon.js<br>`computeLighting()` in Babylon standard shader |
| Babylon Lite<br>`calcFogFactor()` | Babylon.js<br>`CalcFogFactor()` in Babylon |
| Babylon Lite<br>`computeShadowWithESM()` | Babylon.js<br>`computeShadowWithESM()` in Babylon |

## Dependencies

- **`standard-material.ts`**: Imports `Texture2D` from texture-2d, `computeUboLayout` from ubo-layout, `createStandardTemplate` from standard-template.
- **`standard-template.ts`**: Imports `ShaderTemplate`, `UboField`, `VertexAttribute`, `Varying`, `BindingDecl` from fragment-types, `WGSL_FOG` from wgsl-helpers.
- **`standard-pipeline.ts`**: Imports `createStandardTemplate` from standard-template, `composeShader` from shader-composer, types from standard-material, shadow generator types, lights UBO helpers.
- **`standard-renderable.ts`**: Imports pipeline functions from standard-pipeline, `ShaderFragment` from fragment-types, scene/engine/mesh/light types, material-view types, renderable interface, resource pool helpers, and returns the single-mesh rebuild closure.
- **`no-color-view.ts`**: Imports `createMaterialView` and Standard feature flags to create no-color material views without pulling the helper into ordinary Standard scenes.
- **Fragment modules** (`fragments/`): Each imports only `ShaderFragment` (and optionally `BindingDecl`, `Varying`) from `fragment-types.js`.
- **`thin-instance-gpu.ts`** (`src/mesh/`): Conditionally imported by `standardGroupBuilder` when thin instances are detected.
- **Depended on by**: Application code (via `createStandardMaterial`), mesh factories, skybox-cubemap (shares scene UBO layout).

## Test Specification

| Test | Description |
| --- | --- |
| Test<br>`createStandardMaterial defaults` | Description<br>All properties match documented defaults |
| Test<br>`pipeline cache hit` | Description<br>Same features+format+msaa → same variant object |
| Test<br>`pipeline cache miss on features` | Description<br>Different features → different variant |
| Test<br>`simple shader (features=0)` | Description<br>No UV attribute, no texture bindings |
| Test<br>`textured shader (features=1)` | Description<br>UV attribute added, diffuse texture bound |
| Test<br>`shadow shader (features=4)` | Description<br>Shadow UBO, shadow map bind group created |
| Test<br>`full shader (features=7)` | Description<br>All bindings present |
| Test<br>`mesh grouping` | Description<br>Meshes with same features share pipeline |
| Test<br>`Blinn-Phong NdotL=0` | Description<br>Diffuse = 0, specular = 0 |
| Test<br>`minimal Standard excludes fog` | Description<br>No fog helper or blend WGSL without a scene fog context |
| Test<br>`explicit fog composition` | Description<br>Fog helper + blend appear with `STD_SCENE_FOG` |
| Test<br>`fog cache separation` | Description<br>Fog/non-fog scenes sharing a device get distinct bindings/WGSL |
| Test<br>`default UV offset` | Description<br>Global UV-offset opt-in + missing material offset writes zero |
| Test<br>`Standard skeleton composition` | Description<br>Shared 4/8-bone fragment, bone binding, and vertex layouts |
| Test<br>`Standard vertex-color alpha` | Description<br>RGBA modulation precedes alpha-test and geometry mask |
| Test<br>`geometry deformation` | Description<br>Geometry shader/layout/bind/draw variants include morph, skeleton, and vertex color |
| Test<br>`root feature exports` | Description<br>Root declaration exposes each enabler with no package subpaths |
| Test<br>`single rebuild` | Description<br>Material swap rebuilds one mesh without full scene teardown |
| Test<br>`fragment composition` | Description<br>Bump fragment injects perturbNormal helper + AC slot code |
| Test<br>`shadow fragment ESM` | Description<br>ESM shadow factor computation per light |
| Test<br>`shadow fragment PCF` | Description<br>PCF shadow factor computation per light |
| Test<br>`scene267-standard-vertex-colors` | Description<br>Standard RGBA vertex-color interpolation matches BJS exactly |

## File Manifest

| File | Size | Purpose |
| --- | --- | --- |
| File<br>`src/material/standard/standard-material.ts` | Size<br>~299 lines | Purpose<br>Types (StandardMaterialProps, FogConfig), factory, collectStdBoundTextures, standardGroupBuilder with dynamic fragment imports |
| File<br>`src/material/standard/standard-template.ts` | Size<br>— | Purpose<br>`StandardTemplateConfig` \+ `createStandardTemplate()` — builds the minimal Blinn-Phong `ShaderTemplate`; fog is a dynamically loaded fragment |
| File<br>`src/material/standard/standard-pipeline.ts` | Size<br>— | Purpose<br>`composeStandardShader()`, full shader-context cache keys, mesh bind groups, UV transform writes, material UBO writes |
| File<br>`src/material/standard/standard-renderable.ts` | Size<br>— | Purpose<br>`StdFragmentFactories`, effective mesh features, per-scene shader context, composed bindings/pipelines, draw-time deformation buffers |
| File<br>`src/material/standard/enable-standard-vertex-colors.ts` | Size<br>— | Purpose<br>Canonical process-global opt-in that installs Standard RGBA vertex-color support while preserving byte-identical non-feature bundles |
| File<br>`src/material/standard/enable-standard-mesh-features.ts` | Size<br>— | Purpose<br>Published idempotent skeleton and UV-offset enablers |
| File<br>`src/material/standard/standard-geometry-feature-hooks.ts` | Size<br>— | Purpose<br>Scalar lazy-loader hook for opt-in skeletal geometry velocity |
| File<br>`src/material/standard/standard-geometry-skeleton-velocity.ts` | Size<br>— | Purpose<br>Double-buffered previous-bone textures loaded only by skeletal velocity passes |
| File<br>`src/material/standard/fragments/std-skeleton-fragment.ts` | Size<br>— | Purpose<br>Standard wrapper around the shared skeleton fragment; bone texture + joints/weights binding |
| File<br>`src/material/standard/std-fog-wgsl.ts` | Size<br>— | Purpose<br>Dynamically imported Standard fog fragment (varying, helper, and final blend) |
| File<br>`src/shader/fragments/skeleton-fragment.ts` | Size<br>— | Purpose<br>Material-agnostic 4/8-bone WGSL shared by PBR and Standard |
| File<br>`src/material/standard/standard-geometry-renderable.ts` | Size<br>— | Purpose<br>Geometry-pass Standard variant cache, layouts, bindings, updates, and draw buffers including deformation state |
| File<br>`src/material/standard/no-color-view.ts` | Size<br>~16 lines | Purpose<br>`createStandardNoColorMaterialView()` — pass-specific no-color material view helper |
| File<br>`src/material/standard/fragments/normal-map-fragment.ts` | Size<br>~33 lines | Purpose<br>Cotangent-frame bump/normal mapping fragment (`AC` slot) |
| File<br>`src/material/standard/fragments/std-emissive-fragment.ts` | Size<br>~17 lines | Purpose<br>Emissive texture sampling fragment (`AT` slot) |
| File<br>`src/material/standard/fragments/std-specular-fragment.ts` | Size<br>~18 lines | Purpose<br>Specular texture sampling fragment (`AT` slot, UV/UV2 aware) |
| File<br>`src/material/standard/fragments/std-ambient-fragment.ts` | Size<br>~18 lines | Purpose<br>Ambient/AO texture sampling fragment (`AD` slot, UV/UV2 aware) |
| File<br>`src/material/standard/fragments/std-lightmap-fragment.ts` | Size<br>~18 lines | Purpose<br>Additive lightmap fragment (`BC` slot, UV/UV2 aware) |
| File<br>`src/material/standard/fragments/std-opacity-fragment.ts` | Size<br>~20 lines | Purpose<br>Opacity texture fragment (`AT` slot, RGB or alpha mode) |
| File<br>`src/material/standard/fragments/std-vertex-color-fragment.ts` | Size<br>~20 lines | Purpose<br>RGBA vertex attribute/varying and base-color/alpha multiplication (`VB` \+ `AT` slots) |
| File<br>`src/material/standard/fragments/std-reflection-fragment.ts` | Size<br>~39 lines | Purpose<br>Spherical/planar reflection fragment (`AD` slot) |
| File<br>`src/material/standard/fragments/std-shadow-fragment.ts` | Size<br>~155 lines | Purpose<br>ESM/PCF shadow receiving fragment (per-light, `VB` \+ `AD` slots) |
| File<br>`src/mesh/thin-instance-gpu.ts` | Size<br>~50 lines | Purpose<br>`syncThinInstanceBuffers()` — uploads instance matrix/color vertex buffers |
| File<br>`src/shader/shader-composer.ts` | Size<br>~293 lines | Purpose<br>`composeShader()` — topological sort, UBO merge, binding assignment, slot injection |

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