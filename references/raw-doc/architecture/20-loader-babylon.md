---
title: Loader Babylon
source: https://doc.babylonjs.com/lite/architecture/20-loader-babylon/
section: Architecture
---

[API](https://doc.babylonjs.com/lite/typedoc/)

[Babylon Lite](https://doc.babylonjs.com/lite/)\|

[Architecture](https://doc.babylonjs.com/lite/architecture/)\|

[Loader Babylon](https://doc.babylonjs.com/lite/architecture/20-loader-babylon/)

…\|

[Babylon Lite](https://doc.babylonjs.com/lite/)\|

[Architecture](https://doc.babylonjs.com/lite/architecture/)\|

[Loader Babylon](https://doc.babylonjs.com/lite/architecture/20-loader-babylon/)

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


# Module: Loader Babylon

### Table Of Contents

[Module: Loader Babylon](https://doc.babylonjs.com/lite/architecture/20-loader-babylon/#module-loader-babylon) [Purpose](https://doc.babylonjs.com/lite/architecture/20-loader-babylon/#purpose) [Public API Surface](https://doc.babylonjs.com/lite/architecture/20-loader-babylon/#public-api-surface) [Functions](https://doc.babylonjs.com/lite/architecture/20-loader-babylon/#functions) [Types](https://doc.babylonjs.com/lite/architecture/20-loader-babylon/#types) [Usage](https://doc.babylonjs.com/lite/architecture/20-loader-babylon/#usage) [Internal Architecture](https://doc.babylonjs.com/lite/architecture/20-loader-babylon/#internal-architecture) [.babylon JSON Schema (parsed types)](https://doc.babylonjs.com/lite/architecture/20-loader-babylon/#babylon-json-schema-parsed-types) [Loading Pipeline](https://doc.babylonjs.com/lite/architecture/20-loader-babylon/#loading-pipeline) [Material Resolution](https://doc.babylonjs.com/lite/architecture/20-loader-babylon/#material-resolution) [Ambient Color Handling](https://doc.babylonjs.com/lite/architecture/20-loader-babylon/#ambient-color-handling) [Texture Loading](https://doc.babylonjs.com/lite/architecture/20-loader-babylon/#texture-loading) [Sub-Mesh Handling](https://doc.babylonjs.com/lite/architecture/20-loader-babylon/#sub-mesh-handling) [Differences from glTF Loading Path](https://doc.babylonjs.com/lite/architecture/20-loader-babylon/#differences-from-gltf-loading-path) [Pipeline Configuration](https://doc.babylonjs.com/lite/architecture/20-loader-babylon/#pipeline-configuration) [Shader Logic](https://doc.babylonjs.com/lite/architecture/20-loader-babylon/#shader-logic) [State Machine / Lifecycle](https://doc.babylonjs.com/lite/architecture/20-loader-babylon/#state-machine--lifecycle) [Babylon.js Equivalence Map](https://doc.babylonjs.com/lite/architecture/20-loader-babylon/#babylonjs-equivalence-map) [Dependencies](https://doc.babylonjs.com/lite/architecture/20-loader-babylon/#dependencies) [Test Specification](https://doc.babylonjs.com/lite/architecture/20-loader-babylon/#test-specification) [File Manifest](https://doc.babylonjs.com/lite/architecture/20-loader-babylon/#file-manifest)

> Package path: `packages/babylon-lite/src/loader-babylon/`

## Purpose

Parses Babylon.js `.babylon` scene files and returns an `AssetContainer` with meshes, standard materials, point lights, and scene-level settings. The caller passes the result to `addToScene(scene, result)` which populates the `SceneContext`. Provides an alternative loading path to glTF for scenes authored in the Babylon.js editor or exported from 3ds Max / Unity.

## Public API Surface

### Functions

```typescript
export async function loadBabylon(engine: Engine, url: string, opts?: LoadBabylonOptions): Promise<AssetContainer>;
```

### Types

```typescript
export interface LoadBabylonOptions {
    maxMeshes?: number; // maximum meshes to load (default: all)
    loadTextures?: boolean; // whether to load textures (default: true)
}

/** Returned by both loadGltf() and loadBabylon(). Passed to addToScene(). */
export type { AssetContainer } from "../asset-container.js";
```

### Usage

```typescript
const result = await loadBabylon(engine, "https://example.com/scene.babylon");
addToScene(scene, result); // entities[], clearColor, animationGroups dispatched into scene
```

- `entities`: flat array of all loaded `Mesh` and `LightBase` objects
- `clearColor`: from `scene.clearColor` JSON field (if present), applied by `addToScene()`
- `animationGroups`: empty for `.babylon` (format has no animation groups)

## Internal Architecture

### .babylon JSON Schema (parsed types)

```typescript
interface BabylonScene {
    clearColor?: number[];
    ambientColor?: number[];
    cameras?: BabylonCamera[];
    lights?: BabylonLight[];
    materials?: BabylonMaterial[];
    multiMaterials?: BabylonMultiMaterial[];
    meshes?: BabylonMesh[];
    activeCameraID?: string;
}

interface BabylonCamera {
    name: string;
    id: string;
    type: string;
    position: number[];
    rotation?: number[];
    target?: number[];
    fov?: number;
    minZ?: number;
    maxZ?: number;
}

interface BabylonTexture {
    name: string; // filename relative to .babylon URL
    hasAlpha?: boolean;
    getAlphaFromRGB?: boolean;
    level?: number;
    coordinatesIndex?: number; // 0 = UV1, 1 = UV2
    coordinatesMode?: number; // 2 = spherical reflection
    uOffset?: number;
    vOffset?: number;
    uScale?: number;
    vScale?: number;
}

interface BabylonMaterial {
    name: string;
    id: string;
    diffuse?: number[];
    specular?: number[];
    specularPower?: number;
    emissive?: number[];
    ambient?: number[];
    alpha?: number;
    alphaCutOff?: number;
    diffuseTexture?: BabylonTexture | null;
    bumpTexture?: BabylonTexture | null;
    specularTexture?: BabylonTexture | null;
    ambientTexture?: BabylonTexture | null;
    lightmapTexture?: BabylonTexture | null;
    emissiveTexture?: BabylonTexture | null;
    opacityTexture?: BabylonTexture | null;
    reflectionTexture?: BabylonTexture | null;
    backFaceCulling?: boolean;
}

interface BabylonMultiMaterial {
    name: string;
    id: string;
    materials: string[]; // ordered sub-material IDs
}

interface BabylonSubMesh {
    materialIndex: number;
    verticesStart: number;
    verticesCount: number;
    indexStart: number;
    indexCount: number;
}

interface BabylonMesh {
    name: string;
    id: string;
    parentId?: string | null;
    materialId?: string | null;
    position?: number[];
    rotation?: number[];
    scaling?: number[];
    positions?: number[];
    normals?: number[];
    uvs?: number[];
    uvs2?: number[];
    indices?: number[];
    subMeshes?: BabylonSubMesh[];
    isVisible?: boolean;
}

interface BabylonLight {
    name: string;
    id: string;
    type: number; // 0=point, 1=directional, 2=spot, 3=hemispheric
    position?: number[];
    direction?: number[];
    diffuse?: number[];
    specular?: number[];
    intensity?: number;
    range?: number;
    excludedMeshesIds?: string[];
    includedOnlyMeshesIds?: string[];
}
```

### Loading Pipeline

```javascript
fetch(url) → JSON parse → BabylonScene
     │
     ├── Scene settings: clearColor
     │
     ├── Materials: Build Map<id, StandardMaterialProps>
     │   └── For each material: create StandardMaterial, load textures in parallel
     │
     ├── MultiMaterials: Build Map<id, string[]> (sub-material ID arrays)
     │
     ├── Lights: Create point lights (type === 0) with position, intensity, colors, range
     │   └── Support: excludedMeshesIds, includedOnlyMeshesIds
     │
     └── Meshes: For each visible mesh with geometry:
         ├── Upload positions, normals, indices, uvs, uvs2 to GPU
         ├── Resolve material (direct or via multi-material subMesh)
         ├── Split into sub-meshes (each sub-mesh → separate GPU mesh)
         ├── Apply position/rotation/scaling transform
         └── Retain CPU geometry for picking (_cpuPositions, _cpuNormals, etc.)
```

### Material Resolution

1. Look up `mesh.materialId` in `multiMatMap`
2. If found: it's a multi-material → use sub-material IDs array
3. If not: treat `materialId` as single material ID
4. For each sub-mesh: `matIds[subMesh.materialIndex]` → lookup in `materialMap`
5. Fallback: `createStandardMaterial()` (default white material)

### Ambient Color Handling

BJS multiplies `material.ambient` by `scene.ambientColor`. The loader pre-multiplies:

```typescript
mat.ambientColor = [md.ambient[0] * sceneAmbient[0], md.ambient[1] * sceneAmbient[1], md.ambient[2] * sceneAmbient[2]];
```

### Texture Loading

Textures are loaded in parallel via `Promise.all(texturePromises)`:

- URL resolution: `baseUrl + texture.name` where `baseUrl = url.substring(0, lastIndexOf("/") + 1)`
- Supported texture slots: diffuse, bump, specular, ambient, lightmap, emissive, opacity, reflection
- Per-texture properties mapped: `level` → material-specific level, `coordinatesIndex` → coord index, `uScale`/`vScale` → `uvScale`, `getAlphaFromRGB` → `opacityFromRGB`, `coordinatesMode === 2` → `reflectionCoordMode = 2` (spherical)
- Texture cache cleared on dispose via `clearTexture2DCache(device)`

### Sub-Mesh Handling

Each `BabylonSubMesh` becomes a separate GPU mesh with:

- Shared vertex buffers (positions, normals referenced from parent)
- Sliced index buffer: `allIndices.slice(sub.indexStart, sub.indexStart + sub.indexCount)`
- Individual material assignment from multi-material array
- Name: `meshName_sub{materialIndex}` for multi-sub-mesh meshes

### Differences from glTF Loading Path

| Aspect | glTF Loader | .babylon Loader |
| --- | --- | --- |
| Aspect<br>Format | glTF Loader<br>Binary GLB or JSON + .bin | .babylon Loader<br>Single JSON file |
| Aspect<br>Material system | glTF Loader<br>PBR (metallic-roughness) | .babylon Loader<br>Standard (Blinn-Phong) |
| Aspect<br>Coordinate system | glTF Loader<br>Right-handed → LH conversion | .babylon Loader<br>Already left-handed |
| Aspect<br>Skeleton/animation | glTF Loader<br>Full support | .babylon Loader<br>Not supported |
| Aspect<br>Morph targets | glTF Loader<br>Supported | .babylon Loader<br>Not supported |
| Aspect<br>Multi-material | glTF Loader<br>Not applicable (per-primitive) | .babylon Loader<br>SubMesh → multi-material mapping |
| Aspect<br>Vertex data | glTF Loader<br>Binary accessors + buffer views | .babylon Loader<br>Inline JSON number arrays |
| Aspect<br>Texture references | glTF Loader<br>URI or buffer-embedded | .babylon Loader<br>Filename relative to .babylon URL |
| Aspect<br>Lights | glTF Loader<br>Not in glTF core | .babylon Loader<br>Point lights with include/exclude |

## Pipeline Configuration

N/A — No GPU pipelines created by this module. Mesh upload uses `uploadMeshToGPU()` from mesh module.

## Shader Logic

N/A — Uses Standard material shaders (not managed by this loader).

## State Machine / Lifecycle

One-shot async loader. No persistent state. Registers `clearTexture2DCache` disposable on scene.

## Babylon.js Equivalence Map

| Babylon.js | Babylon Lite |
| --- | --- |
| Babylon.js<br>`SceneLoader.Load(".babylon")` | Babylon Lite<br>`addToScene(scene, await loadBabylon(engine, url))` |
| Babylon.js<br>`StandardMaterial` | Babylon Lite<br>`createStandardMaterial()` → `StandardMaterialProps` |
| Babylon.js<br>`MultiMaterial` | Babylon Lite<br>`multiMatMap: Map<id, string[]>` |
| Babylon.js<br>`Mesh.subMeshes` | Babylon Lite<br>Split into individual GPU meshes per sub-mesh |
| Babylon.js<br>`PointLight` | Babylon Lite<br>`createPointLight()` |
| Babylon.js<br>`Light.excludedMeshes` | Babylon Lite<br>`pl.excludedMeshIds: Set<string>` |
| Babylon.js<br>`Light.includedOnlyMeshes` | Babylon Lite<br>`pl.includedOnlyMeshIds: Set<string>` |

## Dependencies

- `../scene/scene.js` — `SceneContext`, `SceneContextInternal`
- `../engine/engine.js` — `EngineInternal` (device access)
- `../material/standard/standard-material.js` — `createStandardMaterial`, `StandardMaterialProps`
- `../mesh/mesh.js` — `uploadMeshToGPU`, `initMeshTransform`, `MeshInternal`
- `../light/point-light.js` — `createPointLight`
- `../texture/texture-2d.js` — `loadTexture2D`, `clearTexture2DCache`

## Test Specification

01. **Scene clear color**: Verify `scene.clearColor` set from JSON
02. **Material parsing**: Verify diffuse/specular/emissive colors, specularPower, alpha
03. **Texture loading**: Verify textures loaded with correct URLs and properties mapped
04. **Multi-material**: Verify sub-meshes assigned correct materials from multi-material array
05. **Mesh transform**: Verify position/rotation/scaling applied via `initMeshTransform`
06. **Point lights**: Verify position, intensity, diffuse/specular colors, range
07. **Light filtering**: Verify excludedMeshIds and includedOnlyMeshIds Sets created
08. **Invisible meshes**: Verify `isVisible: false` meshes are skipped
09. **maxMeshes**: Verify mesh count cap is respected
10. **CPU geometry retained**: Verify `_cpuPositions`, `_cpuNormals`, `_cpuIndices` set for picking

## File Manifest

| File | Purpose |
| --- | --- |
| File<br>`load-babylon.ts` | Purpose<br>Complete .babylon format loader: JSON parsing, material/texture creation, mesh upload, light creation |

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