---
title: Scene Hierarchy Parenting
source: https://doc.babylonjs.com/lite/architecture/11-scene-hierarchy-parenting/
section: Architecture
---

[API](https://doc.babylonjs.com/lite/typedoc/)

[Babylon Lite](https://doc.babylonjs.com/lite/)\|

[Architecture](https://doc.babylonjs.com/lite/architecture/)\|

[Scene Hierarchy Parenting](https://doc.babylonjs.com/lite/architecture/11-scene-hierarchy-parenting/)

…\|

[Babylon Lite](https://doc.babylonjs.com/lite/)\|

[Architecture](https://doc.babylonjs.com/lite/architecture/)\|

[Scene Hierarchy Parenting](https://doc.babylonjs.com/lite/architecture/11-scene-hierarchy-parenting/)

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


# Module: Scene Hierarchy & Parenting

### Table Of Contents

[Module: Scene Hierarchy & Parenting](https://doc.babylonjs.com/lite/architecture/11-scene-hierarchy-parenting/#module-scene-hierarchy--parenting) [Purpose](https://doc.babylonjs.com/lite/architecture/11-scene-hierarchy-parenting/#purpose) [Public API Surface](https://doc.babylonjs.com/lite/architecture/11-scene-hierarchy-parenting/#public-api-surface) [Interfaces (`scene/parentable.ts`)](https://doc.babylonjs.com/lite/architecture/11-scene-hierarchy-parenting/#interfaces-sceneparentablets) [Reparenting (`scene/set-parent.ts`)](https://doc.babylonjs.com/lite/architecture/11-scene-hierarchy-parenting/#reparenting-sceneset-parentts) [TransformNode (`scene/transform-node.ts`)](https://doc.babylonjs.com/lite/architecture/11-scene-hierarchy-parenting/#transformnode-scenetransform-nodets) [Mesh (`mesh/mesh.ts`)](https://doc.babylonjs.com/lite/architecture/11-scene-hierarchy-parenting/#mesh-meshmeshts) [Cameras](https://doc.babylonjs.com/lite/architecture/11-scene-hierarchy-parenting/#cameras) [Lights](https://doc.babylonjs.com/lite/architecture/11-scene-hierarchy-parenting/#lights) [Internal Architecture](https://doc.babylonjs.com/lite/architecture/11-scene-hierarchy-parenting/#internal-architecture) [Shared World Matrix Helper (`scene/world-matrix-state.ts`)](https://doc.babylonjs.com/lite/architecture/11-scene-hierarchy-parenting/#shared-world-matrix-helper-sceneworld-matrix-statets) [Push-Based Dirty Tracking](https://doc.babylonjs.com/lite/architecture/11-scene-hierarchy-parenting/#push-based-dirty-tracking) [`ObservableQuat` (`math/observable-quat.ts`)](https://doc.babylonjs.com/lite/architecture/11-scene-hierarchy-parenting/#observablequat-mathobservable-quatts) [Light Matrix Helper (`light/light-matrix.ts`)](https://doc.babylonjs.com/lite/architecture/11-scene-hierarchy-parenting/#light-matrix-helper-lightlight-matrixts) [Version-Based Lazy Algorithm](https://doc.babylonjs.com/lite/architecture/11-scene-hierarchy-parenting/#version-based-lazy-algorithm) [Performance characteristics](https://doc.babylonjs.com/lite/architecture/11-scene-hierarchy-parenting/#performance-characteristics) [Scene Integration](https://doc.babylonjs.com/lite/architecture/11-scene-hierarchy-parenting/#scene-integration) [`addToScene(scene, TransformNode)`](https://doc.babylonjs.com/lite/architecture/11-scene-hierarchy-parenting/#addtoscenescene-transformnode) [glTF Loader](https://doc.babylonjs.com/lite/architecture/11-scene-hierarchy-parenting/#gltf-loader) [File Manifest](https://doc.babylonjs.com/lite/architecture/11-scene-hierarchy-parenting/#file-manifest) [Babylon.js Equivalence Map](https://doc.babylonjs.com/lite/architecture/11-scene-hierarchy-parenting/#babylonjs-equivalence-map)

> Package path: `packages/babylon-lite/src/scene/`

## Purpose

Live parent-child hierarchy where **any entity** (TransformNode, Mesh, Camera, Light)
can be parented to any other via two interfaces: `IWorldMatrixProvider` (parent contract)
and `IParentable` (child contract). World matrices propagate lazily via version-based
caching — O(1) for static scenes, O(depth) for dynamic changes.

* * *

## Public API Surface

### Interfaces (`scene/parentable.ts`)

```typescript
interface IWorldMatrixProvider {
    readonly worldMatrix: Mat4;
    readonly worldMatrixVersion: number;
}

interface IParentable {
    parent: IWorldMatrixProvider | null;
}
```

Zero runtime code — interfaces are erased at compile time.

### Reparenting (`scene/set-parent.ts`)

```typescript
// Reparent while preserving world-space transform (Babylon.js TransformNode.setParent).
// Accepts any SceneNode (mesh, transform node, camera, light), not just Mesh.
export function setParent(child: SceneNode, parent: IWorldMatrixProvider | null): void;
```

`setParent` snapshots the child's world matrix, sets `child.parent`, then writes back the
local TRS (via `mat4Decompose`, so the rotation is a quaternion — no lossy Euler round-trip).
It also keeps the scene-graph `children` arrays in sync: the child is removed from its old
parent's `children` and appended to the new parent's, so traversal helpers (`setMeshVisible`
cascade, cloning, camera bounds) see the new hierarchy. Setting `child.parent` directly drives
the transform math but does **not** touch `children` — push manually if you need traversal too.

**Mirrored children are preserved.** The glTF loader's synthetic `__root__` carries the RH→LH
handedness flip as `scaling = (-1, 1, 1)`, so its local transform has a negative determinant.
`mat4Decompose` keeps that reflection (folded onto a negative Y scale, as Babylon.js does), so
reparenting a loaded model under a user-created transform node renders identically to before.

**Matrix-backed nodes are reparented too.** A node created with `createSceneNodeFromMatrix` (used
for glTF nodes that declare a raw `matrix` instead of TRS) reports that matrix as its local
transform and ignores `position`/`rotationQuaternion`/`scaling`. `setParent` clears `_localMatrix`
and writes the decomposed TRS instead, handing control back to the TRS triple — the decomposition
reproduces exactly the matrix it replaces, so the node does not move beyond the reparent itself.

**Parent links come from `addToScene`.** The glTF loader fills `children` arrays but leaves `parent`
unset; `addToScene` walks the tree and assigns it. `setParent` needs the real parent chain to read a
node's world transform, so reparent a _nested_ loaded node only after its container has been added.
Reparenting the container's own root beforehand is fine — its parent is null either way.

### TransformNode (`scene/transform-node.ts`)

```typescript
interface TransformNode extends IWorldMatrixProvider, IParentable {
    name: string;
    position: ObservableVec3;
    rotationQuaternion: ObservableQuat;
    scaling: ObservableVec3;
    children: (TransformNode | Mesh)[];
    parent: IWorldMatrixProvider | null;
    readonly worldMatrix: Mat4;
    readonly worldMatrixVersion: number;
}

function createTransformNode(name, px, py, pz, qx, qy, qz, qw, sx, sy, sz): TransformNode;
function cloneTransformNode(src: TransformNode): TransformNode;
function collectMeshes(node: TransformNode, parentProvider?: IWorldMatrixProvider): Mesh[];
function isTransformNode(obj: unknown): obj is TransformNode;
```

### Mesh (`mesh/mesh.ts`)

```typescript
interface Mesh extends IWorldMatrixProvider, IParentable {
    // ... existing fields ...
    parent: IWorldMatrixProvider | null;
    readonly worldMatrix: Mat4;
    readonly worldMatrixVersion: number;
}
```

`computeWorldMatrix()` is removed. All call sites use `mesh.worldMatrix` directly.
`MeshGPU.worldMatrix` is removed — caching lives in `createWorldMatrixState` closure.
`mesh._transformVersion` is removed — replaced by `worldMatrixVersion`.

### Cameras

Both `ArcRotateCamera` and `FreeCamera` extend `IWorldMatrixProvider, IParentable`.
Camera `worldMatrix` is the camera-to-world transform (inverse of view matrix).
`getViewMatrix(camera)` and `getCameraPosition(camera)` derive from `worldMatrix`.

### Lights

`LightBase` extends `IWorldMatrixProvider, IParentable`. All 4 light types
(point, directional, spot, hemispheric) use `createWorldMatrixState` with
push-based dirty tracking via `ObservableVec3`.

UBO writers read world-space values from `worldMatrix` columns:

- Position = column 3: `[w[12], w[13], w[14]]`
- Direction = column 2: `[w[8], w[9], w[10]]`

* * *

## Internal Architecture

### Shared World Matrix Helper (`scene/world-matrix-state.ts`)

```typescript
function createWorldMatrixState(getLocalMatrix: () => Mat4): WorldMatrixAccessors;
```

Factory that returns `{ getWorldMatrix, getWorldMatrixVersion, markLocalDirty, parent }`.
Each entity provides a `getLocalMatrix()` closure. The helper handles:

- Version tracking (`_localVersion`, `_worldVersion`, `_lastParentVersion`)
- Parent chain validation (recursive `parent.worldMatrix` call)
- Caching with `mat4MultiplyInto` for GC-free buffer reuse

### Push-Based Dirty Tracking

All entities use push-based dirty notification — no polling or `checkDirty()` functions:

| Entity | Property | Mechanism |
| --- | --- | --- |
| Entity<br>TransformNode | Property<br>position/scaling | Mechanism<br>`ObservableVec3` → `markLocalDirty()` |
| Entity<br>TransformNode | Property<br>rotationQuaternion | Mechanism<br>`ObservableQuat` → `markLocalDirty()` |
| Entity<br>Mesh | Property<br>position/rotation/scaling | Mechanism<br>`ObservableVec3` → `markLocalDirty()` |
| Entity<br>ArcRotateCamera | Property<br>alpha/beta/radius | Mechanism<br>`Object.defineProperty` setter → `markLocalDirty()` |
| Entity<br>ArcRotateCamera | Property<br>target | Mechanism<br>`ObservableVec3` → `markLocalDirty()` |
| Entity<br>FreeCamera | Property<br>position/target | Mechanism<br>`ObservableVec3` → `markLocalDirty()` |
| Entity<br>FreeCamera | Property<br>\_yaw/\_pitch | Mechanism<br>`Object.defineProperty` setter → `markLocalDirty()` |
| Entity<br>All lights | Property<br>position/direction | Mechanism<br>`ObservableVec3` → `markLocalDirty()` |

### `ObservableQuat` (`math/observable-quat.ts`)

Same pattern as `ObservableVec3` but with 4 components (x,y,z,w). Used for
`TransformNode.rotationQuaternion`. Fires `onDirty` callback on any component change.

### Light Matrix Helper (`light/light-matrix.ts`)

```typescript
function localMatrixFromDirection(dx, dy, dz, px?, py?, pz?): Mat4;
```

Builds an orthonormal basis from a direction vector. Column 2 = forward (normalized direction).
Used by directional, spot, and hemispheric lights. Inlines `Float32Array(16)` to avoid
importing `mat4Identity`.

* * *

## Version-Based Lazy Algorithm

```javascript
get worldMatrix():
    if cached AND localVersion unchanged:
        if no parent → return cached           ← O(1)
        walk parent chain (triggers lazy recompute)
        if parent version unchanged → return cached  ← O(1)

    local = getLocalMatrix()
    if parent:
        cached = mat4Multiply(parent.worldMatrix, local)  // mat4MultiplyInto if cached exists
    else:
        cached = local

    update version snapshots
    worldVersion++
    return cached
```

### Performance characteristics

| Scenario | Cost per frame |
| --- | --- |
| Scenario<br>Static scene (no changes) | Cost per frame<br>O(1) per entity — integer comparison |
| Scenario<br>Root changes, N descendants | Cost per frame<br>O(N) — each descendant recomputes once |
| Scenario<br>Single leaf changes | Cost per frame<br>O(depth) — walk to root, recompute back down |

* * *

## Scene Integration

### `addToScene(scene, TransformNode)`

```typescript
if (isTransformNode(entity)) {
    const meshes = collectMeshes(entity, entity.parent ?? undefined);
    for (const m of meshes) {
        ctx.add(m);
    }
}
```

`collectMeshes` recursively walks `children`, sets `parent` links on each child,
and returns all `Mesh` leaves. Meshes land in `scene.meshes[]` for flat rendering iteration.
The hierarchy persists via `parent` pointers.

### glTF Loader

`buildNodeHierarchy()` uses `createTransformNode()` and pushes both child TransformNodes
and Meshes into the unified `children` array. Parent links are set by `collectMeshes`
when the tree is added to the scene.

Animation/skin parsing is lazy-loaded via `gltf-animation.ts` for bundle size optimization.

* * *

## File Manifest

| File | Status | Description |
| --- | --- | --- |
| File<br>`scene/parentable.ts` | Status<br>New | Description<br>IWorldMatrixProvider + IParentable interfaces |
| File<br>`scene/world-matrix-state.ts` | Status<br>New | Description<br>createWorldMatrixState factory |
| File<br>`math/observable-quat.ts` | Status<br>New | Description<br>ObservableQuat class |
| File<br>`light/light-matrix.ts` | Status<br>New | Description<br>localMatrixFromDirection helper |
| File<br>`loader-gltf/gltf-animation.ts` | Status<br>New | Description<br>Lazy-loaded animation/skin parsing |
| File<br>`scene/transform-node.ts` | Status<br>Rewritten | Description<br>createTransformNode, unified children |
| File<br>`mesh/mesh.ts` | Status<br>Modified | Description<br>Removed computeWorldMatrix, added IWorldMatrixProvider |
| File<br>`camera/arc-rotate.ts` | Status<br>Modified | Description<br>Added IWorldMatrixProvider, push-based dirty |
| File<br>`camera/free-camera.ts` | Status<br>Modified | Description<br>Added IWorldMatrixProvider, push-based dirty |
| File<br>`light/types.ts` | Status<br>Modified | Description<br>LightBase extends IWorldMatrixProvider |
| File<br>`light/point-light.ts` | Status<br>Modified | Description<br>ObservableVec3 position, createWorldMatrixState |
| File<br>`light/directional-light.ts` | Status<br>Modified | Description<br>ObservableVec3 position/direction |
| File<br>`light/spot-light.ts` | Status<br>Modified | Description<br>ObservableVec3 position/direction |
| File<br>`light/hemispheric.ts` | Status<br>Modified | Description<br>ObservableVec3 direction |
| File<br>`scene/scene-core.ts` | Status<br>Modified | Description<br>addToScene() sets parent links via collectMeshes |
| File<br>`loader-gltf/load-gltf.ts` | Status<br>Modified | Description<br>Uses createTransformNode, lazy animation |
| File<br>`index.ts` | Status<br>Modified | Description<br>Exports IWorldMatrixProvider, IParentable, ObservableQuat |

* * *

## Babylon.js Equivalence Map

| Babylon Lite | Babylon.js |
| --- | --- |
| Babylon Lite<br>`IWorldMatrixProvider` | Babylon.js<br>`Node` (has `getWorldMatrix()`) |
| Babylon Lite<br>`IParentable` | Babylon.js<br>`Node.parent` property |
| Babylon Lite<br>`mesh.parent = node` | Babylon.js<br>`mesh.parent = node` |
| Babylon Lite<br>`mesh.worldMatrix` (getter) | Babylon.js<br>`mesh.getWorldMatrix()` |
| Babylon Lite<br>`mesh.worldMatrixVersion` | Babylon.js<br>`mesh._currentRenderId` |
| Babylon Lite<br>`createTransformNode(name)` | Babylon.js<br>`new TransformNode(name, scene)` |
| Babylon Lite<br>`node.position.set(x, y, z)` | Babylon.js<br>`node.position = new Vector3(x, y, z)` |
| Babylon Lite<br>`node.children` | Babylon.js<br>`node.getChildren()` |
| Babylon Lite<br>Lazy pull model | Babylon.js<br>Push model (`_markAsDirty`) |
| Babylon Lite<br>Version-based staleness | Babylon.js<br>Frame-based `_currentRenderId` check |

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