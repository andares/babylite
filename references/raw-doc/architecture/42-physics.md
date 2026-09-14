---
title: Physics
source: https://doc.babylonjs.com/lite/architecture/42-physics/
section: Architecture
---

[API](https://doc.babylonjs.com/lite/typedoc/)

[Babylon Lite](https://doc.babylonjs.com/lite/)\|

[Architecture](https://doc.babylonjs.com/lite/architecture/)\|

[Physics](https://doc.babylonjs.com/lite/architecture/42-physics/)

…\|

[Babylon Lite](https://doc.babylonjs.com/lite/)\|

[Architecture](https://doc.babylonjs.com/lite/architecture/)\|

[Physics](https://doc.babylonjs.com/lite/architecture/42-physics/)

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


# Module: Physics

### Table Of Contents

[Module: Physics](https://doc.babylonjs.com/lite/architecture/42-physics/#module-physics) [Purpose](https://doc.babylonjs.com/lite/architecture/42-physics/#purpose) [Design: pure-state handle + functions](https://doc.babylonjs.com/lite/architecture/42-physics/#design-pure-state-handle--functions) [Module files](https://doc.babylonjs.com/lite/architecture/42-physics/#module-files) [World lifecycle](https://doc.babylonjs.com/lite/architecture/42-physics/#world-lifecycle) [Timestep & delta-time propagation](https://doc.babylonjs.com/lite/architecture/42-physics/#timestep--delta-time-propagation) [Stage 1 — the scene resolves one delta per frame](https://doc.babylonjs.com/lite/architecture/42-physics/#stage-1--the-scene-resolves-one-delta-per-frame) [Stage 2 — the world re-gates with its own fixed step](https://doc.babylonjs.com/lite/architecture/42-physics/#stage-2--the-world-re-gates-with-its-own-fixed-step) [Units](https://doc.babylonjs.com/lite/architecture/42-physics/#units) [Overriding the step](https://doc.babylonjs.com/lite/architecture/42-physics/#overriding-the-step) [Out-of-loop callers: `worldStepSeconds`](https://doc.babylonjs.com/lite/architecture/42-physics/#out-of-loop-callers-worldstepseconds) [Why `Math.min(dt, 0.1)`](https://doc.babylonjs.com/lite/architecture/42-physics/#why-mathmindt-01) [Consistency with other time-based subsystems](https://doc.babylonjs.com/lite/architecture/42-physics/#consistency-with-other-time-based-subsystems) [Feature modules (opt-in)](https://doc.babylonjs.com/lite/architecture/42-physics/#feature-modules-opt-in) [Testing](https://doc.babylonjs.com/lite/architecture/42-physics/#testing)

> Package path: `packages/babylon-lite/src/physics/`

> **Status: Implemented.**
> Behavioral integration of **Havok Physics V2** (the same WASM engine Babylon.js
> uses), re-shaped to Lite idioms: a pure-state `PhysicsWorld` handle plus
> standalone functions, zero module-level side effects, and opt-in feature
> modules (collision events, triggers, heightfields, queries, character
> controller, floating-origin, debug viewer). The **authoritative API is the**
> **exported TSDoc** in `packages/babylon-lite/src/physics/`.

* * *

## Purpose

The Physics module drives rigid-body simulation by wrapping the Havok V2 WASM
solver. It owns **no scene graph**: it reads transforms from Lite `SceneNode`s to
seed bodies and writes integrated transforms back each step, but the scene never
holds a reference to the physics world (Pillar 4b — one-way ownership). The
per-frame step is driven by the scene's before-render loop; the world is the
data owner and the scene is the clock source.

The module is **100% opt-in and tree-shakable**. A scene that imports nothing
from `physics/` pays zero bytes, and the Havok WASM binary is loaded lazily by
the caller and only referenced once `createHavokWorld` runs.

* * *

## Design: pure-state handle + functions

| Concept | Babylon Lite |
| --- | --- |
| Concept<br>`PhysicsEngine` \+ plugin | Babylon Lite<br>one `PhysicsWorld` state interface + standalone functions |
| Concept<br>`PhysicsBody` class | Babylon Lite<br>`PhysicsBody` state interface + `createPhysicsBody(...)` etc. |
| Concept<br>`body.applyForce()` | Babylon Lite<br>`applyPhysicsBodyForce(world, body, ...)` |
| Concept<br>`PhysicsViewer` class | Babylon Lite<br>`createPhysicsViewer(...)` \+ `show*/hide*` functions |
| Concept<br>Engine-owned step observer | Babylon Lite<br>a callback pushed onto `scene._beforeRender` at world creation |

### Module files

| File | Responsibility |
| --- | --- |
| File<br>`havok.ts` | Responsibility<br>Core: world create/step/dispose, bodies, shapes, aggregates, forces |
| File<br>`havok-collision.ts` | Responsibility<br>Opt-in collision-started/continued/finished events (`onPhysicsCollision`) |
| File<br>`havok-trigger.ts` | Responsibility<br>Opt-in trigger volume enter/exit events |
| File<br>`havok-heightfield.ts` | Responsibility<br>Heightfield collision shape |
| File<br>`havok-queries.ts` | Responsibility<br>Raycast, shape-cast, shape-proximity queries |
| File<br>`havok-floating-origin.ts` | Responsibility<br>Multi-region simulation for Large World Rendering (loaded on demand) |
| File<br>`character-controller.ts` | Responsibility<br>Kinematic character controller (cast-and-slide) |
| File<br>`physics-viewer.ts` \+ `physics-debug-line-material.ts` | Responsibility<br>Debug wireframe overlay of collider shapes |

* * *

## World lifecycle

```ts
import HavokPhysics from "@babylonjs/havok";

const hknp = await HavokPhysics({ locateFile: () => "/HavokPhysics.wasm" });
const world = createHavokWorld(scene, hknp);          // world step defaults to 0 (follows the scene)
// ... create bodies/aggregates ...
disposePhysics(world);                                 // stops stepping, releases native world
```

`createHavokWorld` registers the per-frame step by **unshifting a callback onto**
**`scene._beforeRender`** and stores a remover in `world._stopStep`. `disposePhysics`
calls that remover and clears `world._afterStep` **before** releasing the native
world — otherwise a still-registered callback would step (and read collision
events from) a freed Havok world, which is both a leak and a use-after-free in the
WASM heap. See `tests/lite/unit/physics-dispose.test.ts`.

* * *

## Timestep & delta-time propagation

Physics advances on the **same delta-time contract every time-based subsystem in**
**Lite follows**: the scene resolves one effective delta per frame, and each
subsystem may re-gate it with its own fixed override.

### Stage 1 — the scene resolves one delta per frame

`scene-core.ts` picks the delta once and passes it to every before-render
callback (animation, sprites, **physics**):

```ts
// scene-core.ts (buildScene render step)
const d = ctx.fixedDeltaMs > 0 ? ctx.fixedDeltaMs : eng._currentDelta;
for (const cb of ctx._beforeRender) cb(d);
```

`scene.fixedDeltaMs` (milliseconds, default `0`) is the determinism knob: set it
to a fixed value (e.g. `1000 / 60`) for reproducible playback, or leave it `0` to
use the real `requestAnimationFrame` delta (`engine._currentDelta`).

### Stage 2 — the world re-gates with its own fixed step

The world stores its own **`_fixedDeltaMs` (milliseconds)**, which is **independent**
**of the scene** — it defaults to `0` at creation and is only set through the
accessors. `_stepWorld` applies the identical `> 0 ? fixed : delta` rule the
animation and sprite managers use:

```ts
// havok.ts _stepWorld(world, deltaMs)
const stepMs = world._fixedDeltaMs > 0 ? world._fixedDeltaMs : deltaMs;
if (!Number.isFinite(stepMs) || stepMs <= 0) return;   // reject NaN / non-positive
const dt = Math.min(stepMs / 1000, 0.1);               // → seconds, clamped (see below)
hknp.HP_World_Step(hkWorld, dt);
```

Because the world step defaults to `0`, in the common case (no override) the world
**follows the scene**: the `deltaMs` it receives each frame is the value the render
loop already resolved as `scene.fixedDeltaMs > 0 ? scene.fixedDeltaMs : engine._currentDelta` (Stage 1). Physics therefore steps in **lockstep with**
**animation** — both resolve to the same fixed value when the scene is deterministic,
or both fall back to the real frame delta when it is not — and any **runtime change**
**to `scene.fixedDeltaMs` is picked up on the next frame** (no construction-time
snapshot to go stale).

### Units

The stored step is **milliseconds everywhere** (consistent with
`scene.fixedDeltaMs` and the animation/sprite managers). Physics converts to
**seconds only at the Havok boundary**, because `HP_World_Step` and the
force→impulse / displacement→velocity conversions expect seconds. The
after-step callbacks (`onPhysicsAfterStep`) receive this per-step `dt` in seconds.

### Overriding the step

`setPhysicsTimestepMs(world, fixedDeltaMs)` / `getPhysicsTimestepMs(world)` read and
write `_fixedDeltaMs` in **milliseconds**, matching `SceneContext.fixedDeltaMs`. Pass
`0` (the default) to detach physics from a world-level fixed step and follow the
scene's per-frame delta:

```ts
setPhysicsTimestepMs(world, 1000 / 30);   // force a 30 fps physics step
setPhysicsTimestepMs(world, 0);           // back to following the scene's delta
```

`setPhysicsTimestep(world, seconds)` / `getPhysicsTimestep(world)` are the equivalent
**seconds-based** accessors (`setPhysicsTimestep(world, 1 / 30)` is the same as
`setPhysicsTimestepMs(world, 1000 / 30)`); the millisecond accessors are preferred in
new code so units line up with the rest of the engine's delta convention.

This is the physics analogue of assigning `manager.fixedDeltaMs` on an animation
or sprite manager. See `tests/lite/unit/physics-timestep.test.ts`.

### Out-of-loop callers: `worldStepSeconds`

Some physics operations run **outside** the per-frame `_stepWorld` callback and so
never receive the render loop's `deltaMs` argument — for example `applyPhysicsBodyForce`
(force → impulse over one step) and the character controller's `moveWithCollisions`
(displacement → velocity). These call the shared `worldStepSeconds(world)` helper,
which resolves the same effective delta the step would use and returns it in **seconds**:

1. `world._fixedDeltaMs` if a fixed step is set, else
2. `scene.fixedDeltaMs` if the scene runs fixed, else
3. the engine's real per-frame delta (`scene.surface.engine._currentDelta`).

This keeps force and character motion locked to the same delta the world integrates
with, whether the world runs fixed-step or follows the real frame delta. The helper
can return `0` on the very first frame (no delta measured yet); callers guard against
a zero/negative step.

### Why `Math.min(dt, 0.1)`

The step is clamped to a **100 ms ceiling (a 10 fps floor)**. A long hitch — a
backgrounded tab, a GC pause, a hit breakpoint — otherwise hands Havok a single
huge `dt`. Integrating one giant step makes fast bodies **tunnel** through thin
geometry (they teleport past a collider between two solver samples) and can
destabilise the constraint solver. Capping turns a stall into a brief slow-motion
instead of an explosion. Babylon.js caps its physics substep the same way. The
clamp is intentionally _not_ a substepping loop: Lite runs a single fixed step per
frame, trading perfect catch-up for simplicity and a stable bundle.

### Consistency with other time-based subsystems

| Subsystem | Gate | Source |
| --- | --- | --- |
| Subsystem<br>Scene | Gate<br>`fixedDeltaMs > 0 ? fixedDeltaMs : currentDelta` | Source<br>`scene-core.ts` |
| Subsystem<br>Animation | Gate<br>`fixedDeltaMs > 0 ? fixedDeltaMs : deltaMs` | Source<br>`animation-manager.ts` |
| Subsystem<br>Sprites | Gate<br>`fixedDeltaMs > 0 ? fixedDeltaMs : deltaMs` | Source<br>`sprite-animation.ts` |
| Subsystem<br>Physics | Gate<br>`_fixedDeltaMs > 0 ? _fixedDeltaMs : deltaMs` | Source<br>`havok.ts``_stepWorld` |

The only physics-specific differences are the ms→seconds conversion at the Havok
boundary and the 100 ms tunnelling clamp; the guard against non-finite / negative
steps matches the animation and sprite managers.

* * *

## Feature modules (opt-in)

- **Collision events** (`havok-collision.ts`): `setPhysicsBodyCollisionEventsEnabled`
  - `onPhysicsCollision` register an after-step drain on `world._afterStep`.
- **Triggers** (`havok-trigger.ts`): `setPhysicsShapeIsTrigger`, `onPhysicsTrigger`,
and body-aware `onPhysicsTriggerBodies`; both subscriptions return a disposer.
`onPhysicsTrigger` previously returned `void`; callers that ignore its return value
need no runtime changes, while callers can now retain the disposer to unsubscribe.
- **Queries** (`havok-queries.ts`): `physicsRaycast`, `shapeCast`, `shapeProximity`.
Shape casts accept one `ignoreBody`, matching Havok's single optional ignored body
ID, so callers can sweep a body's own shape without immediately hitting that body.
- **Heightfield** (`havok-heightfield.ts`): `createHeightFieldShape`.
- **Character controller** (`character-controller.ts`): kinematic cast-and-slide
movement; `moveWithCollisions` uses `worldStepSeconds(world)` (the world's step, or
the scene's per-frame delta when no fixed step is set) to convert a requested
displacement into a velocity. `getPhysicsCharacterControllerBody` exposes the
backing body for queries and event matching.
- **Floating origin** (`havok-floating-origin.ts`): `enableHavokFloatingOrigin`
opts a world into multi-region simulation for Large World Rendering
(see [35-large-world-rendering.md](https://doc.babylonjs.com/lite/architecture/35-large-world-rendering)).
Its `step(world, dt)` receives the same clamped per-step seconds as the single-region path.
- **Debug viewer** (`physics-viewer.ts`): wireframe overlay of collider shapes.

* * *

## Testing

- `tests/lite/unit/physics-dispose.test.ts` — the step / after-step callbacks are
registered on creation and fully torn down on dispose (no leak, no use-after-free).
- `tests/lite/unit/physics-timestep.test.ts` — the world's step defaults to `0`
(independent of `scene.fixedDeltaMs`), follows the scene's per-frame delta when
unset (respecting runtime changes), is converted to seconds for `HP_World_Step`,
and is settable via `setPhysicsTimestep` / `setPhysicsTimestepMs`.
- Parity scenes (physics drop/stack/constraint scenes) set
`scene.fixedDeltaMs = 1000 / 60` so Lite and Babylon.js step identically.

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