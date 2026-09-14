---
title: Mesh Generators
source: https://doc.babylonjs.com/lite/architecture/10-mesh-generators/
section: Architecture
---

[API](https://doc.babylonjs.com/lite/typedoc/)

[Babylon Lite](https://doc.babylonjs.com/lite/)\|

[Architecture](https://doc.babylonjs.com/lite/architecture/)\|

[Mesh Generators](https://doc.babylonjs.com/lite/architecture/10-mesh-generators/)

…\|

[Babylon Lite](https://doc.babylonjs.com/lite/)\|

[Architecture](https://doc.babylonjs.com/lite/architecture/)\|

[Mesh Generators](https://doc.babylonjs.com/lite/architecture/10-mesh-generators/)

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


# Module: Mesh Generators

### Table Of Contents

[Module: Mesh Generators](https://doc.babylonjs.com/lite/architecture/10-mesh-generators/#module-mesh-generators) [Purpose](https://doc.babylonjs.com/lite/architecture/10-mesh-generators/#purpose) [Public API Surface](https://doc.babylonjs.com/lite/architecture/10-mesh-generators/#public-api-surface) [Ground (`create-ground.ts`)](https://doc.babylonjs.com/lite/architecture/10-mesh-generators/#ground-create-groundts) [Torus (`create-torus.ts`)](https://doc.babylonjs.com/lite/architecture/10-mesh-generators/#torus-create-torusts) [Sphere (`create-sphere.ts`)](https://doc.babylonjs.com/lite/architecture/10-mesh-generators/#sphere-create-spherets) [Box (`create-box.ts`)](https://doc.babylonjs.com/lite/architecture/10-mesh-generators/#box-create-boxts) [Cylinder (`create-cylinder.ts`)](https://doc.babylonjs.com/lite/architecture/10-mesh-generators/#cylinder-create-cylinderts) [Plane (`create-plane.ts`)](https://doc.babylonjs.com/lite/architecture/10-mesh-generators/#plane-create-planets) [Disc / Ring (`create-disc.ts`)](https://doc.babylonjs.com/lite/architecture/10-mesh-generators/#disc--ring-create-discts) [Polyhedron (`create-polyhedron.ts`)](https://doc.babylonjs.com/lite/architecture/10-mesh-generators/#polyhedron-create-polyhedronts) [Ribbon (`create-ribbon.ts`)](https://doc.babylonjs.com/lite/architecture/10-mesh-generators/#ribbon-create-ribbonts) [Tube (`create-tube.ts`)](https://doc.babylonjs.com/lite/architecture/10-mesh-generators/#tube-create-tubets) [Extrude Shape (`create-extrude.ts`)](https://doc.babylonjs.com/lite/architecture/10-mesh-generators/#extrude-shape-create-extrudets) [Shared types](https://doc.babylonjs.com/lite/architecture/10-mesh-generators/#shared-types) [Internal Architecture](https://doc.babylonjs.com/lite/architecture/10-mesh-generators/#internal-architecture) [Ground](https://doc.babylonjs.com/lite/architecture/10-mesh-generators/#ground) [Torus](https://doc.babylonjs.com/lite/architecture/10-mesh-generators/#torus) [Sphere](https://doc.babylonjs.com/lite/architecture/10-mesh-generators/#sphere) [Box](https://doc.babylonjs.com/lite/architecture/10-mesh-generators/#box) [Cylinder](https://doc.babylonjs.com/lite/architecture/10-mesh-generators/#cylinder) [Plane](https://doc.babylonjs.com/lite/architecture/10-mesh-generators/#plane) [Disc / Ring](https://doc.babylonjs.com/lite/architecture/10-mesh-generators/#disc--ring) [Polyhedron](https://doc.babylonjs.com/lite/architecture/10-mesh-generators/#polyhedron) [Ribbon](https://doc.babylonjs.com/lite/architecture/10-mesh-generators/#ribbon) [Tube](https://doc.babylonjs.com/lite/architecture/10-mesh-generators/#tube) [Extrude Shape](https://doc.babylonjs.com/lite/architecture/10-mesh-generators/#extrude-shape) [Path3D (`path3d.ts`)](https://doc.babylonjs.com/lite/architecture/10-mesh-generators/#path3d-path3dts) [GPU Upload Pattern](https://doc.babylonjs.com/lite/architecture/10-mesh-generators/#gpu-upload-pattern) [Vertex Data Layout](https://doc.babylonjs.com/lite/architecture/10-mesh-generators/#vertex-data-layout) [Pipeline Configuration](https://doc.babylonjs.com/lite/architecture/10-mesh-generators/#pipeline-configuration) [Shader Logic](https://doc.babylonjs.com/lite/architecture/10-mesh-generators/#shader-logic) [State Machine / Lifecycle](https://doc.babylonjs.com/lite/architecture/10-mesh-generators/#state-machine--lifecycle) [Ground Lifecycle](https://doc.babylonjs.com/lite/architecture/10-mesh-generators/#ground-lifecycle) [Other Shapes](https://doc.babylonjs.com/lite/architecture/10-mesh-generators/#other-shapes) [Babylon.js Equivalence Map](https://doc.babylonjs.com/lite/architecture/10-mesh-generators/#babylonjs-equivalence-map) [Dependencies](https://doc.babylonjs.com/lite/architecture/10-mesh-generators/#dependencies) [Test Specification](https://doc.babylonjs.com/lite/architecture/10-mesh-generators/#test-specification) [Ground](https://doc.babylonjs.com/lite/architecture/10-mesh-generators/#ground-1) [Torus](https://doc.babylonjs.com/lite/architecture/10-mesh-generators/#torus-1) [Sphere](https://doc.babylonjs.com/lite/architecture/10-mesh-generators/#sphere-1) [Box](https://doc.babylonjs.com/lite/architecture/10-mesh-generators/#box-1) [File Manifest](https://doc.babylonjs.com/lite/architecture/10-mesh-generators/#file-manifest)

> Package path: `packages/babylon-lite/src/mesh/`

## Purpose

Procedural mesh generation for the core BabylonJS `MeshBuilder` shape set: ground (with heightmap support), torus, UV sphere, box, cylinder/cone, plane, disc/ring, polyhedron, ribbon, tube, and extruded shape. Each generator produces CPU-side vertex data (positions, normals, UVs, indices) and — where applicable — a companion upload helper. All generators match Babylon.js `MeshBuilder` output exactly; parity is enforced pixel-perfect by scene 38 (MAD = 0.000).

* * *

## Public API Surface

### Ground (`create-ground.ts`)

```typescript
export interface GroundData {
    positions: Float32Array; // vertexCount × 3
    normals: Float32Array; // vertexCount × 3
    uvs: Float32Array; // vertexCount × 2
    indices: Uint32Array; // indexCount
}

export interface GroundOptions {
    width?: number; // Default: 1
    height?: number; // Default: 1
    subdivisions?: number; // Default: 1
    minHeight?: number; // Default: 0
    maxHeight?: number; // Default: 1
}

export interface GroundGPU {
    positionBuffer: GPUBuffer;
    normalBuffer: GPUBuffer;
    uvBuffer: GPUBuffer;
    indexBuffer: GPUBuffer;
    indexCount: number;
}

export function createFlatGroundData(opts?: GroundOptions): GroundData;

export function applyHeightmap(
    ground: GroundData,
    heightmapData: Uint8ClampedArray,
    hmWidth: number,
    hmHeight: number,
    subdivisions: number,
    minHeight: number,
    maxHeight: number
): void;

export async function createGroundFromHeightMap(heightmapUrl: string, opts?: GroundOptions): Promise<GroundData>;
```

### Torus (`create-torus.ts`)

```typescript
export interface TorusData {
    positions: Float32Array; // vertexCount × 3
    normals: Float32Array; // vertexCount × 3
    uvs: Float32Array; // vertexCount × 2
    indices: Uint32Array; // indexCount
}

export interface TorusOptions {
    diameter?: number; // Default: 1
    thickness?: number; // Default: 0.5
    tessellation?: number; // Default: 16
}

export interface TorusGPU {
    positionBuffer: GPUBuffer;
    normalBuffer: GPUBuffer;
    uvBuffer: GPUBuffer;
    indexBuffer: GPUBuffer;
    indexCount: number;
}

export function createTorusData(opts?: TorusOptions): TorusData;
export function uploadTorusToGPU(device: GPUDevice, data: TorusData): TorusGPU;
```

### Sphere (`create-sphere.ts`)

```typescript
export interface SphereMeshData {
    positions: Float32Array; // vertexCount × 3
    normals: Float32Array; // vertexCount × 3
    indices: Uint32Array; // indexCount
    vertexCount: number;
    indexCount: number;
}

export interface SphereOptions {
    segments?: number; // Default: 32 (minimum: 3)
    diameter?: number; // Default: 1
    diameterX?: number; // Default: diameter
    diameterY?: number; // Default: diameter
    diameterZ?: number; // Default: diameter
}

export function createSphereData(options?: SphereOptions): SphereMeshData;

export function uploadSphereToGPU(device: GPUDevice, data: SphereMeshData): { posBuffer: GPUBuffer; normBuffer: GPUBuffer; idxBuffer: GPUBuffer; idxCount: number };
```

### Box (`create-box.ts`)

```typescript
export interface BoxData {
    positions: Float32Array; // 24 × 3 = 72 floats
    normals: Float32Array; // 24 × 3 = 72 floats
    indices: Uint32Array; // 36 indices
    vertexCount: number; // always 24
    indexCount: number; // always 36
}

export interface BoxGPU {
    posBuffer: GPUBuffer;
    normBuffer: GPUBuffer;
    idxBuffer: GPUBuffer;
    idxCount: number;
}

export function createBoxData(size?: number): BoxData; // Default: size = 1
export function uploadBoxToGPU(device: GPUDevice, data: BoxData): BoxGPU;
```

### Cylinder (`create-cylinder.ts`)

```typescript
export interface CylinderOptions {
    height?: number; // Default: 2
    diameter?: number; // Default: 1 (overrides diameterTop / diameterBottom)
    diameterTop?: number; // Default: 1 (0 → cone)
    diameterBottom?: number; // Default: 1
    tessellation?: number; // Default: 24
    subdivisions?: number; // Default: 1
    arc?: number; // Default: 1 (partial wedge)
}

export function createCylinderData(opts?: CylinderOptions): MeshData;
```

### Plane (`create-plane.ts`)

```typescript
export interface PlaneOptions {
    size?: number; // Default: 1 (shorthand for width + height)
    width?: number;
    height?: number;
}

export function createPlaneData(opts?: PlaneOptions): MeshData;
```

### Disc / Ring (`create-disc.ts`)

```typescript
export interface DiscOptions {
    radius?: number; // Default: 0.5
    tessellation?: number; // Default: 64
    arc?: number; // Default: 1 (<1 → pie slice / ring)
}

export function createDiscData(opts?: DiscOptions): MeshData;
```

### Polyhedron (`create-polyhedron.ts`)

```typescript
export interface PolyhedronOptions {
    type?: number; // 0-14 (0=tetra, 3=icosahedron, …)
    size?: number; // Default: 1 (uniform scale)
    sizeX?: number;
    sizeY?: number;
    sizeZ?: number;
    flat?: boolean; // Default: true (duplicate verts per face)
}

export function createPolyhedronData(opts?: PolyhedronOptions): MeshData;
```

### Ribbon (`create-ribbon.ts`)

```typescript
export interface RibbonOptions {
    pathArray: Vec3[][];
    closeArray?: boolean; // Default: false
    closePath?: boolean; // Default: false
    offset?: number; // Default: pathArray[0].length / 2
    sideOrientation?: number;
}

export function createRibbonData(opts: RibbonOptions): MeshData;
```

### Tube (`create-tube.ts`)

```typescript
export const CAP_NONE = 0;
export const CAP_START = 1;
export const CAP_END = 2;
export const CAP_ALL = 3;

export interface TubeOptions {
    path: Vec3[];
    radius?: number; // Default: 1
    tessellation?: number; // Default: 64
    radiusFunction?: (i: number, distance: number) => number;
    cap?: number; // Default: CAP_NONE
    arc?: number; // Default: 1
}

export function createTubeData(opts: TubeOptions): MeshData;
```

### Extrude Shape (`create-extrude.ts`)

```typescript
export interface ExtrudeShapeOptions {
    shape: Vec3[];
    path: Vec3[];
    scale?: number; // Default: 1
    rotation?: number; // Default: 0 (radians accumulated per path step)
    cap?: number; // Default: CAP_NONE
    closeShape?: boolean;
    closePath?: boolean;
}

export function createExtrudeShapeData(opts: ExtrudeShapeOptions): MeshData;
```

### Shared types

```typescript
// All new builders return this common shape.
export interface MeshData {
    positions: Float32Array;
    normals: Float32Array;
    uvs: Float32Array;
    indices: Uint32Array;
}
```

* * *

## Internal Architecture

### Ground

**Grid layout:**`(subdivisions + 1) × (subdivisions + 1)` vertices.

**Vertex counts:**

- Vertices: `(subdivisions + 1)²`
- Indices: `subdivisions² × 6`

**Vertex position formula:**

```javascript
x = -width/2 + (col / subdivisions) * width
y = 0 (flat; displaced by heightmap)
z = -height/2 + (1 - row / subdivisions) * height
```

**UV formula:**

```javascript
u = col / subdivisions
v = 1 - row / subdivisions
```

**Initial normals:** All `(0, 1, 0)` (up).

**Index generation (per quad):**

```javascript
topLeft     = row * cols + col
topRight    = topLeft + 1
bottomLeft  = (row + 1) * cols + col
bottomRight = bottomLeft + 1

Triangle 1: topLeft, bottomLeft, bottomRight
Triangle 2: topLeft, bottomRight, topRight
```

**Heightmap displacement (`applyHeightmap`):**

1. For each vertex at `(row, col)`:
   - Sample heightmap at pixel `(px, py)`:









     ```javascript
     u = col / subdivisions
     v = row / subdivisions  (row 0 = top of image)
     px = floor(u * (hmWidth - 1))
     py = floor(v * (hmHeight - 1))
     ```

   - Compute weighted luminance: `gradient = r * 0.3 + g * 0.59 + b * 0.11`
   - Displace Y: `position.y = minHeight + gradient * (maxHeight - minHeight)`
2. Recompute normals:
   - Reset all normals to zero
   - For each triangle: compute face normal via cross product of edge vectors, **negate** the result (due to Z-flip from `1 - row/subdivisions`), normalize to unit length, then accumulate onto each triangle's 3 vertices
   - Normalize all vertex normals

**Cross product formula for face normals:**

```javascript
e1 = p1 - p0
e2 = p2 - p0
fn = -(e1 × e2)          // negated
fn = fn / |fn|            // normalize before accumulation
```

**Async heightmap loading (`createGroundFromHeightMap`):**

1. Create flat ground data
2. Load image via `new Image()` with `crossOrigin = 'anonymous'`
3. Draw to canvas, extract `ImageData`
4. Call `applyHeightmap`

### Torus

**Parameterization (matches Babylon.js `Mesh.CreateTorus`):**

```javascript
R = diameter / 2          // major radius (default: 0.5)
r = thickness / 2         // tube radius (default: 0.25)
stride = tessellation + 1

outerAngle = i * 2π / tessellation - π/2    // around major ring
innerAngle = j * 2π / tessellation + π      // around tube cross-section
```

**Vertex counts:**

- Vertices: `(tessellation + 1)²`
- Indices: `(tessellation + 1)² × 6` (includes wrapping seam geometry)

**Position formula:**

```javascript
dx = cos(innerAngle)
dy = sin(innerAngle)

x =  (dx * r + R) * cos(outerAngle)
y =  dy * r
z = -(dx * r + R) * sin(outerAngle)
```

**Normal formula** (rotate tube normal by Y-axis rotation):

```javascript
nx =  dx * cos(outerAngle)
ny =  dy
nz = -dx * sin(outerAngle)
```

**UV formula:**

```javascript
u = i / tessellation
v = 1 - j / tessellation
```

**Index generation** (per quad with wrapping):

```javascript
nextI = (i + 1) % stride
nextJ = (j + 1) % stride

Triangle 1: (i*stride + j), (i*stride + nextJ), (nextI*stride + j)
Triangle 2: (i*stride + nextJ), (nextI*stride + nextJ), (nextI*stride + j)
```

### Sphere

**Parameterization (matches Babylon.js `MeshBuilder.CreateSphere`):**

```javascript
totalZRotationSteps = 2 + segments     // vertical rows
totalYRotationSteps = 2 * totalZRotationSteps  // horizontal columns

rx = (diameterX ?? diameter) / 2       // default: 0.5
ry = (diameterY ?? diameter) / 2
rz = (diameterZ ?? diameter) / 2
```

**Default tessellation:**`segments = 32` → `totalZ = 34, totalY = 68` → `35 × 69 = 2415` vertices.

**Vertex counts:**

- Vertices: `(totalZRotationSteps + 1) × (totalYRotationSteps + 1)`
- Indices: `totalZRotationSteps × totalYRotationSteps × 6`

**Position formula:**

```javascript
angleZ = (zStep / totalZRotationSteps) * π       // polar angle [0, π]
angleY = (yStep / totalYRotationSteps) * 2π      // azimuthal angle [0, 2π]

nx = sin(angleZ) * cos(angleY)
ny = cos(angleZ)
nz = sin(angleZ) * sin(angleY)

position = (rx * nx, ry * ny, rz * nz)
normal   = (nx, ny, nz)
```

**Index generation** (per quad):

```javascript
a = zStep * (totalYRotationSteps + 1) + yStep
b = a + totalYRotationSteps + 1

Triangle 1: a, b, a+1
Triangle 2: a+1, b, b+1
```

**Note:** No UV coordinates are generated. The sphere only has positions, normals, and indices.

### Box

**Static geometry** — uses pre-computed constant arrays.

**Vertex count:** 24 (4 per face × 6 faces)
**Index count:** 36 (2 triangles × 3 indices × 6 faces)

**Face order:** +Z, -Z, +X, -X, +Y, -Y

**Vertex positions (at size = 1, half-extent = 0.5):**

| Face | V0 | V1 | V2 | V3 | Normal |
| --- | --- | --- | --- | --- | --- |
| Face<br>+Z | V0<br>(0.5,-0.5,0.5) | V1<br>(-0.5,-0.5,0.5) | V2<br>(-0.5,0.5,0.5) | V3<br>(0.5,0.5,0.5) | Normal<br>(0,0,1) |
| Face<br>-Z | V0<br>(0.5,0.5,-0.5) | V1<br>(-0.5,0.5,-0.5) | V2<br>(-0.5,-0.5,-0.5) | V3<br>(0.5,-0.5,-0.5) | Normal<br>(0,0,-1) |
| Face<br>+X | V0<br>(0.5,0.5,-0.5) | V1<br>(0.5,-0.5,-0.5) | V2<br>(0.5,-0.5,0.5) | V3<br>(0.5,0.5,0.5) | Normal<br>(1,0,0) |
| Face<br>-X | V0<br>(-0.5,0.5,0.5) | V1<br>(-0.5,-0.5,0.5) | V2<br>(-0.5,-0.5,-0.5) | V3<br>(-0.5,0.5,-0.5) | Normal<br>(-1,0,0) |
| Face<br>+Y | V0<br>(-0.5,0.5,0.5) | V1<br>(-0.5,0.5,-0.5) | V2<br>(0.5,0.5,-0.5) | V3<br>(0.5,0.5,0.5) | Normal<br>(0,1,0) |
| Face<br>-Y | V0<br>(0.5,-0.5,0.5) | V1<br>(0.5,-0.5,-0.5) | V2<br>(-0.5,-0.5,-0.5) | V3<br>(-0.5,-0.5,0.5) | Normal<br>(0,-1,0) |

**Index pattern per face:**

```javascript
[base+0, base+1, base+2], [base+0, base+2, base+3]
```

Complete indices:

```javascript
[0,1,2], [0,2,3],  [4,5,6], [4,6,7],  [8,9,10], [8,10,11],
[12,13,14], [12,14,15],  [16,17,18], [16,18,19],  [20,21,22], [20,22,23]
```

**Scaling:** When `size ≠ 1`, all position coordinates are multiplied by `size`. Normals remain unchanged. When `size = 1`, the pre-computed `BOX_POSITIONS` constant is returned directly (no allocation).

### Cylinder

Ported from BJS `VertexData.CreateCylinder`. Builds `subdivisions + 1` radial rings interpolated between `diameterBottom` and `diameterTop`, plus CAP\_ALL triangle fans at both ends. Normals are computed from the slant angle so cones and prisms shade correctly. `arc < 1` produces a partial wedge with a seam.

### Plane

Single quad in the XY plane; normal `(0, 0, -1)`; UVs `[0,1]`; index order `(0,1,2),(0,2,3)` → winding matches `frontFace: "ccw"` with the -Z normal.

### Disc / Ring

Triangle fan from the center, `tessellation` outer vertices around `2π · arc` radians. Normal is hard-coded `(0, 0, -1)`. With `arc < 1`, the fan forms a pie slice; mesh thickness-of-zero rings are produced by sampling the same shape at two radii (extrude path).

### Polyhedron

BJS preset tables (`polyhedron-data.ts`) contain vertex positions and face index lists for 15 polyhedra. The builder scales by `sizeX/Y/Z` then tessellates each face:

- **`flat = true` (default):** each face contributes independent vertices with a single face normal (cross product of two edge vectors). No vertex sharing across faces.
- **`flat = false`:** face vertices are shared; normals are averaged via `compute-normals.ts` for smooth shading.

### Ribbon

The base primitive that powers `tube` and `extrude`. Given a `pathArray` (rows of equal-length 3D paths), it:

1. Concatenates all rows into one positions buffer (row-major).
2. Emits two triangles per quad stitched between consecutive paths.
3. Normalizes UVs via cumulative edge distances along each row and column (matches BJS).
4. Computes per-vertex normals via `compute-normals.ts`.
5. If `closePath`, duplicates each row's first vertex at the end and averages the seam normal.
6. If `closeArray`, stitches the last path back to the first and averages those seam normals too.

### Tube

Builds a ribbon where each row is a circle of `tessellation` vertices around `path[i]`, radius `radius` (or `radiusFunction(i, distance)`):

1. Computes Path3D frames → `tangents[i]`, `normals[i]`, `binormals[i]`.
2. For each `path[i]`, starts from `normals[i] * radius` and rotates it around `tangents[i]` by `2π · arc / tessellation` via Rodrigues' rotation formula to build the ring.
3. Always sets `closePath = true` so the ring seals.
4. `cap` inserts extra rows at the start/end: a barycenter vertex plus a duplicate ring at zero scale (matches BJS cap geometry).

### Extrude Shape

Sweeps a 2D `shape` (XY) along a 3D `path`:

1. Computes Path3D frames.
2. For each `path[i]`, transforms each `shape[k]`: `p = tangent[i] * sz + normal[i] * sx + binormal[i] * sy` (reinterprets shape Z as tangent offset).
3. Applies cumulative `rotation` around `tangent[i]` (Rodrigues) and `scale`.
4. Translates to `path[i]`.
5. Builds ribbon rows from the transformed rings, with optional start/end caps via barycenter + zero-scale duplicate ring.

### Path3D (`path3d.ts`)

Port of BJS's parallel-transport frame computation:

- First tangent: `normalize(curve[1] - curve[0])` (or the first non-null diff for degenerate leading duplicates).
- First normal: arbitrary perpendicular via `_normalVector(tangent, null)` — picks the most stable axis cross.
- Subsequent frames: `tangent[i] = normalize(curve[i+1] - curve[i])`, then `normal[i] = normalize(cross(binormal[i-1], tangent[i]))`, `binormal[i] = cross(tangent[i], normal[i])`. This parallel-transports the frame along the curve without swing/roll discontinuities.
- Last point copies the previous tangent.
- `distances[i]` is the cumulative arc length, used for UV normalization.

### GPU Upload Pattern

All generators follow the same GPU upload pattern:

```typescript
// Per-attribute buffer creation
const buffer = device.createBuffer({
    size: data.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true, // (ground, torus, sphere)
    // OR: writeBuffer after creation (box)
});
new Float32Array(buffer.getMappedRange()).set(data);
buffer.unmap();
```

**Index buffers** use `GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST` with `Uint32Array`.

**Box variant:** Uses `device.queue.writeBuffer()` instead of `mappedAtCreation`.

### Vertex Data Layout

All generators use **separate buffers** (not interleaved):

| Buffer | Stride | Format | Content |
| --- | --- | --- | --- |
| Buffer<br>Position | Stride<br>12B | Format<br>float32x3 | Content<br>xyz coords |
| Buffer<br>Normal | Stride<br>12B | Format<br>float32x3 | Content<br>xyz normal |
| Buffer<br>UV | Stride<br>8B | Format<br>float32x2 | Content<br>uv coords |
| Buffer<br>Index | Stride<br>4B | Format<br>uint32 | Content<br>indices |

**Exception:** Sphere and Box do not generate UV coordinates.

* * *

## Pipeline Configuration

Mesh generators do not create pipelines. They produce raw vertex data consumed by material pipelines (e.g., `standard-textured-material.ts`). The expected pipeline vertex layout is:

| Slot | Stride | Location | Format | Buffer |
| --- | --- | --- | --- | --- |
| Slot<br>0 | Stride<br>12B | Location<br>0 | Format<br>float32x3 | Buffer<br>position |
| Slot<br>1 | Stride<br>12B | Location<br>1 | Format<br>float32x3 | Buffer<br>normal |
| Slot<br>2 | Stride<br>8B | Location<br>2 | Format<br>float32x2 | Buffer<br>uv |

* * *

## Shader Logic

No shaders. Mesh generators are CPU-only geometry producers.

* * *

## State Machine / Lifecycle

### Ground Lifecycle

```javascript
Option A: Flat ground
  createFlatGroundData(opts) → GroundData

Option B: Heightmap ground
  createGroundFromHeightMap(url, opts) → GroundData  (async)
    ├─ createFlatGroundData(opts)
    ├─ Load image via HTMLImageElement
    ├─ Draw to canvas, extract ImageData
    └─ applyHeightmap(ground, imageData, ...)

Option C: Manual heightmap
  createFlatGroundData(opts) → GroundData
  applyHeightmap(ground, pixelData, ...)
```

### Other Shapes

```javascript
createTorusData(opts) → TorusData → uploadTorusToGPU(device, data) → TorusGPU
createSphereData(opts) → SphereMeshData → uploadSphereToGPU(device, data) → {posBuffer, normBuffer, idxBuffer, idxCount}
createBoxData(size) → BoxData → uploadBoxToGPU(device, data) → BoxGPU
```

All are single-call, synchronous generators (except `createGroundFromHeightMap` which is async).

* * *

## Babylon.js Equivalence Map

| Babylon Lite | Babylon.js |
| --- | --- |
| Babylon Lite<br>`createFlatGroundData(opts)` | Babylon.js<br>`MeshBuilder.CreateGround(name, opts, scene)` |
| Babylon Lite<br>`createGroundFromHeightMap(url, opts)` | Babylon.js<br>`MeshBuilder.CreateGroundFromHeightMap(name, url, opts, scene)` |
| Babylon Lite<br>`applyHeightmap()` | Babylon.js<br>Internal: `GroundMesh._applyDisplacementMap()` |
| Babylon Lite<br>Luminance: `r*0.3 + g*0.59 + b*0.11` | Babylon.js<br>Same luminance formula in Babylon |
| Babylon Lite<br>`createTorusData(opts)` | Babylon.js<br>`MeshBuilder.CreateTorus(name, opts, scene)` |
| Babylon Lite<br>Torus outer angle offset `-π/2` | Babylon.js<br>Babylon's torus starts at -π/2 rotation |
| Babylon Lite<br>Torus inner angle offset `+π` | Babylon.js<br>Babylon's tube cross-section starts at +π |
| Babylon Lite<br>`createSphereData(opts)` | Babylon.js<br>`MeshBuilder.CreateSphere(name, opts, scene)` |
| Babylon Lite<br>`totalZ = 2 + segments` | Babylon.js<br>Babylon's sphere tessellation formula |
| Babylon Lite<br>`totalY = 2 * totalZ` | Babylon.js<br>Babylon's sphere azimuthal step count |
| Babylon Lite<br>`createBoxData(size)` | Babylon.js<br>`MeshBuilder.CreateBox(name, { size }, scene)` |
| Babylon Lite<br>Face order: +Z,-Z,+X,-X,+Y,-Y | Babylon.js<br>Same face order in Babylon |
| Babylon Lite<br>`createCylinderData(opts)` | Babylon.js<br>`MeshBuilder.CreateCylinder(name, opts, scene)` |
| Babylon Lite<br>`createPlaneData(opts)` | Babylon.js<br>`MeshBuilder.CreatePlane(name, opts, scene)` |
| Babylon Lite<br>`createDiscData(opts)` | Babylon.js<br>`MeshBuilder.CreateDisc(name, opts, scene)` |
| Babylon Lite<br>`createPolyhedronData(opts)` | Babylon.js<br>`MeshBuilder.CreatePolyhedron(name, opts, scene)` |
| Babylon Lite<br>`createRibbonData(opts)` | Babylon.js<br>`MeshBuilder.CreateRibbon(name, opts, scene)` |
| Babylon Lite<br>`createTubeData(opts)` | Babylon.js<br>`MeshBuilder.CreateTube(name, opts, scene)` |
| Babylon Lite<br>`createExtrudeShapeData(opts)` | Babylon.js<br>`MeshBuilder.ExtrudeShape(name, opts, scene)` |
| Babylon Lite<br>`CAP_NONE/CAP_START/CAP_END/CAP_ALL` | Babylon.js<br>`Mesh.NO_CAP/CAP_START/CAP_END/CAP_ALL` |
| Babylon Lite<br>Separate pos/normal/uv buffers | Babylon.js<br>Babylon uses `VertexBuffer` per kind |

* * *

## Dependencies

- None (all generators are self-contained)
- WebGPU API types (GPUDevice, GPUBuffer)
- Browser APIs: `Image`, `HTMLCanvasElement`, `CanvasRenderingContext2D` (ground heightmap only)

* * *

## Test Specification

### Ground

1. **Flat ground dimensions** — With `width=10, height=10, subdivisions=4`: 25 vertices, 96 indices.
2. **Position range** — Vertex X in `[-width/2, width/2]`, Z in `[-height/2, height/2]`, Y = 0.
3. **UV range** — All UVs in \[0, 1\].
4. **Heightmap luminance** — Pixel `(255, 0, 0)` → gradient = `0.3`. With minHeight=0, maxHeight=10: Y = 3.0.
5. **Normal recomputation** — After heightmap: all normals should be unit length, Y-dominant for gentle slopes.
6. **Winding** — CCW front face (consistent with `frontFace: 'ccw'` in pipeline).

### Torus

7. **Vertex count** — With `tessellation=16`: `(17)² = 289` vertices, `289 × 6 = 1734` indices.
8. **Symmetry** — Torus should be symmetric about Y axis.
9. **Major radius** — Vertex distance from Y-axis should be approximately `R ± r`.
10. **UV wrap** — UVs should tile correctly with wrapping indices.

### Sphere

11. **Default tessellation** — `segments=32`: `35 × 69 = 2415` vertices, `34 × 68 × 6 = 13872` indices.
12. **Unit radius** — With `diameter=1`: all vertex positions should have magnitude ≈ 0.5.
13. **Poles** — Top pole at `(0, ry, 0)`, bottom pole at `(0, -ry, 0)`.
14. **Normal direction** — Each normal should point radially outward from origin.
15. **Ellipsoid** — With `diameterX=2, diameterY=1, diameterZ=1`: positions scaled non-uniformly but normals remain on unit sphere.

### Box

16. **Counts** — Always 24 vertices, 36 indices regardless of size.
17. **Size=1 optimization** — Returns pre-computed constant arrays directly.
18. **Size scaling** — `size=2`: all positions multiplied by 2, normals unchanged.
19. **Face normals** — Each face has 4 identical axis-aligned normals.
20. **No UV** — Box does not generate UV coordinates.

* * *

## File Manifest

| File | Role |
| --- | --- |
| File<br>`src/mesh/create-ground.ts` | Role<br>Ground plane with heightmap: flat generation, displacement, normal recomputation, GPU upload |
| File<br>`src/mesh/create-torus.ts` | Role<br>Torus: parametric ring mesh generation, GPU upload |
| File<br>`src/mesh/create-sphere.ts` | Role<br>UV sphere: parametric sphere generation, GPU upload |
| File<br>`src/mesh/create-box.ts` | Role<br>Box: static 6-face geometry from constant arrays, GPU upload |
| File<br>`src/mesh/create-cylinder.ts` | Role<br>Cylinder / cone / prism: height, diameterTop/Bottom, tessellation, subdivisions, CAP\_ALL |
| File<br>`src/mesh/create-plane.ts` | Role<br>Plane: quad in XY with -Z normal (size or width/height) |
| File<br>`src/mesh/create-disc.ts` | Role<br>Disc / pie / ring: fan disc with configurable arc, -Z normal |
| File<br>`src/mesh/create-polyhedron.ts` | Role<br>15 BJS polyhedron presets (tetra/cube/octa/dodeca/icosa/etc), flat & smooth normals |
| File<br>`src/mesh/polyhedron-data.ts` | Role<br>Vertex / face tables for the 15 polyhedra (auto-generated from BJS `polyhedronData.js`) |
| File<br>`src/mesh/create-ribbon.ts` | Role<br>Parametric ribbon primitive: pathArray, closePath, closeArray, offset, sideOrientation |
| File<br>`src/mesh/create-tube.ts` | Role<br>Tube: closed-circle ribbon along a 3D path; CAP\_NONE/START/END/ALL; Rodrigues rotation |
| File<br>`src/mesh/create-extrude.ts` | Role<br>ExtrudeShape: sweep a 2D shape along a 3D path using Frenet frames (tangent/normal/binormal) |
| File<br>`src/mesh/path3d.ts` | Role<br>Path3D port: tangents, normals, binormals, cumulative distances (parallel-transport frames) |
| File<br>`src/mesh/compute-normals.ts` | Role<br>BJS-equivalent normal accumulator (Float64Array) for shapes that compute normals post-build |

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