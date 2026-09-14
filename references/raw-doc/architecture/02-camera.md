---
title: Camera
source: https://doc.babylonjs.com/lite/architecture/02-camera/
section: Architecture
---

[API](https://doc.babylonjs.com/lite/typedoc/)

[Babylon Lite](https://doc.babylonjs.com/lite/)\|

[Architecture](https://doc.babylonjs.com/lite/architecture/)\|

[Camera](https://doc.babylonjs.com/lite/architecture/02-camera/)

…\|

[Babylon Lite](https://doc.babylonjs.com/lite/)\|

[Architecture](https://doc.babylonjs.com/lite/architecture/)\|

[Camera](https://doc.babylonjs.com/lite/architecture/02-camera/)

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


# Module: Camera (ArcRotateCamera + FreeCamera)

### Table Of Contents

[Module: Camera (ArcRotateCamera + FreeCamera)](https://doc.babylonjs.com/lite/architecture/02-camera/#module-camera-arcrotatecamera--freecamera) [Purpose](https://doc.babylonjs.com/lite/architecture/02-camera/#purpose) [Public API Surface](https://doc.babylonjs.com/lite/architecture/02-camera/#public-api-surface) [`camera.ts` — Shared Camera Contract](https://doc.babylonjs.com/lite/architecture/02-camera/#camerats--shared-camera-contract) [`arc-rotate.ts`](https://doc.babylonjs.com/lite/architecture/02-camera/#arc-rotatets) [`arc-rotate-controls.ts`](https://doc.babylonjs.com/lite/architecture/02-camera/#arc-rotate-controlsts) [`free-camera.ts`](https://doc.babylonjs.com/lite/architecture/02-camera/#free-camerats) [`free-camera-controls.ts`](https://doc.babylonjs.com/lite/architecture/02-camera/#free-camera-controlsts) [`orthographic.ts` — Opt-in Orthographic Projection](https://doc.babylonjs.com/lite/architecture/02-camera/#orthographicts--opt-in-orthographic-projection) [Changing extents at runtime](https://doc.babylonjs.com/lite/architecture/02-camera/#changing-extents-at-runtime) [Internal Architecture](https://doc.babylonjs.com/lite/architecture/02-camera/#internal-architecture) [Shared World-Matrix Integration](https://doc.babylonjs.com/lite/architecture/02-camera/#shared-world-matrix-integration) [ArcRotateCamera Position Calculation](https://doc.babylonjs.com/lite/architecture/02-camera/#arcrotatecamera-position-calculation) [ArcRotateCamera Dirty Tracking](https://doc.babylonjs.com/lite/architecture/02-camera/#arcrotatecamera-dirty-tracking) [FreeCamera Position & Orientation](https://doc.babylonjs.com/lite/architecture/02-camera/#freecamera-position--orientation) [FreeCamera Dirty Tracking](https://doc.babylonjs.com/lite/architecture/02-camera/#freecamera-dirty-tracking) [View Matrix](https://doc.babylonjs.com/lite/architecture/02-camera/#view-matrix) [World Matrix (all cameras)](https://doc.babylonjs.com/lite/architecture/02-camera/#world-matrix-all-cameras) [Projection Matrix](https://doc.babylonjs.com/lite/architecture/02-camera/#projection-matrix) [Projection Change Detection](https://doc.babylonjs.com/lite/architecture/02-camera/#projection-change-detection) [Orthographic Projection Seam (zero-cost opt-in)](https://doc.babylonjs.com/lite/architecture/02-camera/#orthographic-projection-seam-zero-cost-opt-in) [Consumers that still assume a perspective projection](https://doc.babylonjs.com/lite/architecture/02-camera/#consumers-that-still-assume-a-perspective-projection) [View-Projection Matrix](https://doc.babylonjs.com/lite/architecture/02-camera/#view-projection-matrix) [ArcRotateCamera Controls — Inertia Model](https://doc.babylonjs.com/lite/architecture/02-camera/#arcrotatecamera-controls--inertia-model) [Sensibility Constants](https://doc.babylonjs.com/lite/architecture/02-camera/#sensibility-constants) [Inertia Epsilon Thresholds](https://doc.babylonjs.com/lite/architecture/02-camera/#inertia-epsilon-thresholds) [Input Handlers](https://doc.babylonjs.com/lite/architecture/02-camera/#input-handlers) [Left-drag (Rotate)](https://doc.babylonjs.com/lite/architecture/02-camera/#left-drag-rotate) [Right-drag (Pan)](https://doc.babylonjs.com/lite/architecture/02-camera/#right-drag-pan) [Wheel (Zoom)](https://doc.babylonjs.com/lite/architecture/02-camera/#wheel-zoom) [Touch Pinch (Zoom — direct, no inertia)](https://doc.babylonjs.com/lite/architecture/02-camera/#touch-pinch-zoom--direct-no-inertia) [Per-Frame Inertia Application (`applyInertia`)](https://doc.babylonjs.com/lite/architecture/02-camera/#per-frame-inertia-application-applyinertia) [Scene Integration](https://doc.babylonjs.com/lite/architecture/02-camera/#scene-integration) [Event Registration](https://doc.babylonjs.com/lite/architecture/02-camera/#event-registration) [FreeCamera Controls](https://doc.babylonjs.com/lite/architecture/02-camera/#freecamera-controls) [Input Bindings](https://doc.babylonjs.com/lite/architecture/02-camera/#input-bindings) [Mouse Rotation](https://doc.babylonjs.com/lite/architecture/02-camera/#mouse-rotation) [Movement Speed Formula](https://doc.babylonjs.com/lite/architecture/02-camera/#movement-speed-formula) [Per-Frame Update](https://doc.babylonjs.com/lite/architecture/02-camera/#per-frame-update) [Canvas Focus](https://doc.babylonjs.com/lite/architecture/02-camera/#canvas-focus) [Event Registration](https://doc.babylonjs.com/lite/architecture/02-camera/#event-registration-1) [Babylon.js Equivalence Map](https://doc.babylonjs.com/lite/architecture/02-camera/#babylonjs-equivalence-map) [Dependencies](https://doc.babylonjs.com/lite/architecture/02-camera/#dependencies) [Test Specification](https://doc.babylonjs.com/lite/architecture/02-camera/#test-specification) [File Manifest](https://doc.babylonjs.com/lite/architecture/02-camera/#file-manifest)

> Package path: `packages/babylon-lite/src/camera/`

## Purpose

The Camera module provides two camera implementations as plain data objects, plus standalone matrix helpers and companion control functions that wire DOM events to mutate camera properties. Cameras are pure data — they know nothing about the scene or DOM until controls are attached. Both cameras implement the shared `Camera` interface and integrate with the scene's world-matrix hierarchy via `IWorldMatrixProvider` / `IParentable`.

## Public API Surface

### `camera.ts` — Shared Camera Contract

```typescript
/** Minimal camera contract — any camera with world and projection state.
 *  Both ArcRotateCamera and FreeCamera implement this interface.
 *  Plain data, no scene knowledge (pillar 4b). */
export interface Camera {
    fov: number;
    nearPlane: number;
    farPlane: number;
    viewport?: NormalizedViewport;
    children: SceneNode[];
    readonly worldMatrix: Mat4;
    readonly worldMatrixVersion: number;
    ortho?: OrthographicBounds | null;
}

export function getViewMatrix(camera: Camera): Mat4;
export function getProjectionMatrix(camera: Camera, aspectRatio: number): Mat4;
export function getViewProjectionMatrix(camera: Camera, aspectRatio: number): Mat4;
export function getCameraPosition(camera: Camera): Vec3;
```

### `arc-rotate.ts`

```typescript
/** ArcRotateCamera — orbits around a target point.
 *  Uses Babylon.js convention: left-handed, alpha=rotation around Y, beta=elevation.
 *  Plain data. Does NOT know about the scene.
 *
 *  Push-based dirty tracking: alpha/beta/radius use Object.defineProperty,
 *  target uses ObservableVec3. Changes call wm.markLocalDirty() immediately.
 *
 *  Inertia follows the Babylon.js model: input handlers accumulate per-frame
 *  offsets (inertialAlphaOffset, etc.) which are applied and exponentially
 *  decayed each frame by the controls module. */
export interface ArcRotateCamera extends IWorldMatrixProvider, IParentable {
    alpha: number; // Rotation around Y axis (radians)
    beta: number; // Elevation angle from Y axis (radians, 0=top, π=bottom)
    radius: number; // Distance from target
    target: Vec3; // Orbit center point (ObservableVec3 at runtime)
    fov: number; // Vertical field of view (radians)
    nearPlane: number; // Near clipping plane
    farPlane: number; // Far clipping plane

    inertia: number; // Inertia for rotation & zoom (0=instant, 0.9=default, 1=no decay)
    panningInertia: number; // Inertia for panning (0=instant, 0.9=default)

    inertialAlphaOffset: number; // Per-frame accumulated rotation offset
    inertialBetaOffset: number;
    inertialRadiusOffset: number; // Per-frame accumulated zoom offset
    inertialPanningX: number; // Per-frame accumulated pan offset
    inertialPanningY: number;

    parent: IWorldMatrixProvider | null;
    readonly worldMatrix: Mat4;
    readonly worldMatrixVersion: number;
}

/** Create a bare ArcRotateCamera with given params. Pure data, no scene knowledge. */
export function createArcRotateCamera(alpha: number, beta: number, radius: number, target: Vec3): ArcRotateCamera;
```

**Default values** (set in `createArcRotateCamera`):

- `fov = 0.8` (~45.8°)
- `nearPlane = 0.1`
- `farPlane = 1000`
- `inertia = 0.9`
- `panningInertia = 0.9`

### `arc-rotate-controls.ts`

```typescript
/** Attach orbit/zoom/pan controls to an ArcRotateCamera.
 *  Matches Babylon.js ArcRotateCameraPointersInput behavior with inertia.
 *  Input handlers accumulate into the camera's inertial offset properties.
 *  Inertia is applied each frame via scene._beforeRender (single RAF loop).
 *  Returns a cleanup function to remove all event listeners and the beforeRender hook. */
export function attachControl(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene?: SceneContext): () => void;
```

### `free-camera.ts`

```typescript
/** FreeCamera — positioned in world space, looking at a target point.
 *  Matches Babylon.js FreeCamera: position + target, left-handed.
 *  Plain data. Does NOT know about the scene.
 *
 *  Push-based dirty tracking: position and target use ObservableVec3,
 *  _yaw/_pitch use Object.defineProperty. */
export interface FreeCamera extends Camera, IWorldMatrixProvider, IParentable {
    position: ObservableVec3; // World-space position
    target: ObservableVec3; // Look-at target (auto-updated by controls from yaw/pitch)
    speed: number; // Movement speed (default 2.0, matches BJS)
    angularSensitivity: number; // Mouse rotation sensitivity (higher=less sensitive, default 2000)
    inertia: number; // Inertia damping factor (0=instant stop, 0.9=smooth, default 0.9)
    parent: IWorldMatrixProvider | null;
    readonly worldMatrix: Mat4;
    readonly worldMatrixVersion: number;
}

/** @internal FreeCamera with internal yaw/pitch state. Not re-exported from index.ts. */
export interface FreeCameraInternal extends FreeCamera {
    _yaw: number;
    _pitch: number;
}

/** Create a FreeCamera at the given position looking at target. Pure data, no scene knowledge. */
export function createFreeCamera(position: Vec3, target: Vec3): FreeCamera;
```

**Default values** (set in `createFreeCamera`):

- `fov = 0.8` (~45.8°)
- `nearPlane = 1`
- `farPlane = 10000`
- `speed = 2.0`
- `angularSensitivity = 2000`
- `inertia = 0.9`

**glTF-loader consumer**: after `enableGltfCameras()` is called, `gltf-feature-camera.ts` (see
module 04, "glTF `camera` Node Property") builds every embedded glTF camera as a `FreeCamera` at
`(0,0,0)` looking toward `(0,0,-1)` — glTF's own local -Z-forward/+Y-up convention — parented
through a `fixupNode` that cancels the engine's RH→LH root mirror. Each imported camera primes its
world transform back to unit scale so the default rigid view inverse remains exact; projection
parameters remain in source glTF units. Zero/non-uniform or animated ancestor scale is not
supported. The loader then exposes the result via `AssetContainer.cameras`.

### `free-camera-controls.ts`

```typescript
/** Attach keyboard + mouse controls to a FreeCamera.
 *  Matches Babylon.js FreeCamera input behavior.
 *  Camera stays plain data — this function reads/writes its properties.
 *  Returns a cleanup function to remove all listeners and the beforeRender hook. */
export function attachFreeControl(camera: FreeCamera, canvas: HTMLCanvasElement, scene?: SceneContext): () => void;
```

### `orthographic.ts` — Opt-in Orthographic Projection

```typescript
/** Live orthographic view-volume extents, in world units. Mutable and animatable:
 *  every setter invalidates the camera's projection cache. A plane left `null` is
 *  derived from `halfHeight` (horizontally scaled by the render aspect ratio). */
export interface OrthographicBounds {
    halfHeight: number;
    left: number | null;
    right: number | null;
    bottom: number | null;
    top: number | null;
}

/** Initial extents — every field optional, omitted planes derived from `halfHeight` (default 1). */
export interface OrthographicBoundsOptions {
    halfHeight?: number;
    left?: number | null;
    right?: number | null;
    bottom?: number | null;
    top?: number | null;
}

/** Switch a camera to an orthographic projection; returns the live `camera.ortho` bounds. */
export function enableOrthographicCamera(camera: Camera, bounds?: OrthographicBoundsOptions): OrthographicBounds;

/** Switch a camera back to its perspective projection. */
export function disableOrthographicCamera(camera: Camera): void;
```

Works with any camera that satisfies the `Camera` contract (ArcRotate, Free, Geospatial) — the projection is orthogonal to how the camera is positioned. Depth still comes from `camera.nearPlane` / `camera.farPlane`; `camera.fov` has no effect in this mode, so an orthographic camera zooms by changing `halfHeight`.

#### Changing extents at runtime

`enableOrthographicCamera` is called once. The bounds it returns (also reachable as `camera.ortho`) stay live, so extents can be driven every frame:

```typescript
const ortho = enableOrthographicCamera(camera, { halfHeight: 6 });
onBeforeRender(scene, () => {
    ortho.halfHeight = 6 + Math.sin(t) * 2; // zoom
});
```

Each field is an accessor that invalidates the camera's projection state on change. That matters because the projection cache is keyed on `_cameraChangeKey` \+ aspect ratio — neither moves when only the extents do, so without the accessor the new bounds would not be picked up until the camera moved.

Invalidation goes through a dedicated projection revision, **not** merely clearing `_projVer` / `_vpVer` and **not** by marking the camera transform dirty. Clearing the matrix caches alone fixes the getters but not the frame: per-frame consumers gate their GPU uploads on a camera change key, and the forward pass's `_writePassSceneUBO` returns early while `[camera, fog, changeKey, aspect, exposure, contrast, envTextures]` are unchanged (ShaderMaterial, text, clustered lighting, TAA and CSM have equivalent gates). Changing a view volume moves none of those, so a steady-state scene would keep rendering the previously uploaded view-projection even though `getProjectionMatrix` returned a fresh matrix.

Every bounds setter therefore bumps `camera._projRev`, and projection-dependent consumers key on `_cameraChangeKey(camera)`, which sums it with the transform version (and also polls `fov` / `nearPlane` / `farPlane` — see **Projection Change Detection**):

```typescript
camera.worldMatrixVersion + (camera._projRev ?? 0);
```

Both terms are monotonically non-decreasing, so the sum is too and any change in either strictly increases it — it cannot alias. (Same version-summing idiom as `shadow-base.ts` and `gltf-feature-lights-punctual.ts`.)

The revision is deliberately **separate from `worldMatrixVersion`** rather than folded into it. Marking the camera transform dirty would signal camera _motion_, which additionally invalidates the camera's children (the world-matrix state pushes invalidation through `_children`) and, under floating origin, makes `wrapRenderableForFO` rebase **every renderable** in the scene — a per-frame cost if `ortho.halfHeight` is animated, for a change that moved nothing in world space. Transform-only consumers (floating origin, child nodes, mesh UBOs) keep reading `worldMatrixVersion` and are correctly unaffected.

Because the fields are real own enumerable properties (defined via `Object.defineProperty`, not left optional), they also resolve as animation property paths. `resolvePropertyBinding` walks the path with `in` and writes through a plain `target[prop] = value` assignment, which lands on the setter:

```typescript
const clip = createPropertyAnimationClip("orthoZoom", [\
    {\
        path: "ortho.halfHeight",\
        keys: [\
            { frame: 0, value: 6 },\
            { frame: 60, value: 2 },\
        ],\
    },\
]);
createPropertyAnimationGroup(manager, camera, clip, { fromFrame: 0, toFrame: 60, loop: true });
```

Setting a plane to a number produces an off-center volume (Babylon's `orthoLeft` / `orthoRight` / `orthoBottom` / `orthoTop`); setting it back to `null` returns it to the derived extent.

## Internal Architecture

### Shared World-Matrix Integration

Both camera types use `createWorldMatrixState()` for push-based dirty tracking with the scene's parent–child hierarchy. The camera's local world matrix is computed from its own state (orbital params for ArcRotate, position+target for Free), then optionally multiplied by a parent's world matrix.

The view matrix is derived from the world matrix by transposing the upper 3×3 rotation block and negating the translation:

```javascript
viewMatrix[0..2]   = column 0 of worldMatrix (transposed row 0)
viewMatrix[4..6]   = column 1 of worldMatrix (transposed row 1)
viewMatrix[8..10]  = column 2 of worldMatrix (transposed row 2)
viewMatrix[12..14] = -(rotation^T × eye)
viewMatrix[15]     = 1
```

`getCameraPosition(camera)` reads translation from the final world matrix: `{ x: w[12], y: w[13], z: w[14] }`.

### ArcRotateCamera Position Calculation

The camera's local eye position is computed from spherical coordinates:

```javascript
sinB = sin(beta)    // if sinB == 0, clamp to 0.0001
cosB = cos(beta)
cosA = cos(alpha)
sinA = sin(alpha)

eye.x = target.x + radius * cosA * sinB
eye.y = target.y + radius * cosB
eye.z = target.z + radius * sinA * sinB
```

This is the **Babylon.js left-handed** spherical coordinate convention:

- `alpha` rotates around the Y axis
- `beta` is the polar angle from the +Y axis (0 = looking straight down, π = looking straight up)
- At `alpha = -π/2, beta = π/2`, the camera is on the +Z axis looking at the target

The local world matrix is: transpose(upper 3×3 of view) + eye position.

### ArcRotateCamera Dirty Tracking

`alpha`, `beta`, `radius` use `Object.defineProperty` with setters that call `wm.markLocalDirty()` on change. `target` is an `ObservableVec3` that calls the same dirty callback when any component (x, y, z) is mutated.

### FreeCamera Position & Orientation

The FreeCamera's local world matrix is computed via `mat4LookAtWorldLHToRef(_localMat, position, target, Vec3Up)` — see **World Matrix (all cameras)** below.

Initial yaw/pitch are derived from the position→target direction:

```javascript
dx = target.x - position.x
dy = target.y - position.y
dz = target.z - position.z

_yaw   = atan2(dx, dz)
_pitch = atan2(dy, sqrt(dx² + dz²))
```

### FreeCamera Dirty Tracking

`position` and `target` are `ObservableVec3` instances. `_yaw` and `_pitch` use `Object.defineProperty`. All mutations call `wm.markLocalDirty()`.

### View Matrix

Both cameras use the same world-matrix-to-view inversion (described above). This is equivalent to `mat4LookAtLH(eye, target, Vec3Up)` for their respective eye/target values.

### World Matrix (all cameras)

A camera's local matrix is its **camera-to-world** matrix — cameras parent like any other node, and `getViewMatrix` inverts it per frame. `mat4LookAtWorldLHToRef(out, eye, target, up)` writes it directly as the columns `[xAxis, yAxis, zAxis, eye]`, where the basis is the same one `mat4LookAtLH` derives:

```javascript
zAxis = normalize(target - eye)          // left-handed: +Z looks at the target
xAxis = normalize(cross(up, zAxis))
yAxis = cross(zAxis, xAxis)
```

All three factories (`ArcRotate`, `Free`, `Geospatial`) call it. They previously built a **view** matrix with `mat4LookAtLH` and inverted it back by hand — allocating a `Float32Array`, computing a translation column of three dot products that was immediately overwritten with the eye, then transposing the rotation — with the 17-line transpose block copy-pasted into each factory. Degenerate input (eye on target, or the view direction parallel to `up`) leaves an identity rotation with the eye translation, matching `mat4LookAtLH`'s identity fallback exactly.

### Projection Matrix

Both cameras: `mat4PerspectiveLH(fov, aspectRatio, nearPlane, farPlane)` — left-handed perspective with reverse-Z zero-to-one depth (`nearPlane` maps to `1`, `farPlane` maps to `0`).

### Projection Change Detection

`fov`, `nearPlane` and `farPlane` are plain writable fields on a plain-data camera (pillar 4b′), so a write notifies nobody. Both the matrix caches in `camera.ts` and every projection-dependent per-frame consumer key on `_cameraChangeKey`, which **polls those three by value** and folds any drift into `camera._projRev`:

```typescript
export function _cameraChangeKey(camera: Camera): number {
    if (camera._projFov !== camera.fov || camera._projNear !== camera.nearPlane || camera._projFar !== camera.farPlane) {
        camera._projFov = camera.fov;
        camera._projNear = camera.nearPlane;
        camera._projFar = camera.farPlane;
        camera._projRev = (camera._projRev ?? 0) + 1;
    }
    return camera.worldMatrixVersion + (camera._projRev ?? 0);
}
```

Polling here rather than installing accessors in every camera factory keeps the projection contract in **one** place, costs nothing per camera type, and works for a hand-rolled object satisfying `Camera` — the same reasoning behind `world-matrix-state.ts` polling a foreign parent's version instead of pushing to it. Orthographic bounds are _pushed_ instead (see below): that module already owns setters, so pushing is exact and costs the poll nothing.

### Orthographic Projection Seam (zero-cost opt-in)

`camera.ts` holds a module-local `let _orthoProjector = null` plus a single `@internal` setter `_installOrthographicProjector()`, called only from `orthographic.ts`. `getProjectionMatrix` branches on `_orthoProjector !== null && camera.ortho`. When `enableOrthographicCamera` is absent from a bundle the setter tree-shakes, the bundler proves the projector is always `null`, and the entire orthographic branch folds away — perspective-only scenes stay byte-identical. This is the same seam pattern as `_stencilResolver` / `_stdVertexColorFragment` in `standard-pipeline.ts`.

Cache invalidation for live bound changes is deliberately kept out of the shared path: the bounds setters bump `camera._projRev`. Projection-dependent consumers read `_cameraChangeKey(camera)` in place of `camera.worldMatrixVersion`, which is a substitution rather than an extra comparison, so no per-frame gate grows a slot.

`mat4OrthoOffCenterLHToRef` writes a reverse-Z `OrthoOffCenterLH` matrix so orthographic cameras share the engine's reverse-Z depth state (clear `0`, compare `greater`):

```javascript
m[0]  =  2 / (right - left)      m[12] = (left + right) / (left - right)
m[5]  =  2 / (top - bottom)      m[13] = (top + bottom) / (bottom - top)
m[10] = -1 / (far - near)        m[14] = far / (far - near)
m[11] =  0                       m[15] = 1
```

`mat4PerspectiveLHToRef` only writes the terms a perspective matrix needs and relies on the rest of a freshly allocated (zeroed) cache. The orthographic writer overwrites **all 16 elements**, so switching perspective → orthographic on the shared cache is safe unconditionally; the reverse is not symmetric, because `m[12]`, `m[13]` and `m[15]` are written only by the orthographic path, so `disableOrthographicCamera` clears exactly those three before handing `_projCache` back. Optional projectors fully overwriting their output is the contract, so a future third projection type cannot be contaminated by whichever ran before it. That cleanup lives in the lazy module so the shared perspective path pays nothing for it.

### Consumers that still assume a perspective projection

Orthographic support is projection-level; a few features derive screen-space quantities from the projection and need their own handling. Clustered lighting's `projectedSphereBounds` branches on `proj[11] === 0` (1 for perspective, 0 for orthographic — a projection-agnostic discriminator) and uses depth-independent bounds that honour the off-center offsets in `proj[12]` / `proj[13]`; the perspective path divides the silhouette by view depth and ignores those offsets entirely.

Still perspective-only, and therefore **not supported** with an orthographic camera:

| Feature | Assumption |
| --- | --- |
| Feature<br>Gaussian splatting | Assumption<br>`1/z` splat sizing and the linear-depth decode in `gs-depth-fragments.ts` |
| Feature<br>Camera gizmo | Assumption<br>Always draws a perspective frustum wireframe (`camera-gizmo.ts`) |

Both enable/disable reset the projection state, as does every bounds setter — that is what lets extents change without the camera moving (the projection cache is otherwise keyed on `_cameraChangeKey` \+ aspect ratio).

### View-Projection Matrix

Both cameras: `mat4Multiply(projectionMatrix, viewMatrix)`.

* * *

## ArcRotateCamera Controls — Inertia Model

### Sensibility Constants

| Constant | Value | Description |
| --- | --- | --- |
| Constant<br>`angularSensibility` | Value<br>`1000` | Description<br>Babylon default |
| Constant<br>`panningSensibility` | Value<br>`50` | Description<br>Pixels per unit |
| Constant<br>`wheelPrecision` | Value<br>`3` | Description<br>Wheel delta divisor |

### Inertia Epsilon Thresholds

| Constant | Value | Used for |
| --- | --- | --- |
| Constant<br>`ROTATION_EPSILON` | Value<br>`0.001` | Used for<br>Alpha/beta offsets |
| Constant<br>`RADIUS_EPSILON` | Value<br>`0.001` | Used for<br>Radius offset |
| Constant<br>`PANNING_EPSILON` | Value<br>`0.0001` | Used for<br>Panning X/Y offsets |

### Input Handlers

Input handlers do **not** directly modify camera properties. They accumulate into the camera's `inertial*` offset fields, which are applied and decayed each frame by `applyInertia()`.

#### Left-drag (Rotate)

```javascript
camera.inertialAlphaOffset -= dx / angularSensibility
camera.inertialBetaOffset  -= dy / angularSensibility
```

#### Right-drag (Pan)

```javascript
camera.inertialPanningX += -dx / panningSensibility
camera.inertialPanningY +=  dy / panningSensibility
```

#### Wheel (Zoom)

```javascript
camera.inertialRadiusOffset -= (deltaY * camera.radius) / (wheelPrecision * 1000)
```

Zoom is proportional to current radius (logarithmic feel).

#### Touch Pinch (Zoom — direct, no inertia)

Two-finger pinch directly modifies radius:

```javascript
on touchstart (2 fingers): pinchStartDist = distance between fingers
                            pinchStartRadius = camera.radius
on touchmove (2 fingers):  dist = distance between fingers
                            camera.radius = pinchStartRadius * (pinchStartDist / dist)
                            camera.radius = max(0.01, camera.radius)
```

### Per-Frame Inertia Application (`applyInertia`)

Called each frame via `scene._beforeRender` (or fallback RAF if no scene passed):

```javascript
// Rotation
alpha += inertialAlphaOffset
beta  += inertialBetaOffset
beta = clamp(beta, 0.01, π - 0.01)    // prevent gimbal flip
inertialAlphaOffset *= camera.inertia
inertialBetaOffset  *= camera.inertia
if |offset| < ROTATION_EPSILON: offset = 0

// Zoom
radius -= inertialRadiusOffset
radius = max(0.01, radius)
inertialRadiusOffset *= camera.inertia
if |offset| < RADIUS_EPSILON: offset = 0

// Panning (uses camera.panningInertia, not camera.inertia)
rightX = -sin(alpha)
rightZ =  cos(alpha)
panScale = radius * 0.001
target.x += rightX * inertialPanningX * panScale
target.y += inertialPanningY * panScale
target.z += rightZ * inertialPanningX * panScale
inertialPanningX *= camera.panningInertia
inertialPanningY *= camera.panningInertia
if |offset| < PANNING_EPSILON: offset = 0
```

### Scene Integration

When `scene` is provided to `attachControl`:

- `applyInertia` is registered on `(scene as SceneContextInternal)._beforeRender` — single RAF chain.
- Cleanup removes the callback from `_beforeRender`.

When `scene` is omitted (fallback):

- `applyInertia` self-reschedules via `requestAnimationFrame`.
- Cleanup calls `cancelAnimationFrame`.

### Event Registration

| Event | Handler | Options |
| --- | --- | --- |
| Event<br>`pointerdown` | Handler<br>`onPointerDown` | Options<br>— |
| Event<br>`pointermove` | Handler<br>`onPointerMove` | Options<br>— |
| Event<br>`pointerup` | Handler<br>`onPointerUp` | Options<br>— |
| Event<br>`wheel` | Handler<br>`onWheel` | Options<br>`{ passive: false }` |
| Event<br>`contextmenu` | Handler<br>`onContextMenu` | Options<br>— (prevents right-click menu) |
| Event<br>`touchstart` | Handler<br>`onTouchStart` | Options<br>`{ passive: true }` |
| Event<br>`touchmove` | Handler<br>`onTouchMove` | Options<br>`{ passive: true }` |
| Event<br>`touchend` | Handler<br>`onTouchEnd` | Options<br>— |

Pointer capture (`setPointerCapture`/`releasePointerCapture`) keeps drags active outside canvas.

* * *

## FreeCamera Controls

### Input Bindings

| Key(s) | Action |
| --- | --- |
| Key(s)<br>`W` / `ArrowUp` | Action<br>Move forward (+Z local) |
| Key(s)<br>`S` / `ArrowDown` | Action<br>Move backward (−Z local) |
| Key(s)<br>`A` / `ArrowLeft` | Action<br>Strafe left (−X local) |
| Key(s)<br>`D` / `ArrowRight` | Action<br>Strafe right (+X local) |
| Key(s)<br>`Space` / `PageUp` | Action<br>Move up (+Y world) |
| Key(s)<br>`Shift` / `PageDown` | Action<br>Move down (−Y world) |
| Key(s)<br>Mouse drag (any button) | Action<br>Look around (yaw/pitch) |

### Mouse Rotation

Mouse drag accumulates into rotation accumulators:

```javascript
crY += dx / camera.angularSensitivity   // yaw delta
crX += dy / camera.angularSensitivity   // pitch delta
```

### Movement Speed Formula

Matches Babylon.js frame-rate-independent speed calculation:

```javascript
dt = max(deltaMs, 1)
moveSpeed = camera.speed × sqrt(dt² / 100000)
```

### Per-Frame Update

Called each frame via `scene._beforeRender` with `deltaMs`:

```javascript
// 1. Accumulate keyboard input (local space)
cdZ += moveSpeed  (forward/back)
cdX += moveSpeed  (strafe)
cdY += moveSpeed  (up/down)

// 2. Apply rotation
_yaw   += crY
_pitch -= crX
_pitch = clamp(_pitch, -(π/2 - 0.01), π/2 - 0.01)

// 3. Transform local direction → world space
cosY = cos(_yaw),  sinY = sin(_yaw)
position.x += sinY × cdZ + cosY × cdX
position.y += cdY
position.z += cosY × cdZ - sinY × cdX

// 4. Recompute target from yaw/pitch
cosP = cos(_pitch)
target = (position.x + sinY×cosP, position.y + sin(_pitch), position.z + cosY×cosP)

// 5. Decay accumulators (inertia)
cd* *= camera.inertia
cr* *= camera.inertia
if |accumulator| < camera.speed × 0.001: accumulator = 0
```

### Canvas Focus

If the canvas has no `tabindex` attribute, `attachFreeControl` sets `canvas.tabIndex = 0` to make it keyboard-focusable.

### Event Registration

| Event | Handler | Options |
| --- | --- | --- |
| Event<br>`pointerdown` | Handler<br>`onPointerDown` | Options<br>— |
| Event<br>`pointermove` | Handler<br>`onPointerMove` | Options<br>— |
| Event<br>`pointerup` | Handler<br>`onPointerUp` | Options<br>— |
| Event<br>`contextmenu` | Handler<br>`onContextMenu` | Options<br>— |
| Event<br>`keydown` | Handler<br>`onKeyDown` | Options<br>— |
| Event<br>`keyup` | Handler<br>`onKeyUp` | Options<br>— |

Cleanup removes all 6 event listeners and the `_beforeRender` callback.

* * *

## Babylon.js Equivalence Map

| Babylon Lite | Babylon.js |
| --- | --- |
| Babylon Lite<br>`Camera` interface | Babylon.js<br>`BABYLON.Camera` base class |
| Babylon Lite<br>`createArcRotateCamera(alpha, beta, radius, target)` | Babylon.js<br>`new BABYLON.ArcRotateCamera("cam", alpha, beta, radius, target, scene)` |
| Babylon Lite<br>`camera.alpha / beta / radius / target` | Babylon.js<br>Same property names |
| Babylon Lite<br>`camera.fov` (default 0.8) | Babylon.js<br>`camera.fov` (default 0.8) |
| Babylon Lite<br>`camera.nearPlane` / `camera.farPlane` | Babylon.js<br>`camera.minZ` / `camera.maxZ` |
| Babylon Lite<br>`camera.inertia` (default 0.9) | Babylon.js<br>`camera.inertia` (default 0.9) |
| Babylon Lite<br>`camera.panningInertia` (default 0.9) | Babylon.js<br>`camera.panningInertia` (default 0.9) |
| Babylon Lite<br>`camera.inertialAlphaOffset` | Babylon.js<br>`camera.inertialAlphaOffset` |
| Babylon Lite<br>`camera.getViewMatrix()` | Babylon.js<br>`camera.getViewMatrix()` |
| Babylon Lite<br>`camera.getProjectionMatrix(aspect)` | Babylon.js<br>`camera.getProjectionMatrix()` |
| Babylon Lite<br>`enableOrthographicCamera(camera, bounds)` | Babylon.js<br>`camera.mode = Camera.ORTHOGRAPHIC_CAMERA` |
| Babylon Lite<br>`camera.ortho.left / right / bottom / top` | Babylon.js<br>`camera.orthoLeft / orthoRight / orthoBottom / orthoTop` |
| Babylon Lite<br>`camera.ortho.halfHeight` (aspect-derived width) | Babylon.js<br>no equivalent — BJS defaults to half the render size in pixels |
| Babylon Lite<br>Animate path `"ortho.halfHeight"` | Babylon.js<br>`Animation` on `orthoTop` / `orthoBottom` / … |
| Babylon Lite<br>`disableOrthographicCamera(camera)` | Babylon.js<br>`camera.mode = Camera.PERSPECTIVE_CAMERA` |
| Babylon Lite<br>`attachControl(camera, canvas, scene)` | Babylon.js<br>`camera.attachControl(canvas, true)` |
| Babylon Lite<br>`angularSensibility = 1000` | Babylon.js<br>`camera.inputs.attached.pointers.angularSensibilityX/Y` |
| Babylon Lite<br>`panningSensibility = 50` | Babylon.js<br>`camera.inputs.attached.pointers.panningSensibility` |
| Babylon Lite<br>`wheelPrecision = 3` | Babylon.js<br>`camera.inputs.attached.mousewheel.wheelPrecision` |
| Babylon Lite<br>Left-drag → rotate | Babylon.js<br>`ArcRotateCameraPointersInput` button 0 |
| Babylon Lite<br>Right-drag → pan | Babylon.js<br>`ArcRotateCameraPointersInput` button 2 |
| Babylon Lite<br>Wheel → zoom radius | Babylon.js<br>`ArcRotateCameraMouseWheelInput` |
| Babylon Lite<br>Pinch → zoom radius (direct, no inertia) | Babylon.js<br>`ArcRotateCameraPointersInput` multitouch pinch |
| Babylon Lite<br>Beta clamped to `[0.01, π-0.01]` | Babylon.js<br>`camera.lowerBetaLimit / upperBetaLimit` |
| Babylon Lite<br>`createFreeCamera(position, target)` | Babylon.js<br>`new BABYLON.FreeCamera("cam", position, scene); camera.setTarget(target)` |
| Babylon Lite<br>`camera.speed` (default 2.0) | Babylon.js<br>`camera.speed` (default 2.0) |
| Babylon Lite<br>`camera.angularSensitivity` (default 2000) | Babylon.js<br>`camera.inputs.attached.mouse.angularSensibility` |
| Babylon Lite<br>`attachFreeControl(camera, canvas, scene)` | Babylon.js<br>`camera.attachControl(canvas)` |
| Babylon Lite<br>WASD / Arrow keys | Babylon.js<br>`FreeCameraKeyboardMoveInput` |
| Babylon Lite<br>Mouse drag → yaw/pitch | Babylon.js<br>`FreeCameraMouseInput` |
| Babylon Lite<br>Pitch clamped to ±(π/2 − 0.01) | Babylon.js<br>BJS `FreeCameraMouseInput` pitch limits |
| Babylon Lite<br>`_yaw` / `_pitch` (internal) | Babylon.js<br>BJS internal `_cameraRotationMatrix` |

## Dependencies

- **`camera.ts` imports**: `Vec3`, `Mat4` from `../math/types.js`.
- **`arc-rotate.ts` imports**: `Vec3`, `Mat4` from `../math/types.js`; `Vec3Up` from `../math/vec3.js`; `mat4LookAtWorldLHToRef` from `../math/mat4-look-at-world-lh.js`; `IWorldMatrixProvider`, `IParentable` from `../scene/parentable.js`; `createWorldMatrixState` from `../scene/world-matrix-state.js`; `ObservableVec3` from `../math/observable-vec3.js`.
- **`arc-rotate-controls.ts` imports**: `ArcRotateCamera` from `./arc-rotate.js`; `SceneContext`, `SceneContextInternal` from `../scene/scene.js`.
- **`free-camera.ts` imports**: `Camera` from `./camera.js`; `Vec3`, `Mat4` from `../math/types.js`; `Vec3Up` from `../math/vec3.js`; `mat4LookAtWorldLHToRef` from `../math/mat4-look-at-world-lh.js`; `IWorldMatrixProvider`, `IParentable` from `../scene/parentable.js`; `createWorldMatrixState` from `../scene/world-matrix-state.js`; `ObservableVec3` from `../math/observable-vec3.js`.
- **`free-camera-controls.ts` imports**: `FreeCamera`, `FreeCameraInternal` from `./free-camera.js`; `SceneContext` from `../scene/scene.js`.
- **Depended on by**: `scene.ts` (creates camera), render pipeline (reads camera matrices).

## Test Specification

| Test | Description |
| --- | --- |
| Test<br> **ArcRotate** | Description |
| Test<br>`getCameraPosition at alpha=-π/2, beta=π/2` | Description<br>Camera should be at `(target.x, target.y, target.z + radius)` |
| Test<br>`getCameraPosition at alpha=0, beta=π/2` | Description<br>Camera at `(target.x + radius, target.y, target.z)` |
| Test<br>`getViewMatrix is valid LH lookAt` | Description<br>Multiply view × position should give NDC-like coords |
| Test<br>`getProjectionMatrix aspect ratio` | Description<br>Verify `m[0] = tan/aspect`, `m[5] = tan` |
| Test<br>`getViewProjectionMatrix = proj × view` | Description<br>Compare with manual multiply |
| Test<br>`beta clamping` | Description<br>Inertia application clamps beta to `[0.01, π-0.01]` |
| Test<br>`wheel zoom proportional` | Description<br>Large radius → larger absolute change |
| Test<br>`pan shifts target via inertia` | Description<br>Accumulated panning offsets move target, radius unchanged |
| Test<br>`pinch zoom` | Description<br>Two-touch events correctly scale radius directly |
| Test<br>`inertia decay` | Description<br>After input stops, offsets decay by `camera.inertia` per frame |
| Test<br>`cleanup removes all listeners + beforeRender` | Description<br>After cleanup, events and RAF hook removed |
| Test<br> **FreeCamera** | Description |
| Test<br>`initial yaw/pitch from position→target` | Description<br>Verify atan2 computation |
| Test<br>`WASD movement in local space` | Description<br>W moves along +Z local, A along −X local |
| Test<br>`mouse drag rotates yaw/pitch` | Description<br>Verify angular sensitivity scaling |
| Test<br>`pitch clamped to ±(π/2 − 0.01)` | Description<br>Extreme pitch values clamped |
| Test<br>`inertia decay on accumulators` | Description<br>Movement/rotation decay by `camera.inertia` |
| Test<br>`target updated from yaw/pitch` | Description<br>Target re-derived each frame from orientation |
| Test<br>`world-to-view matrix consistency` | Description<br>View = inverse of world matrix |
| Test<br>`cleanup removes 6 listeners + beforeRender` | Description<br>All handlers detached |
| Test<br> **Orthographic** | Description |
| Test<br>`view volume corners → NDC` | Description<br>Reverse-Z depth (near→1, far→0); x/y independent of depth |
| Test<br>`off-center volume` | Description<br>Volume midpoint projects to NDC origin |
| Test<br>`aspect-derived horizontal extent` | Description<br>`halfWidth = halfHeight * aspectRatio` |
| Test<br>`revert to perspective` | Description<br>No stale `m[12] / m[13] / m[15]` left in the shared cache |
| Test<br>`re-enable re-arms the projection cache` | Description<br>Changing `halfHeight` takes effect without a camera move |
| Test<br>`live bound mutation` | Description<br>`ortho.halfHeight = x` invalidates proj + viewProj caches |
| Test<br>`steady-state scene UBO re-upload` | Description<br>Bound change re-opens the real `_writePassSceneUBO` gate |
| Test<br>`runtime enable/disable re-upload` | Description<br>Toggling after the first frame also re-opens the gate |
| Test<br>`projection change is not camera motion` | Description<br>`_cameraChangeKey` moves; `worldMatrixVersion`/`worldMatrix` do not |
| Test<br>`no-op assignment does not re-upload` | Description<br>Writing a bound its current value skips the GPU write |
| Test<br>`halfHeight is number-only` | Description<br>Planes accept `null`; `halfHeight` cannot go degenerate |
| Test<br>`null plane toggles derived/off-center` | Description<br>Assigning a number then `null` restores the derived extent |
| Test<br>`bounds are own enumerable properties` | Description<br>Animation paths like `"ortho.halfHeight"` resolve and write |
| Test<br> **Projection parameters** | Description |
| Test<br>`fov write rebuilds the projection` | Description<br>`m[5] = 1/tan(fov/2)` follows, camera at rest |
| Test<br>`near/far write rebuilds the projection` | Description<br>Reverse-Z depth terms `m[10]` / `m[14]` follow |
| Test<br>`propagates through the view-projection cache` | Description<br>`getViewProjectionMatrix` is not stale either |
| Test<br>`steady-state scene UBO re-upload` | Description<br>Each of fov / near / far re-opens the real `_writePassSceneUBO` gate, under perspective and ortho |
| Test<br>`no-op rewrite does not re-upload` | Description<br>Rewriting a parameter with its current value skips the GPU write |

## File Manifest

| File | Size | Purpose |
| --- | --- | --- |
| File<br>`src/camera/camera.ts` | Size<br>~15 lines | Purpose<br>Shared `Camera` interface contract |
| File<br>`src/camera/arc-rotate.ts` | Size<br>~198 lines | Purpose<br>ArcRotateCamera data + world matrix + dirty tracking |
| File<br>`src/camera/arc-rotate-controls.ts` | Size<br>~220 lines | Purpose<br>ArcRotate pointer/wheel/touch input with inertia model |
| File<br>`src/camera/free-camera.ts` | Size<br>~152 lines | Purpose<br>FreeCamera data + world matrix + dirty tracking |
| File<br>`src/camera/free-camera-controls.ts` | Size<br>~184 lines | Purpose<br>FreeCamera keyboard/mouse input with inertia |
| File<br>`src/camera/orthographic.ts` | Size<br>~75 lines | Purpose<br>Opt-in orthographic projection (installs the seam) |

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