---
title: PBR Material
source: https://doc.babylonjs.com/lite/architecture/06-pbr-material/
section: Architecture
---

[API](https://doc.babylonjs.com/lite/typedoc/)

[Babylon Lite](https://doc.babylonjs.com/lite/)\|

[Architecture](https://doc.babylonjs.com/lite/architecture/)\|

[PBR Material](https://doc.babylonjs.com/lite/architecture/06-pbr-material/)

…\|

[Babylon Lite](https://doc.babylonjs.com/lite/)\|

[Architecture](https://doc.babylonjs.com/lite/architecture/)\|

[PBR Material](https://doc.babylonjs.com/lite/architecture/06-pbr-material/)

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


# Module: PBR Material

### Table Of Contents

[Module: PBR Material](https://doc.babylonjs.com/lite/architecture/06-pbr-material/#module-pbr-material) [Purpose](https://doc.babylonjs.com/lite/architecture/06-pbr-material/#purpose) [ShaderFragment Composition System](https://doc.babylonjs.com/lite/architecture/06-pbr-material/#shaderfragment-composition-system) [Composition Flow (PBR)](https://doc.babylonjs.com/lite/architecture/06-pbr-material/#composition-flow-pbr) [Dynamic Feature Flags (`pbr-flags.ts`)](https://doc.babylonjs.com/lite/architecture/06-pbr-material/#dynamic-feature-flags-pbr-flagsts) [Public API Surface](https://doc.babylonjs.com/lite/architecture/06-pbr-material/#public-api-surface) [Material Props (`pbr-material.ts`)](https://doc.babylonjs.com/lite/architecture/06-pbr-material/#material-props-pbr-materialts) [Material Views and Rebuild](https://doc.babylonjs.com/lite/architecture/06-pbr-material/#material-views-and-rebuild) [Pipeline (`pbr-pipeline.ts`)](https://doc.babylonjs.com/lite/architecture/06-pbr-material/#pipeline-pbr-pipelinets) [Template (`pbr-template.ts`)](https://doc.babylonjs.com/lite/architecture/06-pbr-material/#template-pbr-templatets) [Renderable Builder (`pbr-renderable.ts`)](https://doc.babylonjs.com/lite/architecture/06-pbr-material/#renderable-builder-pbr-renderablets) [Fragment Modules](https://doc.babylonjs.com/lite/architecture/06-pbr-material/#fragment-modules) [`ibl-fragment.ts` — IBL Environment Lighting](https://doc.babylonjs.com/lite/architecture/06-pbr-material/#ibl-fragmentts--ibl-environment-lighting) [`local-cubemap-fragment.ts` — Per-material and bounded local IBL (opt-in)](https://doc.babylonjs.com/lite/architecture/06-pbr-material/#local-cubemap-fragmentts--per-material-and-bounded-local-ibl-opt-in) [`clearcoat-fragment.ts` — Clearcoat Layer](https://doc.babylonjs.com/lite/architecture/06-pbr-material/#clearcoat-fragmentts--clearcoat-layer) [`sheen-fragment.ts` — Sheen Layer](https://doc.babylonjs.com/lite/architecture/06-pbr-material/#sheen-fragmentts--sheen-layer) [`reflectance-fragment.ts` — Metallic Reflectance Extension](https://doc.babylonjs.com/lite/architecture/06-pbr-material/#reflectance-fragmentts--metallic-reflectance-extension) [`emissive-fragment.ts` — Emissive Color Uniform](https://doc.babylonjs.com/lite/architecture/06-pbr-material/#emissive-fragmentts--emissive-color-uniform) [`lightmap-fragment.ts` — Baked Lightmap (opt-in)](https://doc.babylonjs.com/lite/architecture/06-pbr-material/#lightmap-fragmentts--baked-lightmap-opt-in) [`morph-fragment.ts` — Morph Targets](https://doc.babylonjs.com/lite/architecture/06-pbr-material/#morph-fragmentts--morph-targets) [`skeleton-fragment.ts` — Skeletal Animation](https://doc.babylonjs.com/lite/architecture/06-pbr-material/#skeleton-fragmentts--skeletal-animation) [`pbr-shadow-fragment.ts` — Shadow Receiving](https://doc.babylonjs.com/lite/architecture/06-pbr-material/#pbr-shadow-fragmentts--shadow-receiving) [PBR Light WGSL](https://doc.babylonjs.com/lite/architecture/06-pbr-material/#pbr-light-wgsl) [Pipeline Configuration](https://doc.babylonjs.com/lite/architecture/06-pbr-material/#pipeline-configuration) [Vertex Buffers (varies by features)](https://doc.babylonjs.com/lite/architecture/06-pbr-material/#vertex-buffers-varies-by-features) [Pipeline State](https://doc.babylonjs.com/lite/architecture/06-pbr-material/#pipeline-state) [Bind Group Layouts](https://doc.babylonjs.com/lite/architecture/06-pbr-material/#bind-group-layouts) [`_buildGroup` Pattern](https://doc.babylonjs.com/lite/architecture/06-pbr-material/#_buildgroup-pattern) [Visible Environment Skybox Opt-Ins](https://doc.babylonjs.com/lite/architecture/06-pbr-material/#visible-environment-skybox-opt-ins) [Internal Architecture](https://doc.babylonjs.com/lite/architecture/06-pbr-material/#internal-architecture) [Scene Uniform Buffer Layout (Group 0, Binding 0)](https://doc.babylonjs.com/lite/architecture/06-pbr-material/#scene-uniform-buffer-layout-group-0-binding-0) [Mesh Uniform Buffer Layout (Group 1, Binding 0)](https://doc.babylonjs.com/lite/architecture/06-pbr-material/#mesh-uniform-buffer-layout-group-1-binding-0) [Pipeline Caching](https://doc.babylonjs.com/lite/architecture/06-pbr-material/#pipeline-caching) [Shader Template (`pbr-template.ts`)](https://doc.babylonjs.com/lite/architecture/06-pbr-material/#shader-template-pbr-templatets) [Composed Shader Caching](https://doc.babylonjs.com/lite/architecture/06-pbr-material/#composed-shader-caching) [Renderable Builder (`pbr-renderable.ts`)](https://doc.babylonjs.com/lite/architecture/06-pbr-material/#renderable-builder-pbr-renderablets-1) [Single-Mesh Rebuild Closure](https://doc.babylonjs.com/lite/architecture/06-pbr-material/#single-mesh-rebuild-closure) [Shader Logic](https://doc.babylonjs.com/lite/architecture/06-pbr-material/#shader-logic) [Vertex Shader (composed by template + fragments)](https://doc.babylonjs.com/lite/architecture/06-pbr-material/#vertex-shader-composed-by-template--fragments) [Fragment Shader (composed by template + fragments)](https://doc.babylonjs.com/lite/architecture/06-pbr-material/#fragment-shader-composed-by-template--fragments) [1\. Texture Sampling (always)](https://doc.babylonjs.com/lite/architecture/06-pbr-material/#1-texture-sampling-always) [2\. Material Setup Slots](https://doc.babylonjs.com/lite/architecture/06-pbr-material/#2-material-setup-slots) [3\. Normal Mapping](https://doc.babylonjs.com/lite/architecture/06-pbr-material/#3-normal-mapping) [4\. Emissive](https://doc.babylonjs.com/lite/architecture/06-pbr-material/#4-emissive) [5\. Direct Lighting + `/*AD*/` Slot](https://doc.babylonjs.com/lite/architecture/06-pbr-material/#5-direct-lighting--ad-slot) [6\. Environment Lighting — `/*AI*/` or `/*NI*/` Slot](https://doc.babylonjs.com/lite/architecture/06-pbr-material/#6-environment-lighting--ai-or-ni-slot) [7\. Final Composition — `/*BC*/` and `/*BA*/` Slots](https://doc.babylonjs.com/lite/architecture/06-pbr-material/#7-final-composition--bc-and-ba-slots) [8\. Image Processing (if `PBR_HAS_TONEMAP`)](https://doc.babylonjs.com/lite/architecture/06-pbr-material/#8-image-processing-if-pbr_has_tonemap) [Babylon.js Equivalence Map](https://doc.babylonjs.com/lite/architecture/06-pbr-material/#babylonjs-equivalence-map) [Dependencies](https://doc.babylonjs.com/lite/architecture/06-pbr-material/#dependencies) [Test Specification](https://doc.babylonjs.com/lite/architecture/06-pbr-material/#test-specification) [File Manifest](https://doc.babylonjs.com/lite/architecture/06-pbr-material/#file-manifest)

> Package path: `packages/babylon-lite/src/material/pbr/`
> Files: `pbr-material.ts` (props + factory), `pbr-template.ts` (shader template), `pbr-pipeline.ts` (pipeline cache), `pbr-renderable.ts` (renderable builder and single-mesh rebuild closure), `pbr-flags.ts` / `pbr-flag-bits.ts` (feature flag constants), `no-color-view.ts` (pass-specific material view), `fragments/singlelight-wgsl.ts` (one-light WGSL), `fragments/multilight-wgsl.ts` (multi-light WGSL)

## Purpose

The PBR Material module implements a physically-based rendering material with GGX microfacet BRDF, Smith-GGX height-correlated geometry, Schlick Fresnel, spherical harmonics diffuse IBL, specular IBL via split-sum approximation, normal mapping (tangent or cotangent), emissive (texture and/or uniform color), image processing (exposure, tone mapping, contrast), Kulla-Conty energy conservation, clearcoat, sheen, metallic reflectance extension, specular anti-aliasing, skeletal animation, morph targets, thin instances, a non-looping single-light path, generic multi-light loops, and ESM/PCF shadow receiving. It renders glTF metallic-roughness and specular-glossiness workflow meshes to match Babylon.js PBR output.

Shaders are **dynamically composed** via the `ShaderFragment` / `ShaderComposer` system — no raw `.wgsl` files. A `ShaderTemplate` (`pbr-template.ts`) provides the base WGSL with slot markers; optional `ShaderFragment` modules inject code into those slots. Only the fragments needed for a given mesh's features are composed, minimizing bundle size per the Size Pillar. Fragment modules are **dynamically imported** at build time so unused features are tree-shaken.

## ShaderFragment Composition System

PBR shaders are built using the `ShaderComposer` architecture defined in `src/shader/shader-composer.ts`:

1. **`ShaderTemplate`** (`pbr-template.ts` → `createPbrTemplate()`) — provides base vertex/fragment WGSL with slot markers (e.g. `/*MF*/`, `/*AD*/`, `/*AI*/`, `/*AT*/`, `/*SV*/`, `/*VR*/`, `/*VW*/`, `/*VB*/`, `/*BC*/`, `/*BA*/`, `/*BL*/`, `/*NI*/`), base UBO fields, base vertex attributes, base varyings, and base bindings.

2. **`ShaderFragment`** — each optional feature (IBL, clearcoat, sheen, shadows, skeleton, morph, emissive-color, reflectance) is a fragment object with:
   - `id` — unique string identifier
   - `dependencies` — other fragment IDs that must be composed first
   - `fragmentSlots` / `vertexSlots` — WGSL snippets keyed by slot name
   - `bindings` / `vertexBindings` — `BindingDecl[]` for textures/samplers/UBOs
   - `uboFields` — additional material UBO fields
   - `vertexAttributes` — additional vertex buffer attributes
   - `varyings` — additional inter-stage varyings
   - `helperFunctions` / `vertexHelperFunctions` — WGSL helper code
   - `vertexBuiltins` — built-in inputs (e.g. `vertex_index`)
   - `pipelineVertexBuffers` — extra GPU vertex buffer layouts
3. **`composeShader(template, fragments)`** — topologically sorts fragments by dependency, merges UBO fields, assigns binding indices sequentially, replaces slot markers with concatenated fragment code, and returns a `ComposedShader` with final WGSL + bind group layout descriptors + vertex buffer layouts.


### Composition Flow (PBR)

```javascript
pbr-renderable.ts:
  1. Resolves MaterialOrView to source material state + render feature bits
  2. Dynamically imports only needed fragment modules
  3. Calls createPbrTemplate(config) → ShaderTemplate
  4. Calls composeShader(template, fragments) → ComposedShader
  5. Caches ComposedShader per feature bitmask
  6. Passes ComposedShader to getOrCreatePbrPipeline()
```

## Dynamic Feature Flags (`pbr-flags.ts`)

| Flag | Constant | Condition | Shader effect |
| --- | --- | --- | --- |
| Flag<br>`PBR_HAS_NORMAL_MAP` | Constant<br>`1 << 0` | Condition<br>Mesh has tangent buffer | Shader effect<br>Tangent vertex attr + normal texture + TBN transform |
| Flag<br>`PBR_HAS_EMISSIVE` | Constant<br>`1 << 1` | Condition<br>Material has emissive texture | Shader effect<br>Emissive texture sampling |
| Flag<br>`PBR_HAS_ENV` | Constant<br>`1 << 2` | Condition<br>Environment loaded | Shader effect<br>IBL (BRDF LUT + specular cubemap + SH irradiance) |
| Flag<br>`PBR_HAS_TONEMAP` | Constant<br>`1 << 4` | Condition<br>Tone mapping enabled | Shader effect<br>Exposure/contrast/gamma post-processing |
| Flag<br>`PBR_HAS_ALPHA_BLEND` | Constant<br>`1 << 6` | Condition<br>Material has alpha blend | Shader effect<br>Alpha blend pipeline state |
| Flag<br>`PBR_HAS_SPEC_GLOSS` | Constant<br>`1 << 7` | Condition<br>Specular-glossiness workflow | Shader effect<br>SpecGloss texture instead of ORM |
| Flag<br>`PBR_HAS_DOUBLE_SIDED` | Constant<br>`1 << 8` | Condition<br>Material is double-sided | Shader effect<br>`cullMode: 'none'` \+ front-facing normal flip |
| Flag<br>`PBR_HAS_COTANGENT_NORMAL` | Constant<br>`1 << 9` | Condition<br>Normal map without tangents | Shader effect<br>Cotangent-frame normal perturbation |
| Flag<br>`PBR_HAS_METALLIC_REFLECTANCE_MAP` | Constant<br>`1 << 10` | Condition<br>Has metallic reflectance map | Shader effect<br>Reflectance texture sampling |
| Flag<br>`PBR_HAS_REFLECTANCE_MAP` | Constant<br>`1 << 11` | Condition<br>Has reflectance map | Shader effect<br>Reflectance map sampling |
| Flag<br>`PBR_HAS_USE_ALPHA_ONLY_MR` | Constant<br>`1 << 12` | Condition<br>Use alpha-only from MR map | Shader effect<br>Alpha-only metallic reflectance |
| Flag<br>Clustered point gate (local) | Constant<br>`1 << 13` | Condition<br>Clustered point-light state | Shader effect<br>Point-only clustered fragment and cache variant |
| Flag<br>Clustered spot gate (local) | Constant<br>`1 << 14` | Condition<br>Clustered spot-light state | Shader effect<br>Spot-capable clustered fragment and cache variant |
| Flag<br>`PBR_HAS_OCCLUSION` | Constant<br>`1 << 15` | Condition<br>Has occlusion strength | Shader effect<br>ORM/separate occlusion with strength factor |
| Flag<br>`PBR_HAS_SPECULAR_AA` | Constant<br>`1 << 17` | Condition<br>Specular anti-aliasing | Shader effect<br>Geometric AA roughness adjustment |
| Flag<br>`PBR_HAS_CLEARCOAT` | Constant<br>`1 << 20` | Condition<br>Clearcoat layer enabled | Shader effect<br>Clearcoat BRDF + energy conservation |
| Flag<br>`PBR_HAS_EMISSIVE_COLOR` | Constant<br>`1 << 21` | Condition<br>Non-zero emissive uniform | Shader effect<br>Emissive color uniform contribution |
| Flag<br>`PBR_HAS_SHEEN` | Constant<br>`1 << 22` | Condition<br>Sheen layer enabled | Shader effect<br>Sheen BRDF (Charlie NDF + Ashikhmin visibility) |
| Flag<br>`PBR_HAS_SHEEN_TEXTURE` | Constant<br>`1 << 23` | Condition<br>Sheen has texture | Shader effect<br>Sheen texture sampling |
| Flag<br>Lightmap gate (local) | Constant<br>`1 << 24` | Condition<br>Opt-in lightmap texture | Shader effect<br>Lightmap fragment and cache variant |
| Flag<br>`PBR_HAS_GAMMA_ALBEDO` | Constant<br>`1 << 25` | Condition<br>Base color in gamma space | Shader effect<br>Gamma-to-linear decode |
| Flag<br>`PBR_HAS_ANISOTROPY` | Constant<br>`1 << 26` | Condition<br>Anisotropy enabled | Shader effect<br>Anisotropic specular BRDF |
| Flag<br>`PBR_HAS_SUBSURFACE` | Constant<br>`1 << 27` | Condition<br>Subsurface enabled | Shader effect<br>Translucency / scattering / volume feature root |
| Flag<br>`PBR_HAS_THICKNESS_MAP` | Constant<br>`1 << 28` | Condition<br>Thickness texture present | Shader effect<br>Thickness texture sampling |
| Flag<br>`PBR_HAS_SKYBOX` | Constant<br>`1 << 29` | Condition<br>PBR skybox mode | Shader effect<br>Direct environment lookup |
| Flag<br>`PBR_HAS_SHEEN_ALBEDO_SCALING` | Constant<br>`1 << 30` | Condition<br>Sheen albedo scaling enabled | Shader effect<br>Energy compensation for sheen |

Mesh/pass feature bits live in `mesh-features.ts` (`MSH_HAS_SKELETON`, `MSH_HAS_MORPH_TARGETS`, `MSH_HAS_THIN_INSTANCES`, `MSH_HAS_INSTANCE_COLOR`, `MSH_HAS_VERTEX_COLOR`, `MSH_HAS_UV2`, `MSH_RECEIVE_SHADOWS`). Do not duplicate a mesh feature as `PBR_HAS_*` or `PBR2_HAS_*`; the mesh flag takes precedence.

Extended `features2` bits carry overflow and pass-specific features, including clearcoat texture bits, transmission/volume, unlit, UV transform, occlusion-on-UV2 material intent (`PBR2_HAS_UV2` gated by `MSH_HAS_UV2`), linear image processing for refraction, and `PBR2_NO_COLOR_OUTPUT` for no-color material views. Extension-local bit 29 selects UV2 specifically for lightmaps (alongside shared `PBR2_HAS_UV2`); the sheen roughness-texture selector moves to bit 31 to keep the gates independent.

Light type bits are also shifted into the feature mask via `getLightTypeFeatureBits()` (hemispheric=1, directional=2, point=3).

Base color + ORM textures are always present (core PBR workflow).

PBR caches are two-tiered: sig-independent shader bindings are cached per the inline key string `${features}:${features2}:${meshFeatures}:${sceneFeatures}:${shaderKey}`, where `shaderKey` includes tone-mapping identity and the material-plugin index; geometry-output composition and per-view resources also include the plugin index. Each binding then caches sig-specific pipelines per `targetSignatureKey(sig)` (format, depth format, sample count, Y-flip).

## Public API Surface

### Material Props (`pbr-material.ts`)

```typescript
import type { Texture2D } from "../../texture/texture-2d.js";
import type { MeshGroupBuilder } from "../../render/renderable.js";

/** Clearcoat layer properties. */
export interface ClearCoatProps {
    isEnabled?: boolean;
    intensity?: number;
    roughness?: number;
    indexOfRefraction?: number;
    texture?: Texture2D;
    roughnessTexture?: Texture2D;
    bumpTexture?: Texture2D;
    bumpTextureScale?: number;
    useF0Remap?: boolean;
}

/** Sheen layer properties. */
export interface SheenProps {
    isEnabled: boolean;
    color?: [number, number, number];
    roughness?: number;
    intensity?: number;
    texture?: Texture2D;
    albedoScaling?: boolean;
}

export interface AnisotropyProps {
    isEnabled: boolean;
    intensity?: number;
    direction?: [number, number];
}

export interface TranslucencyProps {
    intensity?: number;
    color?: [number, number, number];
    diffusionDistance?: [number, number, number];
}

export interface ScatteringProps {
    diffusionDistance?: [number, number, number];
    metersPerUnit?: number;
}

export interface ThicknessProps {
    texture?: Texture2D;
    useGlTFChannel?: boolean;
    min?: number;
    max?: number;
}

export interface RefractionProps {
    intensity?: number;
    texture?: Texture2D;
    indexOfRefraction?: number;
    useThicknessAsDepth?: boolean;
}

export interface TintProps {
    color?: [number, number, number];
    atDistance?: number;
}

export interface SubSurfaceProps {
    translucency?: TranslucencyProps;
    scattering?: ScatteringProps;
    thickness?: ThicknessProps;
    tint?: TintProps;
    refraction?: RefractionProps;
}

/** User-facing PBR material properties. */
export interface PbrMaterialProps extends Material {
    baseColorTexture?: Texture2D;
    normalTexture?: Texture2D;
    normalTextureScale?: number;
    /** Occlusion-Roughness-Metallic packed: R=occ, G=rough, B=metal. */
    ormTexture?: Texture2D;
    emissiveTexture?: Texture2D;
    specGlossTexture?: Texture2D;
    metallicReflectanceTexture?: Texture2D;
    reflectanceTexture?: Texture2D;
    /** @internal Set via `setPbrEmissive()` — direct assignment skips extension registration. */
    _emissiveColor?: [number, number, number];
    doubleSided?: boolean;
    alpha?: number;
    alphaBlend?: boolean;
    alphaCutOff?: number;
    environmentIntensity?: number;
    directIntensity?: number;
    usePhysicalLightFalloff?: boolean;
    reflectance?: number;
    metallicFactor?: number;
    roughnessFactor?: number;
    occlusionStrength?: number;
    occlusionTexCoord?: number;
    occlusionTexture?: Texture2D;
    metallicF0Factor?: number;
    metallicReflectanceColor?: [number, number, number];
    useOnlyMetallicFromMetallicReflectanceTexture?: boolean;
    enableSpecularAA?: boolean;
    gammaAlbedo?: boolean;
    clearCoat?: ClearCoatProps;
    sheen?: SheenProps;
    anisotropy?: AnisotropyProps;
    subsurface?: SubSurfaceProps;
    transmissive?: boolean;
    skyboxMode?: boolean;
    unlit?: boolean;
    unlitColor?: [number, number, number];
}

/** Create a PbrMaterialProps with optional overrides. */
export function createPbrMaterial(props?: Partial<PbrMaterialProps>): PbrMaterialProps;

/** MeshGroupBuilder that dynamically imports pbr-renderable.js. */
export const pbrGroupBuilder: MeshGroupBuilder;

/** Collect all non-null textures for acquire/release tracking. */
export function collectPbrBoundTextures(mat: PbrMaterialProps): Texture2D[];

/** Create a pass-specific no-color material view over a PBR source material. */
export function createPbrNoColorMaterialView(source: PbrMaterialProps): MaterialView;
```

Usage:

```typescript
// Manual creation
const mat = createPbrMaterial({
    baseColorTexture: await loadTexture2D(engine, "albedo.png"),
    normalTexture: await loadTexture2D(engine, "normal.png"),
    ormTexture: await loadTexture2D(engine, "orm.png"),
    clearCoat: { isEnabled: true, intensity: 1, roughness: 0.1 },
    sheen: { isEnabled: true, color: [1, 1, 1], roughness: 0.5 },
});

// From glTF (automatic — loadGltf() builds PbrMaterialProps internally)
addToScene(scene, await loadGltf(engine, "model.glb"));
```

### Material Views and Rebuild

PBR renderables accept `MaterialOrView`. A plain material computes/stores `_renderFeatures = _computePbrMaterialFeatures(mat)`. A view uses `view._renderFeatures` exactly while reading all uniform/texture state from `view.source`.

`createPbrNoColorMaterialView(source)` creates a view that clears `PBR_HAS_ALPHA_BLEND` and sets `PBR2_NO_COLOR_OUTPUT`. This produces a no-color PBR pipeline suitable for passes that should execute the fragment stage without writing color, while retaining the source material's geometry-relevant state and textures.

The `rebuildSingle` closure returned from `buildPbrRenderables()` is stored on `pbrGroupBuilder._rebuildSingle`. It is used by material swaps, `rebuildMaterial()`, and `RenderTask.addMesh(mesh, { material })` per-pass overrides.

### Pipeline (`pbr-pipeline.ts`)

```typescript
/** Compute PBR feature bitmask from mesh/material/scene capabilities. */
export function computePbrFeatures(...): number;

/** Get or create sig-independent PBR shader bindings. */
export function getOrCreatePbrBindings(
  engine: EngineContextInternal, features: number, features2: number,
  meshFeatures: number, sceneFeatures: number,
  composed: ComposedShader, shaderKey?: string,
): _PbrShaderBindings;

/** Get or create a cached PBR pipeline for a render-target signature. */
export function getOrCreatePbrPipeline(
  engine: EngineContextInternal, sig: RenderTargetSignature, bindings: _PbrShaderBindings,
): GPURenderPipeline;

/** Create per-mesh bind group (group 1) with textures matching the composed shader layout. */
export function createPbrMeshBindGroup(
  engine: EngineContextInternal, bindings: PbrShaderBindings, composed: ComposedShader,
  meshUBO: GPUBuffer, materialUBO: GPUBuffer, material: PbrMaterialProps,
  env: EnvironmentTextures | null,
  meshCtx: { skeleton?: { boneTexture: GPUTexture } | null; morphTargets?: { texture: GPUTexture; weightsBuffer?: GPUBuffer } | null } | null,
): GPUBindGroup;

export function clearPbrPipelineCache(): void;
```

### Template (`pbr-template.ts`)

```typescript
/** Full configuration for PBR template generation. */
export interface PbrTemplateConfig {
    // Light configuration
    _hasSingleLight?: boolean;
    _hasMultiLight?: boolean;
    _singleLightWGSL?: string;
    _singleLightBlock?: string;
    _multiLightWGSL?: string;
    _multiLightLoop?: string;
    // Feature booleans
    _normalMode?: "tangent" | "cotangent" | "none";
    _hasEmissiveTexture?: boolean;
    _hasSpecGloss?: boolean;
    _hasDoubleSided?: boolean;
    _hasTonemap?: boolean;
    _acesHelpers?: string;
    _acesTonemapCall?: string;
    _hasAlphaBlend?: boolean;
    _hasSpecularAA?: boolean;
    _hasGammaAlbedo?: boolean;
    _hasMorph?: boolean;
    _hasOcclusion?: boolean;
    _hasEmissiveColor?: boolean;
    _hasReflectanceExt?: boolean;
    _hasIbl?: boolean;
    _hasAnisotropy?: boolean;
    _anisoBrdfFunctions?: string;
    _anisoTBBlock?: string;
    _ext?: PbrTemplateExt;
    _noColorOutput?: boolean;
    _esmShadowOutput?: boolean;
    _esmShadowDepthCode?: string;
}

/** Create a ShaderTemplate from PBR configuration. */
export function createPbrTemplate(config: PbrTemplateConfig): ShaderTemplate;
```

### Renderable Builder (`pbr-renderable.ts`)

```typescript
/** Build PBR renderables from mesh data. */
export function buildPbrRenderables(
  scene: SceneContext, meshes: Mesh[], envTextures: EnvironmentTextures | undefined,
): Promise<MeshGroupBuildResult>;

/** Internal helper used by the captured single-mesh rebuild closure. */
export function _createPbrMeshUBO(...): GPUBuffer;
```

## Fragment Modules

All fragments live in `src/material/pbr/fragments/` and export factory functions returning `ShaderFragment` objects.

### `ibl-fragment.ts` — IBL Environment Lighting

- **Factory**: `createIblFragment(hasNormalMap: boolean): ShaderFragment`
- **ID**: `"ibl"`
- **Bindings**: `brdfLUT` (texture2D), `brdfSampler_` (sampler), `iblTexture` (cube texture), `iblSampler` (sampler)
- **Helper WGSL**: `environmentHorizonOcclusion()`, `getEnergyConservationFactor()`, `rotateY()`
- **Fragment slots**:

  - `AI` — full IBL computation: reflected vector, BRDF LUT sampling, specular radiance, SH irradiance, horizon occlusion, energy conservation
  - `BA` — luminance-over-alpha accumulation for alpha blending

### `local-cubemap-fragment.ts` — Per-material and bounded local IBL (opt-in)

- **Opt-in/init**: call `await enablePbrLocalCubemap({ maxCandidates })` before loading any DDS or
HDR environment that will be used as a probe, creating probe sets, or registering the scene.
`maxCandidates` defaults to 4, accepts 1–12, and is fixed after the first call.
- **Zero-cost default**: state, WGSL, resource packing, and binding logic are reachable only from
`enable-pbr-local-cubemap.ts` and its dynamic fragment import. Ordinary PBR materials retain the
existing IBL shader and bindings.
- **Public assignments**:

  - `setPbrEnvironment(material, environment)` selects one material-specific cubemap without
    parallax correction.
  - `setPbrLocalEnvironment(material, environment, options)` selects one box- or sphere-projected
    cubemap. `capturePosition` may differ from `projectionPosition`; it defaults to the projection
    centre for backward compatibility.
  - `setPbrLocalEnvironmentProbeSet(material, set)` selects fragment-weighted local probes.
  - `clearPbrLocalEnvironment(material)` removes any of these private opt-in assignments.
- **Binding lifecycle**: configure assignments before `registerScene()`. After renderables exist,
call `rebuildMaterial(scene, material)` after changing or clearing an assignment.
- **Material views**: local-environment state is resolved through a view's source material, so
geometry and other pass views compose, write, and bind the same assignment without copying it.
- **Pass variants**: no-color, ESM-shadow, and skybox variants intentionally skip local-IBL
rewriting because they do not contain the ordinary shaded-IBL targets. A scene environment, when
present, continues to serve those variants through their existing paths.
- **Layered IBL**: a local environment counts as active IBL even when the scene has no global
environment. Clearcoat, sheen, subsurface, unlit, and alpha-luminance composition therefore use
the same local cubemap or blended probe radiance as the base PBR layer.
- **Device replacement**: probe-set textures, uniform/storage buffers, views, samplers, and dummy
bindings are recreated lazily when the engine acquires a replacement GPU device. Source
`EnvironmentTextures` must already refer to resources recovered for that device.
- **Feature variant**: primary PBR bit 31 gates one local-environment fragment. A material UBO mode
selects unprojected, box, sphere, or probe-array behavior at runtime, avoiding collisions with
lightmap and sheen feature bits while keeping the implementation out of non-opted bundles.
- **Single local environment**: the assigned environment supplies prefiltered specular radiance,
BRDF LUT, diffuse spherical harmonics, and LOD scale. Finite projection intersects the reflected
ray with the authored box or sphere, then samples the cubemap using the vector from the independent
capture position to that hit point.
- **Probe-set diffuse lighting**: arrays replace specular radiance. Diffuse irradiance uses the
scene spherical harmonics when a scene environment exists; otherwise it uses the first probe's
spherical harmonics. Probe irradiance is intentionally not blended.
- **Probe array**: `createPbrLocalEnvironmentProbeSet()` copies every probe into one
`texture_cube_array<f32>`. Sources share a format and have power-of-two-related square dimensions.
The destination uses the smallest dimension; larger sources contribute matching lower mips, so
no resampling pass is required. The array uses the engine's deduplicated trilinear sampler rather
than depending on any source environment's sampler identity. Source cubemaps must include
`COPY_SRC` usage. The built-in `.env` loader always includes it; DDS and HDR loaders include it
only for environments loaded after `enablePbrLocalCubemap()` is called. Environments loaded earlier
must be reloaded, and unsupported custom environments are rejected synchronously with the same
ordering requirement in the error.
- **Shared probe UBO**: each probe occupies seven `vec4`s: projection centre/layer,
projection half-size/LOD scale, capture position/LOD bias, inner influence centre/yaw cosine,
inner half-size/yaw sine, outer influence centre, and outer half-size/packed metadata. The last
word stores RGB8 debug color plus the sphere flag. The WebGPU-guaranteed 64 KiB uniform binding
therefore holds 585 probes after the fixed header.
- **Independent influence centres**: `influencePosition` centres the inner full-weight volume.
Box probes may set `influenceOuterPosition` independently; it defaults to the inner centre.
Validation transforms their offset into the probe's yaw-local frame and requires the inner box
to remain fully contained by the outer box.
- **World-space voxel lookup**: each set owns one dense read-only storage buffer. Its header stores
grid minimum, reciprocal cell size, dimensions, and fixed cell stride; each cell stores a count
followed by up to `maxCandidates` probe indices. CPU voxelization uses the outer centre and exact
yaw-oriented box/AABB or sphere/AABB tests. Overflow throws instead of discarding probes, and
empty cells receive the deterministic nearest probe at the cell centre.
- **Asymmetric box influence**: fragments rotate `worldPos - influencePosition` into probe-local
space. For each axis, the fade span toward the negative or positive outer boundary incorporates
the signed offset between the inner and outer centres. The box NDF is the maximum axis value;
spheres use `(distance - innerRadius) / (outerRadius - innerRadius)`. Inner hits receive full
weight, one outer hit receives full weight, overlapping outer hits use normalized blend-map
weights, and points outside every outer volume sample the smallest unbounded NDF candidate.
- **Limits**: the cube-array count is additionally limited by `maxTextureArrayLayers / 6`; the
dense grid must fit `maxBufferSize` and `maxStorageBufferBindingSize`. Grid dimensions and byte
size are checked before allocating per-cell CPU arrays. Probe-set creation locks the current
`maxCandidates` before measuring the grid, so a custom value must be configured first with
`enablePbrLocalCubemap({ maxCandidates })`; overflowing cells always throw instead of truncating.
- **Diagnostics**: `setPbrLocalEnvironmentProbeDebug(set, true)` preserves production influence
calculations but replaces cubemap samples and final PBR output with weighted packed probe colors.
- **Coverage**: Scene 186 compares per-material unprojected environments, hard finite projection,
and blended probes, including influence debug visualization. It sets `skipParity` because
Babylon.js has no equivalent fragment-weighted local cube-array blending feature.
- **References**:

  - Shadertoy reference implementation: < [https://www.shadertoy.com/view/DtlBWn](https://www.shadertoy.com/view/DtlBWn) >
  - Sébastien Lagarde, _Local Image-based Lighting with Parallax-Corrected Cubemaps_:
    < [https://dl.acm.org/doi/10.1145/2343045.2343094](https://dl.acm.org/doi/10.1145/2343045.2343094) >

### `clearcoat-fragment.ts` — Clearcoat Layer

- **Factory**: `createClearcoatFragment(hasIbl: boolean, hasReflectance?: boolean): ShaderFragment`
- **ID**: `"clearcoat"`
- **Dependencies**: `["ibl"]` when `hasIbl`, `["reflectance"]` when `hasReflectance`
- **Helper WGSL**: `visibility_Kelemen()`, `getR0RemappedForClearCoat()`
- **Fragment slots**:

  - `MF` — remaps base F0 using clearcoat IOR/refraction params from `mesh.ccParams` / `mesh.ccRefractionParams`
  - `BL` — initializes direct clearcoat attenuation/specular variables
  - `AD` — direct clearcoat BRDF (GGX NDF + Kelemen visibility + Fresnel)
  - `AI` (IBL path) — samples IBL for clearcoat environment reflection, applies Jones-style energy conservation
  - `NI` (non-IBL path) — non-IBL clearcoat energy conservation

### `sheen-fragment.ts` — Sheen Layer

- **Factory**: `createSheenFragment(hasSheenTexture: boolean, hasIbl?: boolean): ShaderFragment`
- **ID**: `"sheen"`
- **Dependencies**: `["ibl"]` when `hasIbl`
- **Helper WGSL**: `normalDistributionFunction_CharlieSheen()`, `visibility_Ashikhmin()`
- **Fragment slots**:

  - `SV` — initializes sheen local vars (`sheenDirectTerm`, `sheenIblTerm`, `sheenAlbedoScaling`, `sheenColorFinal`, `sheenRoughnessAdjusted`); optionally samples sheen texture
  - `AD` — direct sheen specular term via Charlie NDF + Ashikhmin visibility
  - `AI` (IBL path) — IBL sheen reflection from `iblTexture` and `brdfLUT`
  - `NI` (non-IBL path) — direct sheen only

### `reflectance-fragment.ts` — Metallic Reflectance Extension

- **Factory**: `createReflectanceFragment(hasMetallicReflectanceMap: boolean, hasReflectanceMap: boolean, useAlphaOnlyMR: boolean): ShaderFragment`
- **ID**: `"reflectance"`
- **Bindings**: conditionally `metallicReflectanceMap` \+ sampler, `reflectanceMap` \+ sampler
- **Fragment slots**:

  - `MF` — computes `mrFactors`, dielectric F0, surface reflectivity, `colorF0`/`colorF90`, surface albedo
  - `AT` — computes occlusion from ORM with `mesh.occlusionStrength`

### `emissive-fragment.ts` — Emissive Color Uniform

- **Factory**: `createEmissiveColorFragment(hasEmissiveTexture: boolean): ShaderFragment`
- **ID**: `"emissive-color"`
- **Fragment slots**:

  - `AT` — sets `emissive` from `mesh.emissiveColor`, optionally multiplied by emissive texture sample

### `lightmap-fragment.ts` — Baked Lightmap (opt-in)

- **Public API**: call `await enablePbrLightmap()` before `registerScene()`, then assign the texture with `setPbrLightmap(material, texture, options)`.
- **Tree shaking**: the enable call dynamically imports and registers the fragment. The always-loaded PBR renderable never scans for lightmaps, so scenes that do not opt in retain no lightmap implementation.
- **Feature variants**: primary bit 24 gates lightmap presence, extended bit 29 selects lightmap UV2, and primary bits 16/18/19 select shadowmap composition, gamma decode, and effective V flip. Clustered point/spot lighting retains primary bits 13/14. The lightmap-local bits participate in the normal PBR shader cache key without overlapping those lighting gates.
- **UV selection**: `setPbrLightmap()` owns bit 64 of `_uv2Mask`; this reuses the existing TEXCOORD\_1 attribute/varying path while preserving all other channel claims.
- **UBO and bindings**: contributes `lmLvl`, `lmTexture`, and `lmSampler`.
- **Composition**: the `NI` slot adds the decoded sample by default or multiplies the lit result while preserving emissive for `useLightmapAsShadowmap`. Dependencies keep it after unlit, sheen, refraction, and subsurface final-color reconstruction.
- **Orientation**: the V-flip variant is `texture.invertY XOR (texture.uAng === Math.PI)`, matching the Standard texture path for upload-flipped and codec-decoded textures.
- **Coverage**: `pbr-lightmap.test.ts` covers feature detection, UV fallback, composition order, UBO/bindings, and texture enumeration; Scene 167 covers UV1/UV2, additive/shadowmap, gamma decode, and V-flip parity.

### `morph-fragment.ts` — Morph Targets

- **Factory**: `createMorphFragment(): ShaderFragment`
- **ID**: `"morph"`
- **Vertex builtins**: `vertex_index` (`u32`)
- **Vertex bindings**: `morphTargets` (texture2D, unfilterable), `morph` (uniform buffer with weights/count/texWidth/rowsPerBand)
- **Vertex slots**:

  - `VR` — loops over morph targets, accumulates position/normal deltas from morph texture

### `skeleton-fragment.ts` — Skeletal Animation

- **Factory**: `createSkeletonFragment(has8Bones: boolean): ShaderFragment`
- **ID**: `"skeleton"`
- **Vertex attributes**: `joints`, `weights` (\+ `joints1`, `weights1` for 8-bone)
- **Vertex bindings**: `boneSampler` (texture2D, unfilterable)
- **Helper WGSL**: `readMatrixFromRawSampler()`
- **Vertex slots**:

  - `VW` — reads bone matrices, blends 4 or 8 bone influences, sets `finalWorld = mesh.world * influence`

### `pbr-shadow-fragment.ts` — Shadow Receiving

- **Factory**: `createPbrShadowFragment(shadowLights: PbrShadowLightSlot[]): ShaderFragment`
- **ID**: `"pbr-shadow"`
- **Interface**: `PbrShadowLightSlot { lightIndex: number; shadowType: "esm" | "pcf" }`
- **Varyings**: per-light `vPosFromLight_<n>` (`vec4<f32>`), `vDepthMetric_<n>` (`f32`)
- **Bindings**: per-light shadow textures + samplers + `shadowInfo_<n>` uniform buffers (group `"shadow"`)
- **Vertex slots**:

  - `VB` — transforms world position into light space, computes depth metric
- **Fragment slots**:

  - `AD` — computes per-light shadow factor via ESM or PCF, writes `shadowFactors[lightIndex]`
- Supports both ESM (`computeShadowESM_<n>`) and PCF (`computeShadowPCF_<n>`) shadow modes per light.

## PBR Light WGSL

PBR lighting consumes the shared `render/lights-ubo.ts` buffer. Light code is still dynamically imported so scenes only fetch the shader helper they need:

| Helper | Loaded when | Exports |
| --- | --- | --- |
| Helper<br>`fragments/singlelight-wgsl.ts` | Loaded when<br>Exactly one scene light and no shadow receivers | Exports<br>`SINGLE_LIGHT_STRUCTS`, `getSingleLightBlock(lightType)` |
| Helper<br>`fragments/multilight-wgsl.ts` | Loaded when<br>More than one light, or any shadow receiver | Exports<br>`MULTI_LIGHT_STRUCTS()`, `COMPUTE_PBR_LIGHT`, `getMultiLightLoop()` |

The single-light helper emits specialized, non-looping WGSL for hemispheric, directional, point, or spot lights and reads the mesh-selected light index. The multi-light helper emits `computePbrLight()` plus a loop over the mesh-selected light indices; it also exposes first-light aliases for direct-light fragments (`clearcoat`, `sheen`, `subsurface`) and supports shadow factors written by `pbr-shadow-fragment.ts`.

`usePhysicalLightFalloff` defaults to `true`, matching Babylon.js PBR's physical inverse-square point/spot falloff. When set to `false`, point and spot lights use Babylon's Standard-style falloff: linear range attenuation and spot cone exponent attenuation. Scene 22 uses this path to mirror `PBRMaterial.usePhysicalLightFalloff = false` in the Babylon.js reference.

## Pipeline Configuration

### Vertex Buffers (varies by features)

Base vertex buffers are defined by the template. Fragment modules add additional attributes:

**Base (always present):**

| Slot | Attribute | Format | Stride | Shader Location |
| --- | --- | --- | --- | --- |
| Slot<br>0 | Attribute<br>Position | Format<br>`float32x3` | Stride<br>12 bytes | Shader Location<br>`@location(0)` |
| Slot<br>1 | Attribute<br>Normal | Format<br>`float32x3` | Stride<br>12 bytes | Shader Location<br>`@location(1)` |
| Slot<br>2 | Attribute<br>UV | Format<br>`float32x2` | Stride<br>8 bytes | Shader Location<br>`@location(2)` |

**Conditional (appended by template or fragments, location indices assigned by composer):**

| Attribute | Source | When |
| --- | --- | --- |
| Attribute<br>Tangent (`float32x4`) | Source<br>Template | When<br>`PBR_HAS_NORMAL_MAP` (tangent mode) |
| Attribute<br>Joints (`uint16x4`) \+ Weights (`float32x4`) | Source<br>`skeleton-fragment` | When<br>`MSH_HAS_SKELETON` |
| Attribute<br>Joints1 + Weights1 | Source<br>`skeleton-fragment` | When<br>`MSH_HAS_SKELETON_8` |
| Attribute<br>Instance matrix (4× `float32x4`) | Source<br>`thin-instance-fragment` | When<br>`MSH_HAS_THIN_INSTANCES` |
| Attribute<br>Instance color (`float32x4`) | Source<br>`thin-instance-fragment` | When<br>`MSH_HAS_INSTANCE_COLOR` |

### Pipeline State

| Setting | Value |
| --- | --- |
| Setting<br>Topology | Value<br>`triangle-list` |
| Setting<br>Cull mode | Value<br>`back` (or `none` if `PBR_HAS_DOUBLE_SIDED`) |
| Setting<br>Front face | Value<br>`ccw` |
| Setting<br>Depth format | Value<br>`depth24plus-stencil8` |
| Setting<br>Depth compare | Value<br>`greater-equal` |
| Setting<br>Depth write | Value<br>`true` (disabled for alpha-blend variants) |
| Setting<br>MSAA | Value<br>`count = msaaSamples` (4) |
| Setting<br>Color target | Value<br>Canvas preferred format, alpha blend if `PBR_HAS_ALPHA_BLEND` |

### Bind Group Layouts

**Group 0 — Scene Uniforms** (shared across all materials):

| Binding | Visibility | Type |
| --- | --- | --- |
| Binding<br>0 | Visibility<br>VERTEX \| FRAGMENT | Type<br>Uniform buffer (size varies with features) |

**Group 1 — PBR Mesh** (dynamic, binding indices assigned by `ShaderComposer`):

Binding 0 is always the mesh UBO (VERTEX+FRAGMENT). Subsequent bindings are assigned sequentially by the composer based on which fragments are active. The order follows fragment topological sort:

- Mesh UBO — always (binding 0)
- Morph target texture + UBO — if `MSH_HAS_MORPH_TARGETS`
- Bone sampler texture — if `MSH_HAS_SKELETON`
- Base color texture + sampler — always
- Normal texture + sampler — if `PBR_HAS_NORMAL_MAP`
- ORM texture + sampler — always (or specGloss texture)
- Emissive texture + sampler — if `PBR_HAS_EMISSIVE`
- BRDF LUT + sampler + IBL cubemap + sampler — if `PBR_HAS_ENV`
- Reflectance maps + samplers — if reflectance extension
- Sheen texture + sampler — if `PBR_HAS_SHEEN_TEXTURE`
- Lightmap texture + sampler — if the opt-in PBR lightmap extension is active

**Group 2 — Shadow** (only when `MSH_RECEIVE_SHADOWS`):

Per-light shadow info UBOs, shadow textures, and shadow samplers.

## `_buildGroup` Pattern

`pbr-material.ts` exports `pbrGroupBuilder`, a `MeshGroupBuilder` function that dynamically imports `pbr-renderable.js` at build time. This function is set as the `_buildGroup` field on every PBR material created by `createPbrMaterial()`. At `startEngine()`, `scene.ts` calls each mesh's `material._buildGroup`, grouping meshes by builder identity so that all PBR meshes are batched together for a single `buildPbrRenderables()` call.

The builder stores the returned `rebuildSingle` closure on `pbrGroupBuilder._rebuildSingle`. The closure is captured inside `pbr-renderable.ts`, reuses the initial per-scene caches, and rebuilds one mesh for material swaps, `rebuildMaterial()`, and per-pass `RenderTask.addMesh(mesh, { material })` overrides.

## Visible Environment Skybox Opt-Ins

Visible HDR and DDS skyboxes each have one canonical renderable builder:

- `buildHdrSkyboxRenderable`
- `buildDdsSkyboxRenderable`

The builders patch their fragment shader from a fixed core when an optional environment feature is enabled. They never select or import alternate renderable builders.

Two public scene setters provide independent opt-ins:

```ts
setEnvironmentBlur(scene: SceneContext, blur: number): void;
setEnvironmentRotation(scene: SceneContext, rotation: number): void;
```

Each setter registers one feature-owned patch loader in an ordered composition slot with a feature-agnostic composer stored on that scene. Rotation therefore always applies before blur regardless of setter call order. Configuring one scene cannot activate a feature for another scene.

The canonical builders contain only one optional call to the scene-local composer. They do not import the composer or either feature patch, keeping non-feature skybox consumers at the canonical-builder baseline. This follows the PBR/Standard extension principle without a global registry: generic composition is retained only by consumers that import an environment feature setter.

The core skybox shader has two composition slots:

| Slot | Default | Optional contribution |
| --- | --- | --- |
| Slot<br>Direction | Default<br>Normalized cube direction | Optional contribution<br>`setEnvironmentRotation` rotates the sampling direction around Y using the `envRotationY` scene uniform |
| Slot<br>LOD | Default<br>Mip level `0.0` | Optional contribution<br>`setEnvironmentBlur` computes a clamped fractional cubemap LOD from blur, cubemap size, scale, and offset |

Blur and rotation patches are separate modules. Importing one setter does not retain the other patch. The rotation registration loads its patch only when the scene-local composer first runs during visible-skybox construction, while the blur registration resolves its statically imported patch. Lighting-only consumers do not fetch the rotation patch.

The first call to either setter must occur before the visible skybox is built so its shader variant includes the corresponding patch. Subsequent calls update scene-uniform data and take effect without rebuilding the skybox.

## Internal Architecture

### Scene Uniform Buffer Layout (Group 0, Binding 0)

PBR uses the canonical `SceneUniforms` shared with Standard/material-independent passes. The struct is fixed-size (`SCENE_UBO_BYTES = 352`) and is declared in `packages/babylon-lite/shaders/scene-uniforms.wgsl`. It contains view/projection matrices, camera position, environment rotation, SH irradiance, image-processing fields, and fog fields.

The environment rotation slot remains in this fixed layout for alignment and shader compatibility, but the base scene packer and cache key do not read it. Rotation is setter-only: `setEnvironmentRotation` owns the internal scene value, lazy skybox-patch registration, contributor registration, and task-cache invalidation. Environment loaders register the same contributor for SH data, while glTF image-based lights may initialize the internal value from asset metadata.

Light data is **not** stored in `SceneUniforms`. PBR direct lighting reads the scene-owned `LightsUniforms` UBO at group 0 binding 1 when `_hasSingleLight` or `_hasMultiLight` is enabled.

### Mesh Uniform Buffer Layout (Group 1, Binding 0)

Base fields (always present):

| Offset (bytes) | Size | WGSL Type | Field |
| --- | --- | --- | --- |
| Offset (bytes)<br>0 | Size<br>64 | WGSL Type<br>`mat4x4<f32>` | Field<br>`world` |
| Offset (bytes)<br>64 | Size<br>4 | WGSL Type<br>`u32` | Field<br>`lc` |
| Offset (bytes)<br>80.. | Size<br>`ceil(MAX_LIGHTS / 4) × 16` | WGSL Type<br>`array<vec4<u32>, ceil(MAX_LIGHTS / 4)>` | Field<br>packed light indices into group-0 `LightsUniforms` |

Additional fields appended by fragments:

| Field | Type | Fragment |
| --- | --- | --- |
| Field<br>`metallicReflectanceColor`, `metallicF0Factor`, `occlusionStrength` | Type<br>`vec3<f32>`, `f32`, `f32` | Fragment<br>`reflectance-fragment` |
| Field<br>`emissiveColor` | Type<br>`vec3<f32>` | Fragment<br>`emissive-fragment` |
| Field<br>`ccParams`, `ccRefractionParams` | Type<br>`vec4<f32>`, `vec4<f32>` | Fragment<br>`clearcoat-fragment` |
| Field<br>`sheenParams`, `sheenParams2` | Type<br>`vec4<f32>`, `vec4<f32>` | Fragment<br>`sheen-fragment` |

The exact layout is computed by `computeUboLayout()` from the merged UBO field list.

### Pipeline Caching

`getOrCreatePbrPipeline` keeps a per-`PbrShaderBindings``Map<targetSignatureKey(sig), GPURenderPipeline>`. Bind-group layouts are stable across signatures (only the pipeline depends on `sig`), so meshBGs validate against any pipeline produced for the same `(features, features2)` bindings instance.

### Shader Template (`pbr-template.ts`)

`createPbrTemplate(config)` builds a `ShaderTemplate` with:

- **Vertex template** — world transform, optional TBN (tangent or cotangent), UV passthrough, slot markers for morph (`/*VR*/`), skinning (`/*VW*/`), shadow (`/*VB*/`)
- **Fragment template** — texture sampling, BRDF functions (always included: GGX NDF, Smith-GGX geometry, Schlick Fresnel), optional specular AA, optional gamma decode, slot markers for material setup (`/*MF*/`, `/*SV*/`, `/*BL*/`), direct lighting (`/*AD*/`), IBL (`/*AI*/` or `/*NI*/`), post-effects (`/*AT*/`, `/*BC*/`, `/*BA*/`)
- **Base UBO fields** for the mesh light-selection data and **base bindings** for the always-present textures; direct lighting uses the fixed group-0 lights UBO

Supports both metallic-roughness and specular-glossiness workflows via `_hasSpecGloss`.

### Composed Shader Caching

`pbr-renderable.ts` maintains composed shader caches keyed by material features, extended features, mesh features, scene features, light mode, and shader variant key. The same captured composer is used by the `rebuildSingle` closure returned from the initial build.

### Renderable Builder (`pbr-renderable.ts`)

`buildPbrRenderables(scene, meshes, envTextures)`:

1. Dynamically imports only the fragment modules needed by the mesh set
2. Computes per-mesh affected light indices from scene lights
3. Creates composed shaders per feature bitmask and per-mesh light mode (no light, single-light fast path, or multi/shadow path)
4. Builds per-mesh mesh/material UBOs and bind groups; the mesh UBO stores `lc` and packed `li` scene-light indices
5. For each mesh: `computePbrFeatures()` → compose shader → `getOrCreatePbrPipeline()` → create mesh UBO → `createPbrMeshBindGroup()`
6. Returns one `Renderable` per mesh; each renderable binds target-specific `DrawBinding`s for frame-graph passes
7. Uses opaque order = 100 and transparent/transmissive order = 150; scene-texture refraction surfaces set `_transmissive` and bind against `RenderTargetSignature._transmissionTexture` during `record()`
8. Returns `rebuildSingle` so material swaps and per-pass material overrides can rebuild one mesh without rebuilding the whole scene
9. Sets up disposal to clear pipeline cache and samplers on scene teardown

### Single-Mesh Rebuild Closure

The `rebuildSingle(scene, mesh, materialOverride?)` closure returned from `buildPbrRenderables()` rebuilds one mesh after a material swap or pass-specific override without rebuilding the entire scene. It accepts `MaterialOrView`, uses view render features with source material resources, reuses captured per-scene fragment imports/composer caches/shadow caches/environment state, recomputes mesh features and light variants, creates/reuses shader bindings and pipelines, and returns a `Renderable` that early-exits if the mesh material changed again unless it was built for an explicit override.

## Shader Logic

### Vertex Shader (composed by template + fragments)

**Inputs**: position (`vec3`), normal (`vec3`), uv (`vec2`), optional tangent (`vec4`), optional joints/weights, optional instance matrix.

**Processing**:

1. `/*VR*/` — Morph target application (if `MSH_HAS_MORPH_TARGETS`): accumulates position/normal deltas from morph texture
2. `/*VW*/` — Skinning (if `MSH_HAS_SKELETON`): `finalWorld = mesh.world * boneInfluence`; otherwise `finalWorld = mesh.world`
3. `worldPos = finalWorld × vec4(position, 1.0)`
4. `clipPos = scene.viewProjection × worldPos`
5. `worldNormal = normalize((finalWorld × vec4(normalize(normal), 0)).xyz)`
6. If tangent normal map — compute TBN **in local space first** (critical for reflection matrices):









```javascript
N_local = normalize(normal)
T_local = normalize(tangent.xyz)
B_local = cross(N_local, T_local) * tangent.w
worldTangent = normalize((finalWorld × vec4(T_local, 0)).xyz)
worldBitangent = normalize((finalWorld × vec4(B_local, 0)).xyz)
```

7. `/*VB*/` — Shadow light-space transform (if `MSH_RECEIVE_SHADOWS`)

**Outputs**: `worldPos`, `worldNormal`, \[`worldTangent`, `worldBitangent`\], `uv`, optional shadow varyings.

### Fragment Shader (composed by template + fragments)

#### 1\. Texture Sampling (always)

```javascript
baseColor = textureSample(baseColorTexture, baseColorSampler, uv)
// Optional gamma decode when gammaAlbedo flag is set
occlusion = orm.r
roughness = clamp(orm.g, 0.04, 1.0)
metallic  = orm.b
```

#### 2\. Material Setup Slots

- `/*MF*/` — Reflectance F0 remap (reflectance-fragment), clearcoat IOR remap (clearcoat-fragment)
- `/*SV*/` — Sheen variable initialization (sheen-fragment)
- `/*BL*/` — Clearcoat variable initialization (clearcoat-fragment)

#### 3\. Normal Mapping

- Tangent mode (`PBR_HAS_NORMAL_MAP`): TBN matrix from interpolated tangent/bitangent
- Cotangent mode (`PBR_HAS_COTANGENT_NORMAL`): cotangent-frame reconstruction from screen-space derivatives
- Neither: `N = normalize(worldNormal)`, with front-face flip if double-sided

#### 4\. Emissive

- If `PBR_HAS_EMISSIVE`: `emissive = textureSample(emissiveTexture, ...).rgb`
- `/*AT*/` slot: `emissive-fragment` adds emissive color uniform contribution

#### 5\. Direct Lighting + `/*AD*/` Slot

BRDF evaluation (GGX NDF + Smith-GGX geometry + Schlick Fresnel) for the primary light, plus:

- Clearcoat direct BRDF (clearcoat-fragment `AD`)
- Sheen direct term (sheen-fragment `AD`)
- Shadow factor application (pbr-shadow-fragment `AD`)
- Single-light direct block when `_hasSingleLight` is enabled
- Multi-light loop when `_hasMultiLight` is enabled

#### 6\. Environment Lighting — `/*AI*/` or `/*NI*/` Slot

- `AI` (IBL path): SH irradiance, specular radiance via split-sum, BRDF LUT, energy conservation, horizon occlusion, clearcoat IBL, sheen IBL
- `NI` (non-IBL path): clearcoat/sheen non-IBL conservation

#### 7\. Final Composition — `/*BC*/` and `/*BA*/` Slots

- Emissive additive
- Lightmap contributions
- Alpha blend luminance accumulation (`BA`)

#### 8\. Image Processing (if `PBR_HAS_TONEMAP`)

- Exposure: `color *= exposureLinear`
- Tone mapping: `color = color / (1 + color)`
- Contrast adjustment
- Gamma: `pow(color, 1/2.2)`

## Babylon.js Equivalence Map

| Babylon Lite | Babylon.js |
| --- | --- |
| Babylon Lite<br>`computePbrFeatures()` | Babylon.js<br>Internal define flags in `PBRMaterial._getEffect()` |
| Babylon Lite<br>`getOrCreatePbrPipeline()` | Babylon.js<br>Pipeline cache in `PBRMaterial._getEffect()` |
| Babylon Lite<br>`createPbrTemplate()` \+ `composeShader()` | Babylon.js<br>GLSL shader generation from defines |
| Babylon Lite<br>`ShaderFragment` composition | Babylon.js<br>`#include` / `#define` preprocessor |
| Babylon Lite<br>Scene UBO (group 0) | Babylon.js<br>`Scene.sceneUbo` |
| Babylon Lite<br>Mesh UBO (group 1, binding 0) | Babylon.js<br>`Mesh._uniformBuffer` |
| Babylon Lite<br>`PBR_HAS_NORMAL_MAP` | Babylon.js<br>`#define BUMP` |
| Babylon Lite<br>`PBR_HAS_EMISSIVE` | Babylon.js<br>`#define EMISSIVE` |
| Babylon Lite<br>`PBR_HAS_ENV` | Babylon.js<br>`#define REFLECTION` \+ `#define SS_REFRACTION` |
| Babylon Lite<br>`PBR_HAS_CLEARCOAT` | Babylon.js<br>`#define CLEARCOAT` |
| Babylon Lite<br>`PBR_HAS_SHEEN` | Babylon.js<br>`#define SHEEN` |
| Babylon Lite<br>`MSH_HAS_SKELETON` | Babylon.js<br>`#define BONES` |
| Babylon Lite<br>`MSH_HAS_MORPH_TARGETS` | Babylon.js<br>`#define MORPHTARGETS` |
| Babylon Lite<br>`MSH_RECEIVE_SHADOWS` | Babylon.js<br>`#define SHADOW0` |
| Babylon Lite<br>`PBR_HAS_SPEC_GLOSS` | Babylon.js<br>`#define SPECULARGLOSSINESS` |
| Babylon Lite<br>`PBR_HAS_SPECULAR_AA` | Babylon.js<br>`#define SPECULARAA` |
| Babylon Lite<br>`rebuildSingle` closure | Babylon.js<br>`Material._markAllSubMeshesAsAllDirty()` |
| Babylon Lite<br>`singlelight-wgsl.ts` / `multilight-wgsl.ts` | Babylon.js<br>Direct-light setup/functions in `pbr.fragment.fx` |

## Dependencies

- **`pbr-material.ts`**: Imports `Texture2D` from texture-2d, `MeshGroupBuilder` from renderable.
- **`pbr-flags.ts`**: Pure PBR feature/ext constants and registry helpers. No light-extension dependency.
- **`pbr-template.ts`**: Imports `ShaderTemplate`, `UboField`, `VertexAttribute`, `Varying`, `BindingDecl` from fragment-types.
- **`pbr-pipeline.ts`**: Imports `PbrMaterialProps` from pbr-material, `ComposedShader` from shader-composer, feature flags from pbr-flags.
- **`pbr-renderable.ts`**: Imports pipeline functions, template creator, shader composer, fragment factories (dynamic), engine/scene/mesh/light types, material-view types, resource pool helpers, and returns the single-mesh rebuild closure.
- **`no-color-view.ts`**: Imports `createMaterialView` and PBR feature flags to create no-color material views without pulling the helper into ordinary PBR scenes.
- **`fragments/singlelight-wgsl.ts`**: No imports (pure WGSL string helpers).
- **`fragments/multilight-wgsl.ts`**: Imports `MAX_LIGHTS` to size the generated WGSL arrays.
- **Fragment modules**: Each imports only `ShaderFragment` (and optionally `BindingDecl`, `Varying`) from `fragment-types.js`.
- **Depended on by**: `load-gltf.ts` (imports `PbrMaterialProps`, `createPbrMaterial`), `background-renderable.ts` (reuses scene BGL/BG), `index.ts` (public exports).

## Test Specification

| Test | Description |
| --- | --- |
| Test<br>`pipeline cache hit` | Description<br>Same features+format+msaa → same pipeline object |
| Test<br>`pipeline cache miss on features` | Description<br>Different features → different pipeline |
| Test<br>`vertex buffers with tangent` | Description<br>HAS\_NORMAL\_MAP → tangent buffer in layout |
| Test<br>`vertex buffers without tangent` | Description<br>No HAS\_NORMAL\_MAP → no tangent buffer |
| Test<br>`composed shader with IBL` | Description<br>IBL fragment injects BRDF LUT + cubemap bindings |
| Test<br>`composed shader without IBL` | Description<br>Fragment omits IBL blocks, smaller output |
| Test<br>`clearcoat fragment integration` | Description<br>Clearcoat slots inject BRDF + energy conservation code |
| Test<br>`sheen fragment integration` | Description<br>Sheen slots inject Charlie NDF + Ashikhmin visibility |
| Test<br>`skeleton fragment` | Description<br>4-bone and 8-bone vertex attribute injection |
| Test<br>`morph fragment` | Description<br>Morph target texture binding + vertex slot code |
| Test<br>`shadow fragment ESM` | Description<br>ESM shadow factor computation per light |
| Test<br>`shadow fragment PCF` | Description<br>PCF shadow factor computation per light |
| Test<br>`single rebuild` | Description<br>Material swap rebuilds one mesh without full scene teardown |
| Test<br>`GGX NDF at roughness=0.5, NdotH=1` | Description<br>D = α⁴/(π) ≈ 0.001245 |
| Test<br>`Fresnel at cosθ=0` | Description<br>F = 1.0 (full reflection) |
| Test<br>`Image processing: exposure=1, contrast=1` | Description<br>Tone map only |

## File Manifest

| File | Size | Purpose |
| --- | --- | --- |
| File<br>`src/material/pbr/pbr-material.ts` | Size<br>~140 lines | Purpose<br>`PbrMaterialProps`, `ClearCoatProps`, `SheenProps` interfaces + `createPbrMaterial()` factory + `pbrGroupBuilder` \+ `collectPbrBoundTextures()` |
| File<br>`src/material/pbr/pbr-flags.ts` | Size<br>~43 lines | Purpose<br>Feature flag bit constants + PBR extension registry helpers |
| File<br>`src/material/pbr/pbr-template.ts` | Size<br>~465 lines | Purpose<br>`PbrTemplateConfig` \+ `createPbrTemplate()` — builds `ShaderTemplate` with BRDF helpers, slot markers, base UBO/bindings |
| File<br>`src/material/pbr/pbr-pipeline.ts` | Size<br>~284 lines | Purpose<br>`computePbrFeatures()`, `getOrCreatePbrPipeline()`, `createPbrMeshBindGroup()`, pipeline cache management |
| File<br>`src/material/pbr/pbr-renderable.ts` | Size<br>~723 lines | Purpose<br>`buildPbrRenderables()` — dynamic fragment import, shader composition, lights UBO setup, renderable creation, single-mesh rebuild closure |
| File<br>`src/material/pbr/no-color-view.ts` | Size<br>~18 lines | Purpose<br>`createPbrNoColorMaterialView()` — pass-specific no-color material view helper |
| File<br>`src/material/pbr/fragments/singlelight-wgsl.ts` | Size<br>~75 lines | Purpose<br>Lazy WGSL helpers for the non-looping one-light direct path |
| File<br>`src/material/pbr/fragments/multilight-wgsl.ts` | Size<br>~120 lines | Purpose<br>Lazy WGSL helpers: `MULTI_LIGHT_STRUCTS()`, `COMPUTE_PBR_LIGHT`, `getMultiLightLoop()` |
| File<br>`src/material/pbr/fragments/ibl-fragment.ts` | Size<br>~86 lines | Purpose<br>IBL environment lighting fragment (BRDF LUT, specular cubemap, SH irradiance) |
| File<br>`src/material/pbr/fragments/local-cubemap-fragment.ts` | Size<br>~600 lines | Purpose<br>Opt-in per-material environments, finite box/sphere projection, and fragment-weighted probe-array IBL |
| File<br>`src/material/pbr/enable-pbr-local-cubemap.ts` | Size<br>~500 lines | Purpose<br>Public local-environment API, validation, probe packing, cube-array creation, and voxel lookup |
| File<br>`src/material/pbr/fragments/clearcoat-fragment.ts` | Size<br>~122 lines | Purpose<br>Clearcoat layer fragment (Kelemen visibility, F0 remap, direct + IBL clearcoat) |
| File<br>`src/material/pbr/fragments/sheen-fragment.ts` | Size<br>~115 lines | Purpose<br>Sheen layer fragment (Charlie NDF, Ashikhmin visibility, direct + IBL sheen) |
| File<br>`src/material/pbr/fragments/reflectance-fragment.ts` | Size<br>~79 lines | Purpose<br>Metallic reflectance extension fragment (F0 computation, reflectance maps) |
| File<br>`src/material/pbr/fragments/emissive-fragment.ts` | Size<br>~29 lines | Purpose<br>Emissive color uniform fragment |
| File<br>`src/material/pbr/fragments/lightmap-fragment.ts` | Size<br>~140 lines | Purpose<br>Opt-in baked lightmap fragment (UV1/UV2, additive/shadowmap, gamma decode, effective V flip) |
| File<br>`src/material/pbr/enable-pbr-lightmap.ts` | Size<br>~70 lines | Purpose<br>Published `enablePbrLightmap()` / `setPbrLightmap()` opt-in seam |
| File<br>`src/material/pbr/fragments/morph-fragment.ts` | Size<br>~48 lines | Purpose<br>Morph target vertex animation fragment |
| File<br>`src/material/pbr/fragments/skeleton-fragment.ts` | Size<br>~71 lines | Purpose<br>Skeletal animation fragment (4-bone or 8-bone) |
| File<br>`src/material/pbr/fragments/pbr-shadow-fragment.ts` | Size<br>~143 lines | Purpose<br>PBR shadow receiving fragment (ESM + PCF, per-light) |
| File<br>`src/shader/shader-composer.ts` | Size<br>~293 lines | Purpose<br>`composeShader()` — topological sort, UBO merge, binding assignment, slot injection |

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