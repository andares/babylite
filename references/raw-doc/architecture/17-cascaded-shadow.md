---
title: Cascaded Shadow
source: https://doc.babylonjs.com/lite/architecture/17-cascaded-shadow/
section: Architecture
---

[API](https://doc.babylonjs.com/lite/typedoc/)

[Babylon Lite](https://doc.babylonjs.com/lite/)\|

[Architecture](https://doc.babylonjs.com/lite/architecture/)\|

[Cascaded Shadow](https://doc.babylonjs.com/lite/architecture/17-cascaded-shadow/)

…\|

[Babylon Lite](https://doc.babylonjs.com/lite/)\|

[Architecture](https://doc.babylonjs.com/lite/architecture/)\|

[Cascaded Shadow](https://doc.babylonjs.com/lite/architecture/17-cascaded-shadow/)

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


# Module: Cascaded Shadow Maps (CSM)

### Table Of Contents

[Module: Cascaded Shadow Maps (CSM)](https://doc.babylonjs.com/lite/architecture/17-cascaded-shadow/#module-cascaded-shadow-maps-csm) [Purpose](https://doc.babylonjs.com/lite/architecture/17-cascaded-shadow/#purpose) [Public API Surface](https://doc.babylonjs.com/lite/architecture/17-cascaded-shadow/#public-api-surface) [Internal Architecture](https://doc.babylonjs.com/lite/architecture/17-cascaded-shadow/#internal-architecture) [`ShadowGenerator` extensions (shared interface, type-only)](https://doc.babylonjs.com/lite/architecture/17-cascaded-shadow/#shadowgenerator-extensions-shared-interface-type-only) [Static cache and refit gate](https://doc.babylonjs.com/lite/architecture/17-cascaded-shadow/#static-cache-and-refit-gate) [Receiver UBO layout (`_shadowUBO`, 320 bytes / 80 f32)](https://doc.babylonjs.com/lite/architecture/17-cascaded-shadow/#receiver-ubo-layout-_shadowubo-320-bytes--80-f32) [Shadow map texture](https://doc.babylonjs.com/lite/architecture/17-cascaded-shadow/#shadow-map-texture) [Pipeline Configuration](https://doc.babylonjs.com/lite/architecture/17-cascaded-shadow/#pipeline-configuration) [Shader Logic (WGSL outline)](https://doc.babylonjs.com/lite/architecture/17-cascaded-shadow/#shader-logic-wgsl-outline) [CSM Math (`csm-shadow-task-hooks.ts`)](https://doc.babylonjs.com/lite/architecture/17-cascaded-shadow/#csm-math-csm-shadow-task-hooksts) [Splits (`_computeCsmCascades`)](https://doc.babylonjs.com/lite/architecture/17-cascaded-shadow/#splits-_computecsmcascades) [Per-cascade matrix](https://doc.babylonjs.com/lite/architecture/17-cascaded-shadow/#per-cascade-matrix) [State Machine / Lifecycle](https://doc.babylonjs.com/lite/architecture/17-cascaded-shadow/#state-machine--lifecycle) [Babylon.js Equivalence Map](https://doc.babylonjs.com/lite/architecture/17-cascaded-shadow/#babylonjs-equivalence-map) [Bundle Discipline (no movement for unrelated scenes)](https://doc.babylonjs.com/lite/architecture/17-cascaded-shadow/#bundle-discipline-no-movement-for-unrelated-scenes) [Dependencies](https://doc.babylonjs.com/lite/architecture/17-cascaded-shadow/#dependencies) [Test Specification](https://doc.babylonjs.com/lite/architecture/17-cascaded-shadow/#test-specification) [File Manifest](https://doc.babylonjs.com/lite/architecture/17-cascaded-shadow/#file-manifest)

> Package paths:
> `packages/babylon-lite/src/shadow/csm-directional-shadow-generator.ts``packages/babylon-lite/src/shadow/csm-shadow-task-hooks.ts``packages/babylon-lite/src/shadow/csm-shadow-cache.ts``packages/babylon-lite/src/shadow/csm-refit-gate.ts``packages/babylon-lite/src/shader/fragments/csm-shadow-fragment-core.ts``packages/babylon-lite/src/material/standard/fragments/std-csm-shadow-fragment.ts`

## Purpose

Cascaded Shadow Maps for a **directional light**, matching Babylon.js
`CascadedShadowGenerator` with the default 5×5 PCF filter (`computeShadowWithCSMPCF5`).
The camera view frustum is split into N depth slices (cascades); each cascade gets
its own orthographic shadow map fit tightly to that slice, rendered into one layer
of a `depth32float``texture_2d_array`. The receiver selects a cascade per fragment
from the camera-view-space depth and samples that array layer with PCF5, optionally
cross-fading into the next cascade near the slice boundary.

All substantive CSM code lives in the four modules above plus a byte-minimal set of
shared edits (see _Bundle Discipline_), so ESM/PCF scenes are byte-unaffected.

## Public API Surface

```ts
interface CsmDirectionalShadowGeneratorConfig {
    mapSize?: number; // per-cascade square resolution, default 1024
    numCascades?: number; // default 4 (max 4)
    lambda?: number; // log/uniform split blend 0..1, default 0.5
    cascadeBlendPercentage?: number; // cross-fade fraction, default 0.1 (0 disables)
    stabilizeCascades?: boolean; // bounding-sphere fit (no shimmer), default false
    shadowMaxZ?: number; // max shadow distance, default = camera far plane
    bias?: number; // depth bias, default 0.00005
    worldSpaceBias?: number; // caster depth offset in world units; supplied non-positive/non-finite values disable bias
    darkness?: number; // 0 = black shadow, 1 = no shadow, default 0
    frustumEdgeFalloff?: number; // soft cascade-edge fade 0..1, default 0
    forceRefreshEveryFrame?: boolean; // default false
}

function createCsmDirectionalShadowGenerator(engine: EngineContext, light: DirectionalLight, cfg?: CsmDirectionalShadowGeneratorConfig): ShadowGenerator;

interface CsmStaticCacheOptions {
    refitAngle: number;
    refitMaxIntervalMs?: number;
}

function enableCsmStaticCache(engine: EngineContext, shadowGenerator: ShadowGenerator, options: CsmStaticCacheOptions): Promise<void>;

function getCsmReceiverTexture(shadowGenerator: ShadowGenerator): Texture2D;

function onCsmReceiverUpdate(shadowGenerator: ShadowGenerator, callback: (data: Float32Array) => void): () => void;

function setShadowCasterMaxCascade(mesh: Mesh, maxCascade: number): void;

interface CsmRefitCaster {
    readonly worldMatrixVersion: number;
    readonly thinInstances?: { readonly _version: number } | null;
}

interface CsmRefitGateOptions {
    refitAngle: number;
    refitMaxIntervalMs: number;
    demoteQuietFrames?: number;
}

interface CsmRefitDecision {
    refit: boolean;
    renderDynamic: boolean;
}

interface CsmRefitGate<M extends CsmRefitCaster> {
    syncCasters(casters: readonly M[]): void;
    markDynamic(caster: M): void;
    isDynamic(caster: M): boolean;
    update(
        lightDirX: number,
        lightDirY: number,
        lightDirZ: number,
        nowMs: number,
        cameraChanged: boolean,
        force: boolean,
        onPromote: (caster: M) => void,
        onDemote: (caster: M) => void
    ): CsmRefitDecision;
}

function createCsmRefitGate<M extends CsmRefitCaster>(options: CsmRefitGateOptions): CsmRefitGate<M>;
```

Usage mirrors the other directional generators:

```ts
const light = createDirectionalLight([0, -1, -1], 0.8);
addToScene(scene, light);
light.shadowGenerator = createCsmDirectionalShadowGenerator(engine, light, { mapSize: 1024 });
setShadowTaskCasterMeshes(light.shadowGenerator, casterMeshes);
// receivers: mesh.receiveShadows = true
await registerSceneWithShadowSupport(scene);
```

`setShadowCasterMaxCascade(mesh, maxCascade)` limits a caster to cascade layers
`0..maxCascade` (`0` is nearest). The default is all cascades; pass `Infinity` to
restore it. Values must be non-negative integer indexes or `Infinity`. The cap is
snapshotted when `setShadowTaskCasterMeshes` supplies the caster set, so changing a
live cap requires re-supplying a new caster-array instance. CSM updates only the
changed caster's per-cascade task membership; ESM and single-map PCF ignore the cap.

Custom `ShaderMaterial` receivers use the same public generator without reading its
internal WebGPU resources:

```ts
const material = createShaderMaterial({
    // ...sources, attributes, and uniforms...
    samplers: [{ name: "csmShadow", sampleType: "depth", viewDimension: "2d-array", comparison: true }],
});
setShaderTexture(material, "csmShadow", getCsmReceiverTexture(light.shadowGenerator));
onCsmReceiverUpdate(light.shadowGenerator, (data) => {
    // Mirror the documented 80-float receiver layout into the custom material.
});
```

`getCsmReceiverTexture` accepts only a generator created by
`createCsmDirectionalShadowGenerator`; other shadow techniques throw. It returns a
borrowed `Texture2D` whose view is explicitly `"2d-array"`, whose sampler is the
generator's comparison sampler, and whose sample type is depth. The same wrapper
object is returned for every call on one generator. It shares the generator's
lifetime and must not be released or disposed independently.

## Internal Architecture

### `ShadowGenerator` extensions (shared interface, type-only)

- `_shadowType` union widened `"esm" | "pcf"` → `"esm" | "pcf" | "csm"`.
- `_csmCascadeCount?: number` — number of cascades, read by the receiver renderable
to bake the cascade-select loop bound.
- `_csmReceiverTexture?: Texture2D` — lazily created borrowed public wrapper for
custom receivers. It creates exactly one explicit 2d-array view, is cached on
the generator rather than in module state, and establishes one generator-owned
texture reference so ShaderMaterial acquire/release cycles cannot destroy the
shared shadow map.

### Static cache and refit gate

Awaiting `enableCsmStaticCache(engine, generator, options)` enables the static
shadow cache before scene registration or receiver-texture access. Casters begin in the dynamic
overlay, become static after 120 quiet frames, and return to the dynamic set
immediately when their world or thin-instance version changes. A refit recomputes
the cascades and refreshes the private static depth array after the light drifts by
`options.refitAngle`, the camera changes, caster membership changes, a static caster
moves, or `options.refitMaxIntervalMs` expires. The interval remains active while the
light is paused so GPU-clock-animated static casters continue refreshing. Generators
that are not explicitly enabled preserve the original single-task path, allocate no
cache texture, and do not load the cache implementation.

`createCsmRefitGate` exposes the CPU-only partition/refit state machine for consumers
that need the same policy without engine or WebGPU dependencies. Re-supplying a new
array with identical caster membership does not invalidate the cache.

### Receiver UBO layout (`_shadowUBO`, 320 bytes / 80 f32)

| offset (f32) | field | type |
| --- | --- | --- |
| offset (f32)<br>0..63 | field<br>`cascadeTransforms` | type<br>`array<mat4x4, 4>` |
| offset (f32)<br>64..67 | field<br>`viewFrustumZ` | type<br>`vec4<f32>` |
| offset (f32)<br>68..71 | field<br>`frustumLengths` | type<br>`vec4<f32>` |
| offset (f32)<br>72..75 | field<br>`shadowsInfo` | type<br>`vec4<f32>` (darkness, mapSize, 1/mapSize, frustumEdgeFalloff) |
| offset (f32)<br>76..79 | field<br>`csmParams` | type<br>`vec4<f32>` (cascadeCount, cascadeBlendFactor, 0, 0) |

`cascadeBlendFactor = cascadeBlendPercentage === 0 ? 10000 : 1 / cascadeBlendPercentage`.
Unused cascade slots (when `numCascades < 4`) are never read — the WGSL loop bound is
the baked cascade count.

### Shadow map texture

`depth32float`, size `mapSize × mapSize × numCascades`,
`RENDER_ATTACHMENT | TEXTURE_BINDING` plus `COPY_DST` when static caching is enabled.
The private static cache uses `RENDER_ATTACHMENT | COPY_SRC`. Receiver view:
`dimension:"2d-array"`. Per-cascade
caster render targets use a single-layer view
(`createView({dimension:"2d", baseArrayLayer:i, arrayLayerCount:1})`). Comparison
sampler `compare:"less"`, linear filtering.

Built-in material receivers bind the generator's internal texture and sampler through
their material pipeline. Custom `ShaderMaterial` receivers obtain the equivalent
borrowed `Texture2D` only through `getCsmReceiverTexture`; raw `GPUTexture`,
`GPUTextureView`, and `GPUSampler` handles never cross that public boundary.

## Pipeline Configuration

- **Caster pass:** N depth-only render tasks (one per cascade layer), each rendering
every caster through the material family's _no-color_ view, clearing the layer to
depth 1.0 with `depthCompare:"less-equal"`. The per-cascade camera facade carries
the cascade view matrix + **bias-adjusted** ortho·view transform. Legacy `bias`
supplies the existing normalized projection offset. `worldSpaceBias`, when present,
extends the fitted far plane by that distance, then converts the authored
world-space distance into a per-cascade clip offset
`worldSpaceBias / (paddedFar-near)`. The physical separation stays constant while a
moving light or caster changes the fitted cascade depth range, and far-bound casters
remain inside the clip volume after the offset.
- **Static-cache caster passes:** after `enableCsmStaticCache`, every cascade owns a clearing
static task targeting the private cache and a non-clearing dynamic task targeting the
live map. Refit frames render static tasks, copy the complete cache array to the live
map, then depth-test the dynamic overlay against that copy. Overlay-only frames repeat
the copy before drawing dynamic casters so moved shadows cannot leave stale depth.
Frames with no refit and no dynamic change issue neither passes nor copies.
- **Receiver pass:** group-2 bind group per CSM light = `[arrayDepthView, comparisonSampler, csmUBO]` (binding order 0,1,2). The 2d-array view dimension is
produced by the shader composer (`bglEntry` maps `_textureType` containing `"array"`
→ `viewDimension:"2d-array"`).

## Shader Logic (WGSL outline)

Receiver, per CSM light (suffix `_<lightIndex>`, `N` = baked cascade count):

```wgsl
// cascade select from camera-view-space depth, LH
let viewZ = (scene.view * vec4(vp, 1.0)).z;
var idx = -1; var diff = 0.0;
for (var i = 0; i < N; i++) {
    diff = csmInfo.viewFrustumZ[i] - viewZ;
    if (diff >= 0.0) { idx = i; break; }
}
if (idx < 0) { idx = N - 1; }

var shadow = csmSample(idx, vec4(vp, 1.0));      // PCF5 on layer idx
// optional cross-fade into next cascade
let ratio = clamp(diff / csmInfo.frustumLengths[idx], 0.0, 1.0) * csmInfo.csmParams.y;
if (idx < N - 1 && ratio < 1.0) {
    shadow = mix(csmSample(idx + 1, vec4(vp, 1.0)), shadow, ratio);
}
shadowFactors[lightIndex] = shadow;
```

`csmSample(layer, worldPos)`:

```wgsl
let p = csmInfo.cascadeTransforms[layer] * worldPos;
let clip = p.xyz / p.w;
let uv = vec2(0.5*clip.x + 0.5, 0.5 - 0.5*clip.y);   // Lite Y-flip convention
let depthRef = clamp(clip.z, 0.0, 0.99999994);        // GREATEST_LESS_THAN_ONE
// 5×5 PCF (9 textureSampleCompareLevel taps, /144 weighting)
// textureSampleCompareLevel(csmTex, csmComp, base + offset, layer, depthRef)
return computeFallOff(mix(darkness, 1.0, sh), clip.xy, frustumEdgeFalloff);
```

The `0.99999994` clamp is critical: fragments projecting beyond a cascade's far plane
must compare strictly _less than_ the cleared shadow-map value (1.0) so they read as
**lit**, not shadowed.

`vp` is the existing world-position varying. Standard CSM derives camera-view-space
depth from `scene.view × vec4(vp, 1)` in the fragment shader. It must not depend on
the fog-only `vf` varying, so a non-fog CSM material composes without retaining fog
WGSL or requiring fog-generated vertex output. CSM still avoids emitting N
per-cascade light-space varyings.

## CSM Math (`csm-shadow-task-hooks.ts`)

### Splits (`_computeCsmCascades`)

`near = camera.near`, `far = camera.far`, `cameraRange = far - near`,
`maxDistance = shadowMaxZ < far && shadowMaxZ >= near ? min((shadowMaxZ-near)/cameraRange, 1) : 1`,
`minZ = near`, `maxZ = near + maxDistance*cameraRange`, `range = maxZ-minZ`, `ratio = maxZ/minZ`.
For `p = (i+1)/N`: `log = minZ*ratio^p`, `uniform = minZ + range*p`,
`d = lambda*(log-uniform) + uniform`.
`viewFrustumZ[i] = d`; `breakDist[i] = (d-near)/cameraRange`;
`frustumLengths[i] = (breakDist[i]-prevBreak)*cameraRange`.

### Per-cascade matrix

1. Invert the **reverse-Z** camera view-projection (`getViewProjectionMatrix`). Transform
the 8 reverse-Z NDC frustum corners ( **near z=1, far z=0**) to world space.
2. Slice \[prevSplit, split\]: `corner[k] = near + ray*prevSplit`,
`corner[k+4] = near + ray*split` where `ray = far - near` per side.
3. Centroid = mean of the 8 slice corners.
4. Fit a light-space AABB: temp `LookAtLH` from centroid along `lightDir`
(`buildLightViewMatrix`), transform corners, take min/max extents.
(`stabilizeCascades` instead uses a `ceil(radius*16)/16` bounding sphere.)
5. Shadow camera eye = `centroid + lightDir * minExtents.z`; cascade view =
`buildLightViewMatrix(lightDir, eye)`.
6. Z range: `viewMinZ = 0`, `viewMaxZ = extents.z`, then tightened to the casters'
world-AABB Z in cascade view space (depthClamp-false behaviour:
`viewMinZ = min(0, castersMinZ)`, `viewMaxZ = min(extents.z, castersMaxZ)` when
`castersMinZ <= viewMaxZ`). v1 uses depthClamp = false so no GPU depth-clip feature
is required. A positive `worldSpaceBias` then extends `viewMaxZ` by the same
distance so the farthest fitted caster is not clipped after biasing.
7. `ortho = OrthoOffCenterLH(minX,maxX,minY,maxY, viewMinZ, viewMaxZ)` (column-major,
half-z, near→0 far→1 — same convention as the PCF generator's shadow ortho).
8. `transform = ortho · view`. **Texel snap (always applied):** project the world origin
(`transform[12], transform[13]`), `× mapSize/2`, round, build an XY translation of the
rounded offset, `transform = (T·ortho) · view`.
9. Receiver `cascadeTransforms[i] = transform` (unbiased). Caster camera view-projection
adds `clipOffset·w` to its Z row, where `clipOffset = bias·0.5` for the legacy
normalized bias, or `worldSpaceBias / (paddedViewMaxZ-viewMinZ)` for a world-space
bias. The latter is invariant in world units even when caster-AABB fitting changes
the range.

## State Machine / Lifecycle

`createShadowTask` (scene-owned) drives the generic hooks:
`_preloadShadowTask` → loads the no-color material-view factories.
`_ensureShadowTaskState` → builds N per-layer render targets + cameras + tasks once
(rebuilt only when the caster set identity changes).
`_renderShadowMap` → per frame, dirty-checked on `casterVersion + lightVersion + cameraVersion`; recomputes splits + matrices, writes the 320-byte UBO (bumping
`_version`), updates each cascade camera, executes all cascade tasks.

With static caching enabled, the dynamically imported `csm-shadow-cache.ts` owns the
GPU task split and `csm-refit-gate.ts` owns the caster partition and refit decision.
Cascade matrices, the receiver UBO, and shadow-camera versions change only on refit
frames; dynamic-only frames reuse the last refit's cameras so cached and overlay
depth stay in the same coordinate system. Quiet dynamic casters demote only during a
refit. A changed static caster promotes immediately and forces that refit. Resolved
renderables transfer between task sets without rebuilding their per-mesh packets.
The gate survives GPU task rebuilds, while the replacement state's initial camera key
forces the new cache texture to be populated before use.

The custom-receiver texture wrapper is lazy and generator-scoped. The first
`getCsmReceiverTexture` call validates the CSM technique, creates the array view, and
caches the wrapper. It also anchors the generator's texture ownership in the shared
ref-count pool; receiver materials may acquire and release the wrapper without
destroying the generator-owned depth array. Later calls preserve object/view identity.
Shadow-map recreation is not supported by the current fixed generator configuration;
therefore the wrapper remains valid until the generator's GPU resources are disposed
with the scene.

`onCsmReceiverUpdate` immediately replays the most recently published 80-float UBO to
a late subscriber once at least one cascade update has completed. This is required in
cache mode because the next refit may be far in the future.

Each CSM task state also snapshots every caster's maximum cascade. When a new caster
array is supplied without material changes, the incremental diff removes and re-adds
only new, removed, or re-capped casters, preserving all unchanged caster packets.

## Babylon.js Equivalence Map

| Babylon.js | Babylon Lite |
| --- | --- |
| Babylon.js<br>`CascadedShadowGenerator._splitFrustum` | Babylon Lite<br>`_computeCsmCascades` (split section) |
| Babylon.js<br>`_computeFrustumInWorldSpace` | Babylon Lite<br>reverse-Z frustum corner extraction + slice |
| Babylon.js<br>`_computeCascadeFrustum` | Babylon Lite<br>centroid + light-space AABB / sphere fit |
| Babylon.js<br>`_computeMatrices` (ortho + snap) | Babylon Lite<br>`orthoOffCenterLH` \+ texel-snap block |
| Babylon.js<br>`computeShadowWithCSMPCF5` | Babylon Lite<br>`csmSample_<i>` (PCF5, array layer) |
| Babylon.js<br>cascade select in `lightFragment.fx` | Babylon Lite<br>`computeShadowCSM_<i>` loop + blend |
| Babylon.js<br>`GREATEST_LESS_THAN_ONE` | Babylon Lite<br>`0.99999994` depthRef clamp |

Two deliberate deviations from default BJS, applied symmetrically to the BJS oracle so
parity holds: **reverse-Z** NDC (Lite's projection) and **depthClamp = false**
(avoids the optional `depth-clip-control` WebGPU feature). Both are reflected in the
reference scene (`sg.depthClamp = false`). Result: full-image MAD = 0.000.

## Bundle Discipline (no movement for unrelated scenes)

Shared edits are byte-minimal:

- TS union widenings `"esm" | "pcf"` → add `"csm"` (type-only, 0 runtime bytes) in
`shadow-generator.ts`, `standard-renderable.ts`; PBR/Node renderables filter out CSM
lights (they ignore CSM in v1).
- `_depthView` field swap in the three receiver renderables (call → field read).
- One `hasCsm`-gated dynamic import of `std-csm-shadow-fragment.ts` in
`standard-group-builder.ts`.
- `shader-composer.ts``bglEntry` gains `"array"` → `"2d-array"` view-dimension support
(a few bytes on the shared material chunk; well within ceilings).

All cascade math + WGSL live in the four new modules, dynamically imported only by
scenes that create a CSM generator.

The static-cache orchestration and refit gate live behind the dynamic import performed
by `enableCsmStaticCache`. Default CSM scenes therefore do not fetch the cache task
split, transfer helper, or gate.

## Dependencies

`shadow-base` (`buildLightViewMatrix`, `multiply4x4`, `createShadowCamera`,
`updateShadowCameraBase`, `createShadowParamsUBO`, `casterVersionSum`),
`pcf-shadow-task-hooks` (`getNoColorView`, `preloadPcfShadowTaskState`),
`math/mat4-invert`, `camera` (`getViewProjectionMatrix`), `frame-graph/render-task`,
`csm-refit-gate`.

## Test Specification

`tests/lite/parity/scenes/scene214-cascaded-shadows.spec.ts` — captures the BJS CSM
oracle (`captureGolden({ force: true })`) and compares the Lite render of
`scene214.html` (6×6 Standard box casters + Standard ground receiver, 4-cascade CSM).
Threshold `maxMad` in `scene-config.json` (achieved MAD = 0.000).

`tests/lite/unit/csm-world-space-bias.test.ts` proves that per-cascade clip offsets
map back to the same authored world-space distance across changing fitted depth
ranges, preserve a tightly fitted far caster after the projection reserves bias
headroom, and produce no bias for invalid or collapsed inputs.

`tests/lite/unit/csm-receiver-texture.test.ts` proves that the public custom-receiver
adapter creates one explicit 2d-array depth wrapper, reuses the generator texture and
comparison sampler without exposing them in its signature, preserves wrapper identity,
survives a ShaderMaterial acquire/release cycle, and rejects ESM/PCF generators.

`tests/lite/unit/shadow-caster-max-cascade.test.ts` validates cap input, default and
reset behavior, and incremental reassignment of an existing caster across cascade
tasks after a live cap change.

`tests/lite/unit/csm-refit-gate.test.ts` validates stable re-supply, version-sum
collision handling, promotion/demotion timing, angular drift, and interval refits.

`tests/lite/unit/light-version.test.ts` validates that direct scalar light mutations
can bump the light UBO version without dirtying the world matrix.

## File Manifest

- `shadow/csm-directional-shadow-generator.ts` — public factory, custom-receiver
`Texture2D` adapter, update subscription, and texture/UBO/sampler ownership.
- `shadow/csm-shadow-task-hooks.ts` — cascade math + N-layer caster render hooks.
- `shadow/csm-shadow-cache.ts` — dynamically loaded static-cache GPU orchestration.
- `shadow/csm-refit-gate.ts` — GPU-free static/dynamic partition and refit policy.
- `shader/fragments/csm-shadow-fragment-core.ts` — receiver WGSL codegen.
- `material/standard/fragments/std-csm-shadow-fragment.ts` — Standard-family wrapper.
- `lab/lite/src/lite/scene214.ts`, `lab/lite/scene214.html` — Lite demo scene.
- `lab/lite/src/bjs/scene214.ts`, `lab/lite/babylon-ref-scene214.html` — BJS oracle.
- `reference/lite/scene214-cascaded-shadows/babylon-ref-golden.png` — golden.

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