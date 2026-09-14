---
title: Animation Parity Testing
source: https://doc.babylonjs.com/lite/architecture/39-animation-parity-testing/
section: Architecture
---

[API](https://doc.babylonjs.com/lite/typedoc/)

[Babylon Lite](https://doc.babylonjs.com/lite/)\|

[Architecture](https://doc.babylonjs.com/lite/architecture/)\|

[Animation Parity Testing](https://doc.babylonjs.com/lite/architecture/39-animation-parity-testing/)

…\|

[Babylon Lite](https://doc.babylonjs.com/lite/)\|

[Architecture](https://doc.babylonjs.com/lite/architecture/)\|

[Animation Parity Testing](https://doc.babylonjs.com/lite/architecture/39-animation-parity-testing/)

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


# Module: Animation Parity Testing — Deterministic Frame Sync

### Table Of Contents

[Module: Animation Parity Testing — Deterministic Frame Sync](https://doc.babylonjs.com/lite/architecture/39-animation-parity-testing/#module-animation-parity-testing--deterministic-frame-sync) [Purpose](https://doc.babylonjs.com/lite/architecture/39-animation-parity-testing/#purpose) [Problem](https://doc.babylonjs.com/lite/architecture/39-animation-parity-testing/#problem) [Solution: Freeze-at-Frame-N + Constant Timestep](https://doc.babylonjs.com/lite/architecture/39-animation-parity-testing/#solution-freeze-at-frame-n--constant-timestep) [Constant Timestep (Both Sides)](https://doc.babylonjs.com/lite/architecture/39-animation-parity-testing/#constant-timestep-both-sides) [BJS Reference (`babylon-ref-sceneN.html`)](https://doc.babylonjs.com/lite/architecture/39-animation-parity-testing/#bjs-reference-babylon-ref-scenenhtml) [Lite (`sceneN.ts`)](https://doc.babylonjs.com/lite/architecture/39-animation-parity-testing/#lite-scenents) [Frame Freeze](https://doc.babylonjs.com/lite/architecture/39-animation-parity-testing/#frame-freeze) [BJS Reference](https://doc.babylonjs.com/lite/architecture/39-animation-parity-testing/#bjs-reference) [Lite (gated behind `?freeze` query param)](https://doc.babylonjs.com/lite/architecture/39-animation-parity-testing/#lite-gated-behind-freeze-query-param) [Signal Protocol](https://doc.babylonjs.com/lite/architecture/39-animation-parity-testing/#signal-protocol) [Parity Test Pattern](https://doc.babylonjs.com/lite/architecture/39-animation-parity-testing/#parity-test-pattern) [Golden Capture](https://doc.babylonjs.com/lite/architecture/39-animation-parity-testing/#golden-capture) [Key Design Decisions](https://doc.babylonjs.com/lite/architecture/39-animation-parity-testing/#key-design-decisions) [File Manifest](https://doc.babylonjs.com/lite/architecture/39-animation-parity-testing/#file-manifest) [Applying to New Animated Scenes](https://doc.babylonjs.com/lite/architecture/39-animation-parity-testing/#applying-to-new-animated-scenes)

> Scope: `lab/`, `scripts/capture-golden.ts`, `tests/lite/parity/`

## Purpose

Animated scenes (skeleton, morph targets) must be captured at the exact same
animation frame in both the Babylon.js reference and Babylon Lite. Without
synchronisation, frame-rate differences cause different poses and produce
false parity failures. This module documents the deterministic frame
synchronisation protocol that eliminates that class of flake.

* * *

## Problem

Each machine/GPU renders at a different native frame rate. Babylon.js adapts
its animation timestep to the real delta time, so a 144 Hz monitor and a
60 Hz monitor will show a different pose after the same wall-clock duration.
Screenshot comparisons therefore produce spurious diffs unless both sides
agree on **which animation frame** to capture and use **identical timesteps**
to reach it.

* * *

## Solution: Freeze-at-Frame-N + Constant Timestep

The protocol has two parts:

1. **Constant timestep** — both engines advance animations by exactly 16 ms
per frame, regardless of the real delta time.
2. **Frame freeze** — at a predetermined frame count (e.g. frame 300), both
engines pause all animations but continue rendering. A DOM signal tells
the test harness that the frozen frame is ready for capture.

* * *

## Constant Timestep (Both Sides)

### BJS Reference (`babylon-ref-sceneN.html`)

```javascript
engine.getDeltaTime = function () {
    return 16;
};
scene.useConstantAnimationDeltaTime = true;
```

### Lite (`sceneN.ts`)

```typescript
engine._fixedDeltaMs = 16.0;
```

Both sides now advance at a fixed 16 ms / frame. Animation state after N
frames is fully deterministic.

* * *

## Frame Freeze

At a specific frame count both engines pause animation but keep rendering.

### BJS Reference

```javascript
let frameCount = 0;
scene.registerBeforeRender(() => {
    frameCount++;
    if (frameCount === 300) {
        scene.animationGroups.forEach((g) => g.pause());
        canvas.dataset.animationFrozen = "true";
    }
});
```

### Lite (gated behind `?freeze` query param)

```typescript
if (new URLSearchParams(location.search).has("freeze")) {
    let frameCount = 0;
    engine._beforeRender.push(() => {
        frameCount++;
        if (frameCount === 300) {
            engine.pauseAnimations();
            canvas.dataset.animationFrozen = "true";
        }
    });
}
```

The `?freeze` query-param gate keeps interactive browsing unaffected — only
tests and the golden-capture script append it.

* * *

## Signal Protocol

`canvas.dataset.animationFrozen = 'true'` is the DOM signal consumed by:

1. **Golden capture** (`scripts/capture-golden.ts`) — waits for this signal
before taking the reference screenshot.
2. **Parity tests** (`tests/lite/parity/sceneN-*.spec.ts`) — waits for the signal
on the Lite page before pixel-comparing against the golden.

* * *

## Parity Test Pattern

```typescript
test("Scene N — Animated model matches reference", async ({ page }) => {
    // Load Lite scene with freeze param
    await page.goto("/sceneN.html?freeze");
    await page.waitForFunction(() => document.querySelector("canvas")?.dataset.ready === "true", { timeout: 30_000 });
    // Wait for exact animation frame
    await page.waitForFunction(() => document.querySelector("canvas")?.dataset.animationFrozen === "true", { timeout: 30_000 });
    // Screenshot and compare against golden
    const screenshot = await page.screenshot({
        /* … */
    });
    // … pixel comparison …
});
```

* * *

## Golden Capture

`scripts/capture-golden.ts` is a CLI tool that captures golden reference PNGs:

```bash
pnpm exec tsx scripts/capture-golden.ts 5   # Capture scene 5 golden
```

For animated scenes it:

1. Opens the BJS reference HTML.
2. Waits for `canvas.dataset.animationFrozen === 'true'`.
3. Takes screenshot → `reference/lite/sceneN-*/babylon-ref-golden.png`.

* * *

## Key Design Decisions

| Decision | Rationale |
| --- | --- |
| Decision<br> **Exact frame (`=== N`), not `>= N`** | Rationale<br>Both BJS and Lite must freeze at the identical animation pose. An inequality would allow off-by-one drift. |
| Decision<br> **Constant 16 ms delta** | Rationale<br>Without this, BJS adapts to actual frame rate, making poses non-deterministic across different hardware. |
| Decision<br> **Query-param gating (`?freeze`)** | Rationale<br>Interactive browsing stays unaffected. Only tests and golden capture append the param. |
| Decision<br> **Frame 300** | Rationale<br>Late enough that all assets are loaded and animations are mid-cycle (interesting poses), early enough for fast tests (~5 s at 60 fps). |

* * *

## File Manifest

| File | Role |
| --- | --- |
| File<br>`lab/lite/babylon-ref-scene5.html` | Role<br>BJS reference with frame sync |
| File<br>`lab/lite/babylon-ref-scene7.html` | Role<br>BJS reference with frame sync |
| File<br>`lab/lite/src/lite/scene5.ts` | Role<br>Lite scene with freeze support |
| File<br>`lab/lite/src/lite/scene7.ts` | Role<br>Lite scene with freeze support |
| File<br>`scripts/capture-golden.ts` | Role<br>Golden-capture CLI |
| File<br>`tests/lite/parity/scene5-alien.spec.ts` | Role<br>Animated parity test |
| File<br>`tests/lite/parity/scene7-chibirex.spec.ts` | Role<br>Animated parity test |

* * *

## Applying to New Animated Scenes

When adding a new animated scene:

1. **BJS ref** — add `getDeltaTime = () => 16`,
`useConstantAnimationDeltaTime`, frame counter, freeze + signal.
2. **Lite scene** — add `_fixedDeltaMs = 16`, freeze behind `?freeze` param,
signal.
3. **Parity test** — wait for both `ready` and `animationFrozen` signals
before screenshotting.
4. **capture-golden.ts** — add scene to the registry with `animated: true`
and the freeze frame count.

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