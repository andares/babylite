---
title: Lights
source: https://doc.babylonjs.com/lite/architecture/03-lights/
section: Architecture
---

[API](https://doc.babylonjs.com/lite/typedoc/)

[Babylon Lite](https://doc.babylonjs.com/lite/)\|

[Architecture](https://doc.babylonjs.com/lite/architecture/)\|

[Lights](https://doc.babylonjs.com/lite/architecture/03-lights/)

…\|

[Babylon Lite](https://doc.babylonjs.com/lite/)\|

[Architecture](https://doc.babylonjs.com/lite/architecture/)\|

[Lights](https://doc.babylonjs.com/lite/architecture/03-lights/)

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


# Module: Lights

### Table Of Contents

[Module: Lights](https://doc.babylonjs.com/lite/architecture/03-lights/#module-lights) [Purpose](https://doc.babylonjs.com/lite/architecture/03-lights/#purpose) [Public API Surface](https://doc.babylonjs.com/lite/architecture/03-lights/#public-api-surface) [Shared Types (`types.ts`)](https://doc.babylonjs.com/lite/architecture/03-lights/#shared-types-typests) [Light Base (`light-base.ts`)](https://doc.babylonjs.com/lite/architecture/03-lights/#light-base-light-basets) [Light Matrix Helper (`light-matrix.ts`)](https://doc.babylonjs.com/lite/architecture/03-lights/#light-matrix-helper-light-matrixts) [Directional Light (`directional-light.ts`)](https://doc.babylonjs.com/lite/architecture/03-lights/#directional-light-directional-lightts) [Point Light (`point-light.ts`)](https://doc.babylonjs.com/lite/architecture/03-lights/#point-light-point-lightts) [Hemispheric Light (`hemispheric.ts`)](https://doc.babylonjs.com/lite/architecture/03-lights/#hemispheric-light-hemisphericts) [Spot Light (`spot-light.ts`)](https://doc.babylonjs.com/lite/architecture/03-lights/#spot-light-spot-lightts) [Internal Architecture](https://doc.babylonjs.com/lite/architecture/03-lights/#internal-architecture) [Data Structures](https://doc.babylonjs.com/lite/architecture/03-lights/#data-structures) [Light Base Infrastructure (`light-base.ts`)](https://doc.babylonjs.com/lite/architecture/03-lights/#light-base-infrastructure-light-basets) [Light Type Discrimination (Standard Material)](https://doc.babylonjs.com/lite/architecture/03-lights/#light-type-discrimination-standard-material) [Lights UBO Layout (`render/lights-ubo.ts`)](https://doc.babylonjs.com/lite/architecture/03-lights/#lights-ubo-layout-renderlights-ubots) [UBO Functions (`lights-ubo.ts`)](https://doc.babylonjs.com/lite/architecture/03-lights/#ubo-functions-lights-ubots) [PBR Light Shader Paths](https://doc.babylonjs.com/lite/architecture/03-lights/#pbr-light-shader-paths) [Shader Lighting Math (Standard Material)](https://doc.babylonjs.com/lite/architecture/03-lights/#shader-lighting-math-standard-material) [Pipeline Configuration](https://doc.babylonjs.com/lite/architecture/03-lights/#pipeline-configuration) [Shader Logic](https://doc.babylonjs.com/lite/architecture/03-lights/#shader-logic) [State Machine / Lifecycle](https://doc.babylonjs.com/lite/architecture/03-lights/#state-machine--lifecycle) [Light Creation](https://doc.babylonjs.com/lite/architecture/03-lights/#light-creation) [Mutation & Dirty Tracking](https://doc.babylonjs.com/lite/architecture/03-lights/#mutation--dirty-tracking) [Lights UBO Lifecycle](https://doc.babylonjs.com/lite/architecture/03-lights/#lights-ubo-lifecycle) [Babylon.js Equivalence Map](https://doc.babylonjs.com/lite/architecture/03-lights/#babylonjs-equivalence-map) [Key Differences from Babylon.js](https://doc.babylonjs.com/lite/architecture/03-lights/#key-differences-from-babylonjs) [Dependencies](https://doc.babylonjs.com/lite/architecture/03-lights/#dependencies) [types.ts](https://doc.babylonjs.com/lite/architecture/03-lights/#typests) [light-base.ts](https://doc.babylonjs.com/lite/architecture/03-lights/#light-basets) [light-matrix.ts](https://doc.babylonjs.com/lite/architecture/03-lights/#light-matrixts) [directional-light.ts](https://doc.babylonjs.com/lite/architecture/03-lights/#directional-lightts) [point-light.ts](https://doc.babylonjs.com/lite/architecture/03-lights/#point-lightts) [hemispheric.ts](https://doc.babylonjs.com/lite/architecture/03-lights/#hemisphericts) [spot-light.ts](https://doc.babylonjs.com/lite/architecture/03-lights/#spot-lightts) [lights-ubo.ts](https://doc.babylonjs.com/lite/architecture/03-lights/#lights-ubots) [Test Specification](https://doc.babylonjs.com/lite/architecture/03-lights/#test-specification) [File Manifest](https://doc.babylonjs.com/lite/architecture/03-lights/#file-manifest)

> Package path: `packages/babylon-lite/src/light/`

## Purpose

Provides plain-data light definitions for **hemispheric**, **directional**, **point**, and **spot** light types, plus a shared infrastructure layer (`light-base.ts`, `light-matrix.ts`, `types.ts`) and a scene-owned lights UBO packing system (`render/lights-ubo.ts`, `scene/scene-light-state.ts`). Following Babylon Lite's "pillar 4b" principle, lights are stateless data objects with no scene references.

Factory functions create light objects with sensible defaults; callers add them to scenes or pass them to material setup functions. Each light carries:

- Push-based dirty tracking via `ObservableVec3` for positions/directions
- World-matrix state with parent support (inherited from `light-base.ts`)
- Shared UBO writer (`_writeLightUbo`) for the scene lights UBO system
- Version tracking (`_lightVersion`) so per-frame light uploads can be guarded

PBR no longer uses per-light extension registration or light fields in `SceneUniforms`. Standard, PBR, and NodeMaterial consume the scene-owned `LightsUniforms` UBO at `@group(0) @binding(1)`. Per-mesh UBOs carry material-independent light selection (`lc` plus packed `li: array<vec4<u32>, ceil(MAX_LIGHTS / 4)>`) computed from `LightBase.includedOnlyMeshIds` / `excludedMeshIds`; shaders index the scene lights array through those mesh indices. Exactly one eligible non-shadow PBR light uses `material/pbr/fragments/singlelight-wgsl.ts`; multiple lights or any shadow receiver use `material/pbr/fragments/multilight-wgsl.ts`.

* * *

## Public API Surface

### Shared Types (`types.ts`)

```typescript
/** Shared base for all light types. Provides pipeline integration callbacks. */
export interface LightBase extends IWorldMatrixProvider, IParentable {
    readonly lightType: string;
    children: SceneNode[];
    excludedMeshIds?: ReadonlySet<string>;
    includedOnlyMeshIds?: ReadonlySet<string>;
    shadowGenerator?: ShadowGenerator;
    parent: IWorldMatrixProvider | null;
    readonly worldMatrix: Mat4;
    readonly worldMatrixVersion: number;
}

/** @internal */
export interface LightBaseInternal extends LightBase {
    readonly _writeLightUbo?: (data: Float32Array, offset: number) => void;
    readonly _lightVersion: number;
}

export let MAX_LIGHTS = 16;
export function setMaxLights(n: number): void;
export const LIGHT_ENTRY_FLOATS = 16; // 4 × vec4 = 64 bytes per light
```

### Light Base (`light-base.ts`)

```typescript
/** Create world-matrix state + dirty callback shared by all light types. */
export function createLightBase(getLocalMatrix: () => Mat4): {
    wm: WorldMatrixAccessors;
    onDirty: () => void;
};

/** Mixin world-matrix accessors (parent, worldMatrix, worldMatrixVersion) onto a light object. */
export function applyWorldMatrixAccessors<R>(target: object, wm: WorldMatrixAccessors): R;

export { ObservableVec3 } from "../math/observable-vec3.js";
```

### Light Matrix Helper (`light-matrix.ts`)

```typescript
/** Build a local matrix from a direction vector + optional position.
 *  Column 2 = forward (normalized direction), column 0 = right, column 1 = up. */
export function localMatrixFromDirection(dx: number, dy: number, dz: number, px?: number, py?: number, pz?: number): Mat4;
```

**Algorithm:**

1. Normalize direction: `forward = normalize(dx, dy, dz)`
2. Compute `right = normalize(cross((0,1,0), forward))` (simplified: `right = (-fz, 0, fx)`)
3. Compute `up = cross(forward, right)`
4. Build column-major 4×4 matrix: col0=right, col1=up, col2=forward, col3=position
5. `m[15] = 1`

### Directional Light (`directional-light.ts`)

```typescript
export interface DirectionalLight extends LightBase {
    readonly lightType: "directional";
    direction: ObservableVec3;
    position: ObservableVec3;
    diffuse: [number, number, number];
    specular: [number, number, number];
    intensity: number;
}

export function createDirectionalLight(
    direction: [number, number, number],
    intensity?: number // Default: 1
): DirectionalLight;
```

**Default values:**

| Property | Default |
| --- | --- |
| Property<br>lightType | Default<br>`'directional'` |
| Property<br>direction | Default<br> _(parameter)_ |
| Property<br>position | Default<br>`(0, 0, 0)` via ObservableVec3 |
| Property<br>diffuse | Default<br>`[1, 1, 1]` |
| Property<br>specular | Default<br>`[1, 1, 1]` |
| Property<br>intensity | Default<br>`1` |

### Point Light (`point-light.ts`)

```typescript
export interface PointLight extends LightBase {
    readonly lightType: "point";
    position: ObservableVec3;
    diffuse: [number, number, number];
    specular: [number, number, number];
    intensity: number;
    range: number;
}

export function createPointLight(
    position: [number, number, number],
    intensity?: number // Default: 1.0
): PointLight;
```

**Default values:**

| Property | Default |
| --- | --- |
| Property<br>lightType | Default<br>`'point'` |
| Property<br>position | Default<br> _(parameter)_ via ObservableVec3 |
| Property<br>diffuse | Default<br>`[1, 1, 1]` |
| Property<br>specular | Default<br>`[1, 1, 1]` |
| Property<br>intensity | Default<br>`1.0` |
| Property<br>range | Default<br>`Number.MAX_VALUE` |

**Local matrix:**`mat4Translation(position.x, position.y, position.z)` — position only, no orientation.

### Hemispheric Light (`hemispheric.ts`)

```typescript
export interface HemisphericLight extends LightBase {
    readonly lightType: "hemispheric";
    direction: ObservableVec3;
    intensity: number;
    diffuseColor: [number, number, number];
    specularColor: [number, number, number];
    groundColor: [number, number, number];
}

export function createHemisphericLight(
    direction?: [number, number, number], // Default: [0, 1, 0]
    intensity?: number // Default: 1.0
): HemisphericLight;
```

**Default values:**

| Property | Default |
| --- | --- |
| Property<br>lightType | Default<br>`'hemispheric'` |
| Property<br>direction | Default<br>`(0, 1, 0)` via ObservableVec3 |
| Property<br>intensity | Default<br>`1.0` |
| Property<br>diffuseColor | Default<br>`[1, 1, 1]` |
| Property<br>specularColor | Default<br>`[1, 1, 1]` |
| Property<br>groundColor | Default<br>`[0, 0, 0]` |

### Spot Light (`spot-light.ts`)

```typescript
export interface SpotLight extends LightBase {
    readonly lightType: "spot";
    position: ObservableVec3;
    direction: ObservableVec3;
    /** Full cone angle in radians. */
    angle: number;
    /** Falloff exponent — higher = sharper spotlight. */
    exponent: number;
    diffuse: [number, number, number];
    specular: [number, number, number];
    intensity: number;
    range: number;
}

export function createSpotLight(
    position: [number, number, number],
    direction: [number, number, number],
    angle: number,
    exponent: number,
    intensity?: number // Default: 1.0
): SpotLight;
```

**Default values:**

| Property | Default |
| --- | --- |
| Property<br>lightType | Default<br>`'spot'` |
| Property<br>position | Default<br> _(parameter)_ via ObservableVec3 |
| Property<br>direction | Default<br> _(parameter)_ via ObservableVec3 |
| Property<br>angle | Default<br> _(parameter)_ |
| Property<br>exponent | Default<br> _(parameter)_ |
| Property<br>diffuse | Default<br>`[1, 1, 1]` |
| Property<br>specular | Default<br>`[1, 1, 1]` |
| Property<br>intensity | Default<br>`1.0` |
| Property<br>range | Default<br>`Number.MAX_VALUE` |

**Local matrix:** Uses `localMatrixFromDirection(direction, position)` — both orientation and position.

* * *

## Internal Architecture

### Data Structures

All lights are plain JavaScript objects (POJOs) with `Object.defineProperties`-based world-matrix accessors — no classes, no GPU resources. The scene owns one GPU `LightsUniforms` buffer for `scene.lights`; materials only declare/read the fixed group-0 binding.

### Light Base Infrastructure (`light-base.ts`)

Every light factory:

1. Calls `createLightBase(getLocalMatrix)` which returns `{ wm, onDirty }`:

   - `wm`: `WorldMatrixAccessors` — provides `getWorldMatrix()`, `getWorldMatrixVersion()`, `markLocalDirty()`, and `parent` get/set
   - `onDirty`: callback that calls `wm.markLocalDirty()` — passed to `ObservableVec3` constructors
2. Builds the light data object with an `_writeLightUbo` callback
3. Calls `applyWorldMatrixAccessors(target, wm)` which uses `Object.defineProperties` to add `parent`, `worldMatrix`, and `worldMatrixVersion` as getters/setters

This pattern eliminates duplicated world-matrix boilerplate across all light types.

### Light Type Discrimination (Standard Material)

Each light writes its type flag at `data[offset + 3]` in `_writeLightUbo`:

| `vLightData.w` | Light Type | Position/Direction Source |
| --- | --- | --- |
| `vLightData.w`<br>`0` | Light Type<br>Point | Position/Direction Source<br>xyz = world position (worldMatrix col 3) |
| `vLightData.w`<br>`1` | Light Type<br>Directional | Position/Direction Source<br>xyz = world direction (worldMatrix col 2) |
| `vLightData.w`<br>`2` | Light Type<br>Spot | Position/Direction Source<br>xyz = world position (worldMatrix col 3) |
| `vLightData.w`<br>`3` | Light Type<br>Hemispheric | Position/Direction Source<br>xyz = world direction (worldMatrix col 2) |

### Lights UBO Layout (`render/lights-ubo.ts`)

Standard, PBR, and NodeMaterial pipelines use a shared scene lights UBO supporting up to `MAX_LIGHTS = 16` packed scene lights by default. `setMaxLights(n)` may adjust the cap before pipelines/UBOs are created. Unlike Babylon.js's default `maxSimultaneousLights = 4` per material, Babylon Lite's `MAX_LIGHTS` is the total scene-wide packed-light capacity.

The frame/pass bind group layout is:

| Group | Binding | Owner | Contents |
| --- | --- | --- | --- |
| Group<br>0 | Binding<br>0 | Owner<br>`RenderTask` | Contents<br>Per-pass `SceneUniforms` (camera, fog, image processing, environment) |
| Group<br>0 | Binding<br>1 | Owner<br>`SceneContextInternal` via `scene-light-state.ts` | Contents<br>Scene-wide `LightsUniforms` packed from `scene.lights` |

Material/mesh bind groups never contain light buffers. Mesh UBOs append:

```wgsl
lc: u32,
li: array<vec4<u32>, ceil(MAX_LIGHTS / 4)>,
```

Each packed index addresses `lights.lights[index]` in the scene-wide UBO (`li[i / 4u][i % 4u]`). `render/lights-ubo.ts` computes this list per mesh by skipping lights whose `includedOnlyMeshIds` excludes the mesh or whose `excludedMeshIds` includes it.

**Default total UBO size:**`getLightsUboSize() = 16 + MAX_LIGHTS × 64` bytes (1040 bytes when `MAX_LIGHTS = 16`)

**Layout:**

| Offset (bytes) | Size | Content |
| --- | --- | --- |
| Offset (bytes)<br>0–3 | Size<br>4B | Content<br>`count` (u32) — number of active lights |
| Offset (bytes)<br>4–15 | Size<br>12B | Content<br>padding (3 × u32) |
| Offset (bytes)<br>16–79 | Size<br>64B | Content<br>Light 0 entry (4 × vec4) |
| Offset (bytes)<br>80–143 | Size<br>64B | Content<br>Light 1 entry (4 × vec4) |
| Offset (bytes)<br>144–207 | Size<br>64B | Content<br>Light 2 entry (4 × vec4) |
| Offset (bytes)<br>208–271 | Size<br>64B | Content<br>Light 3 entry (4 × vec4) |

**Per-light entry layout (LIGHT\_ENTRY\_FLOATS = 16, 64 bytes):**

| Float Index | Directional (w=1) | Point (w=0) | Spot (w=2) | Hemispheric (w=3) |
| --- | --- | --- | --- | --- |
| Float Index<br>\[0–2\] | Directional (w=1)<br>direction (col2) | Point (w=0)<br>position (col3) | Spot (w=2)<br>position (col3) | Hemispheric (w=3)<br>direction (col2) |
| Float Index<br>\[3\] | Directional (w=1)<br>1 (type flag) | Point (w=0)<br>0 (type flag) | Spot (w=2)<br>2 (type flag) | Hemispheric (w=3)<br>3 (type flag) |
| Float Index<br>\[4–6\] | Directional (w=1)<br>diffuse × intensity | Point (w=0)<br>diffuse × intensity | Spot (w=2)<br>diffuse × intensity | Hemispheric (w=3)<br>diffuseColor × intensity |
| Float Index<br>\[7\] | Directional (w=1)<br>MAX\_VALUE (range) | Point (w=0)<br>range | Spot (w=2)<br>range | Hemispheric (w=3)<br> _(unused)_ |
| Float Index<br>\[8–10\] | Directional (w=1)<br>specular × intensity | Point (w=0)<br>specular × intensity | Spot (w=2)<br>specular × intensity | Hemispheric (w=3)<br>specularColor × intensity |
| Float Index<br>\[11\] | Directional (w=1)<br> _(unused)_ | Point (w=0)<br> _(unused)_ | Spot (w=2)<br>exponent | Hemispheric (w=3)<br> _(unused)_ |
| Float Index<br>\[12–14\] | Directional (w=1)<br> _(unused)_ | Point (w=0)<br> _(unused)_ | Spot (w=2)<br>direction (col2) | Hemispheric (w=3)<br>groundColor × intensity |
| Float Index<br>\[15\] | Directional (w=1)<br> _(unused)_ | Point (w=0)<br> _(unused)_ | Spot (w=2)<br>cos(angle/2) | Hemispheric (w=3)<br> _(unused)_ |

### UBO Functions (`lights-ubo.ts`)

```typescript
/** Fill a Float32Array with standard light data. */
export function fillLightsData(data: Float32Array, lights: readonly LightBase[]): void;

/** Current lights UBO byte size for the active MAX_LIGHTS value. */
export function getLightsUboSize(): number;

/** Create a new lights UBO from all compatible lights. */
export function writeLightsUBO(engine: EngineContextInternal, lights: readonly LightBase[]): GPUBuffer;

/** Refresh an existing lights UBO with current light state. */
export function refreshLightsUBO(engine: EngineContextInternal, buffer: GPUBuffer, lights: readonly LightBase[], scratch: Float32Array): void;
```

**`fillLightsData` algorithm:**

1. Zero the entire Float32Array
2. Iterate lights, skip those without `_writeLightUbo`, stop at `MAX_LIGHTS`
3. Call each light's `_writeLightUbo(data, headerFloats + count * LIGHT_ENTRY_FLOATS)`
4. Write `count` into the first u32 slot via `Uint32Array` view

### PBR Light Shader Paths

PBR materials consume the same packed `LightEntry` layout as Standard materials. The PBR renderable builder decides which WGSL helper to import once per scene:

| Condition | WGSL helper | Behavior |
| --- | --- | --- |
| Condition<br>Mesh has exactly one eligible light and no shadow receiver path | WGSL helper<br>`material/pbr/fragments/singlelight-wgsl.ts` | Behavior<br>Non-looping direct-light code specialized by that light's `lightType`; reads `lights.lights[mli(0u)]` |
| Condition<br>Mesh has multiple eligible lights, or any shadow receiver path | WGSL helper<br>`material/pbr/fragments/multilight-wgsl.ts` | Behavior<br>Generic `computePbrLight()` \+ loop over `mesh.lc`; shadow fragment writes per-scene-light shadow factors |

Supported PBR light types are hemispheric, directional, point, and spot. PBR materials default to physical inverse-square point/spot falloff. Materials with `usePhysicalLightFalloff: false` use Babylon's Standard-style falloff instead: linear range attenuation plus spot cone exponent attenuation.

### Shader Lighting Math (Standard Material)

(Defined in `standard-textured.fragment.wgsl`, consumed via lights UBO)

**Point light attenuation:**

```javascript
direction = lightPosition - fragmentPosition
attenuation = max(0, 1 - length(direction) / range)
lightVector = normalize(direction)
```

**Directional light:**

```javascript
lightVector = normalize(-lightDirection)
attenuation = 1.0
```

**Spot light attenuation:**

```javascript
lightVector = normalize(lightPosition - fragmentPosition)
attenuation = max(0, 1 - length(lightPosition - fragmentPosition) / range)
cosAngle = dot(normalize(lightDirection), -lightVector)
spotFalloff = max(0, cosAngle - cosHalfAngle) ^ exponent
attenuation *= spotFalloff
```

**Hemispheric light:**

```javascript
lightVector = normalize(lightDirection)
NdotL = dot(normal, lightVector) * 0.5 + 0.5  // wrapped diffuse
diffuse = mix(groundColor, diffuseColor, NdotL) * intensity
```

**Diffuse (Lambertian):**

```javascript
ndl = max(0, dot(normal, lightVector))
diffuse = ndl * lightDiffuseColor * attenuation
```

**Specular (Blinn-Phong):**

```javascript
halfVector = normalize(viewDir + lightVector)
specComp = pow(max(0, dot(normal, halfVector)), max(1, glossiness))
specular = specComp * lightSpecularColor * attenuation
```

* * *

## Pipeline Configuration

Light modules do not create GPU pipelines. They produce plain data consumed by material pipelines.

The lights UBO (`render/lights-ubo.ts`) creates a single `GPUBuffer` with `UNIFORM | COPY_DST` usage. `SceneContextInternal._lightGpuState` stores it on the scene, refreshes it per-frame through `refreshSceneLightsUBO()`, and recreates it if the active `MAX_LIGHTS` size changes. The default size is 1040 bytes, but the size follows `MAX_LIGHTS`.

* * *

## Shader Logic

Light modules do not contain shaders. Lighting computation lives in material shader modules: Standard and NodeMaterial loop over `mesh.lc` / `mli(i)` into the group-0 lights UBO, and PBR dynamically imports either `singlelight-wgsl.ts` or `multilight-wgsl.ts` from `material/pbr/fragments/`.

* * *

## State Machine / Lifecycle

### Light Creation

```typescript
// Directional
const light = createDirectionalLight([0, -1, 0], 1.5);
light.position.set(10, 20, 10); // triggers onDirty → markLocalDirty

// Point
const point = createPointLight([5, 3, 0], 2.0);
point.range = 100;

// Hemispheric
const hemi = createHemisphericLight([0, 1, 0], 0.7);
hemi.groundColor = [0.1, 0.1, 0.1];

// Spot
const spot = createSpotLight([0, 10, 0], [0, -1, 0], Math.PI / 3, 2.0, 1.5);
spot.angle = Math.PI / 4;
```

### Mutation & Dirty Tracking

- Setting `direction.x`, `direction.y`, `direction.z` or calling `direction.set(x,y,z)` on any `ObservableVec3` triggers `onDirty()` → `wm.markLocalDirty()` → increments `worldMatrixVersion`
- `worldMatrix` getter lazily recomputes from `getLocalMatrix()` and parent chain when dirty
- `_writeLightUbo` reads from `worldMatrix` (which auto-resolves parent transforms)

### Lights UBO Lifecycle

1. **Creation:**`ensureSceneLightState(engine, scene)` allocates a `getLightsUboSize()` UBO and stores it on `SceneContextInternal._lightGpuState`.
2. **Group-0 binding:** every `RenderTask` binds its task-owned scene UBO at binding 0 and the scene-owned lights UBO at binding 1.
3. **Per-frame refresh:**`refreshSceneLightsUBO(engine, scene)` compares the aggregate light version and light count, then writes the shared UBO only when needed.
4. **Light filtering:** only lights with `_writeLightUbo` defined are packed; up to `MAX_LIGHTS`.
5. **Resize for cap changes:** if `MAX_LIGHTS` changes and the UBO byte size changes, `ensureSceneLightState()` destroys/recreates the scene light buffer and render-pass tasks rebuild their group-0 bind group.
6. **Mesh selection:** material renderables write per-mesh `lc` and packed `li` indices into the mesh UBO; this selection respects `includedOnlyMeshIds` and `excludedMeshIds`.

**No GPU resources are created by light modules.** Light packing and scene-owned GPU state live in `lights-ubo.ts`; materials only own shaders, mesh/material UBOs, textures, and bind groups.

* * *

## Babylon.js Equivalence Map

| Babylon Lite | Babylon.js |
| --- | --- |
| Babylon Lite<br>`createDirectionalLight(dir, intensity)` | Babylon.js<br>`new DirectionalLight(name, dir, scene)` |
| Babylon Lite<br>`DirectionalLight.direction` (ObservableVec3) | Babylon.js<br>`DirectionalLight.direction` (Vector3) |
| Babylon Lite<br>`DirectionalLight.position` (ObservableVec3) | Babylon.js<br>`DirectionalLight.position` (Vector3) |
| Babylon Lite<br>`DirectionalLight.diffuse` | Babylon.js<br>`DirectionalLight.diffuse` |
| Babylon Lite<br>`DirectionalLight.specular` | Babylon.js<br>`DirectionalLight.specular` |
| Babylon Lite<br>`DirectionalLight.intensity` | Babylon.js<br>`DirectionalLight.intensity` |
| Babylon Lite<br>`createPointLight(pos, intensity)` | Babylon.js<br>`new PointLight(name, pos, scene)` |
| Babylon Lite<br>`PointLight.range = Number.MAX_VALUE` | Babylon.js<br>`PointLight.range` (default very large) |
| Babylon Lite<br>`createHemisphericLight(dir, intensity)` | Babylon.js<br>`new HemisphericLight(name, dir, scene)` |
| Babylon Lite<br>`HemisphericLight.diffuseColor` | Babylon.js<br>`HemisphericLight.diffuse` |
| Babylon Lite<br>`HemisphericLight.specularColor` | Babylon.js<br>`HemisphericLight.specular` |
| Babylon Lite<br>`HemisphericLight.groundColor` | Babylon.js<br>`HemisphericLight.groundColor` |
| Babylon Lite<br>`createSpotLight(pos, dir, angle, exp, int)` | Babylon.js<br>`new SpotLight(name, pos, dir, angle, exp, scene)` |
| Babylon Lite<br>`SpotLight.angle` | Babylon.js<br>`SpotLight.angle` |
| Babylon Lite<br>`SpotLight.exponent` | Babylon.js<br>`SpotLight.exponent` |
| Babylon Lite<br>`SpotLight.range` | Babylon.js<br>`SpotLight.range` |
| Babylon Lite<br>`LightBase.lightType` string discriminator | Babylon.js<br>Class hierarchy + `getTypeID()` (internal) |
| Babylon Lite<br>`LightBase.excludedMeshIds` | Babylon.js<br>`Light.excludedMeshes` |
| Babylon Lite<br>`LightBase.includedOnlyMeshIds` | Babylon.js<br>`Light.includedOnlyMeshes` |
| Babylon Lite<br>`LightBase.shadowGenerator` | Babylon.js<br>`Light.getShadowGenerator()` |
| Babylon Lite<br>`LightBase.parent` (IWorldMatrixProvider) | Babylon.js<br>`Light.parent` (TransformNode) |
| Babylon Lite<br>Plain data objects (no scene ref) | Babylon.js<br>Class instances with scene reference |
| Babylon Lite<br>`ObservableVec3` with dirty callback | Babylon.js<br>`Vector3` \+ `_markAsDirty()` pattern |
| Babylon Lite<br>`localMatrixFromDirection()` | Babylon.js<br>`Light._buildUniformLayout()` (internal) |
| Babylon Lite<br>Light type w flag (0/1/2/3) | Babylon.js<br>Internal type system (`LIGHTTYPEID_*`) |
| Babylon Lite<br>`MAX_LIGHTS = 16` scene-wide cap | Babylon.js<br>`maxSimultaneousLights` (default 4 per material) |
| Babylon Lite<br>`fillLightsData()` / `writeLightsUBO()` | Babylon.js<br>Babylon's internal light UBO building |
| Babylon Lite<br>`refreshLightsUBO()` | Babylon.js<br>Per-frame light uniform update |
| Babylon Lite<br>`singlelight-wgsl.ts` / `multilight-wgsl.ts` | Babylon.js<br>PBR shader includes (`pbrDirectLightingSetupFunctions`, etc.) |

### Key Differences from Babylon.js

1. **No scene reference** — Babylon Lite lights are POJOs with world-matrix accessors; Babylon.js lights are class instances that register with a Scene.
2. **`lightType` string discriminator** — Instead of class hierarchy, each light has a `lightType` string literal (`'directional'`, `'point'`, `'spot'`, `'hemispheric'`).
3. **`ObservableVec3`** — Direction/position use observable vectors with dirty callbacks, replacing Babylon's Vector3 + manual dirty tracking.
4. **Shared lights UBO** — Standard and PBR pack up to `MAX_LIGHTS` scene lights into one UBO; Babylon.js uses material-scoped light defines/uniforms and defaults to 4 simultaneous lights per material.
5. **Tree-shakable PBR light code** — PBR imports the one-light or multi-light WGSL helper only when needed; Babylon.js includes broad light shader support.
6. **No shadow caster list on lights or generators** — Shadow casters are scene/frame-graph `ShadowTask` inputs registered for a generator. Lights only reference their shadow generator via `shadowGenerator` property.

* * *

## Dependencies

### types.ts

- `../math/types.js` — `Mat4`
- `../scene/parentable.js` — `IWorldMatrixProvider`, `IParentable`
- `../shadow/shadow-generator.js` — `ShadowGenerator` (type-only import)

### light-base.ts

- `../math/types.js` — `Mat4`
- `../scene/parentable.js` — `IWorldMatrixProvider`
- `../scene/world-matrix-state.js` — `createWorldMatrixState`, `WorldMatrixAccessors`
- `../math/observable-vec3.js` — `ObservableVec3` (re-exported)

### light-matrix.ts

- `../math/types.js` — `Mat4`

### directional-light.ts

- `./types.js` — `LightBase`
- `./light-base.js` — `createLightBase`, `applyWorldMatrixAccessors`, `ObservableVec3`
- `./light-matrix.js` — `localMatrixFromDirection`

### point-light.ts

- `./types.js` — `LightBase`
- `../math/mat4.js` — `mat4Translation`
- `./light-base.js` — `createLightBase`, `applyWorldMatrixAccessors`, `ObservableVec3`

### hemispheric.ts

- `./types.js` — `LightBase`
- `./light-base.js` — `createLightBase`, `applyWorldMatrixAccessors`, `ObservableVec3`
- `./light-matrix.js` — `localMatrixFromDirection`

### spot-light.ts

- `./types.js` — `LightBase`
- `./light-base.js` — `createLightBase`, `applyWorldMatrixAccessors`, `ObservableVec3`
- `./light-matrix.js` — `localMatrixFromDirection`

### lights-ubo.ts

- `../light/types.js` — `LightBase`, `LightBaseInternal`, `MAX_LIGHTS`, `LIGHT_ENTRY_FLOATS`

* * *

## Test Specification

01. **Directional light defaults** — `createDirectionalLight([0, -1, 0])` returns `lightType: 'directional'`, direction `(0,-1,0)`, position `(0,0,0)`, diffuse `[1,1,1]`, specular `[1,1,1]`, intensity `1`.
02. **Point light defaults** — `createPointLight([5, 3, 0])` returns `lightType: 'point'`, position `(5,3,0)`, diffuse `[1,1,1]`, specular `[1,1,1]`, intensity `1`, range `Number.MAX_VALUE`.
03. **Hemispheric light defaults** — `createHemisphericLight()` returns `lightType: 'hemispheric'`, direction `(0,1,0)`, intensity `1`, diffuseColor `[1,1,1]`, specularColor `[1,1,1]`, groundColor `[0,0,0]`.
04. **Spot light defaults** — `createSpotLight([0,10,0], [0,-1,0], PI/3, 2)` returns `lightType: 'spot'`, diffuse `[1,1,1]`, specular `[1,1,1]`, intensity `1`, range `Number.MAX_VALUE`.
05. **Custom intensity** — `createDirectionalLight([1,0,0], 2.5).intensity` should be `2.5`.
06. **Mutability** — All properties should be directly assignable. ObservableVec3 properties support `.x`, `.y`, `.z` setters and `.set(x,y,z)`.
07. **Dirty tracking** — Setting `direction.x = 5` should increment `worldMatrixVersion`.
08. **World matrix** — Directional light's worldMatrix column 2 should match normalized direction.
09. **Parent support** — Setting `light.parent` should affect `worldMatrix` computation.
10. **Light type flags** — `_writeLightUbo` should set w=0 (point), w=1 (directional), w=2 (spot), w=3 (hemispheric).
11. **Spot UBO packing** — Spot light writes exponent at \[11\], direction at \[12–14\], cos(angle/2) at \[15\].
12. **Light UBO packing** — For directional light: `lightData.w = 1`, colors premultiplied by intensity.
13. **Light UBO packing** — For point light: `lightData.w = 0`, `lightDiffuse.a = range`.
14. **Lights UBO size** — `getLightsUboSize() = 272` bytes by default (16 header + 4 × 64).
15. **fillLightsData count** — With 6 lights, only first 4 with `_writeLightUbo` are packed.
16. **localMatrixFromDirection** — Verify column 2 = normalized direction, column 0 = right, column 1 = up.
17. **PBR single-light selection** — One non-shadow light imports `singlelight-wgsl.ts`, not the generic multi-light loop.
18. **PBR multi-light selection** — Multiple lights or shadow receivers import `multilight-wgsl.ts`.

* * *

## File Manifest

| File | Role |
| --- | --- |
| File<br>`src/light/types.ts` | Role<br>`LightBase`, `LightBaseInternal` interfaces; `MAX_LIGHTS`, `setMaxLights()`, `LIGHT_ENTRY_FLOATS` |
| File<br>`src/light/light-base.ts` | Role<br>`createLightBase()`, `applyWorldMatrixAccessors()` — shared world-matrix state factory; re-exports `ObservableVec3` |
| File<br>`src/light/light-matrix.ts` | Role<br>`localMatrixFromDirection()` — builds local 4×4 matrix from direction + position |
| File<br>`src/light/directional-light.ts` | Role<br>`DirectionalLight` interface + `createDirectionalLight()` factory |
| File<br>`src/light/point-light.ts` | Role<br>`PointLight` interface + `createPointLight()` factory |
| File<br>`src/light/hemispheric.ts` | Role<br>`HemisphericLight` interface + `createHemisphericLight()` factory |
| File<br>`src/light/spot-light.ts` | Role<br>`SpotLight` interface + `createSpotLight()` factory |
| File<br>`src/render/lights-ubo.ts` | Role<br>Shared lights UBO system — `getLightsUboSize()`, scene light GPU state, mesh light selection; packs up to `MAX_LIGHTS` scene lights |

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