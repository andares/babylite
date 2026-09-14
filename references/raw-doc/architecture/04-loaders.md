---
title: Loaders
source: https://doc.babylonjs.com/lite/architecture/04-loaders/
section: Architecture
---

[API](https://doc.babylonjs.com/lite/typedoc/)

[Babylon Lite](https://doc.babylonjs.com/lite/)\|

[Architecture](https://doc.babylonjs.com/lite/architecture/)\|

[Loaders](https://doc.babylonjs.com/lite/architecture/04-loaders/)

…\|

[Babylon Lite](https://doc.babylonjs.com/lite/)\|

[Architecture](https://doc.babylonjs.com/lite/architecture/)\|

[Loaders](https://doc.babylonjs.com/lite/architecture/04-loaders/)

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


# Module: Loaders (glTF + .env + HDR + .babylon + Skybox + Splats)

### Table Of Contents

[Module: Loaders (glTF + .env + HDR + .babylon + Skybox + Splats)](https://doc.babylonjs.com/lite/architecture/04-loaders/#module-loaders-gltf--env--hdr--babylon--skybox--splats) [Purpose](https://doc.babylonjs.com/lite/architecture/04-loaders/#purpose) [Public API Surface](https://doc.babylonjs.com/lite/architecture/04-loaders/#public-api-surface) [`asset-container.ts`](https://doc.babylonjs.com/lite/architecture/04-loaders/#asset-containerts) [Compressed-geometry decoder base URLs (`draco-decode.ts`, `meshopt-decode.ts`)](https://doc.babylonjs.com/lite/architecture/04-loaders/#compressed-geometry-decoder-base-urls-draco-decodets-meshopt-decodets) [`load-gltf.ts`](https://doc.babylonjs.com/lite/architecture/04-loaders/#load-gltfts) [`load-env.ts`](https://doc.babylonjs.com/lite/architecture/04-loaders/#load-envts) [Internal Architecture](https://doc.babylonjs.com/lite/architecture/04-loaders/#internal-architecture) [glTF Loader Pipeline](https://doc.babylonjs.com/lite/architecture/04-loaders/#gltf-loader-pipeline) [GLB Container Format](https://doc.babylonjs.com/lite/architecture/04-loaders/#glb-container-format) [Accessor Resolution](https://doc.babylonjs.com/lite/architecture/04-loaders/#accessor-resolution) [RH→LH Coordinate Conversion](https://doc.babylonjs.com/lite/architecture/04-loaders/#rhlh-coordinate-conversion) [glTF `camera` Node Property (`gltf-feature-camera.ts`)](https://doc.babylonjs.com/lite/architecture/04-loaders/#gltf-camera-node-property-gltf-feature-camerats) [Texture Upload](https://doc.babylonjs.com/lite/architecture/04-loaders/#texture-upload) [`KHR_texture_basisu` / KTX2 Texture Sources](https://doc.babylonjs.com/lite/architecture/04-loaders/#khr_texture_basisu--ktx2-texture-sources) [Interleaved Vertex Buffers (`gltf-interleave.ts`)](https://doc.babylonjs.com/lite/architecture/04-loaders/#interleaved-vertex-buffers-gltf-interleavets) [`EXT_meshopt_compression` \+ `KHR_mesh_quantization` (`gltf-feature-meshopt.ts`, `gltf-ext-quantization.ts`)](https://doc.babylonjs.com/lite/architecture/04-loaders/#ext_meshopt_compression--khr_mesh_quantization-gltf-feature-meshoptts-gltf-ext-quantizationts) [`KHR_xmp_json_ld` Metadata (`gltf-feature-xmp.ts`)](https://doc.babylonjs.com/lite/architecture/04-loaders/#khr_xmp_json_ld-metadata-gltf-feature-xmpts) [Bounding Box Computation](https://doc.babylonjs.com/lite/architecture/04-loaders/#bounding-box-computation) [Shared Sampler](https://doc.babylonjs.com/lite/architecture/04-loaders/#shared-sampler) [Environment Loader Pipeline](https://doc.babylonjs.com/lite/architecture/04-loaders/#environment-loader-pipeline) [.env File Format](https://doc.babylonjs.com/lite/architecture/04-loaders/#env-file-format) [RGBD Decoding](https://doc.babylonjs.com/lite/architecture/04-loaders/#rgbd-decoding) [Float16 Conversion (`floatToHalf`)](https://doc.babylonjs.com/lite/architecture/04-loaders/#float16-conversion-floattohalf) [BRDF LUT Generation](https://doc.babylonjs.com/lite/architecture/04-loaders/#brdf-lut-generation) [`integrateBRDF` Algorithm](https://doc.babylonjs.com/lite/architecture/04-loaders/#integratebrdf-algorithm) [`importanceSampleGGX`](https://doc.babylonjs.com/lite/architecture/04-loaders/#importancesampleggx) [`radicalInverseVdC`](https://doc.babylonjs.com/lite/architecture/04-loaders/#radicalinversevdc) [Spherical Harmonics Conversion](https://doc.babylonjs.com/lite/architecture/04-loaders/#spherical-harmonics-conversion) [Babylon.js Equivalence Map](https://doc.babylonjs.com/lite/architecture/04-loaders/#babylonjs-equivalence-map) [Dependencies](https://doc.babylonjs.com/lite/architecture/04-loaders/#dependencies) [Test Specification](https://doc.babylonjs.com/lite/architecture/04-loaders/#test-specification) [File Manifest](https://doc.babylonjs.com/lite/architecture/04-loaders/#file-manifest)

> Package paths:
>
> - `packages/babylon-lite/src/loader-gltf/load-gltf.ts` — GLB 2.0 loader
> - `packages/babylon-lite/src/loader-gltf/gltf-feature-camera.ts` — glTF `camera` node property (core spec, not an extension)
> - `packages/babylon-lite/src/loader-gltf/gltf-ext-basisu.ts` — glTF `KHR_texture_basisu` feature module
> - `packages/babylon-lite/src/loader-gltf/gltf-feature-meshopt.ts` \+ `meshopt-decode.ts` — `EXT_meshopt_compression` feature module + decoder
> - `packages/babylon-lite/src/loader-gltf/gltf-ext-quantization.ts` — `KHR_mesh_quantization` feature module
> - `packages/babylon-lite/src/loader-gltf/gltf-feature-xmp.ts` — `KHR_xmp_json_ld` metadata feature module
> - `packages/babylon-lite/src/loader-gltf/gltf-feature-extras.ts` — `ExtrasAsMetadata` feature module
> - `packages/babylon-lite/src/loader-gltf/gltf-interleave.ts` — dynamic native interleaved-vertex-buffer support (de-strided CPU copies built lazily on demand)
> - `packages/babylon-lite/src/loader-gltf/gltf-share.ts` — duplicate-primitive CPU/GPU geometry sharing
> - `packages/babylon-lite/src/loader-env/load-env.ts` — Babylon .env environment loader
> - `packages/babylon-lite/src/loader-env/load-dds-env.ts` — DDS cubemap environment loader
> - `packages/babylon-lite/src/loader-env/env-helpers.ts` — Shared environment assembly helpers
> - `packages/babylon-lite/src/loader-env/rgbd-decode.ts` — Shared RGBD PNG/cubemap decode (GPU compute)
> - `packages/babylon-lite/src/loader-hdr/load-hdr.ts` — HDR panorama environment loader
> - `packages/babylon-lite/src/loader-hdr/hdr-parser.ts` — RGBE CPU parser + SH extraction
> - `packages/babylon-lite/src/loader-hdr/hdr-ibl-pipeline.ts` — GPU compute IBL pipeline
> - `packages/babylon-lite/src/loader-babylon/load-babylon.ts` — .babylon scene format loader
> - `packages/babylon-lite/src/loader-skybox/load-skybox.ts` — Cube texture skybox loader
> - `packages/babylon-lite/src/loader-skybox/skybox-renderable.ts` — Skybox renderable builder
> - `packages/babylon-lite/src/loader-splat/` — Gaussian splat loaders (`.ply`, `.splat`, `.sog`, `.spz`)

## Purpose

The Loaders module provides asset loading pipelines plus dynamic glTF feature modules:

1. **glTF Loader** — Parses `.glb` / `.gltf` 2.0 files, dynamically imports feature modules based on `extensionsUsed` and material/primitive content, extracts mesh geometry (positions, normals, tangents, UVs, indices), resolves the node hierarchy to compute world matrices with RH→LH conversion, extracts PBR metallic-roughness material data (textures + factors), uploads everything to GPU buffers and textures with mipmaps. Optional features such as `KHR_texture_basisu` live in separate dynamic modules so assets that do not use them pay zero runtime bytes.

2. **Environment Loader (.env)** — Parses Babylon.js `.env` files, decodes RGBD-encoded specular cubemap faces to `rgba16float`, decodes a pre-baked BRDF integration LUT from an RGBD-encoded PNG via GPU compute, extracts spherical harmonics irradiance coefficients, and uploads everything to GPU textures.

3. **DDS Environment Loader** — Loads pre-filtered DDS cubemap environments (rgba16float). Uploads all mip levels directly, computes spherical harmonics from mip 0 face data, and decodes a pre-baked BRDF LUT from a PNG via GPU compute.

4. **HDR Environment Loader** — Loads Radiance `.hdr` (RGBE) equirectangular panoramas. CPU-parses RGBE data, computes spherical harmonics, converts equirect→cubemap via GPU compute, prefilters with importance-sampled GGX via GPU compute, generates BRDF LUT via GPU compute.

5. **.babylon Format Loader** — Parses Babylon.js `.babylon` scene files. Supports standard materials (diffuse, bump, specular, ambient, lightmap, opacity, reflection textures), inline vertex data, point lights, scene clear color, and sub-mesh / multi-material handling.

6. **Skybox Loader** — Loads 6-face cube texture skyboxes for StandardMaterial scenes. Registers a deferred builder that creates the pipeline at engine start time.

7. **Gaussian Splat Loaders** — Load `.ply`, `.splat`, `.sog`, and `.spz` splat assets into `GaussianSplattingMesh` instances. SOG handles ZIP-packed WebP payloads; SPZ handles gzip-wrapped binary streams. Transform baking helpers and material shader fragments are exposed separately so non-splat scenes pay zero runtime cost.


## Public API Surface

### `asset-container.ts`

```typescript
/** Unified result returned by both loadGltf() and loadBabylon(). */
export interface AssetContainer {
    /**
     * Scene entities with world transforms (meshes, transform nodes, lights).
     * - glTF: single-element [root TransformNode]; meshes live in its hierarchy.
     * - .babylon: root SceneNodes + LightBase objects in the file.
     */
    entities: Array<SceneNode | LightBase>;

    /** Animation groups from the file. addToScene() auto-ticks them each frame. */
    animationGroups?: AnimationGroup[];

    /** Scene clear color from the file. addToScene() applies it to ctx.clearColor. */
    clearColor?: GPUColorDict;

    /** Camera parsed from the file. addToScene() sets it as scene.camera when present. */
    camera?: Camera;

    /** Every camera declared by the glTF `cameras` array and referenced by a `node.camera`
     *  index, in node-encounter order. See "glTF `camera` Node Property" below. Unlike
     *  `camera`, addToScene() never auto-activates one of these — pick one explicitly and
     *  assign it to `scene.camera`. */
    cameras?: Camera[];

    /** KHR_materials_variants data. Use selectVariant() / getVariantNames() to interact. */
    materialVariants?: MaterialVariantData;

    /** Bone-control handles (one per glTF skin). Populated only after enableBoneControl();
     *  drive bones via getBoneByName() + setBone*(). See module 13 (Skeleton). */
    skeletons?: Skeleton[];
}
```

### Compressed-geometry decoder base URLs (`draco-decode.ts`, `meshopt-decode.ts`)

```typescript
/** Override where draco_decoder.js / draco_decoder.wasm are fetched (default: site root "/"). */
export function setDracoBaseUrl(url: string): void;
/** Override where meshopt_decoder.js is fetched (default: site root "/"). */
export function setMeshoptBaseUrl(url: string): void;
```

Both decoders lazy-load their glue/WASM via `<script>` injection on first use, so non-Draco /
non-meshopt scenes pay zero bytes. Call the setter before loading an asset that triggers the
codec to self-host the decoder (e.g. avoid a cross-origin CDN). Equivalent to KTX2's
`setKtx2DecoderUrl`.

### `load-gltf.ts`

```typescript
/** Parsed mesh data ready for GPU upload. */
export interface GltfMeshData {
    positions: Float32Array;
    normals: Float32Array;
    tangents: Float32Array | null;
    uvs: Float32Array;
    indices: Uint16Array | Uint32Array;
    vertexCount: number;
    indexCount: number;
    worldMatrix: Mat4;
    material: GltfMaterialData;
}

/** Parsed PBR material data. */
export interface GltfMaterialData {
    baseColorFactor: [number, number, number, number];
    metallicFactor: number;
    roughnessFactor: number;
    emissiveFactor: [number, number, number];
    baseColorImage: ImageBitmap | null;
    metallicRoughnessImage: ImageBitmap | null;
    normalImage: ImageBitmap | null;
    occlusionImage: ImageBitmap | null;
    emissiveImage: ImageBitmap | null;
}

/** Load a glTF/GLB asset from a URL, ArrayBuffer, or Blob; parse it, upload to GPU. Returns an AssetContainer. */
export async function loadGltf(engine: EngineContext, source: string | ArrayBuffer | Blob): Promise<AssetContainer>;

/** Enable camera import for subsequent loadGltf calls. */
export function enableGltfCameras(): void;
```

> **Note**: `loadGltf` takes an `Engine` (not `SceneContext`) and returns an `AssetContainer`. The result's `entities` array contains root scene entities; glTF meshes usually hang off a root `TransformNode` hierarchy. Pass the result to `addToScene(scene, result)` — it will traverse the hierarchy, register animation ticks, and integrate everything into the scene. Meshes are the standard `Mesh` type with GPU data in the `_gpu` field and bounding box on `Mesh.boundMin`/`Mesh.boundMax`. Renderable mesh names preserve source glTF `mesh.name` when present; parent transform names still preserve glTF `node.name`.
>
> **Local data**: `source` may be a URL `string`, or an `ArrayBuffer`/`Blob` of an already-loaded asset (drag-and-drop, OPFS, a `fetch` body, etc.). GLB-vs-glTF is detected from the data's magic bytes, **not** the URL extension, so object URLs (`blob:…`) and extensionless sources load correctly. `ArrayBuffer`/`Blob` inputs and opaque `blob:`/`data:` URL strings have no directory base, so they must be self-contained (a GLB, or a glTF whose buffers/images use `data:` URIs); a glTF referencing external `.bin`/image files by relative path must be loaded from a URL with a resolvable base.

### `load-env.ts`

```typescript
/** GPU-resident environment textures. */
export interface EnvironmentTextures {
    specularCube: GPUTexture;
    specularCubeView: GPUTextureView;
    brdfLut: GPUTexture;
    brdfLutView: GPUTextureView;
    cubeSampler: GPUSampler;
    brdfSampler: GPUSampler;
    irradianceSH: Float32Array;
    sphericalHarmonics: {
        l00: Float32Array;
        l1_1: Float32Array;
        l10: Float32Array;
        l11: Float32Array;
        l2_2: Float32Array;
        l2_1: Float32Array;
        l20: Float32Array;
        l21: Float32Array;
        l22: Float32Array;
    };
}

/** Load a Babylon.js .env file, upload cubemap + BRDF LUT to GPU. */
export async function loadEnvironment(
    scene: SceneContext,
    url: string,
    options: {
        brdfUrl: string; // Required: URL of pre-baked BRDF LUT PNG (RGBD-encoded)
        groundTextureUrl?: string; // Optional: URL of ground texture
        skipSkybox?: boolean; // Default: false — skip skybox renderable
        skipGround?: boolean; // Default: false — skip ground plane
        skyboxUrl?: string; // Override skybox texture URL
        skyboxSize?: number; // Default: 1000 — skybox cube half-size
    }
): Promise<EnvironmentTextures>;
```

## Internal Architecture

### glTF Loader Pipeline

```javascript
fetch(url) → ArrayBuffer
  ↓
parseGlbContainer(buffer)
  ↓
{ json, binChunk: DataView }
  ↓
loadFeatureModules(json)              // dynamic imports, e.g. KHR_texture_basisu
  ├── preMesh hooks                   // Draco, KTX2 strided FLOAT accessor decode, etc.
  └── material hooks                  // feature-owned texture/material/metadata overrides
  ↓
extractAllMeshes(json, binChunk)       // for each node with mesh
  ├── resolveAccessor() × N             // positions, normals, tangents, UVs, indices
  ├── extractMaterial()                 // PBR factors + textures
  │     └── resolveImage() × 5         // parallel image decode
  └── computeNodeWorldMatrix()         // recursive parent chain + RH→LH root
  ↓
GltfMeshData[]
  ↓
uploadMeshes(device, meshDatas)
  ├── repeated-primitive gate           // dynamically imports gltf-share only when needed
  │     ├── canonicalize CPU geometry   // repeated active nodes retain the same arrays
  │     └── primitive GPU cache         // one MeshGPU upload retained by every active owner
  ├── shared mesh builders              // identical instance assembly on normal/shared paths
  ├── uploadTexture() × 4              // → Texture2D objects (cached per bitmap + sRGB)
  ├── runMatExts()                     // feature-owned material overrides, e.g. KTX2 textures
  ├── createBufferFromData() × 5       // pos, norm, tan, uv, idx
  ├── computeWorldBounds()             // world-space AABB
  └── assemble PbrMaterialProps        // { baseColorTexture, normalTexture, ormTexture, emissiveTexture?, _buildGroup: pbrGroupBuilder }
  ↓
Mesh[] + root TransformNode
  ↓
createAnimationGroups(json, ...)       // extract glTF animations → AnimationGroup[]
  ↓
AssetContainer { entities: [root], animationGroups }
  → returned to caller; addToScene() dispatches entities + registers animation ticks
```

**Texture caching**: Textures are cached per bitmap identity + sRGB flag to avoid duplicate GPU uploads. The hot-path cache uses a numeric key (`bitmapId * 2 + +srgb`) so plain-image glTF assets do not pay string-key overhead. Feature modules can maintain their own caches for extension-owned image sources.

**Geometry sharing**: A glTF mesh may be instantiated by multiple nodes. The loader creates a distinct Lite `Mesh` for every node/primitive pair so transforms, bounds, metadata, winding, skins, and morph state remain independent. Normal and repeated-primitive paths use the same internal mesh builders; the lazy `gltf-share` module only canonicalizes immutable geometry, manages ownership, and installs shared recovery. Instances reachable from the selected/default glTF scene share one `MeshGPU` and the same retained CPU attribute arrays when they reference the same immutable primitive. Nodes reachable only from inactive scenes are excluded from that shared ownership group, so they do not increment the active geometry's `_refCount` or pin its buffers. `MeshGPU` ownership is reference-counted so removing one active instance cannot dispose buffers still used by another; device-lost recovery rebuilds each shared geometry only once and preserves the ownership count.

**Animation support**: `loadGltf` extracts glTF animations, creates `AnimationGroup[]` via `createAnimationGroups()`, and returns them in `AssetContainer.animationGroups`. `addToScene()` registers playback with the scene-owned animation manager. Each group exposes `currentTime` (seconds), `goToFrame()` for frame-based seeking, and lightweight `targetedAnimations` metadata for inspecting affected node/path pairs.

**glTF metadata**: `ExtrasAsMetadata` promotes source node, mesh, primitive, and material `extras` payloads to `metadata.gltf.extras` on supported runtime objects. It is implemented as a glTF feature module so scenes without metadata do not pay for the metadata-copying code.

**PBR materials**: Each `PbrMaterialProps` created during upload includes `_buildGroup: pbrGroupBuilder`, imported from `pbr-material.ts`.

### GLB Container Format

```javascript
Offset 0:  Header (12 bytes)
  [0..3]   magic: 0x46546C67 ("glTF" LE)
  [4..7]   version: 2
  [8..11]  total length

Offset 12: JSON Chunk
  [0..3]   chunkLength
  [4..7]   chunkType: 0x4E4F534A ("JSON" LE)
  [8..]    UTF-8 JSON

Offset 12+8+jsonLength: BIN Chunk
  [0..3]   chunkLength
  [4..7]   chunkType: 0x004E4942 ("BIN\0" LE)
  [8..]    Binary data
```

### Accessor Resolution

Supports component types:

| Constant | Value | TypedArray |
| --- | --- | --- |
| Constant<br>`FLOAT` | Value<br>5126 | TypedArray<br>`Float32Array` |
| Constant<br>`UNSIGNED_SHORT` | Value<br>5123 | TypedArray<br>`Uint16Array` |
| Constant<br>`UNSIGNED_INT` | Value<br>5125 | TypedArray<br>`Uint32Array` |
| Constant<br>`UNSIGNED_BYTE` | Value<br>5121 | TypedArray<br>`Uint8Array` |

Type → component count:

| Type | Components |
| --- | --- |
| Type<br>`SCALAR` | Components<br>1 |
| Type<br>`VEC2` | Components<br>2 |
| Type<br>`VEC3` | Components<br>3 |
| Type<br>`VEC4` | Components<br>4 |
| Type<br>`MAT4` | Components<br>16 |

Byte offset = `bufferView.byteOffset + accessor.byteOffset` (both default to 0).

### RH→LH Coordinate Conversion

glTF uses right-handed coordinates. Babylon Lite uses left-handed. The conversion is done via a root world matrix pre-multiply (not by negating Z in vertex data):

```typescript
// Root matrix: diag(-1, 1, 1, 1) — negates X axis
const RH_TO_LH_ROOT: Mat4 = [-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
```

For top-level nodes: `worldMatrix = RH_TO_LH_ROOT × localMatrix`.
For child nodes: `worldMatrix = parentWorldMatrix × localMatrix`.

Local matrices are computed from glTF TRS: `mat4Compose(translation, rotation, scale)`, or directly from `node.matrix` if present.

Parent lookup is done by linear scan (`findParent`): iterates all nodes checking `children` arrays.

### glTF `camera` Node Property (`gltf-feature-camera.ts`)

Core glTF 2.0 spec §5.20 (not an extension) — a node may reference `cameras[i]` via `node.camera`.
Feature id `_camera`, registered only when the caller invokes `enableGltfCameras()` and then
triggered when an asset declares cameras. The generic `gltf-feature-hooks.ts` seam lets the core
loader ask whether any explicitly enabled feature matches without knowing camera semantics; Rollup
folds the seam away when no enabler is imported.
Reproduces cx20 gltf-test's `:warning: embedded camera` gap for Babylon Lite: before this feature,
`loadGltf` silently dropped `node.camera` and exposed no way to select one of an asset's embedded
cameras. Every camera referenced by a `node.camera` index is instantiated and returned via
`AssetContainer.cameras` (node-encounter order), named from the glTF camera definition or
`camera{index}` when unnamed; `AssetContainer.camera` (singular) is untouched.

**Per camera, for each node with `node.camera !== undefined`:**

1. **`fixupNode`** — a `TransformNode` (`createTransformNode`) inserted between the source node and
the camera (never mutating the shared source node — a sibling mesh on the same glTF node, if any,
must keep its own winding/scale):

   - **Handedness.** The synthetic `__root__` node's `scale.x = -1` (RH→LH conversion, above) flips
     a camera's chirality — a mirrored (negative-determinant) camera world matrix renders an
     inside-out view. Babylon.js's own glTF loader hits the same issue and fixes it by setting
     `scaling.x = -1` on the camera's hosting `TransformNode` (`glTFLoader.ts``loadNodeAsync`).
   - `fixupNode`'s scale is `(-1/s, 1/s, 1/s)`, where `s` is the accumulated static uniform
     rest-pose scale. This cancels inherited scale while preserving live translation/rotation.
2. **Parent.**`fixupNode.parent = nodeMap[nodeIdx]` when the node is reachable from a scene root
(the common case — node TRS animation, classic channels or `KHR_animation_pointer`, then drives
the camera every frame through the normal parent chain). Falls back to
`createSceneNodeFromMatrix(name, restWorld)` when unreachable, mirroring the
`KHR_lights_punctual` fallback for the same case.
3. **Camera.**`createFreeCamera({0,0,0}, {0,0,-1})`, parented to `fixupNode`. glTF cameras look
down their local -Z axis with +Y up; `mat4LookAtWorldLHToRef`'s "+Z points from eye to target"
convention reproduces exactly that local orientation for an eye at the origin looking toward
`(0,0,-1)`. The fixup also cancels static uniform ancestor scale so the shared rigid view inverse
remains exact. Projection parameters stay in source glTF units, matching Babylon.js.
Zero/non-uniform or animated ancestor scale is rejected/unsupported rather than rendered with a
silently wrong view.
4. **Projection.**`perspective.yfov → fov`, `.znear → nearPlane`, `.zfar → farPlane` (substituting a
large sentinel, `1e6`, when `zfar` is omitted — glTF's "infinite" convention). Orthographic
cameras lazy-`import()``enableOrthographicCamera` (only when `def.type === "orthographic"`, so a
perspective-only asset never pays for it) and map `xmag`/`ymag` to symmetric
`{ left: -xmag, right: xmag, bottom: -ymag, top: ymag }` bounds.

**Known limitation:** once camera loading is enabled, the feature processes every camera declared
by the asset. An asset with an orthographic camera therefore pulls in `camera/orthographic.js` even
if the consumer selects a different perspective camera. glTF camera-property animation
(`KHR_animation_pointer` targeting `/cameras/{}/perspective/yfov` etc.) is not wired — only the
hosting NODE's transform animates; the camera's own intrinsics (fov/near/far/ortho bounds) are fixed
at load time.

### Texture Upload

`uploadTexture(device, bitmap, srgb, sampler)` returns a `Texture2D` (with `texture`, `view`, `sampler`, `width`, `height`).

| Texture | sRGB | Format | Created when |
| --- | --- | --- | --- |
| Texture<br>`baseColor` | sRGB<br>Yes | Format<br>`rgba8unorm-srgb` | Created when<br>Always (fallback 1×1 white) |
| Texture<br>`normal` | sRGB<br>No | Format<br>`rgba8unorm` | Created when<br>Always (fallback 1×1 white) |
| Texture<br>`ORM` | sRGB<br>No | Format<br>`rgba8unorm` | Created when<br>Always (fallback 1×1 white) |
| Texture<br>`emissive` | sRGB<br>Yes | Format<br>`rgba8unorm-srgb` | Created when<br>Only if glTF has emissive image |

sRGB textures use `rgba8unorm-srgb` format so the GPU performs exact sRGB→linear conversion on sample. All textures get full mip chains via `generateMipmaps()`.

ORM packing follows glTF convention:

- **R** = Ambient Occlusion
- **G** = Roughness
- **B** = Metallic

If only `metallicRoughnessImage` or `occlusionImage` is available, it's used for the ORM texture (they may be the same image in glTF).

### `KHR_texture_basisu` / KTX2 Texture Sources

The `KHR_texture_basisu` implementation is a glTF feature module, not core loader logic:

```javascript
extensionsUsed includes "KHR_texture_basisu"
  ↓
dynamic import("./gltf-ext-basisu.js")
  ↓
preMesh(json, binChunk, baseUrl)
  ├─ marks materials that reference KTX2 images
  ├─ strips KTX2 textureInfos before core image parsing
  └─ deinterleaves strided FLOAT vertex accessors when needed by the KTX2 asset
  ↓
core material parse runs with non-KTX2 textureInfos only
  ↓
applyMaterial(mat, ctx)
  ├─ fetches KTX2 bytes from image.uri or bufferView
  ├─ uploadKtx2Texture2D(ctx.engine, bytes, sRGB)
  ├─ composes ORM when metallic-roughness and occlusion are distinct KTX2 images
  └─ returns Partial<PbrMaterialProps> with feature-owned Texture2D values
```

Design constraints:

- No `KHR_texture_basisu` branches in the core material parser or PBR renderer.
- `ktx2-loader.ts` is reached only through `gltf-ext-basisu.ts`.
- The Babylon KTX2 decoder script is loaded lazily after a KTX2 asset is encountered.
- Core texture cache keys remain image-bitmap based; KTX2 feature caches by glTF texture index and sRGB flag.
- Scene 112 (`FlightHelmetKTX`) validates the path and keeps existing scene runtime bundle sizes unchanged.

### Interleaved Vertex Buffers (`gltf-interleave.ts`)

glTF allows multiple vertex attributes to share one `bufferView` with a non-zero
`byteStride` (interleaved layout). Babylon Lite supports this **at the GPU level**
rather than rewriting the asset:

```javascript
primitive has a strided (byteStride > 0), non-decoded accessor
  ↓
dynamic import("./gltf-interleave.js")   // never fetched by tight-only scenes
  ↓
buildInterleavedPartial(json, binChunk, attrs)
  ├─ records each strided attribute's { bufferView slice, offset, stride }
  └─ resolves tight attributes directly
  ↓
uploadMeshes binds the ONE raw bufferView slice to every attribute slot at the
attribute's byte offset with pipeline arrayStride = byteStride
```

Design constraints:

- **No CPU de-interleave / asset rewrite.** The raw interleaved bytes are uploaded
once and bound to each slot — the GPU does the striding.
- **De-strided CPU copies are lazy.**`installLazyCpu()` defines
`_cpuPositions/_cpuNormals/_cpuUvs` as caching getters that de-stride on first
access; a mesh that is never picked / CSG'd / navigated never materializes them.
- **Zero cost to non-interleaved scenes.** The whole module is dynamic-imported and
only loaded when a genuinely-strided, non-decoded primitive is encountered. Decoded
paths (Draco, `KHR_texture_basisu` de-stride) bypass it.
- Validated by Scene 210 (`XmpMetadataRoundedCube`, genuinely interleaved).

Per-attribute correctness (each was a real parity bug — Scenes 246/247):

- **`COLOR_0`** cannot be GPU-strided directly: glTF permits VEC3/VEC4 and/or normalized
`UNSIGNED_BYTE`/`SHORT`, but the pipeline binds a single `float32x4` layout. Binding a
ubyte/VEC3 source as `float32x4` reads adjacent bytes as floats (rainbow garbage).
`resolveColorVec4` always de-strides + normalizes COLOR\_0 to a tight `float32x4` (rgb
modulates base color, **a modulates fragment alpha** — vertex-color alpha-clip/blend; a
VEC3 source gets `a = 1`).
- **Absent `NORMAL`** must be synthesized, never zero-filled — a zero normal yields
`normalize(0)` = NaN → pure-black lit fragments. `buildInterleavedPartial` calls the
caller-supplied `computeSmoothNormals` (lazily imported only when NORMAL is missing).
The mesh is also tagged `_flatNormal` so the PBR shader flat-shades it via screen-space
`worldPos` derivatives (glTF spec: no-`NORMAL` → flat), matching BJS — see
`material/pbr/fragments/flat-normal-wgsl.ts` (lazily loaded; zero bytes otherwise).
- **`JOINTS_0`/`WEIGHTS_0`** are read by `gltf-feature-skeleton.ts`, not this module,
via `resolveAccessor` — which assumes tight packing. Skinned rigs that interleave
them with a `byteStride` are de-strided there (`resolveAttr`), or half the joint
indices/weights come from padding → exploded / mis-posed mesh.

### `EXT_meshopt_compression` \+ `KHR_mesh_quantization` (`gltf-feature-meshopt.ts`, `gltf-ext-quantization.ts`)

`EXT_meshopt_compression` bufferViews are decoded by a dynamically-imported meshopt
decoder (`meshopt-decode.ts`) before accessor resolution; `KHR_mesh_quantization`
lets normalized/quantized attribute formats upload natively. Both are dynamic feature
modules, so non-meshopt scenes pay zero runtime bytes. Validated by Scene 211
(`BrainStem` glTF-Meshopt-EXT, skinned + animated).

**Unnormalized quantized `TEXCOORD_n`/`POSITION` (Scene 220, `Duck``glTF-Quantized`).**`KHR_mesh_quantization` allows `TEXCOORD_n` (VEC2) and `POSITION` (VEC3) to be
**unnormalized** unsigned-integer accessors (no `normalized: true`) — per the extension
spec, an unnormalized integer `2` means the literal value `2.0`, not `2/65535`; the asset
then rescales it back to real units via a node TRS (`POSITION`) or a `KHR_texture_transform`
on the material (`TEXCOORD_n`; gltfpack's standard quantized-UV output). The core loader's
tight/interleave UV and vertex paths always assume an unsigned-int source means "divide by
255/65535", so this class of accessor must never reach them unconverted.

The fix lives entirely inside `gltf-ext-quantization.ts`'s `preParse` rewrite (not the core
UV/color decoders): the trigger predicate was widened from "unsigned non-normalized integer,
NOT VEC4, AND strided" to "unsigned non-normalized integer VEC2/VEC3, tight OR strided" —
per the extension's attribute table, unnormalized unsigned-int storage is only valid for
those two shapes, so SCALAR (indices) and VEC4 (`JOINTS_n`) stay correctly excluded
regardless. This is what catches the quantized Duck's TEXCOORD\_0: a **tight**`UNSIGNED_SHORT` VEC2 accessor (`byteStride` equal to its own tight size) that the old
stride-gated predicate let through unconverted. Because the rewrite happens in `preParse`
— before any accessor is read — every unnormalized integer TEXCOORD/POSITION is already
FLOAT by the time `load-gltf.ts`, `gltf-color-normalize.ts`, `gltf-interleave.ts`, and
`gltf-uv-denorm.ts` see it, so none of those core/shared modules need to know about
`normalized` at all: they keep their original "integer ⇒ normalized" assumption, which is
now always true for whatever integer data reaches them. This keeps the fix's entire byte
footprint inside the already dynamic-imported `KHR_mesh_quantization` feature — zero
bytes added to any module fetched by scenes that don't use the extension. Validated by
Scene 220 (`Duck``glTF-Quantized`, non-normalized `UNSIGNED_SHORT` VEC2 `TEXCOORD_0`
combined with `KHR_texture_transform`) and by `gltf-ext-quantization.test.ts`, which
exercises the `preParse` hook directly for the tight-unnormalized, strided-unnormalized,
still-normalized, SCALAR-index, and VEC4-joints cases.

### `KHR_xmp_json_ld` Metadata (`gltf-feature-xmp.ts`)

Pure metadata with no render effect: the feature's `applyAsset` hook surfaces the
document-level JSON-LD packets (and the `asset`-referenced packet) on
`AssetContainer.xmpMetadata = { packets, assetPacket }`. Dynamic-imported only when
`extensionsUsed` lists `KHR_xmp_json_ld`. Validated by Scene 210.

### Bounding Box Computation

World-space AABB is computed by transforming every vertex position through the world matrix:

```javascript
for each vertex (lx, ly, lz):
  wx = world[0]*lx + world[4]*ly + world[8]*lz  + world[12]
  wy = world[1]*lx + world[5]*ly + world[9]*lz  + world[13]
  wz = world[2]*lx + world[6]*ly + world[10]*lz + world[14]
  update min/max
```

### Shared Sampler

One sampler is created and shared across all `Texture2D` objects within a single `uploadMeshes()` call: `magFilter: linear, minFilter: linear, mipmapFilter: linear, addressMode: repeat` (both U and V). The sampler is stored inside each `Texture2D.sampler`.

* * *

### Environment Loader Pipeline

```javascript
fetch(url) → ArrayBuffer
  ↓
parseEnvFile(buffer)
  ├── Validate 8-byte magic: [0x86, 0x16, 0x87, 0x96, 0xf6, 0xd6, 0x96, 0x36]
  ├── Parse JSON manifest (UTF-8, null-terminated after magic)
  ├── Extract irradiance SH (9 vec3 = 27 floats from manifest.irradiance)
  └── Extract face image blobs (mip0_face0..5, mip1_face0..5, ...)
  ↓
{ faceBlobs[], irradianceSH, width, mipCount }
  ↓
createImageBitmap() × N faces (parallel, premultiplyAlpha:'none', colorSpaceConversion:'none')
  ↓
uploadCubemapRGBD(device, images, width, mipCount)
  ↓
GPUTexture (rgba16float cubemap)
  ↓
fetch(options.brdfUrl) + decodeBrdfPng(device, png) → 256×256 rgba16float BRDF LUT (GPU compute)
  ↓
polynomialToPreScaledHarmonics(irradianceSH) → pre-scaled SH for shader
  ↓
EnvironmentTextures → stored on scene._envTextures
```

### .env File Format

```javascript
[0..7]     Magic: 86 16 87 96 F6 D6 96 36
[8..N]     JSON manifest (UTF-8, null terminated)
[N+1..]    Binary image data (PNG/JPEG face images)
```

JSON manifest fields:

- `width`: base cubemap face size
- `irradiance`: object with keys `x,y,z,xx,yy,zz,yz,zx,xy` → each is `[r,g,b]`
- `specular.mipmaps`: array of `{ position, length }` byte ranges
- `imageType`: MIME type (default `"image/png"`)

### RGBD Decoding

Each face image is RGBD-encoded. Decoding to linear HDR:

```javascript
r_linear = pow(r_srgb, 2.2) / max(alpha, 1/255)
g_linear = pow(g_srgb, 2.2) / max(alpha, 1/255)
b_linear = pow(b_srgb, 2.2) / max(alpha, 1/255)
a_out    = 1.0
```

The process uses GPU staging to avoid Canvas 2D premultiplied-alpha corruption:

1. Upload `ImageBitmap` → temp `rgba8unorm` texture
2. Copy texture → staging buffer (256-byte aligned rows)
3. Map staging buffer for CPU read
4. Decode RGBD on CPU with Y-flip (Babylon uploads with `invertY=true`)
5. Upload decoded `float16` data to final `rgba16float` cubemap layer

### Float16 Conversion (`floatToHalf`)

IEEE 754 binary16 conversion via bit manipulation:

```javascript
sign     = (float32_bits >>> 16) & 0x8000
exponent = ((float32_bits >>> 23) & 0xFF) - 127 + 15
mantissa = (float32_bits >>> 13) & 0x03FF
```

Handles denormalized numbers, overflow (→ infinity), and NaN.

### BRDF LUT Generation

> **Note on `.env` and DDS loaders**: Environment loaders no longer CPU-compute the BRDF LUT. They decode a pre-baked BRDF LUT from an RGBD-encoded PNG provided via `options.brdfUrl`, using GPU compute in `rgbd-decode.ts`. The CPU algorithm below applies to the **HDR loader** (`hdr-ibl-pipeline.ts`) only.

GPU compute split-sum integration (256×256, `rgba16float`, HDR path):

For each texel `(x, y)`:

```javascript
NdotV     = max((x + 0.5) / 256, 0.001)
roughness = max((y + 0.5) / 256, 0.04)
[A, B]    = integrateBRDF(NdotV, roughness, 1024 samples)
```

Output convention (Babylon):

- **R** = `B` (Fresnel bias)
- **G** = `A + B` (scale + bias)
- Shader usage: `F0 × A + B = F0 × (brdf.g - brdf.r) + brdf.r`

#### `integrateBRDF` Algorithm

Hammersley sequence + importance-sampled GGX:

```javascript
for i in 0..1024:
  xi0 = i / sampleCount
  xi1 = radicalInverseVdC(i)          // Van der Corput
  H = importanceSampleGGX(xi0, xi1, roughness⁴)
  VdotH = max(V·H, 0)
  Lz = 2 × VdotH × H.z - V.z          // reflect(-V, H).z = NdotL
  NdotL = max(Lz, 0)
  NdotH = max(H.z, 0)

  if NdotL > 0 and NdotH > 0:
    // Smith height-correlated visibility
    GGXV = NdotL × √(NdotV² × (1-a2) + a2)
    GGXL = NdotV × √(NdotL² × (1-a2) + a2)
    V_Vis = 0.5 / max(GGXV+GGXL, 1e-6) × NdotL × 4×VdotH/NdotH
    Fc = (1 - VdotH)⁵
    A += (1 - Fc) × V_Vis
    B += Fc × V_Vis

return [A/1024, B/1024]
```

#### `importanceSampleGGX`

```javascript
phi = 2π × xi0
cosTheta = √((1 - xi1) / (1 + (a2 - 1) × xi1))
sinTheta = √(1 - cosTheta²)
return [cos(phi) × sinTheta, sin(phi) × sinTheta, cosTheta]
```

#### `radicalInverseVdC`

Van der Corput radical inverse (bit reversal):

```javascript
bits = input >>> 0
bits = ((bits << 16) | (bits >>> 16)) >>> 0
bits = ((bits & 0x55555555) << 1) | ((bits & 0xAAAAAAAA) >>> 1)   // swap odd/even
bits = ((bits & 0x33333333) << 2) | ((bits & 0xCCCCCCCC) >>> 2)   // swap pairs
bits = ((bits & 0x0F0F0F0F) << 4) | ((bits & 0xF0F0F0F0) >>> 4)   // swap nibbles
bits = ((bits & 0x00FF00FF) << 8) | ((bits & 0xFF00FF00) >>> 8)   // swap bytes
return bits × 2.3283064365386963e-10                               // / 2^32
```

### Spherical Harmonics Conversion

Converts from Babylon.js polynomial representation (27 floats: x,y,z,xx,yy,zz,yz,zx,xy) to pre-scaled harmonics for shader use.

**Step 1: `FromPolynomial`** (matching Babylon.js `SphericalHarmonics.FromPolynomial()`):

```javascript
K00 = 0.376127,  K1 = 0.977204,  K2 = 1.16538
K20_zz = 1.34567, K20_xy = 0.672834

L00   = (xx×K00 + yy×K00 + zz×0.376126) × π
L1_-1 = y × (-K1) × π
L10   = z × K1 × π
L11   = x × (-K1) × π
L2_-2 = xy × K2 × π
L2_-1 = yz × (-K2) × π
L20   = (zz×K20_zz - xx×K20_xy - yy×K20_xy) × π
L21   = zx × (-K2) × π
L22   = (xx - yy) × K2 × π
```

**Step 2: `preScaleForRendering`** (SH basis function coefficients):

```javascript
B00  = √(1/(4π)),      B1m = -√(3/(4π)),     B1p = √(3/(4π))
B2_2 = √(15/(4π)),     B2_1 = -√(15/(4π)),   B20 = √(5/(16π))
B21  = -√(15/(4π)),     B22 = √(15/(16π))

output_L00   = raw_L00 × B00
output_L1_-1 = raw_L1_-1 × B1m
...etc
```

## Babylon.js Equivalence Map

| Babylon Lite | Babylon.js |
| --- | --- |
| Babylon Lite<br>`addToScene(scene, await loadGltf(engine, url))` | Babylon.js<br>`BABYLON.SceneLoader.Append(url, scene)` |
| Babylon Lite<br>`Mesh` (with `_gpu` field) | Babylon.js<br>Internal mesh representation |
| Babylon Lite<br>`RH_TO_LH_ROOT` | Babylon.js<br>Root node rotation `[0,1,0,0]` \+ scale `[1,1,-1]` |
| Babylon Lite<br>`loadEnvironment(scene, url, { brdfUrl })` | Babylon.js<br>`scene.environmentTexture = new BABYLON.CubeTexture.CreateFromPrefilteredData(url)` |
| Babylon Lite<br>`.env` file format | Babylon.js<br>Babylon-proprietary environment file |
| Babylon Lite<br>RGBD decode | Babylon.js<br>`FromRGBD` shader in Babylon |
| Babylon Lite<br>`generateBrdfLut()` (GPU compute, RGBD PNG decode, in rgbd-decode.ts) | Babylon.js<br>Babylon ships pre-baked BRDF LUT (also option for runtime) |
| Babylon Lite<br>`polynomialToPreScaledHarmonics()` | Babylon.js<br>`SphericalHarmonics.FromPolynomial()` \+ `preScaleForRendering()` |
| Babylon Lite<br>`uploadCubemapRGBD()` | Babylon.js<br>Internal cubemap processing in `HDRCubeTexture` |
| Babylon Lite<br>`KHR_texture_basisu` feature + `uploadKtx2Texture2D()` | Babylon.js<br>BJS `KHR_texture_basisu` loader + `KTX2Decoder` texture upload |
| Babylon Lite<br>Staging buffer RGBD decode | Babylon.js<br>Avoids Canvas 2D premultiplication issue |
| Babylon Lite<br>`loadDdsEnvironment(scene, url, opts)` | Babylon.js<br>`BABYLON.CubeTexture.CreateFromPrefilteredData(url)` with DDS file |
| Babylon Lite<br>`computeSH()` (from DDS mip 0) | Babylon.js<br>BJS `SphericalPolynomial.FromHarmonics` on cubemap |
| Babylon Lite<br>`decodeBrdfPng()` | Babylon.js<br>BJS embedded `environmentBRDFTexture` (RGBD PNG) |
| Babylon Lite<br>`loadHdrEnvironment(scene, url, opts)` | Babylon.js<br>`new BABYLON.HDRCubeTexture(url, scene)` |
| Babylon Lite<br>`parseRGBE()` | Babylon.js<br>BJS `HDRTools.GetCubeMapTextureData()` |
| Babylon Lite<br>`computeSHFromEquirect()` | Babylon.js<br>BJS `SphericalPolynomial.FromEquirectangular()` |
| Babylon Lite<br>`equirectToCubemapGPU()` | Babylon.js<br>BJS `panoramaToCubemap.ts` CPU conversion |
| Babylon Lite<br>`prefilterCubemapGPU()` | Babylon.js<br>BJS `hdrFiltering.ts` GPU prefilter |
| Babylon Lite<br>`generateBrdfLut()` (GPU compute, in hdr-ibl-pipeline.ts) | Babylon.js<br>BJS compute-based BRDF LUT |
| Babylon Lite<br>`loadBabylon(engine, url)` | Babylon.js<br>`BABYLON.SceneLoader.Load("", url, engine)` |
| Babylon Lite<br>`createStandardMaterial()` | Babylon.js<br>`new BABYLON.StandardMaterial("mat", scene)` |
| Babylon Lite<br>`loadTexture2D()` | Babylon.js<br>`new BABYLON.Texture(url, scene)` |
| Babylon Lite<br>`createPointLight()` | Babylon.js<br>`new BABYLON.PointLight("light", pos, scene)` |
| Babylon Lite<br>SubMesh + multiMaterial | Babylon.js<br>`BABYLON.SubMesh` \+ `BABYLON.MultiMaterial` |
| Babylon Lite<br>`loadSkybox(scene, baseUrl, ext, size)` | Babylon.js<br>`new BABYLON.CubeTexture(url, scene)` \+ skybox mesh |
| Babylon Lite<br>`buildSkyboxRenderable()` | Babylon.js<br>`skyboxMaterial` \+ `skyboxMesh` in BJS `EnvironmentHelper` |

## Dependencies

- **`load-gltf.ts` imports**: `EngineContext` from `../engine/engine.js`; `Mat4` from `../math/types.js`; `mat4Compose`, `mat4Multiply` from `../math/mat4.js`; `generateMipmaps`, `mipLevelCount` from `../texture/generate-mipmaps.js`; `Texture2D` from `../texture/texture-2d.js`; `PbrMaterialProps`, `pbrGroupBuilder` from `../material/pbr/pbr-material.js`; `createAnimationGroups` from `../animation/animation-group.js`; `AssetContainer` from `../asset-container.js`; dynamic glTF feature imports including `gltf-ext-basisu.ts`.
- **`gltf-ext-basisu.ts` imports**: `decodeKtx2ImageBitmapFromBuffer`, `uploadKtx2Texture2D` from `../texture/ktx2-loader.js`; `resolveAccessor` from `./gltf-parser.js`; PBR and Texture2D types.
- **`load-env.ts` imports**: `SceneContext` from `../scene/scene.js`.
- **`load-dds-env.ts` imports**: `SceneContext`, `SceneContextInternal` from `../scene/scene.js`; `EngineInternal` from `../engine/engine.js`; `EnvironmentTextures` from `./load-env.js`; `acquireGPUTexture`, `releaseGPUTexture` from `../resource/gpu-pool.js`; `assembleEnvironmentTextures` from `./env-helpers.js`; dynamic import of `./rgbd-decode.js`.
- **`env-helpers.ts` imports**: `EnvironmentTextures`, `polynomialToPreScaledHarmonics` from `./load-env.js`; `getOrCreateSampler` from `../resource/gpu-pool.js`.
- **`rgbd-decode.ts` imports**: `EngineContextInternal` from `../engine/engine.js`.
- **`load-hdr.ts` imports**: `EnvironmentTextures` from `../loader-env/load-env.js`; `SceneContext`, `SceneContextInternal` from `../scene/scene.js`; `EngineInternal` from `../engine/engine.js`; `acquireGPUTexture`, `releaseGPUTexture` from `../resource/gpu-pool.js`; `assembleEnvironmentTextures` from `../loader-env/env-helpers.js`; `parseRGBE`, `computeSHFromEquirect` from `./hdr-parser.js`; `equirectToCubemapGPU`, `prefilterCubemapGPU`, `generateBrdfLut` from `./hdr-ibl-pipeline.js`; dynamic imports: `../material/pbr/background-hdr-skybox.js`, `../material/pbr/background-renderable.js`.
- **`hdr-parser.ts` imports**: None (standalone CPU code).
- **`hdr-ibl-pipeline.ts` imports**: `HdrImage` from `./hdr-parser.js`; `getOrCreateSampler` from `../resource/gpu-pool.js`.
- **`load-babylon.ts` imports**: `EngineContext`, `EngineInternal` from `../engine/engine.js`; `createStandardMaterial`, `StandardMaterialProps` from `../material/standard/standard-material.js`; `uploadMeshToGPU`, `initMeshTransform`, `MeshInternal` from `../mesh/mesh.js`; `createPointLight` from `../light/point-light.js`; `loadTexture2D` from `../texture/texture-2d.js`; `AssetContainer` from `../asset-container.js`.
- **`load-skybox.ts` imports**: `SceneContext`, `SceneContextInternal` from `../scene/scene.js`; `EngineInternal` from `../engine/engine.js`; `loadCubeTexture` from `../texture/cube-texture.js`; `createBoxData` from `../mesh/create-box.js`; dynamic import: `./skybox-renderable.js`.
- **`skybox-renderable.ts` imports**: `SceneContext` from `../scene/scene.js`; `EngineInternal` from `../engine/engine.js`; `SkyboxData` from `./load-skybox.js`; `Renderable` from `../render/renderable.js`; `buildSkyboxCubeMapGPU` from `../material/standard/skybox-cubemap.js`.
- **Depended on by**: `pbr-renderable.ts` (consumes `Mesh`), `index.ts` (type exports), scene setup files.

## Test Specification

| Test | Description |
| --- | --- |
| Test<br> **glTF** | Description |
| Test<br>`parseGlbContainer validates magic` | Description<br>Non-GLB input throws |
| Test<br>`parseGlbContainer extracts JSON + BIN` | Description<br>Verify correct chunk parsing |
| Test<br>`resolveAccessor FLOAT` | Description<br>Returns Float32Array with correct count |
| Test<br>`resolveAccessor UNSIGNED_SHORT` | Description<br>Returns Uint16Array |
| Test<br>`RH_TO_LH_ROOT negates X` | Description<br>Verify diag(-1,1,1,1) |
| Test<br>`computeNodeWorldMatrix top-level` | Description<br>Pre-multiplied by RH\_TO\_LH\_ROOT |
| Test<br>`computeNodeWorldMatrix child` | Description<br>Parent world × child local |
| Test<br>`extractMaterial defaults` | Description<br>Missing material → baseColorFactor \[1,1,1,1\], metallic 1, roughness 1 |
| Test<br>`uploadTexture sRGB format` | Description<br>baseColor uses rgba8unorm-srgb |
| Test<br>`uploadTexture null fallback` | Description<br>1×1 white texture |
| Test<br>`computeWorldBounds` | Description<br>Known positions × identity matrix → correct AABB |
| Test<br>`KHR_texture_basisu` | Description<br>Scene 112 FlightHelmetKTX loads KTX2 texture sources and matches Babylon.js within `maxMad: 0.02` |
| Test<br>`KHR_texture_basisu bundle isolation` | Description<br>Existing scenes have no positive runtime-loaded JS deltas when KTX2 support is present |
| Test<br>`Interleaved vertex buffers` | Description<br>Strided accessors resolve to GPU offset/stride; `gltf-interleave.test.ts` covers strided detection + lazy de-stride |
| Test<br>`KHR_xmp_json_ld` | Description<br>Scene 210 XmpMetadataRoundedCube (genuinely interleaved) matches Babylon.js within `maxMad: 0.2`; metadata surfaced on `AssetContainer.xmpMetadata` |
| Test<br>`EXT_meshopt_compression` \+ `KHR_mesh_quantization` | Description<br>Scene 211 BrainStem (glTF-Meshopt-EXT) matches Babylon.js within `maxMad: 0.2` |
| Test<br>`glTF feature bundle isolation` | Description<br>Non-interleaved / non-meshopt / non-XMP scenes never load the corresponding dynamic chunk (verified via `coverage:scene`) |
| Test<br>`glTF camera node property` | Description<br>`gltf-feature-camera.test.ts` — explicit opt-in, perspective/orthographic mapping, source naming, node-hierarchy parenting, handedness fix, inherited-scale fix, unreachable-node fallback. Scene 250 VirtualCity enables camera loading, selects `camera6`, and matches Babylon.js within `maxMad: 6.1`; would fail (badly warped or mirrored view) without the feature. |
| Test<br> **.env** | Description |
| Test<br>`.env magic validation` | Description<br>Bad magic → throws |
| Test<br>`RGBD decode` | Description<br>Known RGBD values → correct linear HDR |
| Test<br>`floatToHalf` | Description<br>1.0 → 0x3C00, 0.0 → 0x0000 |
| Test<br>`BRDF LUT dimensions` | Description<br>256×256, rgba16float |
| Test<br>`integrateBRDF NdotV=1 roughness=0.04` | Description<br>Known approximate values |
| Test<br>`radicalInverseVdC(0)` | Description<br>Returns 0 |
| Test<br>`SH conversion roundtrip` | Description<br>Polynomial → harmonics matches Babylon reference values |
| Test<br> **DDS env** | Description |
| Test<br>`DDS header parsing` | Description<br>Correct width, height, mipCount, dataOffset extraction |
| Test<br>`float16ToFloat32` | Description<br>0x3C00 → 1.0, 0x0000 → 0.0 |
| Test<br>`computeSH from DDS` | Description<br>Known cubemap data → SH coefficients match BJS reference |
| Test<br>`decodeBrdfPng RGBD` | Description<br>Known PNG RGBD values → correct rgba16float output |
| Test<br> **HDR** | Description |
| Test<br>`parseRGBE validates signature` | Description<br>Missing `#?` → throws |
| Test<br>`parseRGBE unsupported format` | Description<br>Non-`32-bit_rle_rgbe` → throws |
| Test<br>`parseRGBE resolution parsing` | Description<br>Correct width/height extraction |
| Test<br>`rgbeToFloat e=0` | Description<br>Returns (0,0,0) |
| Test<br>`rgbeToFloat known values` | Description<br>`[128, 128, 128, 136]` → `(128, 128, 128)` |
| Test<br>`computeSHFromEquirect` | Description<br>Known equirect data → SH matches reference |
| Test<br>`equirectToCubemapGPU output format` | Description<br>rgba16float, faceSize × faceSize × 6 |
| Test<br>`prefilterCubemapGPU mip count` | Description<br>floor(log2(faceSize)) + 1 mip levels |
| Test<br>`generateBrdfLut dimensions` | Description<br>256×256, rgba16float |
| Test<br> **.babylon** | Description |
| Test<br>`loadBabylon clearColor` | Description<br>Scene clearColor set from JSON |
| Test<br>`loadBabylon materials` | Description<br>Standard material properties extracted correctly |
| Test<br>`loadBabylon textures` | Description<br>Texture URLs resolved relative to base URL |
| Test<br>`loadBabylon multiMaterial` | Description<br>SubMesh materialIndex maps to correct sub-material |
| Test<br>`loadBabylon point lights` | Description<br>Position, intensity, diffuse, specular, range |
| Test<br>`loadBabylon mesh transform` | Description<br>Position/rotation/scaling applied via initMeshTransform |
| Test<br>`loadBabylon maxMeshes` | Description<br>Respects mesh count limit |
| Test<br>`loadBabylon invisible mesh` | Description<br>isVisible=false skipped |
| Test<br> **Skybox** | Description |
| Test<br>`loadSkybox registers SkyboxData` | Description<br>scene.\_skybox populated |
| Test<br>`loadSkybox deferred builder` | Description<br>Builder re-enqueues when UBO not ready |
| Test<br>`buildSkyboxRenderable order 0` | Description<br>Renders behind everything |

## File Manifest

| File | Size | Purpose |
| --- | --- | --- |
| File<br>`src/loader-gltf/load-gltf.ts` | Size<br>~413 lines | Purpose<br>GLB parsing, mesh extraction, texture upload, world matrix computation |
| File<br>`src/loader-gltf/gltf-feature-camera.ts` | Size<br>~110 lines | Purpose<br>glTF `camera` node property — perspective/orthographic import, handedness + scale fixup |
| File<br>`src/loader-env/load-env.ts` | Size<br>~470 lines | Purpose<br>.env parsing, RGBD decode, BRDF LUT upload, SH conversion |
| File<br>`src/loader-env/load-dds-env.ts` | Size<br>~286 lines | Purpose<br>DDS cubemap loader, float16 SH extraction, BRDF PNG decode orchestration |
| File<br>`src/loader-env/env-helpers.ts` | Size<br>~34 lines | Purpose<br>Shared sampler creation, EnvironmentTextures assembly |
| File<br>`src/loader-env/rgbd-decode.ts` | Size<br>~125 lines | Purpose<br>Shared GPU compute RGBD PNG/cubemap → rgba16float decode |
| File<br>`src/loader-hdr/load-hdr.ts` | Size<br>~102 lines | Purpose<br>HDR environment loader orchestrator, deferred background builder |
| File<br>`src/loader-hdr/hdr-parser.ts` | Size<br>~218 lines | Purpose<br>RGBE CPU parser, RLE scanline decoder, equirect SH computation |
| File<br>`src/loader-hdr/hdr-ibl-pipeline.ts` | Size<br>~400 lines | Purpose<br>GPU compute: equirect→cubemap, GGX prefilter, BRDF LUT generation |
| File<br>`src/loader-babylon/load-babylon.ts` | Size<br>~428 lines | Purpose<br>.babylon JSON parser, standard materials, lights, mesh upload |
| File<br>`src/loader-skybox/load-skybox.ts` | Size<br>~96 lines | Purpose<br>Cube texture loader + deferred skybox registration |
| File<br>`src/loader-skybox/skybox-renderable.ts` | Size<br>~32 lines | Purpose<br>Skybox renderable builder wrapping skybox-cubemap material |
| File<br>`src/texture/generate-mipmaps.ts` | Size<br>~141 lines | Purpose<br>GPU mipmap blit (shared utility) |

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