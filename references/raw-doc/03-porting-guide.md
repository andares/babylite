---
title: Porting Guide
source: https://doc.babylonjs.com/lite/03-porting-guide/
section: Guides
---

[API](https://doc.babylonjs.com/lite/typedoc/)

[Babylon Lite](https://doc.babylonjs.com/lite/)\|

[Porting Guide](https://doc.babylonjs.com/lite/03-porting-guide/)

…\|

[Babylon Lite](https://doc.babylonjs.com/lite/)\|

[Porting Guide](https://doc.babylonjs.com/lite/03-porting-guide/)

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


# Porting from Babylon.js to Babylon Lite

### Table Of Contents

[Porting from Babylon.js to Babylon Lite](https://doc.babylonjs.com/lite/03-porting-guide/#porting-from-babylonjs-to-babylon-lite) [Quick Reference](https://doc.babylonjs.com/lite/03-porting-guide/#quick-reference) [Key Differences](https://doc.babylonjs.com/lite/03-porting-guide/#key-differences) [1\. No Scene in Constructors](https://doc.babylonjs.com/lite/03-porting-guide/#1-no-scene-in-constructors) [2\. Engine & Render Loop](https://doc.babylonjs.com/lite/03-porting-guide/#2-engine--render-loop) [3\. Plain Data, Not Classes](https://doc.babylonjs.com/lite/03-porting-guide/#3-plain-data-not-classes) [4\. Camera Controls Are Separate](https://doc.babylonjs.com/lite/03-porting-guide/#4-camera-controls-are-separate) [5\. Loaders and Scene Registration](https://doc.babylonjs.com/lite/03-porting-guide/#5-loaders-and-scene-registration) [6\. Shadows Attach to Lights](https://doc.babylonjs.com/lite/03-porting-guide/#6-shadows-attach-to-lights) [7\. Thin Instances Use Raw Arrays](https://doc.babylonjs.com/lite/03-porting-guide/#7-thin-instances-use-raw-arrays) [8\. Mesh Factories Take Engine, Not Scene](https://doc.babylonjs.com/lite/03-porting-guide/#8-mesh-factories-take-engine-not-scene) [9\. StandardMaterial Vertex Colors Are Opt-In](https://doc.babylonjs.com/lite/03-porting-guide/#9-standardmaterial-vertex-colors-are-opt-in) [10\. StandardMaterial Optional Textures Are Opt-In](https://doc.babylonjs.com/lite/03-porting-guide/#10-standardmaterial-optional-textures-are-opt-in) [11\. Mirrored (Negatively Scaled) Meshes Are Opt-In](https://doc.babylonjs.com/lite/03-porting-guide/#11-mirrored-negatively-scaled-meshes-are-opt-in) [12\. Removing & Disposing Entities](https://doc.babylonjs.com/lite/03-porting-guide/#12-removing--disposing-entities) [Full Example: Porting a PBR Scene](https://doc.babylonjs.com/lite/03-porting-guide/#full-example-porting-a-pbr-scene) [Babylon.js](https://doc.babylonjs.com/lite/03-porting-guide/#babylonjs) [Babylon Lite](https://doc.babylonjs.com/lite/03-porting-guide/#babylon-lite) [Gotchas](https://doc.babylonjs.com/lite/03-porting-guide/#gotchas) [Material Animation](https://doc.babylonjs.com/lite/03-porting-guide/#material-animation) [Manual (default — zero overhead)](https://doc.babylonjs.com/lite/03-porting-guide/#manual-default--zero-overhead) [Automatic tracking (opt-in)](https://doc.babylonjs.com/lite/03-porting-guide/#automatic-tracking-opt-in) [Material Stencil (opt-in)](https://doc.babylonjs.com/lite/03-porting-guide/#material-stencil-opt-in) [glTF / PBR Extensions](https://doc.babylonjs.com/lite/03-porting-guide/#gltf--pbr-extensions)

This guide shows how to translate a Babylon.js (BJS) scene to Babylon Lite, side by side. Babylon Lite uses **factory functions** instead of constructors, **plain data** instead of class instances, and explicit `addToScene()` instead of auto-registration.

> **Not ready for a full rewrite? Start with `@babylonjs/lite-compat`.** The
> [`@babylonjs/lite-compat`](https://www.npmjs.com/package/@babylonjs/lite-compat)
> package is an opt-in, **Babylon.js-shaped** compatibility layer built on top of
> the native Lite API described below. It keeps the familiar class-based surface
> (`new WebGPUEngine`, `new Scene`, `new ArcRotateCamera`, `MeshBuilder`,
> `StandardMaterial`, …), so an existing BJS scene runs on Lite's WebGPU renderer
> with little or no code change — and its bundler plugins (Vite / Rollup /
> Webpack / esbuild) can even **rewrite your existing `@babylonjs/core`,**
> **`@babylonjs/loaders`, `@babylonjs/addons`, and `@babylonjs/materials` imports**
> **at build time**, so you don't touch a single import. Unsupported APIs throw
> `LiteCompatError` rather than mis-rendering. The intended path is:
>
> ```javascript
> @babylonjs/core  →  @babylonjs/lite-compat  →  @babylonjs/lite (native)
> ```
>
> Use lite-compat to get running fast, then port to the native factory-function
> API in this guide (smaller bundles, full tree-shaking) at your own pace.

* * *

## Quick Reference

| Babylon.js | Babylon Lite |
| --- | --- |
| Babylon.js<br>`new WebGPUEngine(canvas); await engine.initAsync()` | Babylon Lite<br>`const engine = await createEngine(canvas)` |
| Babylon.js<br>`new Scene(engine)` | Babylon Lite<br>`createSceneContext(engine)` |
| Babylon.js<br>`engine.runRenderLoop(() => scene.render())` | Babylon Lite<br>`await startEngine(engine)` |
| Babylon.js<br>`new ArcRotateCamera("cam", α, β, r, target, scene)` | Babylon Lite<br>`createArcRotateCamera(α, β, r, target)` |
| Babylon.js<br>`new FreeCamera("cam", position, scene)` | Babylon Lite<br>`createFreeCamera(position, target)` |
| Babylon.js<br>`scene.createDefaultCamera(true, true, true)` | Babylon Lite<br>`createDefaultCamera(scene)` |
| Babylon.js<br>`camera.attachControl(canvas, true)` | Babylon Lite<br>`attachControl(camera, canvas, scene)` _(arc-rotate)_ / `attachFreeControl(camera, canvas, scene)` _(free)_ |
| Babylon.js<br>`camera.mode = Camera.ORTHOGRAPHIC_CAMERA` | Babylon Lite<br>`enableOrthographicCamera(camera, { halfHeight })` |
| Babylon.js<br>`new HemisphericLight("h", new Vector3(0,1,0), scene)` | Babylon Lite<br>`createHemisphericLight([0,1,0], 1.0)` |
| Babylon.js<br>`new DirectionalLight("d", new Vector3(0,-1,0), scene)` | Babylon Lite<br>`createDirectionalLight([0,-1,0])` |
| Babylon.js<br>`new SpotLight("s", pos, dir, angle, exp, scene)` | Babylon Lite<br>`createSpotLight(pos, dir, angle, exp)` |
| Babylon.js<br>`MeshBuilder.CreateSphere("s", {}, scene)` | Babylon Lite<br>`createSphere(engine)` |
| Babylon.js<br>`MeshBuilder.CreateBox("b", {}, scene)` | Babylon Lite<br>`createBox(engine)` |
| Babylon.js<br>`MeshBuilder.CreateGround("g", {}, scene)` | Babylon Lite<br>`createGround(engine, opts)` |
| Babylon.js<br>`new StandardMaterial("mat", scene)` | Babylon Lite<br>`createStandardMaterial()` |
| Babylon.js<br>`new PBRMaterial("pbr", scene)` | Babylon Lite<br>`createPbrMaterial()` |
| Babylon.js<br>`new GridMaterial("grid", scene)` _(@babylonjs/materials)_ | Babylon Lite<br>`createGridMaterial(opts)` |
| Babylon.js<br>`SceneLoader.ImportMeshAsync("", url, file, scene)` | Babylon Lite<br>`addToScene(scene, await loadGltf(engine, url))` |
| Babylon.js<br>`new CubeTexture(url, scene)` \+ `createDefaultEnvironment()` | Babylon Lite<br>`await loadEnvironment(scene, url, opts)` |
| Babylon.js<br>`new Texture(url, scene)` | Babylon Lite<br>`await loadTexture2D(engine, url)` |
| Babylon.js<br>KTX1 compressed 2D texture | Babylon Lite<br>`await loadKtxTexture2D(engine, baseUrl, suffixes)` |
| Babylon.js<br>glTF KTX2 / `KHR_texture_basisu` texture source | Babylon Lite<br>`addToScene(scene, await loadGltf(engine, ktx2GltfUrl))` _(auto-detected)_ |
| Babylon.js<br>Basis Universal (.basis) 2D texture | Babylon Lite<br>`await loadBasisTexture2D(engine, url)` |
| Babylon.js<br>`new ShadowGenerator(size, light)` with a directional light and ESM | Babylon Lite<br>`createEsmDirectionalShadowGenerator(engine, light, opts)` |
| Babylon.js<br>`sg.usePercentageCloserFiltering = true` with a spotlight | Babylon Lite<br>`createPcfSpotlightShadowGenerator(engine, light, opts)` |
| Babylon.js<br>`sg.usePercentageCloserFiltering = true` with a directional light | Babylon Lite<br>`createPcfDirectionalShadowGenerator(engine, light, opts)` |
| Babylon.js<br>`mesh.thinInstanceSetBuffer("matrix", data, 16)` | Babylon Lite<br>`setThinInstances(mesh, data, count)` |
| Babylon.js<br>`mesh.thinInstanceSetBuffer("color", data, 4)` | Babylon Lite<br>`setThinInstanceColors(mesh, data)` |
| Babylon.js<br>`new Vector3(x, y, z)` | Babylon Lite<br>`{ x, y, z }` or `[x, y, z]` |
| Babylon.js<br>`new Color3(r, g, b)` | Babylon Lite<br>`[r, g, b]` |
| Babylon.js<br>`Matrix.Identity()` | Babylon Lite<br>`mat4Identity()` |
| Babylon.js<br>`mesh.dispose()` | Babylon Lite<br>`removeFromScene(scene, mesh)` |
| Babylon.js<br>`scene.onBeforeRenderObservable.add(fn)` | Babylon Lite<br>`onBeforeRender(scene, fn)` |

* * *

## Key Differences

### 1\. No Scene in Constructors

BJS objects take `scene` in their constructor and auto-register. Lite objects are plain data — you create them, then `addToScene()` them explicitly.

```typescript
// ❌ Babylon.js
const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

// ✅ Babylon Lite
const light = createHemisphericLight([0, 1, 0], 1.0);
addToScene(scene, light);
```

### 2\. Engine & Render Loop

BJS uses `runRenderLoop` with a callback. Lite uses a single `startEngine(engine)` that returns a promise resolving after the first frame.

```typescript
// ❌ Babylon.js
const engine = new WebGPUEngine(canvas);
await engine.initAsync();
const scene = new Scene(engine);
// ... setup ...
engine.runRenderLoop(() => scene.render());

// ✅ Babylon Lite
const engine = await createEngine(canvas);
const scene = createSceneContext(engine);
// ... setup ...
await startEngine(engine);
```

### 3\. Plain Data, Not Classes

Lite uses plain objects, arrays, and `Float32Array` instead of BJS classes like `Vector3`, `Color3`, `Matrix`.

```typescript
// ❌ Babylon.js
light.direction = new Vector3(0, -1, 0);
light.diffuse = new Color3(1, 0, 0);

// ✅ Babylon Lite
const light = createDirectionalLight([0, -1, 0]);
light.diffuse = [1, 0, 0];
```

### 4\. Camera Controls Are Separate

BJS cameras have `attachControl` as a method. Lite separates camera data from input handling.

```typescript
// ❌ Babylon.js
const camera = new ArcRotateCamera("cam", -Math.PI / 2, Math.PI / 2, 5, Vector3.Zero(), scene);
camera.attachControl(canvas, true);

// ✅ Babylon Lite
const camera = createArcRotateCamera(-Math.PI / 2, Math.PI / 2, 5, { x: 0, y: 0, z: 0 });
scene.camera = camera;
attachControl(camera, canvas, scene);
```

### 5\. Loaders and Scene Registration

`loadEnvironment()` adds its environment data/renderables to the scene internally. `loadGltf()` returns an asset container; pass it to `addToScene()` so transform-node hierarchies, meshes, and animation groups are registered explicitly.

```typescript
// ❌ Babylon.js
await SceneLoader.ImportMeshAsync("", baseUrl, "model.glb", scene);
scene.environmentTexture = new CubeTexture(envUrl, scene);
scene.createDefaultEnvironment({ createSkybox: true, skyboxSize: 1000 });

// ✅ Babylon Lite
addToScene(scene, await loadGltf(engine, "model.glb"));
await loadEnvironment(scene, envUrl, {
    skyboxUrl: "skybox.dds",
    skyboxSize: 1000,
    groundTextureUrl: "ground.png",
    brdfUrl: "/brdf-lut.png",
});
```

### 6\. Shadows Attach to Lights

BJS creates a `ShadowGenerator` separately. Lite assigns it directly to the light.

```typescript
// ❌ Babylon.js
const sg = new ShadowGenerator(1024, light);
sg.addShadowCaster(mesh);
sg.useBlurExponentialShadowMap = true;
ground.receiveShadows = true;

// ✅ Babylon Lite
light.shadowGenerator = createEsmDirectionalShadowGenerator(engine, light, {
    mapSize: 1024,
    depthScale: 50,
    blurScale: 2,
});
setShadowTaskCasterMeshes(light.shadowGenerator, [mesh]);
ground.receiveShadows = true;
await registerSceneWithShadowSupport(scene);
```

For PCF shadows:

```typescript
// ❌ Babylon.js
const sg = new ShadowGenerator(1024, spotLight);
sg.usePercentageCloserFiltering = true;

// ✅ Babylon Lite
spotLight.shadowGenerator = createPcfSpotlightShadowGenerator(engine, spotLight, {
    mapSize: 1024,
});
setShadowTaskCasterMeshes(spotLight.shadowGenerator, [mesh]);
await registerSceneWithShadowSupport(scene);
```

### 7\. Thin Instances Use Raw Arrays

No `Matrix` class needed. Pass raw `Float32Array` with 16 floats per instance.

```typescript
// ❌ Babylon.js
const matrices = new Float32Array(count * 16);
// ... fill with Matrix values ...
mesh.thinInstanceSetBuffer("matrix", matrices, 16);
mesh.thinInstanceSetBuffer("color", colors, 4);

// ✅ Babylon Lite
const matrices = new Float32Array(count * 16);
// ... fill directly (column-major 4x4) ...
setThinInstances(mesh, matrices, count);
setThinInstanceColors(mesh, colors);
addToScene(scene, mesh);
```

### 8\. Mesh Factories Take Engine, Not Scene

BJS mesh builders take `scene`. Lite mesh factories take `engine` (for GPU buffer creation) and return plain mesh data.

```typescript
// ❌ Babylon.js
const sphere = MeshBuilder.CreateSphere("sphere", { diameter: 2 }, scene);
sphere.material = new StandardMaterial("mat", scene);

// ✅ Babylon Lite
const sphere = createSphere(engine);
sphere.material = createStandardMaterial();
addToScene(scene, sphere);
```

### 9\. StandardMaterial Vertex Colors Are Opt-In

PBR materials consume mesh vertex colors automatically. Standard materials use an explicit opt-in so scenes without vertex colors retain no feature code. Supply a tightly packed RGBA buffer (four floats per vertex), call `enableStandardVertexColors()` once, then register the scene.

```typescript
import { enableStandardVertexColors } from "babylon-lite";

const vertexCount = positions.length / 3;
const colors = new Float32Array(vertexCount * 4);
for (let i = 0; i < vertexCount; i++) {
    const offset = i * 4;
    colors[offset] = 1;
    colors[offset + 3] = 1;
}

const mesh = createMeshFromData(engine, "colored", positions, normals, indices, undefined, undefined, undefined, colors);
mesh.material = createStandardMaterial();
addToScene(scene, mesh);

enableStandardVertexColors();
await registerScene(scene);
```

### 10\. StandardMaterial Optional Textures Are Opt-In

Only `diffuseTexture` is built into `StandardMaterialProps`. The other eight texture slots live behind `setStandardXTexture()` functions so scenes that don't use them retain none of the corresponding shader code. Assigning the backing property directly is a compile error — the fields are `@internal` (underscore-prefixed) precisely because a direct write would skip extension registration and silently render nothing.

```typescript
// ❌ Babylon.js
const mat = new StandardMaterial("mat", scene);
mat.bumpTexture = new Texture("normal.png", scene);
mat.emissiveTexture = new Texture("glow.png", scene);

// ✅ Babylon Lite
import { createStandardMaterial, setStandardBumpTexture, setStandardEmissiveTexture } from "@babylonjs/lite";

const mat = createStandardMaterial();
setStandardBumpTexture(mat, await loadTexture2D(engine, "normal.png"));
setStandardEmissiveTexture(mat, await loadTexture2D(engine, "glow.png"));
```

| Babylon.js property | Babylon Lite setter |
| --- | --- |
| Babylon.js property<br>`material.bumpTexture` | Babylon Lite setter<br>`setStandardBumpTexture(mat, tex)` |
| Babylon.js property<br>`material.emissiveTexture` | Babylon Lite setter<br>`setStandardEmissiveTexture(mat, tex)` |
| Babylon.js property<br>`material.specularTexture` | Babylon Lite setter<br>`setStandardSpecularTexture(mat, tex)` |
| Babylon.js property<br>`material.ambientTexture` | Babylon Lite setter<br>`setStandardAmbientTexture(mat, tex)` |
| Babylon.js property<br>`material.lightmapTexture` | Babylon Lite setter<br>`setStandardLightmapTexture(mat, tex)` |
| Babylon.js property<br>`material.opacityTexture` | Babylon Lite setter<br>`setStandardOpacityTexture(mat, tex)` |
| Babylon.js property<br>`material.reflectionTexture` (2D) | Babylon Lite setter<br>`setStandardReflectionTexture(mat, tex)` |
| Babylon.js property<br>`material.reflectionTexture` (cube) | Babylon Lite setter<br>`setStandardReflectionCubeTexture(mat, cube)` |

Companion scalars (`bumpLevel`, `lightmapCoordIndex`, `opacityFromRGB`, `reflectionLevel`, …) remain plain assignable properties and may be set in any order relative to the setter — feature detection runs when the renderable is built, not when the setter is called. Setting a texture _after_ the material has already been built still requires `rebuildMaterial()`, exactly as before.

Cube reflection takes a `CubeTexture`, which only `loadCubeTexture()` produces:

```typescript
import { loadCubeTexture, setStandardReflectionCubeTexture } from "@babylonjs/lite";

setStandardReflectionCubeTexture(mat, await loadCubeTexture(engine, "textures/skybox", ".jpg"));
```

`.babylon` files loaded through `loadBabylon()` wire all of these up automatically — the loader imports only the setters a given file actually needs.

### 11\. Mirrored (Negatively Scaled) Meshes Are Opt-In

Babylon flips `sideOrientation` automatically whenever a mesh's world-matrix determinant turns
negative. Lite's glTF loader already reverses winding for negative-scale nodes it finds at load
time, but the remaining cases go through an explicit opt-in so scenes that never mirror anything
carry no winding code. Call `await enableMirroredMeshes(scene)` once — after your assets are added
and before `registerScene()` — when you mirror a Standard-material mesh, a procedural mesh, or
change a mesh's mirroring after load.

```typescript
import { enableMirroredMeshes } from "babylon-lite";

const box = createBox(engine, 2);
box.scaling.set(-1, 1, 1); // mirrored — winding is reversed for you
addToScene(scene, box);

await enableMirroredMeshes(scene);
await registerScene(scene);
```

It also keeps working when the mirroring changes at runtime: each frame the watcher only looks at
meshes whose world matrix actually changed (an integer version compare), computes a determinant for
those alone, and rebuilds a pipeline only when the sign really flipped.

Only that runtime watcher is scoped to the scene you pass — the pipeline-side winding resolution is
installed process-wide on the first call, so in a multi-scene app the other scenes also stop
rendering mirrored meshes inside-out, but they will not track a mirroring that changes after their
renderables are built unless you call it for them too.

### 12\. Removing & Disposing Entities

BJS uses `mesh.dispose()` on individual objects. Lite uses `removeFromScene()` which removes the mesh from the scene and destroys all its GPU resources (buffers, textures, skeleton data).

```typescript
// ❌ Babylon.js
sphere.dispose();

// ✅ Babylon Lite
removeFromScene(scene, sphere);
```

For full teardown:

```typescript
// ✅ Babylon Lite — tear down everything
disposeScene(scene); // releases all meshes, renderables, disposables
disposeEngine(engine); // destroys GPU device, render targets, swapchain
```

* * *

## Full Example: Porting a PBR Scene

### Babylon.js

```typescript
const engine = new WebGPUEngine(canvas);
await engine.initAsync();
const scene = new Scene(engine);
scene.clearColor = new Color4(0.2, 0.2, 0.3, 1);

const light = new HemisphericLight("h", new Vector3(0, 1, 0), scene);
light.intensity = 1.0;

await SceneLoader.ImportMeshAsync("", baseUrl, "BoomBox.glb", scene);
const envTex = new CubeTexture(envUrl, scene);
scene.environmentTexture = envTex;
scene.createDefaultCamera(true, true, true);
scene.createDefaultEnvironment({ skyboxSize: 1000 });

engine.runRenderLoop(() => scene.render());
```

### Babylon Lite

```typescript
const engine = await createEngine(canvas);
const scene = createSceneContext(engine);

addToScene(scene, await loadGltf(engine, "BoomBox.glb"));
await loadEnvironment(scene, envUrl, {
    skyboxUrl: "skybox.dds",
    skyboxSize: 1000,
    groundTextureUrl: "ground.png",
    brdfUrl: "/brdf-lut.png",
});

const cam = createDefaultCamera(scene);
attachControl(cam, canvas, scene);
addToScene(scene, createHemisphericLight([0, 1, 0], 1.0));

await startEngine(engine);
```

* * *

## Gotchas

| Gotcha | Details |
| --- | --- |
| Gotcha<br> **No auto-add** | Details<br>Meshes, lights, transform nodes, and `loadGltf()` asset containers must be explicitly added with `addToScene()`. `loadEnvironment()` adds its environment data/renderables internally. |
| Gotcha<br> **No `new` keyword** | Details<br>Everything is created via factory functions, not constructors. |
| Gotcha<br> **Assign camera explicitly** | Details<br>Either use `createDefaultCamera(scene)` (auto-assigns) or set `scene.camera = myCamera` manually. |
| Gotcha<br> **Materials are optional** | Details<br>`createStandardMaterial()` / `createPbrMaterial()` return props objects. Assign to `mesh.material`. |
| Gotcha<br> **Standard vertex colors** | Details<br>Supply four floats (RGBA) per vertex and call `enableStandardVertexColors()` before `registerScene()`. PBR vertex colors remain automatic. |
| Gotcha<br> **Mirrored meshes** | Details<br>Call `await enableMirroredMeshes(scene)` before `registerScene()` when you give a mesh (or an ancestor) a negative scale, so its triangle winding is reversed. glTF negative-scale nodes are already handled at load time. |
| Gotcha<br> **WebGPU only** | Details<br>No WebGL fallback. `createEngine()` throws if WebGPU is unavailable. |
| Gotcha<br> **No `dispose()` on meshes** | Details<br>Use `removeFromScene(scene, mesh)` to remove a single mesh and destroy its GPU resources. Use `disposeScene(scene)` \+ `disposeEngine(engine)` to tear down everything. |
| Gotcha<br> **Tree-shakable imports** | Details<br>Import only what you use. Unused features are stripped from the bundle. |
| Gotcha<br> **KTX2 is glTF-scoped** | Details<br>KTX1 has a direct `loadKtxTexture2D()` helper. KTX2/BasisU texture sources are handled through glTF `KHR_texture_basisu` during `loadGltf()` so non-KTX2 scenes pay zero runtime bundle cost. |
| Gotcha<br> **Material property animation** | Details<br>Mutating material props at runtime requires marking the material dirty. See Material Animation section below. |

* * *

## Material Animation

Babylon Lite supports animating material properties at runtime (e.g. changing colors, alpha, anisotropy intensity per frame). Two approaches are available:

### Manual (default — zero overhead)

Mutate the property, then call `markMaterialUboDirty()`:

```typescript
import { markMaterialUboDirty } from "@babylonjs/lite";

onBeforeRender(scene, () => {
    material.alpha = Math.sin(time) * 0.5 + 0.5;
    markMaterialUboDirty(material);
});
```

This works for both PBR and Standard materials. Zero runtime cost when nothing changes.

### Automatic tracking (opt-in)

Call `enableMaterialTracking()` once on a material to install property setters that auto-detect changes — including in-place array mutations like `material.diffuseColor[0] = 0.5`:

```typescript
import { enableMaterialTracking, setPbrAnisotropy, setPbrEmissive } from "@babylonjs/lite";

const mat = createPbrMaterial({});
setPbrAnisotropy(mat, { isEnabled: true, intensity: 1.0 });
setPbrEmissive(mat, [0, 0, 0]);
enableMaterialTracking(mat);

// Now mutations auto-mark the material UBO dirty — no manual call needed:
onBeforeRender(scene, () => {
    mat._anisotropy!.intensity = Math.cos(a) * 0.5 + 0.5; // auto-dirty
    mat._emissiveColor![0] = 0.5; // auto-dirty (index write)
});
```

Opt-in features live behind `setPbrX()` functions so unused shader code tree-shakes away; the
properties they stamp are `@internal` (underscore-prefixed) precisely so that assigning them
directly — which would skip extension registration and silently render nothing — is a compile
error. Once the setter has run, in-place mutation of the stamped value is supported.

`enableMaterialTracking` is fully tree-shakable — scenes that don't import it pay zero bundle cost.

| Feature | `markMaterialUboDirty` | `enableMaterialTracking` |
| --- | --- | --- |
| Feature<br>Bundle cost | `markMaterialUboDirty`<br>~50 bytes | `enableMaterialTracking`<br>~1.5 KB (only if imported) |
| Feature<br>Per-frame cost | `markMaterialUboDirty`<br>Zero (manual call) | `enableMaterialTracking`<br>Zero (setter fires only on change) |
| Feature<br>Catches `color[0] = x` | `markMaterialUboDirty`<br>❌ (must call manually) | `enableMaterialTracking`<br>✅ |
| Feature<br>Catches `mat.alpha = x` | `markMaterialUboDirty`<br>❌ (must call manually) | `enableMaterialTracking`<br>✅ |

* * *

## Material Stencil (opt-in)

Babylon Lite supports a per-material stencil test baked into the main color pass — for masking effects
like portals and decals (one material **writes** the stencil buffer where it draws, another **discards**
fragments where the stencil was written). It is an explicit opt-in so stencil-free scenes stay
byte-near-identical:

```typescript
import { createStandardMaterial, enableMaterialStencil, registerScene } from "@babylonjs/lite";

// Writer: stamp the stencil buffer (0 → 1) everywhere it draws.
const mask = createStandardMaterial();
mask.stencil = { passOp: "increment-clamp" };

// Tester: draw only where the stencil is still the pass's default reference of 0
// (i.e. where the writer did NOT draw). No dynamic stencil reference needed.
const masked = createStandardMaterial();
masked.stencil = { compare: "equal" };

enableMaterialStencil(); // ← opt-in, BEFORE registerScene
await registerScene(scene);
```

`StencilState` accepts `compare`, `passOp`, `failOp`, `depthFailOp`, `readMask`, and `writeMask` (all
optional; defaults `"always"` / `"keep"` / `0xff`). Stencil is applied only on a stencil-capable target (the
main color pass) and ignored on depth-only/shadow passes. Without calling `enableMaterialStencil`, a
material's `stencil` field is inert and the pipeline builders carry no stencil code — `enableMaterialStencil`
is fully tree-shakable, so scenes that don't import it pay no bundle cost.

* * *

## glTF / PBR Extensions

Babylon Lite's glTF loader + PBR material understand the following extensions. Each
feature is tree-shakable: scenes that don't use it pay no bundle cost.

| Extension / Feature | Support | Notes |
| --- | --- | --- |
| Extension / Feature<br>`KHR_materials_pbrSpecularGlossiness` | Support<br>✅ | Notes<br>Auto-detected by `loadGltf()` |
| Extension / Feature<br>`KHR_materials_clearcoat` | Support<br>✅ | Notes<br>Auto-detected; or `createPbrMaterial({ clearCoat: { ... } })` |
| Extension / Feature<br>`KHR_materials_sheen` | Support<br>✅ | Notes<br>Auto-detected (BJS-spec albedo scaling for glTF); or `createPbrMaterial({ sheen: { ... } })` |
| Extension / Feature<br>`KHR_materials_anisotropy` | Support<br>✅ | Notes<br>Auto-detected; or `createPbrMaterial({ anisotropy: { ... } })` |
| Extension / Feature<br>`KHR_materials_variants` | Support<br>✅ | Notes<br>`selectVariant(scene, name)`, `getVariantNames(scene)`, `resetVariant(scene)` |
| Extension / Feature<br>`KHR_materials_ior` | Support<br>✅ | Notes<br>Auto-detected; index of refraction for dielectrics (Scene 30) |
| Extension / Feature<br>`KHR_materials_specular` | Support<br>✅ | Notes<br>Auto-detected; dielectric specular intensity + color (Scene 30) |
| Extension / Feature<br>`KHR_materials_volume` | Support<br>✅ | Notes<br>Auto-detected; attenuation color/distance + thickness (Scene 30) |
| Extension / Feature<br>`KHR_materials_transmission` | Support<br>✅ | Notes<br>Frame-graph scene-texture transmission for transmissive glTF materials (Scenes 30/33/112). Screen-space scene-texture refraction; parity is within-5 = 100% of pixels. |
| Extension / Feature<br>`KHR_texture_transform` | Support<br>✅ | Notes<br>Auto-resolved at load (material-wide UV transform) |
| Extension / Feature<br>`KHR_texture_basisu` | Support<br>✅ | Notes<br>Auto-detected; dynamically loads KTX2 decoder/upload path only for glTF assets that declare the extension (Scene 112) |
| Extension / Feature<br>`EXT_texture_webp` | Support<br>✅ | Notes<br>Auto-detected through texture source selection; image decode is browser-native (Scene 37) |
| Extension / Feature<br>`KHR_draco_mesh_compression` | Support<br>✅ | Notes<br>Auto-detected; loads `draco_decoder.js` \+ `.wasm` on demand from site root (override via `setDracoBaseUrl()`) |
| Extension / Feature<br>`KHR_materials_emissive_strength` | Support<br>✅ | Notes<br>Auto-detected; multiplies emissive output (Scene 31) |
| Extension / Feature<br>`KHR_materials_unlit` | Support<br>✅ | Notes<br>Auto-detected; emits base color directly with no lighting (Scene 32) |
| Extension / Feature<br>`KHR_lights_punctual` | Support<br>✅ | Notes<br>Auto-detected; point / spot / directional lights baked from glTF nodes (Scene 33) |
| Extension / Feature<br>`KHR_node_visibility` | Support<br>✅ | Notes<br>Auto-detected; per-node visibility flag honoured at render time (Scene 34) |
| Extension / Feature<br>`KHR_animation_pointer` | Support<br>✅ | Notes<br>Auto-detected; animates arbitrary JSON pointers (e.g. node visibility, material UBO fields) (Scene 34) |
| Extension / Feature<br>`EXT_mesh_gpu_instancing` | Support<br>✅ | Notes<br>Auto-detected; per-node TRS accessors expanded into thin instances (Scene 35) |
| Extension / Feature<br>`EXT_meshopt_compression` | Support<br>✅ | Notes<br>Auto-detected; meshopt-decodes vertex/index buffers via a dynamically-imported decoder (Scene 211) |
| Extension / Feature<br>`KHR_mesh_quantization` | Support<br>✅ | Notes<br>Auto-detected; normalized/quantized vertex attributes uploaded with native typed formats (Scene 211) |
| Extension / Feature<br>`KHR_xmp_json_ld` | Support<br>✅ | Notes<br>Auto-detected; JSON-LD metadata packets surfaced on `AssetContainer.xmpMetadata` with zero render impact (Scene 210) |
| Extension / Feature<br>`ExtrasAsMetadata` | Support<br>✅ | Notes<br>Promotes glTF node, mesh, primitive, and material `extras` to `metadata.gltf.extras` |
| Extension / Feature<br>Interleaved vertex buffers | Support<br>✅ | Notes<br>Genuine GPU-level interleave: a strided `bufferView` is uploaded once and bound to each attribute slot via `arrayStride`/offset — no CPU de-interleave or asset rewrite (Scene 210) |
| Extension / Feature<br>Subsurface translucency + thickness | Support<br>✅ | Notes<br>`createPbrMaterial({ subsurface: { translucency, thickness } })` |
| Extension / Feature<br>Specular anti-aliasing | Support<br>✅ | Notes<br>Auto-on for glTF; manual: `createPbrMaterial({ enableSpecularAA: true })` |
| Extension / Feature<br>Morph targets | Support<br>✅ | Notes<br>PBR meshes only (not `StandardMaterial`) |
| Extension / Feature<br>Skeletal animation (4 or 8 bones) | Support<br>✅ | Notes<br>Driven by `createAnimationController(scene)` |
| Extension / Feature<br>Animation blending / weights / additive clips | Support<br>✅ | Notes<br>`AnimationManager` with `setAnimationWeight()`, `crossFadeAnimationGroups()`, and `setAnimationAdditive()` (Scenes 155-158) |
| Extension / Feature<br>ShaderMaterial | Support<br>✅ | Notes<br>WGSL-only `createShaderMaterial()` with typed uniforms, samplers, defines, alpha blend/test (Scenes 159-163) |
| Extension / Feature<br>GridMaterial | Support<br>✅ | Notes<br>Procedural unlit object-space grid via `createGridMaterial()`: mainColor/lineColor, gridRatio, gridOffset, major/minor units, opacity, antialias, useMaxLine, preMultiplyAlpha, opacityTexture, visibility (Scene 213) |
| Extension / Feature<br>Node Material | Support<br>✅ | Notes<br>NME snippet parser covering core, PBR, math, texture, procedural, normal, screen/depth, matrix, loop, and storage blocks (Scenes 60-89) |
| Extension / Feature<br>Sprites / billboards | Support<br>⚡ | Notes<br>2D layers, depth-hosted sprites, facing/axis-locked/cutout billboards; not the full BJS SpriteManager API (Scenes 50-57) |
| Extension / Feature<br>Gaussian splatting | Support<br>✅ | Notes<br>`.ply`, `.splat`, `.sog`, `.spz`, bake transforms, material plugin fragments (Scenes 120-126) |
| Extension / Feature<br>CSG / CSG2 | Support<br>✅ | Notes<br>Mesh boolean subtract/intersect/union/add APIs (Scenes 90-91) |
| Extension / Feature<br>Physics | Support<br>⚡ | Notes<br>Havok Physics V2 subset (Scene 40) |
| Extension / Feature<br>Navigation / Recast | Support<br>⚡ | Notes<br>Recast V2 navmesh, crowd pathing, tile-cache obstacles, off-mesh links, raycast (Scenes 170-175) |
| Extension / Feature<br>Device-lost recovery | Support<br>✅ | Notes<br>Opt-in SceneContext, SpriteRenderer, and TextRenderer recovery via the corresponding `enableDeviceLost*Recovery` API (Scene 164 covers SceneContext) |
| Extension / Feature<br>Screen-space SSS (PrePass) | Support<br>❌ | Notes<br>Not implemented — only BRDF-layer translucency |

See `lab/lite/src/lite/scene*.ts` for end-to-end examples of each extension in action.

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