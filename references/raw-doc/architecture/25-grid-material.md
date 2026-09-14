---
title: Grid Material
source: https://doc.babylonjs.com/lite/architecture/25-grid-material/
section: Architecture
---

[API](https://doc.babylonjs.com/lite/typedoc/)

[Babylon Lite](https://doc.babylonjs.com/lite/)\|

[Architecture](https://doc.babylonjs.com/lite/architecture/)\|

[Grid Material](https://doc.babylonjs.com/lite/architecture/25-grid-material/)

…\|

[Babylon Lite](https://doc.babylonjs.com/lite/)\|

[Architecture](https://doc.babylonjs.com/lite/architecture/)\|

[Grid Material](https://doc.babylonjs.com/lite/architecture/25-grid-material/)

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


# Module: Grid Material

### Table Of Contents

[Module: Grid Material](https://doc.babylonjs.com/lite/architecture/25-grid-material/#module-grid-material) [Purpose](https://doc.babylonjs.com/lite/architecture/25-grid-material/#purpose) [Public API Surface](https://doc.babylonjs.com/lite/architecture/25-grid-material/#public-api-surface) [Factory](https://doc.babylonjs.com/lite/architecture/25-grid-material/#factory) [Options](https://doc.babylonjs.com/lite/architecture/25-grid-material/#options) [Shader composition](https://doc.babylonjs.com/lite/architecture/25-grid-material/#shader-composition) [Uniform packing](https://doc.babylonjs.com/lite/architecture/25-grid-material/#uniform-packing) [Render state](https://doc.babylonjs.com/lite/architecture/25-grid-material/#render-state) [Porting note](https://doc.babylonjs.com/lite/architecture/25-grid-material/#porting-note) [Reference scene](https://doc.babylonjs.com/lite/architecture/25-grid-material/#reference-scene) [File inventory](https://doc.babylonjs.com/lite/architecture/25-grid-material/#file-inventory)

> Package path: `packages/babylon-lite/src/material/grid/`

## Purpose

The GridMaterial module provides Lite's equivalent of Babylon.js `GridMaterial` (from
`@babylonjs/materials`): an **unlit, procedural, object-space grid** that wraps any mesh.
It is a thin factory built entirely on top of [ShaderMaterial](https://doc.babylonjs.com/lite/architecture/24-shader-material) — it
composes minimal-whitespace WGSL from typed options and constructs a `ShaderMaterial`. No
new pipeline, renderable, or group builder is introduced; it reuses the shader-material
infrastructure end-to-end, so it stays fully tree-shakable and carries zero cost for scenes
that never import it.

The grid math runs in **object space**: the vertex stage forwards the object-space position
and normal as varyings, and the fragment stage derives per-axis line contributions from the
screen-space derivatives (`dpdx`/`dpdy`) of the object-space position, weighted by the
surface normal. This matches Babylon's `grid.vertex`/`grid.fragment` WGSL math (ported, not
copied).

## Public API Surface

### Factory

```typescript
export function createGridMaterial(options?: GridMaterialOptions): ShaderMaterial;
```

`createGridMaterial` is synchronous and returns a configured `ShaderMaterial`. Assign the
result to `mesh.material` like any other Lite material. Because it _is_ a `ShaderMaterial`,
its uniforms can be updated at runtime via `setShaderUniform()` / `setShaderVector3()` etc.
(e.g. `setShaderVector3(grid, "lineColor", [...])`).

### Options

```typescript
export type GridVec3 = readonly [number, number, number];

export interface GridMaterialOptions {
    readonly name?: string;
    readonly mainColor?: GridVec3; // background between lines.  default [0,0,0]
    readonly lineColor?: GridVec3; // grid line color.           default [0,0.5,0.5] (teal)
    readonly gridRatio?: number; // unit spacing.              default 1
    readonly gridOffset?: GridVec3; // object-space offset.       default [0,0,0]
    readonly majorUnitFrequency?: number; // every Nth line is major (Math.round). default 10
    readonly minorUnitVisibility?: number; // 0..1 minor-line visibility. default 0.33
    readonly opacity?: number; // <1 enables transparent path. default 1
    readonly antialias?: boolean; // cosine AA vs hard cutoff.  default true
    readonly preMultiplyAlpha?: boolean; // rgb *= alpha (transparent path only). default false
    readonly useMaxLine?: boolean; // combine axes with max() vs sum. default false
    readonly opacityTexture?: Texture2D; // .a multiplies final opacity (adds uv attribute + sampler)
    readonly visibility?: number; // final-alpha multiplier.    default 1
    readonly backFaceCulling?: boolean; // default true
}
```

All fields fall back to the Babylon `GridMaterial` defaults.

## Shader composition

The factory composes two WGSL stages against the ShaderMaterial prelude (`shaderSystem` =
world/view/projection, `shaderUniforms` = the custom UBO, optional `opacitySampler`):

- **Vertex** (`mainVertex`): `clip = projection * view * world * position`; outputs
`vPosition` (object-space position), `vNormal` (object-space normal), and `vUv` only when
an opacity texture is supplied.
- **Fragment** (`mainFragment`): `gridPos = (vPosition + gridOffset) / gridRatio`; computes
`gridContrib` per axis (derivative-based line width, dynamic major/minor visibility,
anisotropic attenuation), weights each axis by `normalImpact = clamp(1 - 3·|n³|)`, combines
the axes, and mixes `mainColor → lineColor` by the grid value.

Compile-time toggles are **baked conditionally** into the composed string (never referenced as
dead code against undeclared resources):

| Option | Effect on WGSL |
| --- | --- |
| Option<br>`antialias` | Effect on WGSL<br>cosine falloff vs hard `SQRT2/4` cutoff in `gridIsOnLine` |
| Option<br>`useMaxLine` | Effect on WGSL<br>`grid = max(x,y,z)` vs `grid = x + y + z` |
| Option<br>`opacity < 1` | Effect on WGSL<br>transparent path: `opacity = clamp(grid, 0.08, gridControl.w·grid)` |
| Option<br>`preMultiplyAlpha` | Effect on WGSL<br>transparent path only: `rgb *= opacity` |
| Option<br>`opacityTexture` | Effect on WGSL<br>declares the `uv` attribute + `opacitySampler` and multiplies `.a` |

### Uniform packing

A single `gridControl` vec4 packs the dynamic scalars, matching Babylon:

```javascript
gridControl = (gridRatio, round(majorUnitFrequency), minorUnitVisibility, opacity)
```

Other custom uniforms: `mainColor` (vec3), `lineColor` (vec3), `gridOffset` (vec3),
`visibility` (f32). System uniforms: `world`, `view`, `projection`.

## Render state

- `needAlphaBlending = (opacity < 1) || opacityTexture` → standard `"alpha"` (src-over) blend;
depth writes are disabled automatically while blending (ShaderMaterial pipeline behavior).
- `backFaceCulling` defaults to `true`; `depthCompare` inherits the ShaderMaterial default
(`"greater-equal"`, reverse-Z).

## Porting note

Babylon's `GridMaterial` reads `mesh.visibility`; Lite exposes the same multiplier as the
`visibility` option on the material instead (one-way data ownership — materials don't reach
into meshes). Babylon `@babylonjs/materials` ≥ 9.10 moved the classic lines-only transparency
(`clamp(grid, 0.08, opacity·grid)`) behind its `linesOnly` flag; Lite implements that
formulation directly for the transparent path.

## Reference scene

Scene 213 (`scene213-gridmaterial`) exercises every feature against a `@babylonjs/materials``GridMaterial` oracle: an opaque anti-aliased teal ground, a `useMaxLine` sphere, a
transparent alpha-blended box (`opacity 0.6`), and a hard-cutoff (`antialias:false`) box.

## File inventory

| File | Responsibility |
| --- | --- |
| File<br>`src/material/grid/grid-material.ts` | Responsibility<br>`createGridMaterial()` \+ `GridMaterialOptions` / `GridVec3`; composes WGSL, builds a `ShaderMaterial` |

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