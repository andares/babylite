---
title: Engine
source: https://doc.babylonjs.com/lite/architecture/22-engine/
section: Architecture
---

[API](https://doc.babylonjs.com/lite/typedoc/)

[Babylon Lite](https://doc.babylonjs.com/lite/)\|

[Architecture](https://doc.babylonjs.com/lite/architecture/)\|

[Engine](https://doc.babylonjs.com/lite/architecture/22-engine/)

…\|

[Babylon Lite](https://doc.babylonjs.com/lite/)\|

[Architecture](https://doc.babylonjs.com/lite/architecture/)\|

[Engine](https://doc.babylonjs.com/lite/architecture/22-engine/)

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


# Module: Engine

### Table Of Contents

[Module: Engine](https://doc.babylonjs.com/lite/architecture/22-engine/#module-engine) [Purpose](https://doc.babylonjs.com/lite/architecture/22-engine/#purpose) [Public API Surface](https://doc.babylonjs.com/lite/architecture/22-engine/#public-api-surface) [Internal Types (not exported)](https://doc.babylonjs.com/lite/architecture/22-engine/#internal-types-not-exported) [Internal Architecture](https://doc.babylonjs.com/lite/architecture/22-engine/#internal-architecture) [Initialization Sequence (`createEngine`)](https://doc.babylonjs.com/lite/architecture/22-engine/#initialization-sequence-createengine) [Render Targets](https://doc.babylonjs.com/lite/architecture/22-engine/#render-targets) [Resize Logic](https://doc.babylonjs.com/lite/architecture/22-engine/#resize-logic) [Offscreen / Worker Rendering](https://doc.babylonjs.com/lite/architecture/22-engine/#offscreen--worker-rendering) [Render Loop](https://doc.babylonjs.com/lite/architecture/22-engine/#render-loop) [Frame Rendering (`renderFrame`)](https://doc.babylonjs.com/lite/architecture/22-engine/#frame-rendering-renderframe) [Deferred Builder Execution](https://doc.babylonjs.com/lite/architecture/22-engine/#deferred-builder-execution) [GPU Frame Timing (optional, zero-cost when unused)](https://doc.babylonjs.com/lite/architecture/22-engine/#gpu-frame-timing-optional-zero-cost-when-unused) [GPU Render-Task Timing (optional, zero-cost when unused)](https://doc.babylonjs.com/lite/architecture/22-engine/#gpu-render-task-timing-optional-zero-cost-when-unused) [State Machine / Lifecycle](https://doc.babylonjs.com/lite/architecture/22-engine/#state-machine--lifecycle) [Babylon.js Equivalence Map](https://doc.babylonjs.com/lite/architecture/22-engine/#babylonjs-equivalence-map) [Dependencies](https://doc.babylonjs.com/lite/architecture/22-engine/#dependencies) [Test Specification](https://doc.babylonjs.com/lite/architecture/22-engine/#test-specification) [File Manifest](https://doc.babylonjs.com/lite/architecture/22-engine/#file-manifest)

> Package path: `packages/babylon-lite/src/engine/engine.ts`

## Purpose

The Engine module is the lowest layer of Babylon Lite. It acquires a WebGPU adapter and device, configures the swap chain on a render canvas, creates MSAA and depth/stencil render targets, and drives the per-frame render loop via `requestAnimationFrame`. All other modules depend on the Engine for GPU device access and frame orchestration.

The render canvas may be either a DOM `HTMLCanvasElement` (main thread) or an `OffscreenCanvas` (e.g. one transferred to a Web Worker via `transferControlToOffscreen()`). The engine runs unchanged in both cases — see _Offscreen / Worker Rendering_ below.

## Public API Surface

```typescript
/** A surface the engine can render into: a DOM canvas or an OffscreenCanvas. */
export type RenderCanvas = HTMLCanvasElement | OffscreenCanvas;

/** Handle to the WebGPU engine — public API surface.
 *  GPU internals (device, context, format) are @internal — not user-facing. */
export interface EngineContext {
    readonly canvas: RenderCanvas;
    readonly msaaSamples: number; // 1 or 4
    readonly format: GPUTextureFormat;

    /** GPU draw calls executed in the last rendered frame. */
    drawCallCount: number;

    /** GPU time spent on the last measured frame, in milliseconds. 0 until the first measured frame and
     *  while GPU timing is disabled (the default). Enable with `setGpuTimingEnabled`. */
    gpuFrameTimeMs: number;
}

/** Whether GPU frame-time measurement is available on this engine's device (the adapter offered the
 *  WebGPU `timestamp-query` feature). When false, `setGpuTimingEnabled` is a no-op. */
export function isGpuTimingSupported(engine: EngineContext): boolean;
/** Enable or disable per-frame GPU timing (disabled by default). While on, `engine.gpuFrameTimeMs`
 *  updates each frame. Opt-in and zero-cost when unused — see *GPU Frame Timing* below. */
export function setGpuTimingEnabled(engine: EngineContext, enabled: boolean): void;

export type RenderTaskGpuTimingStatus = "unsupported" | "disabled" | "pending" | "available" | "error";
export interface RenderTaskGpuTiming {
    readonly index: number;
    readonly name: string;
    readonly durationMs: number;
}
export interface RenderTaskGpuTimings {
    readonly status: RenderTaskGpuTimingStatus;
    readonly supported: boolean;
    readonly enabled: boolean;
    readonly frameIndex: number;
    readonly tasks: readonly RenderTaskGpuTiming[];
    readonly droppedTaskCount: number;
    readonly error?: string;
}
export function isRenderTaskGpuTimingSupported(engine: EngineContext): boolean;
export function getRenderTaskGpuTimings(engine: EngineContext): RenderTaskGpuTimings;
export function setRenderTaskGpuTimingEnabled(engine: EngineContext, enabled: boolean): Promise<RenderTaskGpuTimings>;

/** Start the render loop for all registered rendering contexts. Resolves after the first frame renders. */
export function startEngine(engine: EngineContext): Promise<void>;
/** Resolve after all GPU commands submitted before this call have completed. */
export function waitForGpuIdle(engine: EngineContext): Promise<void>;
/** Stop the render loop. */
export function stopEngine(engine: EngineContext): void;
/** Resize render targets to match canvas layout size. No-op for an OffscreenCanvas. */
export function resizeEngine(engine: EngineContext): void;
/** Set the backing-store size directly in device pixels (used for OffscreenCanvas). */
export function setEngineSize(engine: EngineContext, widthPx: number, heightPx: number): void;
/** Release all engine-owned GPU resources (render targets, device). */
export function disposeEngine(engine: EngineContext): void;

/** Create the Babylon Lite engine. Acquires GPU adapter + device, configures swapchain. */
export async function createEngine(canvas: RenderCanvas, options?: EngineOptions): Promise<EngineContext>;
```

### Internal Types (not exported)

```typescript
/** @internal — GPU internals accessible only to renderable/loader code. */
interface EngineContextInternal extends EngineContext {
    readonly device: GPUDevice;
    readonly context: GPUCanvasContext;
    readonly format: GPUTextureFormat;
    readonly alphaMode: GPUCanvasAlphaMode;
    _renderingContexts: RenderingContext[];
    _currentEncoder: GPUCommandEncoder;
    _swapchainView: GPUTextureView;
    _currentDelta: number;
    _cbs: GPUCommandBuffer[];
}
```

## Internal Architecture

### Initialization Sequence (`createEngine`)

1. **Adapter request**: `navigator.gpu.requestAdapter({ powerPreference: 'high-performance' })` — throws if WebGPU unavailable.
2. **Device request**: `adapter.requestDevice({ requiredFeatures })` — optionally enables `float32-filterable` if supported.
3. **Canvas context**: `canvas.getContext('webgpu')` — throws if context unavailable.
4. **Swap chain configure**: `context.configure({ device, format, alphaMode })` where `format = navigator.gpu.getPreferredCanvasFormat()` and `alphaMode = options?.alphaMode ?? "opaque"`.
5. **MSAA**: Defaults to `msaaSamples = 4`, or `1` when requested.
6. **Rendering contexts**: Initializes an empty `_renderingContexts` list. Scenes and other renderers register themselves with the engine.

### Render Targets

The engine no longer owns per-frame color/depth render targets directly. Render targets are owned by registered rendering contexts, primarily scene frame-graph `RenderTask`s. The engine owns the canvas/swapchain and exposes the current swapchain view once per frame through `_swapchainView`.

### Resize Logic

`resizeEngine(engine)` is called at the **start of every frame** (inside the rAF callback), not on a resize event. It auto-sizes only a **DOM canvas** from its layout box:

```javascript
if canvas is not an HTMLCanvasElement: return         // OffscreenCanvas → externally sized
w = canvas.clientWidth * devicePixelRatio | 0
h = canvas.clientHeight * devicePixelRatio | 0
setEngineSize(engine, w, h)                           // applies only if changed
```

`setEngineSize(engine, w, h)` is the shared apply path:

```javascript
if w<=0 or h<=0: return
if (w == canvas.width && h == canvas.height) return
canvas.width = w; canvas.height = h;
for each registered context: context._resize?.()
```

The bitwise OR with 0 (`| 0`) truncates to integer.

### Offscreen / Worker Rendering

An `OffscreenCanvas` has no layout box (`clientWidth`/`clientHeight`) and no attributes, so:

- The canvas tag (`setAttribute("data-engine", …)`) is skipped for it. That tag is applied in `_buildSurface`, guarded by a DOM-canvas check, so every DOM canvas Babylon Lite renders into — the engine's primary canvas and any auxiliary `createSurface` canvas — carries it.
- `resizeEngine` is a **no-op** for it — the visible canvas lives on another thread.
- The host thread (which owns the visible canvas) measures the CSS size, multiplies by `devicePixelRatio`, and posts those device-pixel dimensions to the worker, which calls `setEngineSize(engine, w, h)`. This both sets the backing store **and** fires `_resize()` hooks so canvas-sized GPU resources rebuild.

Everything else (adapter/device acquisition, `getContext("webgpu")`, the rAF render loop) is identical — dedicated workers in Chromium expose `requestAnimationFrame`/`cancelAnimationFrame`. See the **Offscreen** lab demo (`lab/lite/src/demos/offscreen*.ts`) for an end-to-end main-thread-vs-worker example.

### Render Loop

`startEngine(engine)` returns a `Promise<void>` that resolves after the first frame has been rendered. Any scene registered before the call participates in the first frame; later registrations join on subsequent frames.

`waitForGpuIdle(engine)` delegates to the WebGPU queue fence and resolves after all commands submitted before the call have completed. It is intended for infrequent lifecycle synchronization, not steady-state frame loops.

```javascript
registerScene(scene):
  adds scene as a RenderingContext

startEngine(engine):
  return new Promise(resolve => {
    renderFn = (now) => {
      resizeEngine(engine);
      deltaMs = now - prev
      renderFrame(engine, deltaMs);
      resolve()                  // first frame only
      prev = now
      animFrameId = requestAnimationFrame(renderFn);
    };
    animFrameId = requestAnimationFrame(renderFn);
  })

stopEngine(engine):
  cancelAnimationFrame(animFrameId);
  animFrameId = 0; renderFn = null;
```

Scenes read `engine._currentDelta` during their `_update()` step. If `scene.fixedDeltaMs` is set, the scene uses that value instead — useful for deterministic animation playback.

### Frame Rendering (`renderFrame`)

Each frame consists of:

1. **Create command encoder**: `device.createCommandEncoder({ label: "frame" })` and assign `engine._currentEncoder`.
2. **Obtain swapchain view**: `engine.context.getCurrentTexture().createView()` and assign `engine._swapchainView`.
3. **Update/record contexts**: For each registered `RenderingContext`, call `_update()` then `_record()`.

   - A scene `_update()` runs before-render callbacks, material swaps, shadow maps, legacy pre-passes, and shared uniform updaters.
   - A scene `_record()` delegates to `scene._frameGraph.execute()`.
4. **Submit**: finish the command encoder and submit via the reusable `engine._cbs` array to avoid per-frame array allocation.

### Deferred Builder Execution

When `registerScene(scene)` is called, the scene runs its deferred builders, builds material renderables, and rebuilds its frame graph. `startEngine(engine)` then begins the rAF loop and resolves after the first `renderFrame()` call completes.

Swapchain MSAA/depth attachments are managed by the default scene `RenderTask` through render-target helpers, not by the engine render loop itself.

### GPU Frame Timing (optional, zero-cost when unused)

`setGpuTimingEnabled(engine, true)` measures how long the **GPU** spends on each frame (distinct from CPU/wall-clock time), publishing a lightly-smoothed value to `engine.gpuFrameTimeMs` (milliseconds). It's a developer/HUD profiling aid, disabled by default.

The feature is implemented so that scenes which never enable it pay **zero** for it — the heavy timer code (`src/engine/gpu-timer.ts`) is reachable only through a dynamic `import()` inside `setGpuTimingEnabled`, which is itself tree-shaken away when unused. `renderFrame` carries only three optional-chain short-circuits (no-ops while timing is off). The only always-bundled cost is requesting the `timestamp-query` device feature opportunistically in `createEngine` (free at runtime) and a one-field initializer — a handful of bytes that round to zero in bundle-size measurements (e.g. scene1/BoomBox shows no measurable delta).

How it works when enabled:

1. `createEngine` opportunistically requests the `timestamp-query` feature whenever the adapter offers it (alongside the texture-compression features), so timing can be turned on later. `isGpuTimingSupported(engine)` reports whether it was available.
2. The first `setGpuTimingEnabled(engine, true)` dynamic-imports `gpu-timer.ts`, lazily creates a `GpuFrameTimer` (a 2-slot `timestamp` query set + a recycled MAP\_READ readback buffer), and installs three per-frame hooks on the engine (`_gpuTimerBegin` / `_gpuTimerEnd` / `_gpuTimerResolve`).
3. `renderFrame` writes the opening timestamp into the frame's command encoder right after creating it and the closing timestamp right before finishing it — so both are commands **inside the frame's command buffer**, and the GPU runs them contiguously around exactly that frame's passes. This measures the frame's **GPU work**, independent of how long the CPU took to record it. After the frame is submitted, `_gpuTimerResolve` issues a tiny separate `resolveQuerySet` \+ buffer copy and maps the result asynchronously, off the render critical path, so the readout (lightly smoothed) lags a frame or two but never stalls the frame.

Disabling clears the three hooks (renderFrame's optional-chains become no-ops again) and resets `gpuFrameTimeMs` to 0; the timer's GPU resources are kept and reused if it is re-enabled.

### GPU Render-Task Timing (optional, zero-cost when unused)

`setRenderTaskGpuTimingEnabled(engine, true)` enables per-frame-graph-task GPU timings. It returns a snapshot immediately (`"pending"` after a successful enable), and `getRenderTaskGpuTimings(engine)` returns the latest asynchronously completed frame:

```typescript
await setRenderTaskGpuTimingEnabled(engine, true);
// Later, after one or more rendered frames:
const timings = getRenderTaskGpuTimings(engine);
if (timings.status === "available") {
    for (const task of timings.tasks) {
        // task.name is the existing Task.name label ("shadow", "scene", "post-process", ...)
        console.log(task.index, task.name, task.durationMs);
    }
}
```

Unsupported devices are explicit: if the WebGPU device lacks `timestamp-query`, `isRenderTaskGpuTimingSupported(engine)` is false and both enable/read APIs return `status: "unsupported"` with an empty `tasks` array.

Bundle-size protection mirrors screenshot capture and frame timing:

1. `createEngine` only requests `timestamp-query` opportunistically when the adapter offers it.
2. The public API lives in a thin module (`engine/gpu-task-timing.ts`). The timestamp-query implementation (`engine/gpu-task-timer.ts`) is reachable only through the dynamic import inside `setRenderTaskGpuTimingEnabled`.
3. Non-users do not fetch the profiler chunk and do not carry task-profiling code in the always-fetched frame-graph module. On enable, the dynamic profiler wraps the currently registered frame graphs' `execute()` functions, plus newly pushed surfaces/contexts, so timestamp passes are written only while profiling is explicitly enabled.

When enabled, the first timed task seen for a new frame encoder clears the current record list. The dynamic frame-graph wrapper writes an empty timestamped compute pass before and after each `Task` execution. After `renderFrame` submits the frame command buffer, the profiler chains through the existing post-frame GPU timing hook, resolves/copies the used query slots through a tiny follow-up command buffer, then maps a recycled readback buffer asynchronously. Results are one or more frames behind and include the existing `Task.name` label plus an execution-order `index` to disambiguate duplicate names. If the fixed query capacity is exceeded, excess tasks execute normally and `droppedTaskCount` reports how many were not timed.

## State Machine / Lifecycle

```javascript
[Created] --registerScene(scene)--> [Context registered + frame graph built]
          --startEngine(engine)-----------> [Running (rAF loop)]
                                                          |
                                                      resizeEngine(engine) each frame
                                                      _beforeRender(deltaMs) each frame
                                                      renderFrame() each frame
                                                          |
                                          --stopEngine(engine)----> [Stopped]
                                                          |
                                           --startEngine(engine)----------> [Running]
```

## Babylon.js Equivalence Map

| Babylon Lite | Babylon.js |
| --- | --- |
| Babylon Lite<br>`createEngine(canvas)` | Babylon.js<br>`new BABYLON.WebGPUEngine(canvas)` \+ `engine.initAsync()` |
| Babylon Lite<br>`engine._device` | Babylon.js<br>`engine._device` |
| Babylon Lite<br>`engine.format` | Babylon.js<br>`engine._textureHelper._glslang.getPreferredFormat()` |
| Babylon Lite<br>`engine.msaaSamples` (1 or 4) | Babylon.js<br>`engine._samples` |
| Babylon Lite<br>`registerScene(scene)` \+ `startEngine(engine)` | Babylon.js<br>`engine.runRenderLoop(() => scene.render())` — also similar to `scene.whenReadyAsync()` in that the returned Promise resolves after the first frame |
| Babylon Lite<br>`waitForGpuIdle(engine)` | Babylon.js<br>`engine._device.queue.onSubmittedWorkDone()` |
| Babylon Lite<br>`stopEngine(engine)` | Babylon.js<br>`engine.stopRenderLoop()` |
| Babylon Lite<br>`resizeEngine(engine)` | Babylon.js<br>`engine.resize()` |
| Babylon Lite<br>Registered `RenderingContext`s | Babylon.js<br>Engine render loop callbacks |
| Babylon Lite<br>Scene frame graph execution | Babylon.js<br>Scene render graph / rendering manager |
| Babylon Lite<br>`scene._prePasses` in `_update()` | Babylon.js<br>`scene.onBeforeRenderObservable` \+ shadow pre-work |
| Babylon Lite<br>`scene._frameGraph.execute()` | Babylon.js<br>Internal draw list dispatch |

## Dependencies

- **Imports**: `SceneContext` from `../scene/scene.js` (type-only, for `start()` parameter).
- **External**: WebGPU API (`navigator.gpu`, `GPUDevice`, `GPUCanvasContext`, etc.).
- **No other internal dependencies.**

## Test Specification

| Test | Description |
| --- | --- |
| Test<br>`createEngine returns valid Engine` | Description<br>Mock `navigator.gpu`, verify all interface fields are populated |
| Test<br>`resize only recreates targets when size changes` | Description<br>Call resize with same dimensions → targets unchanged; change `clientWidth` → targets recreated |
| Test<br>`start/stop manages rAF` | Description<br>Verify `requestAnimationFrame` called on start, `cancelAnimationFrame` on stop |
| Test<br>`waitForGpuIdle returns the queue fence` | Description<br>Verify `onSubmittedWorkDone()` is called once and its exact Promise is returned |
| Test<br>`renderFrame calls scene callbacks` | Description<br>Verify pre-passes → updaters → renderables order |
| Test<br>`MSAA resolve target is swap chain view` | Description<br>Inspect color attachment `resolveTarget` in render pass descriptor |
| Test<br>`depth format is depth24plus-stencil8` | Description<br>Verify `depthTexture.format` |

## File Manifest

| File | Size | Purpose |
| --- | --- | --- |
| File<br>`src/engine/engine.ts` | Size<br>~150 lines | Purpose<br>Engine interface, creation, render loop, MSAA targets |
| File<br>`src/engine/gpu-timer.ts` | Size<br>~110 lines | Purpose<br>Optional GPU frame-time measurement (dynamic-imported by `setGpuTimingEnabled`; zero-cost when unused) |
| File<br>`src/engine/gpu-task-timing.ts` | Size<br>~120 lines | Purpose<br>Thin public per-task timing API; dynamic-imports the profiler implementation only when enabled |
| File<br>`src/engine/gpu-task-timer.ts` | Size<br>~150 lines | Purpose<br>Optional timestamp-query implementation for per-frame-graph-task GPU timings |

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