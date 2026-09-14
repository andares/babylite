---
title: Material Stencil
source: https://doc.babylonjs.com/lite/architecture/40-material-stencil/
section: Architecture
---

[API](https://doc.babylonjs.com/lite/typedoc/)

[Babylon Lite](https://doc.babylonjs.com/lite/)\|

[Architecture](https://doc.babylonjs.com/lite/architecture/)\|

[Material Stencil](https://doc.babylonjs.com/lite/architecture/40-material-stencil/)

…\|

[Babylon Lite](https://doc.babylonjs.com/lite/)\|

[Architecture](https://doc.babylonjs.com/lite/architecture/)\|

[Material Stencil](https://doc.babylonjs.com/lite/architecture/40-material-stencil/)

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


# Module: Material Stencil

### Table Of Contents

[Module: Material Stencil](https://doc.babylonjs.com/lite/architecture/40-material-stencil/#module-material-stencil) [Purpose](https://doc.babylonjs.com/lite/architecture/40-material-stencil/#purpose) [Public API Surface](https://doc.babylonjs.com/lite/architecture/40-material-stencil/#public-api-surface) [Internal Architecture — Zero-Cost Opt-in](https://doc.babylonjs.com/lite/architecture/40-material-stencil/#internal-architecture--zero-cost-opt-in) [Pipeline Configuration](https://doc.babylonjs.com/lite/architecture/40-material-stencil/#pipeline-configuration) [Babylon.js Equivalence Map](https://doc.babylonjs.com/lite/architecture/40-material-stencil/#babylonjs-equivalence-map) [Dependencies](https://doc.babylonjs.com/lite/architecture/40-material-stencil/#dependencies) [File Manifest](https://doc.babylonjs.com/lite/architecture/40-material-stencil/#file-manifest)

> Package path: `packages/babylon-lite/src/material/`
> Files: `material.ts` (`StencilState`), `stencil-state.ts`, `enable-material-stencil.ts`,
> and the stencil seams in `pbr-pipeline.ts`, `standard-pipeline.ts`, `shader-pipeline.ts`,
> `pbr-renderable.ts`, `standard-renderable.ts`, `engine/engine.ts`.

## Purpose

Optional per-material **stencil test** baked into a material's main-pass pipeline. Lets one material
**write** the stencil buffer where it draws (a mask) and another **discard** fragments where the stencil was
written — with no dynamic stencil reference. Typical use: portals, decals, and mirror/clip masks.

Shared by every concrete material kind (Standard, PBR, Shader) so none depends on another. Stencil takes
effect only on a stencil-capable depth target (the main color pass) and is ignored on depth-only/shadow
targets.

## Public API Surface

```typescript
interface StencilState {
    readonly compare?: GPUCompareFunction; // default "always"
    readonly passOp?: GPUStencilOperation; // default "keep"
    readonly failOp?: GPUStencilOperation; // default "keep"
    readonly depthFailOp?: GPUStencilOperation; // default "keep"
    readonly readMask?: number; // default 0xFF
    readonly writeMask?: number; // default 0xFF
}

// Attach to a material (post-creation optional property on all three kinds):
//   StandardMaterialProps.stencil?: StencilState
//   PbrMaterialProps.stencil?: StencilState
//   ShaderMaterial.stencil?: StencilState

function enableMaterialStencil(): void; // opt-in, process-global, before registerScene
```

Mask/test without a dynamic reference: a **writer** uses `compare: "always"` \+ `passOp: "increment-clamp"`
(stencil 0 → 1 where it draws); a **tester** uses `compare: "equal"`, which passes only where the stencil is
still the render pass's default reference of `0` (i.e. NOT written).

## Internal Architecture — Zero-Cost Opt-in

Stencil is an **explicit opt-in** so stencil-free scenes stay **byte-identical** to a build without it
(mirrors `enableMaterialPlugins`). The construction of the stencil descriptor lives in its own module
(`stencil-state.ts`), and each pipeline builder references it only through a **module-local resolver hook**
that the tree-shaker + minifier can fold away when the opt-in is absent.

- Each of `pbr-pipeline.ts`, `standard-pipeline.ts`, `shader-pipeline.ts` declares a module-local
`let _stencilResolver: ((s: StencilState) => ResolvedStencil) | null = null` plus a single exported setter
(`_installPbrStencilResolver` / `_installStandardStencilResolver` / `_installShaderStencilResolver`).
- `stencil-state.ts` → `_resolveStencil(stencil)` returns `ResolvedStencil { _desc, _key }`:

  - `_desc`: a partial `GPUDepthStencilState` (`stencilFront`/`stencilBack` share one ops object,
    `stencilReadMask`/`stencilWriteMask`), default-filled here so the object literals never land in the
    always-fetched graph.
  - `_key`: a pipeline-cache-key suffix so two materials differing only in stencil never share a pipeline.
- `enable-material-stencil.ts` → `enableMaterialStencil()` imports `_resolveStencil` \+ the three setters and
installs the resolver into all three pipelines. It is the **only** module that imports the heavy resolver,
so when an application never calls it, `stencil-state.ts` and `enable-material-stencil.ts` are not in the
graph, the three setters become unused exports and tree-shake, and each `_stencilResolver` is provably
always `null`. The minifier then folds `stencil && _stencilResolver ? … : null` → `null` and every
downstream `_stencil` / `_desc` branch disappears — the Standard/PBR/Shader chunks are byte-identical.
- The renderables (`buildPbrRenderables`, `buildStandardMeshRenderables`) pass the raw `mat.stencil ?? null`
into `getOrCreate{Pbr,Standard}Bindings`, which resolve via the hook, fold `_key` into the bindings cache
key, and store `_desc`. `getOrCreate{Pbr,Standard}Pipeline` spread `bindings._stencil` into the
depth-stencil descriptor only when `sig._depthStencilFormat.includes("stencil")`. `shader-pipeline.ts`
resolves via its own hook in `getOrCreateShaderPipeline` and spreads the resolved `_desc`.

## Pipeline Configuration

`depthStencil.{stencilFront,stencilBack}` = `{ compare, passOp, failOp, depthFailOp }`;
`depthStencil.{stencilReadMask,stencilWriteMask}` = masks. Applied only on the main color pass
(`*-stencil8` formats); the same material in a `depth32float` shadow/depth pass keeps plain depth state, so
there is no depth-stencil format mismatch.

## Babylon.js Equivalence Map

| Babylon.js | Babylon Lite |
| --- | --- |
| Babylon.js<br>`material.stencil.func` / `funcMask` | Babylon Lite<br>`StencilState.compare` / `readMask` |
| Babylon.js<br>`material.stencil.opStencilDepthPass` | Babylon Lite<br>`StencilState.passOp` |
| Babylon.js<br>`material.stencil.opStencilFail` / `opDepthFail` | Babylon Lite<br>`StencilState.failOp` / `depthFailOp` |
| Babylon.js<br>`material.stencil.mask` | Babylon Lite<br>`StencilState.writeMask` |
| Babylon.js<br>always-on stencil state | Babylon Lite<br>opt-in `enableMaterialStencil()` (zero bundle cost when unused) |

## Dependencies

`material/material.ts` (`StencilState`), `material/stencil-state.ts` (`_resolveStencil`), and the three
material pipeline + renderable modules. No new runtime dependencies; the resolver is reachable only via the
opt-in.

## File Manifest

- `material/material.ts` — `StencilState` interface (public).
- `material/stencil-state.ts` — `ResolvedStencil`, `_resolveStencil` (internal; opt-in-linked).
- `material/enable-material-stencil.ts` — `enableMaterialStencil()` (public opt-in; installs the resolver).
- `material/{pbr,standard,shader}/*pipeline.ts` — module-local `_stencilResolver` \+ `_install*StencilResolver`
setter + hook-gated stencil seam.
- `material/{pbr,standard}/*renderable.ts` — pass raw `mat.stencil` into the bindings.

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