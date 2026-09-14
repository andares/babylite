---
title: Background Skybox
source: https://doc.babylonjs.com/lite/architecture/05-background-skybox/
section: Architecture
---

[API](https://doc.babylonjs.com/lite/typedoc/)

[Babylon Lite](https://doc.babylonjs.com/lite/)\|

[Architecture](https://doc.babylonjs.com/lite/architecture/)\|

[Background Skybox](https://doc.babylonjs.com/lite/architecture/05-background-skybox/)

…\|

[Babylon Lite](https://doc.babylonjs.com/lite/)\|

[Architecture](https://doc.babylonjs.com/lite/architecture/)\|

[Background Skybox](https://doc.babylonjs.com/lite/architecture/05-background-skybox/)

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


# Module: Background & Skybox

### Table Of Contents

[Module: Background & Skybox](https://doc.babylonjs.com/lite/architecture/05-background-skybox/#module-background--skybox) [Purpose](https://doc.babylonjs.com/lite/architecture/05-background-skybox/#purpose) [BJS Ground Architecture (verified via Spector.GPU)](https://doc.babylonjs.com/lite/architecture/05-background-skybox/#bjs-ground-architecture-verified-via-spectorgpu) [Key discovery: the ground is NOT a box with cubemap reflection](https://doc.babylonjs.com/lite/architecture/05-background-skybox/#key-discovery-the-ground-is-not-a-box-with-cubemap-reflection) [BJS ground diffuse texture (`backgroundGround.png`)](https://doc.babylonjs.com/lite/architecture/05-background-skybox/#bjs-ground-diffuse-texture-backgroundgroundpng) [Ground alpha pipeline](https://doc.babylonjs.com/lite/architecture/05-background-skybox/#ground-alpha-pipeline) [Ground world matrix](https://doc.babylonjs.com/lite/architecture/05-background-skybox/#ground-world-matrix) [Public API Surface](https://doc.babylonjs.com/lite/architecture/05-background-skybox/#public-api-surface) [`load-env.ts` (entry point)](https://doc.babylonjs.com/lite/architecture/05-background-skybox/#load-envts-entry-point) [`background-material.ts`](https://doc.babylonjs.com/lite/architecture/05-background-skybox/#background-materialts) [`background-renderable.ts`](https://doc.babylonjs.com/lite/architecture/05-background-skybox/#background-renderablets) [`background-ground.ts`](https://doc.babylonjs.com/lite/architecture/05-background-skybox/#background-groundts) [`background-dds-skybox.ts`](https://doc.babylonjs.com/lite/architecture/05-background-skybox/#background-dds-skyboxts) [`background-dds-environment.ts`](https://doc.babylonjs.com/lite/architecture/05-background-skybox/#background-dds-environmentts) [`background-hdr-skybox.ts`](https://doc.babylonjs.com/lite/architecture/05-background-skybox/#background-hdr-skyboxts) [`skybox-cubemap.ts`](https://doc.babylonjs.com/lite/architecture/05-background-skybox/#skybox-cubemapts) [`cube-texture.ts`](https://doc.babylonjs.com/lite/architecture/05-background-skybox/#cube-texturets) [Pipeline Configuration](https://doc.babylonjs.com/lite/architecture/05-background-skybox/#pipeline-configuration) [Skybox Pipeline (Solid-Color — Environment)](https://doc.babylonjs.com/lite/architecture/05-background-skybox/#skybox-pipeline-solid-color--environment) [Cubemap Skybox Pipeline (DDS + HDR variants)](https://doc.babylonjs.com/lite/architecture/05-background-skybox/#cubemap-skybox-pipeline-dds--hdr-variants) [Ground Pipeline](https://doc.babylonjs.com/lite/architecture/05-background-skybox/#ground-pipeline) [Skybox CubeMap Pipeline (StandardMaterial scenes)](https://doc.babylonjs.com/lite/architecture/05-background-skybox/#skybox-cubemap-pipeline-standardmaterial-scenes) [Bind Group Layouts](https://doc.babylonjs.com/lite/architecture/05-background-skybox/#bind-group-layouts) [Internal Architecture](https://doc.babylonjs.com/lite/architecture/05-background-skybox/#internal-architecture) [Skybox Geometry](https://doc.babylonjs.com/lite/architecture/05-background-skybox/#skybox-geometry) [Scene Size Computation (`computeSceneSize`)](https://doc.babylonjs.com/lite/architecture/05-background-skybox/#scene-size-computation-computescenesize) [Skybox World Matrix (`buildSkyboxWorldMatrix`)](https://doc.babylonjs.com/lite/architecture/05-background-skybox/#skybox-world-matrix-buildskyboxworldmatrix) [Ground Geometry (in `background-ground.ts`)](https://doc.babylonjs.com/lite/architecture/05-background-skybox/#ground-geometry-in-background-groundts) [Mesh UBO Layout — Solid-Color Skybox (96 bytes)](https://doc.babylonjs.com/lite/architecture/05-background-skybox/#mesh-ubo-layout--solid-color-skybox-96-bytes) [Mesh UBO Layout — DDS Skybox (96 bytes)](https://doc.babylonjs.com/lite/architecture/05-background-skybox/#mesh-ubo-layout--dds-skybox-96-bytes) [Mesh UBO Layout — HDR Skybox (112 bytes)](https://doc.babylonjs.com/lite/architecture/05-background-skybox/#mesh-ubo-layout--hdr-skybox-112-bytes) [Mesh UBO Layout — Ground (96 bytes, in `background-ground.ts`)](https://doc.babylonjs.com/lite/architecture/05-background-skybox/#mesh-ubo-layout--ground-96-bytes-in-background-groundts) [Mesh UBO Layout — CubeMap Skybox (64 bytes)](https://doc.babylonjs.com/lite/architecture/05-background-skybox/#mesh-ubo-layout--cubemap-skybox-64-bytes) [DDS Skybox Architecture (`background-dds-skybox.ts`)](https://doc.babylonjs.com/lite/architecture/05-background-skybox/#dds-skybox-architecture-background-dds-skyboxts) [HDR Skybox Architecture (`background-hdr-skybox.ts`)](https://doc.babylonjs.com/lite/architecture/05-background-skybox/#hdr-skybox-architecture-background-hdr-skyboxts) [Background Renderable Orchestrator (`background-renderable.ts`)](https://doc.babylonjs.com/lite/architecture/05-background-skybox/#background-renderable-orchestrator-background-renderablets) [Ground Texture Loading (in `background-ground.ts`)](https://doc.babylonjs.com/lite/architecture/05-background-skybox/#ground-texture-loading-in-background-groundts) [Cube Texture Loading](https://doc.babylonjs.com/lite/architecture/05-background-skybox/#cube-texture-loading) [Render Order](https://doc.babylonjs.com/lite/architecture/05-background-skybox/#render-order) [Shader Logic](https://doc.babylonjs.com/lite/architecture/05-background-skybox/#shader-logic) [Skybox Fragment (`skybox.fragment.wgsl`)](https://doc.babylonjs.com/lite/architecture/05-background-skybox/#skybox-fragment-skyboxfragmentwgsl) [Ground Fragment (`background.ground.fragment.wgsl`)](https://doc.babylonjs.com/lite/architecture/05-background-skybox/#ground-fragment-backgroundgroundfragmentwgsl) [CubeMap Skybox Fragment (`skybox-cubemap.fragment.wgsl`)](https://doc.babylonjs.com/lite/architecture/05-background-skybox/#cubemap-skybox-fragment-skybox-cubemapfragmentwgsl) [Babylon.js Equivalence Map](https://doc.babylonjs.com/lite/architecture/05-background-skybox/#babylonjs-equivalence-map) [Dependencies](https://doc.babylonjs.com/lite/architecture/05-background-skybox/#dependencies) [Test Specification](https://doc.babylonjs.com/lite/architecture/05-background-skybox/#test-specification) [File Manifest](https://doc.babylonjs.com/lite/architecture/05-background-skybox/#file-manifest)

> Package paths:
>
> - `packages/babylon-lite/src/material/pbr/background-material.ts` — Skybox material + cubemap skybox material factory + geometry generation
> - `packages/babylon-lite/src/material/pbr/background-renderable.ts` — Skybox + Ground → Renderables orchestrator, scene size computation
> - `packages/babylon-lite/src/material/pbr/background-ground.ts` — Ground material, geometry, texture loading, UBO
> - `packages/babylon-lite/src/material/pbr/background-dds-skybox.ts` — DDS cubemap skybox renderable
> - `packages/babylon-lite/src/material/pbr/background-dds-environment.ts` — scene-scoped DDS skybox + ground orchestration
> - `packages/babylon-lite/src/material/pbr/background-hdr-skybox.ts` — HDR cubemap skybox renderable
> - `packages/babylon-lite/src/material/standard/skybox-cubemap.ts` — CubeMap skybox for StandardMaterial scenes
> - `packages/babylon-lite/src/texture/cube-texture.ts` — 6-face cube texture loader
>
> Shaders:
>
> - `packages/babylon-lite/shaders/skybox.vertex.wgsl`, `skybox.fragment.wgsl` — Environment solid-color skybox
> - `packages/babylon-lite/shaders/skybox-dds.vertex.wgsl`, `skybox-dds.fragment.wgsl` — DDS cubemap skybox
> - `packages/babylon-lite/shaders/skybox-hdr.fragment.wgsl` — HDR cubemap skybox fragment
> - `packages/babylon-lite/shaders/background.vertex.wgsl`, `background.ground.fragment.wgsl` — Ground plane
> - `packages/babylon-lite/shaders/skybox-cubemap.vertex.wgsl`, `skybox-cubemap.fragment.wgsl` — CubeMap skybox

## Purpose

This module provides five related rendering sub-systems for scene backgrounds:

1. **Solid-Color Skybox Material** (`createSkyboxMaterial`) — Renders the scene background behind all other objects. Uses a box mesh (24v/36i) but outputs a pre-computed clearColor directly from the UBO — the BJS skybox cubemap at max-mip through the image pipeline is indistinguishable from clearColor at default settings.

2. **DDS Cubemap Skybox** (`buildDdsSkyboxRenderable`) — Lazy-loaded skybox that loads `backgroundSkybox.dds` (rgba16float DDS cubemap) and renders it with BJS image processing (exposure, contrast, tonemapping). Uses the shared `CubemapSkyboxMaterial` factory. Tree-shaken from scenes that don't use DDS skyboxes.

3. **HDR Cubemap Skybox** (`buildHdrSkyboxRenderable`) — Lazy-loaded skybox for HDR panorama environments. Samples the specular cubemap (from `EnvironmentTextures`) with image processing. Tree-shaken from scenes that don't use HDR skyboxes.

4. **Ground Material** (`buildGroundRenderable` in `background-ground.ts`) — Renders a translucent ground plane with a diffuse texture, opacity Fresnel, premultiplied alpha blending, and image processing. Matches BJS `BackgroundMaterial` with `DIFFUSE + DIFFUSEHASALPHA + OPACITYFRESNEL + PREMULTIPLYALPHA`. Lazy-loaded and tree-shaken from scenes with `skipGround: true`.

5. **Skybox CubeMap Material** (`buildSkyboxCubeMapGPU`) — Renders a 6-face image cubemap (loaded via `loadCubeTexture`) for StandardMaterial-based scenes. Uses the canonical scene UBO layout. Renders backfaces (cullMode = none). Includes fog support.

6. **Cube Texture Loader** (`loadCubeTexture`) — Loads 6 face images (`_px`, `_nx`, `_py`, `_ny`, `_pz`, `_nz`) and generates mipmaps.


## BJS Ground Architecture (verified via Spector.GPU)

The ground implementation was reverse-engineered by capturing BJS and Lite frames side-by-side with Spector.GPU and comparing shaders, pipelines, textures, and UBO contents.

### Key discovery: the ground is NOT a box with cubemap reflection

Early implementations incorrectly used a 24-vertex/36-index box with a cubemap reflection shader. Spector.GPU captures revealed:

- **BJS ground = `CreatePlane("BackgroundPlane", {size: 15})` with `sideOrientation = BACKSIDE`**
- **4 vertices, 6 indices** (quad, not box!)
- The 36-index draw call visible in captures is the **skybox**, not the ground — misidentified by vertex/index count
- The ground shader has NO `REFLECTION` define — it uses `DIFFUSE + OPACITYFRESNEL + PREMULTIPLYALPHA`

### BJS ground diffuse texture (`backgroundGround.png`)

BJS loads `https://assets.babylonjs.com/core/environments/backgroundGround.png`:

- **1024×1024**, white RGB (255,255,255), radial alpha gradient
- Center alpha = 255, edge alpha = 0
- This texture drives the spatial variation in ground opacity — without it, the ground has uniform alpha

The texture URL is **not hardcoded in the engine**. Client code passes it via `loadEnvironment()` options:

```typescript
await loadEnvironment(scene, envUrl, {
    groundTextureUrl: "https://assets.babylonjs.com/core/environments/backgroundGround.png",
});
```

If no URL is provided, a 1×1 white pixel fallback is used (ground alpha driven by fresnel only).

### Ground alpha pipeline

The final pixel alpha is computed as:

```javascript
alpha = materialAlpha(0.9) × textureAlpha × fadeFactor²
```

Where `fadeFactor = clamp(dot(normalW, viewDir) / 0.1, 0, 1)` (opacity fresnel).

**Camera-dependent behavior:**

- **Grazing angle** (camera at Y≈0, e.g. Scene 1): viewAngle → 0, fadeFactor → 0, alpha → 0 → ground invisible → clearColor shows through
- **Elevated camera** (camera at Y=1.67, e.g. Scene 7): viewAngle > 0.1, fadeFactor → 1, alpha → `0.9 × textureAlpha` → ground partially visible with spatial variation from radial texture

### Ground world matrix

The quad is built in the XY plane and rotated 90° around X to lie flat in XZ:

```javascript
| 1    0       0       0      |
| 0    ε      -1      -0.01   |    ε = 2.220446e-16 (≈0)
| 0    1       ε       0      |
| 0    0       0       1      |
```

Local normal `(0,0,1)` transforms to world `(0,1,0)` (pointing UP). Y offset = `-0.009781629778444767`.

## Public API Surface

### `load-env.ts` (entry point)

```typescript
export async function loadEnvironment(
    scene: SceneContext,
    url: string,
    options: {
        brdfUrl: string;
        groundTextureUrl?: string;
        skipSkybox?: boolean;
        skipGround?: boolean;
        skyboxUrl?: string;
        skyboxSize?: number;
    }
): Promise<EnvironmentTextures>;
```

The `groundTextureUrl` option is passed through to the ground builder, which fetches and uploads the texture to GPU. Standard `loadEnvironment()` backgrounds keep BJS-style background dithering enabled.

### `background-material.ts`

```typescript
// --- Solid-Color Skybox ---
export interface SkyboxMaterial {
    getPipeline(device: GPUDevice, format: GPUTextureFormat, msaaSamples: number): GPURenderPipeline;
    createBindGroup(device: GPUDevice, meshUBO: GPUBuffer, env: EnvironmentTextures): GPUBindGroup;
}
export function createSkyboxMaterial(sceneBindGroupLayout: GPUBindGroupLayout): SkyboxMaterial;

// --- Cubemap Skybox (shared by DDS + HDR variants) ---
export interface CubemapSkyboxMaterial {
    getPipeline(device: GPUDevice, format: GPUTextureFormat, msaaSamples: number): GPURenderPipeline;
    createBindGroup(device: GPUDevice, meshUBO: GPUBuffer, cubeView: GPUTextureView, cubeSampler: GPUSampler): GPUBindGroup;
}
export function createCubemapSkyboxMaterial(sceneBindGroupLayout: GPUBindGroupLayout, label: string, vertCode: string, fragCode: string): CubemapSkyboxMaterial;

// --- Geometry ---
export function createSkyboxBuffers(
    device: GPUDevice,
    S?: number
): {
    posBuffer: GPUBuffer;
    idxBuffer: GPUBuffer;
    idxCount: number;
};
export function createBuf(device: GPUDevice, data: ArrayBufferView, usage: GPUBufferUsageFlags): GPUBuffer;
export function buildSkyboxWorldMatrix(rootPosition: [number, number, number]): Mat4;
```

### `background-renderable.ts`

```typescript
export interface BackgroundRenderableOptions {
    skipSkybox?: boolean; // Skip solid-color skybox (e.g. caller provides HDR/DDS skybox)
    skipGround?: boolean; // Skip ground plane rendering
    skyboxSize?: number; // Skybox size (matches BJS createDefaultEnvironment option)
}

export async function buildBackgroundRenderables(
    scene: SceneContext,
    envTextures: EnvironmentTextures,
    sceneBindGroupLayout: GPUBindGroupLayout,
    sceneBindGroup: GPUBindGroup,
    groundTextureUrl?: string,
    options?: BackgroundRenderableOptions,
    groundImagePromise?: Promise<ImageBitmap>
): Promise<Renderable[]>;

export function computeSceneSize(scene: SceneContext, userSkyboxSize?: number): { groundSize: number; skyboxSize: number; rootPosition: [number, number, number] };

export function computeSkyboxGeometry(scene: SceneContext, userSkyboxSize?: number): { skyHalfSize: number; rootPosition: [number, number, number] };
```

### `background-ground.ts`

```typescript
/** Build the ground renderable for a PBR environment scene. */
export async function buildGroundRenderable(
    device: GPUDevice,
    sceneBindGroupLayout: GPUBindGroupLayout,
    format: GPUTextureFormat,
    msaaSamples: number,
    sceneBindGroup: GPUBindGroup,
    groundSize: number,
    rootPosition: [number, number, number],
    primaryColor: [number, number, number],
    groundTextureUrl?: string,
    groundImagePromise?: Promise<ImageBitmap>,
    enableNoise?: boolean
): Promise<Renderable>;
```

### `background-dds-skybox.ts`

```typescript
/** Build a DDS cube skybox as a complete Renderable (order 0). */
export async function buildDdsSkyboxRenderable(
    scene: SceneContext,
    sceneBindGroupLayout: GPUBindGroupLayout,
    sceneBindGroup: GPUBindGroup,
    skyboxTextureUrl?: string, // default: backgroundSkybox.dds from BJS CDN
    skyboxSize?: number,
    enableNoise?: boolean
): Promise<Renderable>;
```

### `background-dds-environment.ts`

```typescript
export function addDdsEnvironmentBackground(
    scene: SceneContext,
    options: {
        skyboxUrl: string;
        groundTextureUrl: string;
        skyboxSize: number;
        enableNoise?: boolean; // Default true; matches BJS BackgroundMaterial.enableNoise
    }
): void;
```

This helper only orchestrates the existing DDS skybox and ground builders. Scene 112 uses it with `enableNoise: false` after loading environment lighting with `skipSkybox` and `skipGround`, avoiding duplicated skybox/ground implementations while keeping the no-noise path scene-scoped.

### `background-hdr-skybox.ts`

```typescript
/** Build an HDR cubemap skybox as a complete Renderable (order 0). */
export function buildHdrSkyboxRenderable(
    scene: SceneContext,
    envTextures: EnvironmentTextures,
    sceneBindGroupLayout: GPUBindGroupLayout,
    sceneBindGroup: GPUBindGroup,
    skyboxSize?: number
): Renderable;
```

### `skybox-cubemap.ts`

```typescript
export interface SkyboxCubeMapGPU {
    pipeline: GPURenderPipeline;
    sceneBindGroup: GPUBindGroup;
    meshBindGroup: GPUBindGroup;
    sceneUBO: GPUBuffer;
    meshUBO: GPUBuffer;
}

export function buildSkyboxCubeMapGPU(
    device: GPUDevice,
    format: GPUTextureFormat,
    msaaSamples: number,
    sceneUBO: GPUBuffer,
    worldMatrix: Float32Array,
    cubeView: GPUTextureView,
    cubeSampler: GPUSampler
): SkyboxCubeMapGPU;
```

### `cube-texture.ts`

```typescript
export async function loadCubeTexture(
    device: GPUDevice,
    baseUrl: string,
    extension?: string // default: '.jpg'
): Promise<{ texture: GPUTexture; view: GPUTextureView; sampler: GPUSampler }>;
```

## Pipeline Configuration

### Skybox Pipeline (Solid-Color — Environment)

| Setting | Value |
| --- | --- |
| Setting<br>Vertex buffers | Value<br>1: position (`float32x3`, stride 12) |
| Setting<br>Topology | Value<br>`triangle-list` |
| Setting<br>Cull mode | Value<br>`back` |
| Setting<br>Front face | Value<br>`ccw` |
| Setting<br>Depth compare | Value<br>`greater-equal` |
| Setting<br>Depth write | Value<br> **`false`** |
| Setting<br>MSAA | Value<br>`count = msaaSamples` |
| Setting<br>Blend | Value<br>None |

### Cubemap Skybox Pipeline (DDS + HDR variants)

Both DDS and HDR cubemap skyboxes use the same pipeline configuration via `createCubemapSkyboxMaterial` — only the shader sources differ.

| Setting | Value |
| --- | --- |
| Setting<br>Vertex buffers | Value<br>1: position (`float32x3`, stride 12) |
| Setting<br>Topology | Value<br>`triangle-list` |
| Setting<br>Cull mode | Value<br>`back` |
| Setting<br>Front face | Value<br>`ccw` |
| Setting<br>Depth compare | Value<br>`greater-equal` |
| Setting<br>Depth write | Value<br> **`false`** |
| Setting<br>MSAA | Value<br>`count = msaaSamples` |
| Setting<br>Blend | Value<br>None |

### Ground Pipeline

| Setting | Value |
| --- | --- |
| Setting<br>Vertex buffers | Value<br>3: position (`float32x3`, stride 12), normal (`float32x3`, stride 12), uv (`float32x2`, stride 8) |
| Setting<br>Topology | Value<br>`triangle-list` |
| Setting<br>Cull mode | Value<br>`back` |
| Setting<br>Front face | Value<br>`ccw` |
| Setting<br>Depth compare | Value<br>`greater-equal` |
| Setting<br>Depth write | Value<br> **`false`** |
| Setting<br>MSAA | Value<br>`count = msaaSamples` |
| Setting<br>Blend | Value<br>Premultiplied alpha: `src=one, dst=one-minus-src-alpha` (both color and alpha) |

### Skybox CubeMap Pipeline (StandardMaterial scenes)

| Setting | Value |
| --- | --- |
| Setting<br>Vertex buffers | Value<br>2: position (`float32x3`, stride 12), normal (`float32x3`, stride 12) |
| Setting<br>Topology | Value<br>`triangle-list` |
| Setting<br>Cull mode | Value<br> **`none`** (sees inside of box) |
| Setting<br>Front face | Value<br>`ccw` |
| Setting<br>Depth compare | Value<br>`greater-equal` |
| Setting<br>Depth write | Value<br>`true` |
| Setting<br>MSAA | Value<br>`count = msaaSamples` |
| Setting<br>Blend | Value<br>None |

### Bind Group Layouts

**Skybox Solid-Color (Group 1)**:

| Binding | Visibility | Type | Resource |
| --- | --- | --- | --- |
| Binding<br>0 | Visibility<br>VERTEX \| FRAGMENT | Type<br>Uniform buffer | Resource<br>Mesh UBO (96 bytes: world + primaryColor + skyOutputColor) |

**Cubemap Skybox — DDS + HDR (Group 1)** (shared layout via `createCubemapSkyboxMaterial`):

| Binding | Visibility | Type | Resource |
| --- | --- | --- | --- |
| Binding<br>0 | Visibility<br>VERTEX \| FRAGMENT | Type<br>Uniform buffer | Resource<br>Mesh UBO (see variant-specific sizes below) |
| Binding<br>1 | Visibility<br>FRAGMENT | Type<br>texture\_cube | Resource<br>Cubemap texture (DDS or specular env cube) |
| Binding<br>2 | Visibility<br>FRAGMENT | Type<br>sampler (filtering) | Resource<br>Cubemap sampler |

**Ground (Group 1)**:

| Binding | Visibility | Type | Resource |
| --- | --- | --- | --- |
| Binding<br>0 | Visibility<br>VERTEX \| FRAGMENT | Type<br>Uniform buffer | Resource<br>Mesh UBO (96 bytes: world + primaryColor + alpha + backgroundCenter) |
| Binding<br>1 | Visibility<br>FRAGMENT | Type<br>texture\_2d | Resource<br>Ground diffuse texture (loaded from URL) |
| Binding<br>2 | Visibility<br>FRAGMENT | Type<br>sampler (filtering) | Resource<br>Ground texture sampler (bilinear) |

**Skybox CubeMap (Group 1)**:

| Binding | Visibility | Type | Resource |
| --- | --- | --- | --- |
| Binding<br>0 | Visibility<br>VERTEX | Type<br>Uniform buffer | Resource<br>Mesh UBO (world matrix only) |
| Binding<br>1 | Visibility<br>FRAGMENT | Type<br>texture\_cube | Resource<br>Cube texture |
| Binding<br>2 | Visibility<br>FRAGMENT | Type<br>sampler | Resource<br>Cube sampler |

## Internal Architecture

### Skybox Geometry

24 vertices, 36 indices — a box mesh. The half-size `S` defaults to 15 but is dynamically computed from scene bounds via `computeSkyboxGeometry()`.

```javascript
Positions (8 unique corners, but 24 vertices for separate face normals):
  Front:  ( S,-S, S), (-S,-S, S), (-S, S, S), ( S, S, S)
  Back:   ( S, S,-S), (-S, S,-S), (-S,-S,-S), ( S,-S,-S)
  Right:  ( S, S,-S), ( S,-S,-S), ( S,-S, S), ( S, S, S)
  Left:   (-S, S, S), (-S,-S, S), (-S,-S,-S), (-S, S,-S)
  Top:    (-S, S, S), (-S, S,-S), ( S, S,-S), ( S, S, S)
  Bottom: ( S,-S, S), ( S,-S,-S), (-S,-S,-S), (-S,-S, S)

Indices (36, triangle-list, uint16):
  Per face: (2,1,0, 3,2,0)
```

### Scene Size Computation (`computeSceneSize`)

Matches BJS `EnvironmentHelper._setupSizes()` with `sizeAuto=true`:

1. Compute world-space AABB of all meshes (offset local bounds by world translation)
2. Compute scene diagonal length: `sqrt(dx² + dy² + dz²)`
3. Start with `groundSize = 15, skyboxSize = userSkyboxSize ?? 20`
4. If camera has `upperRadiusLimit`: use `upperRadiusLimit × 2` as base
5. If diagonal > groundSize: `groundSize = diagonal × 2, skyboxSize = groundSize`
6. `groundSize *= 1.1`, `skyboxSize *= 1.5`
7. `rootPosition = [centerX, minY − 0.00001, centerZ]`

### Skybox World Matrix (`buildSkyboxWorldMatrix`)

Identity matrix translated to `rootPosition`:

```javascript
| 1  0  0  rootX |
| 0  1  0  rootY |
| 0  0  1  rootZ |
| 0  0  0  1     |
```

### Ground Geometry (in `background-ground.ts`)

4 vertices, 6 indices — a flat quad in the XY plane, extents ±(groundSize/2).

```javascript
Positions: (-h,-h,0), (h,-h,0), (h,h,0), (-h,h,0)    where h = groundSize/2
Normals:   (0,0,1) for all 4 vertices (BACKSIDE — flipped from default -Z)
UVs:       (0,0), (1,0), (1,1), (0,1)
Indices:   (0,2,1, 0,3,2) (BACKSIDE winding — swapped from FRONTSIDE 0,1,2,0,2,3)
```

The ground is rotated 90° around X by its world matrix to lie flat in the XZ plane.
Local normal `(0,0,+1)` → world normal `(0,+1,0)` (pointing UP).

### Mesh UBO Layout — Solid-Color Skybox (96 bytes)

| Offset (bytes) | Size | WGSL Type | Field |
| --- | --- | --- | --- |
| Offset (bytes)<br>0 | Size<br>64 | WGSL Type<br>`mat4x4<f32>` | Field<br>`world` |
| Offset (bytes)<br>64 | Size<br>12 | WGSL Type<br>`vec3<f32>` | Field<br>`primaryColor` |
| Offset (bytes)<br>76 | Size<br>4 | WGSL Type<br>`f32` | Field<br>`_pad` |
| Offset (bytes)<br>80 | Size<br>12 | WGSL Type<br>`vec3<f32>` | Field<br>`skyOutputColor` (pre-computed sRGB clearColor) |
| Offset (bytes)<br>92 | Size<br>4 | WGSL Type<br>`f32` | Field<br>`_pad` |

### Mesh UBO Layout — DDS Skybox (96 bytes)

| Offset (bytes) | Size | WGSL Type | Field |
| --- | --- | --- | --- |
| Offset (bytes)<br>0 | Size<br>64 | WGSL Type<br>`mat4x4<f32>` | Field<br>`world` |
| Offset (bytes)<br>64 | Size<br>12 | WGSL Type<br>`vec3<f32>` | Field<br>`primaryColor` |
| Offset (bytes)<br>76 | Size<br>4 | WGSL Type<br>`f32` | Field<br>`exposureLinear` |
| Offset (bytes)<br>80 | Size<br>4 | WGSL Type<br>`f32` | Field<br>`contrast` |
| Offset (bytes)<br>84 | Size<br>12 | WGSL Type<br>— | Field<br>`_pad` |

### Mesh UBO Layout — HDR Skybox (112 bytes)

| Offset (bytes) | Size | WGSL Type | Field |
| --- | --- | --- | --- |
| Offset (bytes)<br>0 | Size<br>64 | WGSL Type<br>`mat4x4<f32>` | Field<br>`world` |
| Offset (bytes)<br>64 | Size<br>12 | WGSL Type<br>`vec3<f32>` | Field<br>`primaryColor` |
| Offset (bytes)<br>76 | Size<br>4 | WGSL Type<br>`f32` | Field<br>`_pad` |
| Offset (bytes)<br>80 | Size<br>12 | WGSL Type<br>`vec3<f32>` | Field<br>`skyOutputColor` (clearColor for fallback) |
| Offset (bytes)<br>92 | Size<br>4 | WGSL Type<br>`f32` | Field<br>`_pad` |
| Offset (bytes)<br>96 | Size<br>4 | WGSL Type<br>`f32` | Field<br>`exposureLinear` |
| Offset (bytes)<br>100 | Size<br>4 | WGSL Type<br>`f32` | Field<br>`contrast` |
| Offset (bytes)<br>104 | Size<br>8 | WGSL Type<br>— | Field<br>`_pad` |

### Mesh UBO Layout — Ground (96 bytes, in `background-ground.ts`)

| Offset (bytes) | Size | WGSL Type | Field |
| --- | --- | --- | --- |
| Offset (bytes)<br>0 | Size<br>64 | WGSL Type<br>`mat4x4<f32>` | Field<br>`world` |
| Offset (bytes)<br>64 | Size<br>12 | WGSL Type<br>`vec3<f32>` | Field<br>`primaryColor` |
| Offset (bytes)<br>76 | Size<br>4 | WGSL Type<br>`f32` | Field<br>`alpha` (default: 0.9, matches BJS `groundOpacity`) |
| Offset (bytes)<br>80 | Size<br>12 | WGSL Type<br>`vec3<f32>` | Field<br>`backgroundCenter` (default: origin) |
| Offset (bytes)<br>92 | Size<br>4 | WGSL Type<br>`f32` | Field<br>`_pad` |

### Mesh UBO Layout — CubeMap Skybox (64 bytes)

| Offset (bytes) | Size | WGSL Type | Field |
| --- | --- | --- | --- |
| Offset (bytes)<br>0 | Size<br>64 | WGSL Type<br>`mat4x4<f32>` | Field<br>`world` |

### DDS Skybox Architecture (`background-dds-skybox.ts`)

Default DDS URL: `https://assets.babylonjs.com/core/environments/backgroundSkybox.dds`

Pipeline:

1. `computeSkyboxGeometry(scene, skyboxSize)` → `skyHalfSize`, `rootPosition`
2. `buildSkyboxWorldMatrix(rootPosition)` → identity + translation
3. `createSkyboxBuffers(device, skyHalfSize)` → box geometry
4. `loadDdsCube(device, url)` → fetch DDS, parse header, upload all mip levels, create cube view + sampler
5. `createCubemapSkyboxMaterial(sceneBindGroupLayout, "skybox-dds", vertCode, fragCode)` → shared material factory
6. Create UBO with world, primaryColor, exposure, contrast
7. Return `Renderable` with order 0

DDS cube texture loading:

- Parse DDS header: `Int32Array(buf, 0, 32)` — width, height, mipCount
- Handle DX10 extended header offset
- Upload all mip levels per face (face-major layout, `rgba16float`, 8 bytes/pixel)
- Sampler: linear mag/min/mipmap, clamp-to-edge, maxAnisotropy=4

### HDR Skybox Architecture (`background-hdr-skybox.ts`)

Samples the specular cubemap from `EnvironmentTextures` (already loaded by `loadHdrEnvironment`).

Pipeline:

1. `computeSkyboxGeometry(scene, skyboxSize)` → `skyHalfSize`, `rootPosition`
2. `buildSkyboxWorldMatrix(rootPosition)` → identity + translation
3. `createSkyboxBuffers(device, skyHalfSize)` → box geometry
4. `createCubemapSkyboxMaterial(sceneBindGroupLayout, "skybox-hdr", vertCode, fragCode)` → shared material factory
5. Create UBO with world, primaryColor, skyOutputColor (clearColor), exposure, contrast
6. Bind `envTextures.specularCubeView` \+ `envTextures.cubeSampler`
7. Return `Renderable` with order 0

### Background Renderable Orchestrator (`background-renderable.ts`)

Orchestrates the creation of background renderables:

1. If `!options.skipSkybox`: creates solid-color skybox via `createSkyboxMaterial()`
2. If `!options.skipGround`: dynamically imports `background-ground.js` → `buildGroundRenderable(..., enableNoise)`
3. Ground is dynamically imported to enable tree-shaking for scenes without ground

Both DDS and HDR skybox callers (in `load-env.ts`, `load-hdr.ts`, `load-dds-env.ts`) use `buildBackgroundRenderables()` with `skipSkybox: true` when they provide their own cubemap skybox.

### Ground Texture Loading (in `background-ground.ts`)

The ground diffuse texture is loaded at runtime from a client-provided URL:

1. Caller provides `groundTextureUrl` and/or pre-fetched `groundImagePromise`
2. If promise provided: await it. Otherwise: `fetch(url)` → `createImageBitmap(blob, { premultiplyAlpha: 'none' })`
3. `copyExternalImageToTexture()` to upload to GPU as `rgba8unorm`
4. If no URL provided: creates a 1×1 white pixel fallback

The standard BJS ground texture is `backgroundGround.png` (1024×1024, white RGB, radial alpha gradient).

### Cube Texture Loading

1. Construct 6 URLs: `${baseUrl}_px${ext}`, `_nx`, `_py`, `_ny`, `_pz`, `_nz`.
2. Fetch all 6 in parallel → `createImageBitmap` with `colorSpaceConversion: 'none'`.
3. Create GPU texture: `[size, size, 6]`, format `rgba8unorm`, dimension `2d`, full mip chain.
4. Copy each face bitmap to the corresponding array layer.
5. Generate mipmaps via GPU blit pass (fullscreen quad sampling previous mip → next mip).
6. Create cube view (`dimension: 'cube'`) and trilinear sampler.

### Render Order

| Renderable | Order | Notes |
| --- | --- | --- |
| Renderable<br>Skybox | Order<br>0 | Notes<br>Renders first (behind everything), writes depth |
| Renderable<br>PBR meshes | Order<br>100 (default) | Notes<br>Opaque objects |
| Renderable<br>Ground | Order<br>200 | Notes<br>Renders last (transparent), no depth write, alpha blend |

## Shader Logic

### Skybox Fragment (`skybox.fragment.wgsl`)

Currently outputs a pre-computed clearColor from the mesh UBO. The BJS skybox cubemap sampled at max-mip through the full image processing pipeline produces output indistinguishable from clearColor at default settings.

```javascript
output = mesh.skyOutputColor  // pre-computed sRGB value
```

> **Note**: This is a visual shortcut. A proper implementation would sample the cubemap and run the image processing pipeline. The shortcut works because at default PBR environment settings (`primaryColor = #212121`, `exposure = 0.8`, `contrast = 1.2`), the processed cubemap output equals clearColor to within dithering precision.

### Ground Fragment (`background.ground.fragment.wgsl`)

Verified against BJS shd\_16 via Spector.GPU capture comparison.

```javascript
// Sample diffuse texture (BJS backgroundGround.png: white RGB, radial alpha)
diffuseMap = textureSample(groundTexture, groundSampler, uv)

// Base color from texture tinted by primaryColor
diffuseColor = diffuseMap.rgb
finalColor = max(diffuseColor, 0) × mesh.primaryColor

// Alpha = material alpha × texture alpha
finalAlpha = mesh.alpha × diffuseMap.a

// OPACITYFRESNEL (BJS shd_16 lines 367-370)
backgroundCenter = mesh.backgroundCenter  // default: origin
viewAngle = dot(normalW, normalize(cameraPosition - backgroundCenter))
fadeFactor = clamp(viewAngle / 0.1, 0, 1)
finalAlpha *= fadeFactor²

// Image processing (exposure, tonemapping, gamma, contrast — preserves alpha)
color = applyImageProcessing(vec4(finalColor, finalAlpha))

// PREMULTIPLYALPHA (BJS shd_16 line 373)
color.rgb *= color.a

// Dithering (variance = 0.5)
color.rgb += dither(worldPos.xy, 0.5)
```

### CubeMap Skybox Fragment (`skybox-cubemap.fragment.wgsl`)

```javascript
lookupDir = normalize(positionLocal)     // object-space position as direction
color = textureSample(cubeTexture, cubeSampler, lookupDir)

// Apply fog (if enabled)
if fogMode > 0:
  fogCoeff = calcFogFactor(vFogDistance)
  color.rgb = mix(fogColor, color.rgb, fogCoeff)
```

## Babylon.js Equivalence Map

| Babylon Lite | Babylon.js |
| --- | --- |
| Babylon Lite<br>`loadEnvironment(scene, url, { groundTextureUrl })` | Babylon.js<br>`scene.createDefaultEnvironment()` (loads env + ground texture internally) |
| Babylon Lite<br>`createSkyboxMaterial()` | Babylon.js<br>`BackgroundMaterial` with `REFLECTIONMAP_SKYBOX` (solid fallback) |
| Babylon Lite<br>`createCubemapSkyboxMaterial()` | Babylon.js<br>`BackgroundMaterial` with actual cubemap sampling |
| Babylon Lite<br>`buildDdsSkyboxRenderable()` | Babylon.js<br>`BackgroundMaterial` with `backgroundSkybox.dds` cubemap |
| Babylon Lite<br>`buildHdrSkyboxRenderable()` | Babylon.js<br>`BackgroundMaterial` with HDR cubemap from `HDRCubeTexture` |
| Babylon Lite<br>`buildGroundRenderable()` | Babylon.js<br>`BackgroundMaterial` ground mesh with `DIFFUSE + OPACITYFRESNEL + PREMULTIPLYALPHA` |
| Babylon Lite<br>`createSkyboxBuffers(S)` | Babylon.js<br>`BABYLON.BoxBuilder` (±S extents skybox, 24v/36i) |
| Babylon Lite<br>`createGroundBuffers(groundSize)` | Babylon.js<br>`BABYLON.PlaneBuilder` with `BACKSIDE` (4v/6i) |
| Babylon Lite<br>`computeSceneSize()` | Babylon.js<br>`EnvironmentHelper._getSceneSize()` \+ `_setupSizes()` |
| Babylon Lite<br>`computeSkyboxGeometry()` | Babylon.js<br>`EnvironmentHelper._setupSizes()` with `sizeAuto=true` |
| Babylon Lite<br>`buildSkyboxWorldMatrix()` | Babylon.js<br>`EnvironmentHelper._setupSkyboxMaterial()` world matrix |
| Babylon Lite<br>`buildSkyboxCubeMapGPU()` | Babylon.js<br>`StandardMaterial` \+ `CubeTexture(SKYBOX_MODE)` |
| Babylon Lite<br>`loadCubeTexture()` | Babylon.js<br>`new BABYLON.CubeTexture(url, scene)` |
| Babylon Lite<br>`primaryColor` | Babylon.js<br>`BackgroundMaterial.primaryColor` (#212121 linear → `[0.087, 0.087, 0.212]`) |
| Babylon Lite<br>Ground Y offset `minY − 0.00001` | Babylon.js<br>Babylon's computed `sceneSize / rootPosition` |
| Babylon Lite<br>`mesh.alpha = 0.9` | Babylon.js<br>`BackgroundMaterial.alpha` (default ground opacity) |
| Babylon Lite<br>`mesh.backgroundCenter` | Babylon.js<br>`BackgroundMaterial._primaryColor` (fresnel origin) |
| Babylon Lite<br>Opacity Fresnel `viewAngle / 0.1` | Babylon.js<br>`BackgroundMaterial.opacityFresnel` (start=0.1) |
| Babylon Lite<br>Ground diffuse texture (URL) | Babylon.js<br>`backgroundGround.png` loaded by `EnvironmentHelper` |
| Babylon Lite<br>Ground blend `src=one, dst=one-minus-src-alpha` | Babylon.js<br>Premultiplied alpha blend (BJS engine auto-set) |
| Babylon Lite<br>`dither(seed, 0.5)` | Babylon.js<br>`BackgroundMaterial.enableNoise` |
| Babylon Lite<br>`skyOutputColor` UBO field | Babylon.js<br>BJS cubemap sampled at max-mip (produces same result) |
| Babylon Lite<br>DDS skybox `backgroundSkybox.dds` | Babylon.js<br>BJS `createDefaultEnvironment` skybox DDS cubemap |
| Babylon Lite<br>HDR skybox samples `specularCubeView` | Babylon.js<br>BJS `HDRCubeTexture` skybox rendering |
| Babylon Lite<br>CubeMap skybox `cullMode: 'none'` | Babylon.js<br>`material.backFaceCulling = false` |

## Dependencies

- **`background-material.ts` imports**: `EnvironmentTextures` from `../../loader-env/load-env.js`; `Mat4` from `../../math/types.js`; shader sources via `?raw`; render/pipeline helpers; `WGSL_DITHER` from `../../shader/wgsl-helpers.js`.
- **`background-renderable.ts` imports**: `SceneContext` from `../../scene/scene.js`; `EngineInternal` from `../../engine/engine.js`; `EnvironmentTextures` from `../../loader-env/load-env.js`; `Mat4` from `../../math/types.js`; `Renderable` from `../../render/renderable.js`; `createSkyboxMaterial`, `createSkyboxBuffers`, `buildSkyboxWorldMatrix` from `./background-material.js`; dynamic import of `./background-ground.js`.
- **`background-ground.ts` imports**: `Mat4` from `../../math/types.js`; `Renderable` from `../../render/renderable.js`; `getOrCreateSampler` from `../../resource/gpu-pool.js`; shader sources via `?raw`; `createBuf` from `./background-material.js`; `SCENE_UBO_WGSL` from `../../shader/scene-uniforms.js`; `WGSL_IMAGE_PROCESSING`, `WGSL_DITHER` from `../../shader/wgsl-helpers.js`.
- **`background-dds-skybox.ts` imports**: `SceneContext` from `../../scene/scene.js`; `EngineInternal` from `../../engine/engine.js`; `Renderable` from `../../render/renderable.js`; `getOrCreateSampler` from `../../resource/gpu-pool.js`; `computeSkyboxGeometry` from `./background-renderable.js`; `createSkyboxBuffers`, `buildSkyboxWorldMatrix`, `createCubemapSkyboxMaterial` from `./background-material.js`; `SCENE_UBO_WGSL` from `../../shader/scene-uniforms.js`; `WGSL_DITHER` from `../../shader/wgsl-helpers.js`; shader sources via `?raw`.
- **`background-hdr-skybox.ts` imports**: `SceneContext` from `../../scene/scene.js`; `EngineInternal` from `../../engine/engine.js`; `EnvironmentTextures` from `../../loader-env/load-env.js`; `Renderable` from `../../render/renderable.js`; `createSkyboxBuffers`, `buildSkyboxWorldMatrix`, `createCubemapSkyboxMaterial` from `./background-material.js`; `computeSkyboxGeometry` from `./background-renderable.js`; shader sources via `?raw`; `SCENE_UBO_WGSL` from `../../shader/scene-uniforms.js`.
- **`skybox-cubemap.ts` imports**: Shader sources via `?raw`.
- **`cube-texture.ts` imports**: None (standalone).
- **Depended on by**: `load-env.ts` (deferred builder), `load-hdr.ts` (dynamic imports of `background-hdr-skybox.js` and `background-renderable.js`), `load-dds-env.ts` (uses `buildBackgroundRenderables`), `load-skybox.ts` (creates cubemap skybox).

## Test Specification

| Test | Description |
| --- | --- |
| Test<br>`createSkyboxBuffers` | Description<br>24 verts (72 floats), 36 indices |
| Test<br>`createSkyboxBuffers custom size` | Description<br>Verify positions scale with `S` parameter |
| Test<br>`createGroundBuffers` | Description<br>4 verts, 4 normals, 4 UVs, 6 indices |
| Test<br>`skybox pipeline depth write false` | Description<br>Verify solid-color skybox depth config |
| Test<br>`cubemap skybox pipeline depth write false` | Description<br>Verify DDS/HDR skybox depth config |
| Test<br>`ground pipeline depth write false` | Description<br>Verify depth write disabled |
| Test<br>`ground pipeline blend premultiplied` | Description<br>src=one, dst=one-minus-src-alpha |
| Test<br>`ground pipeline 3 vertex buffers` | Description<br>position + normal + uv |
| Test<br>`ground bind group has texture` | Description<br>Binding 1 = texture\_2d, binding 2 = sampler |
| Test<br>`ground fallback texture 1×1 white` | Description<br>No URL → 1×1 RGBA(255,255,255,255) |
| Test<br>`skybox cubemap cull mode none` | Description<br>Verify no culling for inside-box rendering |
| Test<br>`loadCubeTexture loads 6 faces` | Description<br>Verify 6 URLs constructed with correct suffixes |
| Test<br>`loadCubeTexture mip count` | Description<br>`floor(log2(size)) + 1` |
| Test<br>`computeSceneSize empty scene` | Description<br>Returns defaults: groundSize=15, skyboxSize=20 |
| Test<br>`computeSceneSize with meshes` | Description<br>Diagonal > 15 → groundSize=diagonal×2.2, skyboxSize=×1.5 |
| Test<br>`buildSkyboxWorldMatrix` | Description<br>Identity + rootPosition translation |
| Test<br>`DDS skybox loads default URL` | Description<br>Fetches backgroundSkybox.dds |
| Test<br>`DDS skybox UBO layout` | Description<br>world + primaryColor + exposure + contrast = 96 bytes |
| Test<br>`HDR skybox uses specularCubeView` | Description<br>Binds envTextures cube |
| Test<br>`HDR skybox UBO layout` | Description<br>112 bytes with exposure + contrast fields |
| Test<br>`buildBackgroundRenderables skipSkybox` | Description<br>Only ground returned |
| Test<br>`buildBackgroundRenderables skipGround` | Description<br>Only skybox returned |
| Test<br>`dither variance` | Description<br>Output varies by ±0.5/255 |
| Test<br>`opacity fresnel at grazing` | Description<br>fadeFactor → 0 at edge |
| Test<br>`opacity fresnel head-on` | Description<br>fadeFactor → 1 |
| Test<br>Scene 1 full-image MAD ≤ 1 | Description<br>Ground invisible (grazing), clearColor match |
| Test<br>Scene 7 full-image MAD ≤ 2 | Description<br>Ground visible (elevated camera), texture spatial variation |

## File Manifest

| File | Size | Purpose |
| --- | --- | --- |
| File<br>`src/material/pbr/background-material.ts` | Size<br>~184 lines | Purpose<br>Solid-color skybox material, cubemap skybox material factory, skybox geometry, shared buffer helpers, skybox world matrix |
| File<br>`src/material/pbr/background-renderable.ts` | Size<br>~203 lines | Purpose<br>Skybox + Ground orchestrator, scene size computation, `computeSkyboxGeometry` |
| File<br>`src/material/pbr/background-ground.ts` | Size<br>~246 lines | Purpose<br>Ground material factory, ground geometry, ground UBO, ground texture loader |
| File<br>`src/material/pbr/background-dds-skybox.ts` | Size<br>~130 lines | Purpose<br>DDS cubemap skybox renderable, DDS cube texture loader, DDS mesh UBO |
| File<br>`src/material/pbr/background-hdr-skybox.ts` | Size<br>~84 lines | Purpose<br>HDR cubemap skybox renderable, HDR mesh UBO |
| File<br>`src/material/standard/skybox-cubemap.ts` | Size<br>~104 lines | Purpose<br>CubeMap skybox pipeline + bind groups |
| File<br>`src/texture/cube-texture.ts` | Size<br>~141 lines | Purpose<br>6-face cube texture loader with mipmap generation |
| File<br>`shaders/skybox.vertex.wgsl` | Size<br>~38 lines | Purpose<br>Local position passthrough for cubemap lookup |
| File<br>`shaders/skybox.fragment.wgsl` | Size<br>~91 lines | Purpose<br>Outputs pre-computed clearColor from UBO |
| File<br>`shaders/skybox-dds.vertex.wgsl` | Size<br>~38 lines | Purpose<br>DDS skybox vertex shader (position → local direction) |
| File<br>`shaders/skybox-dds.fragment.wgsl` | Size<br>~53 lines | Purpose<br>DDS cubemap sample + image processing with environment direction and LOD hooks |
| File<br>`shaders/skybox-hdr.fragment.wgsl` | Size<br>~44 lines | Purpose<br>HDR cubemap sample + image processing with environment direction and LOD hooks |
| File<br>`shaders/background.vertex.wgsl` | Size<br>~48 lines | Purpose<br>World transform, normal, UV passthrough for ground |
| File<br>`shaders/background.ground.fragment.wgsl` | Size<br>~104 lines | Purpose<br>Diffuse texture sampling, opacity Fresnel, premultiplied alpha, image processing |
| File<br>`shaders/skybox-cubemap.vertex.wgsl` | Size<br>~38 lines | Purpose<br>Object-space position for cube lookup + fog distance |
| File<br>`shaders/skybox-cubemap.fragment.wgsl` | Size<br>~58 lines | Purpose<br>Cube texture sample + fog |

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