---
title: Headless Null Engine
source: https://doc.babylonjs.com/lite/05-headless-null-engine/
section: Guides
---

[API](https://doc.babylonjs.com/lite/typedoc/)

[Babylon Lite](https://doc.babylonjs.com/lite/)\|

[Headless Null Engine](https://doc.babylonjs.com/lite/05-headless-null-engine/)

…\|

[Babylon Lite](https://doc.babylonjs.com/lite/)\|

[Headless Null Engine](https://doc.babylonjs.com/lite/05-headless-null-engine/)

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


# Headless (Null Engine) — Simulation Without Rendering

### Table Of Contents

[Headless (Null Engine) — Simulation Without Rendering](https://doc.babylonjs.com/lite/05-headless-null-engine/#headless-null-engine--simulation-without-rendering) [Mental model](https://doc.babylonjs.com/lite/05-headless-null-engine/#mental-model) [Quick start](https://doc.babylonjs.com/lite/05-headless-null-engine/#quick-start) [Real physics — Havok, headless](https://doc.babylonjs.com/lite/05-headless-null-engine/#real-physics--havok-headless) [Fixed timestep & determinism](https://doc.babylonjs.com/lite/05-headless-null-engine/#fixed-timestep--determinism) [Runtimes](https://doc.babylonjs.com/lite/05-headless-null-engine/#runtimes) [Limitations](https://doc.babylonjs.com/lite/05-headless-null-engine/#limitations) [API reference](https://doc.babylonjs.com/lite/05-headless-null-engine/#api-reference) [Next steps](https://doc.babylonjs.com/lite/05-headless-null-engine/#next-steps)

> 🧪 **Experimental / prototype.** The null engine is a young feature. The simulation path (physics, animation, per-frame callbacks) is validated end to end, but the API surface may still shift, and **rendering is intentionally out of scope** (see [Limitations](https://doc.babylonjs.com/lite/05-headless-null-engine/#limitations)). Feedback is very welcome.

Babylon Lite can run **without a GPU and without a canvas**. The **null engine** is the Lite analogue of Babylon.js `NullEngine`: it drives the _simulation_ half of the engine — physics stepping, animation evaluation, `onBeforeRender` callbacks, and transform updates — with no rendering at all.

That makes it a good fit for running a scene **on a server or in a headless process**:

- Authoritative **server-side physics** for multiplayer or simulation backends.
- **Deterministic, fixed-step** simulation you can run in CI or a test.
- Offline computation of transforms / animation state you later ship to a rendering client.
- Any place a browser and GPU simply aren't available.

> **Not sure whether you want this or the normal engine?** If you need pixels on screen, use [`createEngine`](https://doc.babylonjs.com/lite/01-getting-started) — that's the WebGPU rendering path. Reach for the null engine only when you explicitly want simulation _without_ rendering.

* * *

## Mental model

A normal Lite app wires up a GPU device and a `requestAnimationFrame` loop:

```ts
const engine = await createEngine(canvas); // acquires a WebGPU device
const scene = createSceneContext(engine);
await registerScene(scene);
await startEngine(engine);                 // drives frames via requestAnimationFrame
```

The null engine replaces both of those:

```ts
const engine = createNullEngine();                                  // no device, no canvas
const scene = createSceneContext(engine, { defaultRenderTask: false }); // no render task
for (let i = 0; i < steps; i++) stepScene(engine, scene, 1000 / 60);    // you drive the loop
```

Two things change, and nothing else about how you build a scene:

1. **`createNullEngine()`** returns a device-less engine. It's synchronous — there's no adapter to await.
2. **You own the clock.** Instead of `startEngine`, you call **`stepScene(engine, scene, deltaMs)`** once per tick. Each call sets the frame delta and runs the scene's per-frame update, which fires every `onBeforeRender(scene, …)` callback (that's how physics and animation advance).

`createSceneContext(engine, { defaultRenderTask: false })` is important: it skips creating the frame-graph render task, so **no swapchain or GPU resource is ever built**.

* * *

## Quick start

```ts
import { createNullEngine, stepScene, createSceneContext, onBeforeRender, createTransformNode } from "@babylonjs/lite";

const engine = createNullEngine();
const scene = createSceneContext(engine, { defaultRenderTask: false });

// A node whose transform we want to simulate.
const node = createTransformNode("mover", 0, 10, 0);

// Simple hand-rolled gravity via a per-frame callback — the same hook physics uses.
const stepMs = 1000 / 60;
const dt = stepMs / 1000; // seconds per step
let velocityY = 0;
onBeforeRender(scene, () => {
    velocityY += -9.81 * dt;
    node.position.set(node.position.x, node.position.y + velocityY * dt, node.position.z);
});

for (let i = 0; i < 180; i++) {
    stepScene(engine, scene, stepMs); // advance 3 seconds, no rendering
}

console.log("final y:", node.position.y);
```

There's also a convenience driver, `runHeadlessSteps(engine, scene, steps, deltaMs?)`, equivalent to calling `stepScene` in a loop:

```ts
import { runHeadlessSteps } from "@babylonjs/lite";

runHeadlessSteps(engine, scene, 180); // 180 steps at the default 1000/60 ms
```

* * *

## Real physics — Havok, headless

The null engine's primary use case is physics. Havok runs entirely on the CPU in Lite (it's stepped from `onBeforeRender`), so it works unchanged on a null engine. Here a 1 kg box falls onto a static ground and comes to rest:

```ts
import {
    createNullEngine, stepScene, createSceneContext, createTransformNode,
    createHavokWorld, createPhysicsAggregate, PhysicsShapeType,
} from "@babylonjs/lite";
import HavokPhysics from "@babylonjs/havok";

const engine = createNullEngine();
const scene = createSceneContext(engine, { defaultRenderTask: false });

const hk = await HavokPhysics();
const world = createHavokWorld(scene, hk, { x: 0, y: -9.81, z: 0 });

// Static ground (mass 0) and a dynamic box, both with explicit box extents.
const ground = createTransformNode("ground", 0, 0, 0);
createPhysicsAggregate(world, ground, PhysicsShapeType.BOX, { mass: 0, extents: { x: 100, y: 0.2, z: 100 } });

const box = createTransformNode("box", 0, 10, 0);
createPhysicsAggregate(world, box, PhysicsShapeType.BOX, { mass: 1, extents: { x: 1, y: 1, z: 1 }, restitution: 0.3 });

for (let i = 0; i < 180; i++) stepScene(engine, scene, 1000 / 60); // 3 s

console.log("box rests at y =", box.position.y.toFixed(3)); // ≈ 0.600
```

This exact scenario is validated end to end (in both Node and Deno): first ground contact matches the analytic free-fall time (~1.384 s) and the box settles at `y = 0.600`.

> **Provide collider geometry explicitly.** On a null engine there's no rendering pass to derive bounds from, so give **primitive** shapes their `extents`/`radius` directly (as above), or set `node.boundMin` / `node.boundMax`. Mesh and convex-hull colliders are not supported yet — see [Limitations](https://doc.babylonjs.com/lite/05-headless-null-engine/#limitations).

* * *

## Fixed timestep & determinism

`stepScene` takes the delta you pass it **verbatim** — there's no wall-clock coupling. Passing a constant `deltaMs` (e.g. `1000 / 60`) gives you a **fixed timestep**, which is what you want for a deterministic, reproducible simulation on a server or in a test. To simulate _N_ seconds, run `N * 1000 / deltaMs` steps.

If you're feeding a real-time server loop, accumulate elapsed time and drain it in fixed steps rather than passing a variable delta straight through — the classic fixed-timestep pattern keeps physics stable and reproducible.

* * *

## Runtimes

The null engine needs **no WebGPU and no browser**, so it runs anywhere JavaScript does. WebGPU support in the runtime is irrelevant to this path.

| Runtime | Null engine (simulation) | Notes |
| --- | --- | --- |
| Runtime<br> **Node.js** | Null engine (simulation)<br>✅ **Recommended** | Notes<br>No flags, no WebGPU needed. The simplest and recommended host for server-side simulation. |
| Runtime<br> **Deno** | Null engine (simulation)<br>✅ | Notes<br>Works today. Validated with real Havok WASM. Use `--node-modules-dir=auto` when running inside a pnpm workspace so `npm:` specifiers resolve. |
| Runtime<br> **Web Worker** | Null engine (simulation)<br>✅ | Notes<br>Runs off the main thread — handy for a simulation worker in a browser app. |
| Runtime<br> **CI / test runner** | Null engine (simulation)<br>✅ | Notes<br>Ideal for deterministic, fixed-step regression tests (Lite's own `no-webgpu` test project runs the null engine this way). |
| Runtime<br> **Browser (rendering)** | Null engine (simulation)<br>— | Notes<br>For pixels on screen use [`createEngine`](https://doc.babylonjs.com/lite/01-getting-started) (WebGPU), not the null engine. |

> **Deno is _not_ required.** Node is the recommended host for headless simulation. Deno is only interesting if you're separately exploring headless _rendering_ — which the null engine does not do.

* * *

## Limitations

The null engine deliberately implements only the simulation path. The following are **not supported** and will either throw or dereference the absent GPU device:

- **Any rendering.**`startEngine`, `renderFrame`, `captureScreenshot`, surfaces, and render-to-texture are all unavailable.
- **Meshes with materials.** Their deferred GPU builders touch the (absent) device. Add plain transform nodes / physics bodies, not renderable materialized meshes.
- **Mesh / convex-hull colliders.** These need the render-side world-matrix pass. Use **primitive** shapes (box / sphere / capsule / cylinder) with explicit geometry for now. _(Follow-up.)_
- **High-precision / floating-origin matrices.** These rely on the F64 allocator that the real `createEngine` installs. _(Follow-up.)_

Under the hood the prototype builds a **partial**`EngineContext` populated with only the fields the simulation/update path reads (`_device` is intentionally absent). A full decoupling of `EngineContext` from its GPU/surface members is a larger, separate refactor tracked as future work — but because every rendering code path is unreachable on a null engine, the missing GPU fields are never dereferenced.

* * *

## API reference

| Export | Description |
| --- | --- |
| Export<br>`createNullEngine(options?)` | Description<br>Create a device-less, surface-less engine. Synchronous. `options` is reserved for future use. |
| Export<br>`stepScene(engine, scene, deltaMs)` | Description<br>Advance one fixed simulation step: sets the frame delta and runs the scene's per-frame update (fires all `onBeforeRender` callbacks). Records no GPU work. |
| Export<br>`runHeadlessSteps(engine, scene, steps, deltaMs?)` | Description<br>Convenience: call `stepScene``steps` times (`deltaMs` defaults to `1000 / 60`). |

Pair these with the normal scene API — `createSceneContext(engine, { defaultRenderTask: false })`, `onBeforeRender`, `createTransformNode`, and the physics factories.

* * *

## Next steps

- 🚀 **[Getting Started](https://doc.babylonjs.com/lite/01-getting-started)** — the full (rendering) engine and the Lite mental model.
- 🧱 **[Animation](https://doc.babylonjs.com/lite/architecture/07-animation)** — animation groups also advance under `stepScene`.
- 🌐 **[github.com/BabylonJS/Babylon-Lite](https://github.com/BabylonJS/Babylon-Lite)** — source, issues, and the scene gallery.

Running Lite headlessly and hitting a wall? **[Open an issue](https://github.com/BabylonJS/Babylon-Lite/issues)** — this feature's direction is shaped directly by what people need from it. 💙

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