---
title: Feature Comparison
source: https://doc.babylonjs.com/lite/02-feature-comparison/
section: Guides
---

[API](https://doc.babylonjs.com/lite/typedoc/)

[Babylon Lite](https://doc.babylonjs.com/lite/)\|

[Feature Comparison](https://doc.babylonjs.com/lite/02-feature-comparison/)

…\|

[Babylon Lite](https://doc.babylonjs.com/lite/)\|

[Feature Comparison](https://doc.babylonjs.com/lite/02-feature-comparison/)

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


# Feature Comparison — Babylon Lite vs Babylon.js

### Table Of Contents

[Feature Comparison — Babylon Lite vs Babylon.js](https://doc.babylonjs.com/lite/02-feature-comparison/#feature-comparison--babylon-lite-vs-babylonjs) [Legend](https://doc.babylonjs.com/lite/02-feature-comparison/#legend) [Rendering API](https://doc.babylonjs.com/lite/02-feature-comparison/#rendering-api) [Materials](https://doc.babylonjs.com/lite/02-feature-comparison/#materials) [Lights](https://doc.babylonjs.com/lite/02-feature-comparison/#lights) [Cameras](https://doc.babylonjs.com/lite/02-feature-comparison/#cameras) [Mesh & Geometry](https://doc.babylonjs.com/lite/02-feature-comparison/#mesh--geometry) [Skeleton & Animation](https://doc.babylonjs.com/lite/02-feature-comparison/#skeleton--animation) [Environment & IBL](https://doc.babylonjs.com/lite/02-feature-comparison/#environment--ibl) [Shadows](https://doc.babylonjs.com/lite/02-feature-comparison/#shadows) [Loaders](https://doc.babylonjs.com/lite/02-feature-comparison/#loaders) [glTF 2.0 Extensions (Khronos + vendor)](https://doc.babylonjs.com/lite/02-feature-comparison/#gltf-20-extensions-khronos--vendor) [Textures](https://doc.babylonjs.com/lite/02-feature-comparison/#textures) [Math Utilities](https://doc.babylonjs.com/lite/02-feature-comparison/#math-utilities) [Architecture & Developer Experience](https://doc.babylonjs.com/lite/02-feature-comparison/#architecture--developer-experience) [Advanced Features](https://doc.babylonjs.com/lite/02-feature-comparison/#advanced-features) [How to read the gap](https://doc.babylonjs.com/lite/02-feature-comparison/#how-to-read-the-gap) [Next steps](https://doc.babylonjs.com/lite/02-feature-comparison/#next-steps)

This page maps the feature gap between **Babylon Lite** and **Babylon.js (BJS)**, category by category. It is the honest, detailed view of what Lite supports today, what is partially supported, and what it intentionally won't support — so you can decide whether Lite fits your project.

> **Babylon Lite is not a replacement for Babylon.js.** The two engines move forward side by side. Lite optimizes for the smallest bundle and the highest performance on WebGPU; Babylon.js optimizes for the broadest, most mature feature set with WebGL **and** WebGPU support. Closing the gap below is our top priority — features land in Babylon.lite as isolated, tree-shakable modules, so the engine grows without bloating your bundle.

## Legend

| Symbol | Meaning |
| --- | --- |
| Symbol<br>✅ | Meaning<br>Supported |
| Symbol<br>⚡ | Meaning<br>Partial — a subset is implemented; see notes |
| Symbol<br>— | Meaning<br>Not yet available |
| Symbol<br>🚫 | Meaning<br>Won't support — out of scope by design |
| Symbol<br>★ | Meaning<br>Lite advantage — area where Lite leads Babylon.js |

* * *

<!\-\- AUTOGEN:feature-comparison START — generated from lab/lite/docs/feature-comparison.html by scripts/gen-feature-comparison.ts. Do not edit between these markers by hand. -->

## Rendering API

| Feature | Lite | BJS | Notes |
| --- | --- | --- | --- |
| Feature<br>★ WebGPU | Lite<br>✅ | BJS<br>✅ | Notes<br>Lite is WebGPU-exclusive — zero abstraction overhead |
| Feature<br>WebGL 2.0 | Lite<br>🚫 | BJS<br>✅ | Notes<br>Not planned — WebGPU only by design |
| Feature<br>WebGL 1.0 | Lite<br>🚫 | BJS<br>✅ | Notes<br>Not planned — WebGPU only by design |
| Feature<br>4× MSAA | Lite<br>✅ | BJS<br>✅ | Notes |
| Feature<br>Depth / Stencil Buffer | Lite<br>✅ | BJS<br>✅ | Notes<br>depth24plus-stencil8 |
| Feature<br>HDR Rendering | Lite<br>✅ | BJS<br>✅ | Notes |
| Feature<br>Tone Mapping | Lite<br>✅ | BJS<br>✅ | Notes<br>Image processing pipeline |
| Feature<br>Exposure / Contrast | Lite<br>✅ | BJS<br>✅ | Notes<br>Via ImageProcessingConfig |
| Feature<br>Canvas Resize Handling | Lite<br>✅ | BJS<br>✅ | Notes<br>Automatic per-frame |
| Feature<br>Draw Call Counting | Lite<br>✅ | BJS<br>✅ | Notes |
| Feature<br>EffectRenderer / EffectWrapper | Lite<br>✅ | BJS<br>✅ | Notes<br>Scenes 74-76 — direct swapchain renderer plus RTT task path |
| Feature<br>Fullscreen Effect Passes | Lite<br>✅ | BJS<br>✅ | Notes<br>Single fullscreen triangle, no vertex/index buffers |
| Feature<br>Effect RenderTarget Output | Lite<br>✅ | BJS<br>✅ | Notes<br>Scene 75 — render effect into texture, then use it in a material |
| Feature<br>Effect Texture Bindings | Lite<br>✅ | BJS<br>✅ | Notes<br>Scene 76 — Texture2D + sampler binding via setEffectTexture() |
| Feature<br>Frame-Graph RTT Material Override | Lite<br>✅ | BJS<br>✅ | Notes<br>Scene 110 — offscreen pass renders selected meshes with an override material and camera, then samples the RTT in the main pass |

* * *

## Materials

| Feature | Lite | BJS | Notes |
| --- | --- | --- | --- |
| Feature<br>PBR Metallic-Roughness | Lite<br>✅ | BJS<br>✅ | Notes<br>Full GGX / Smith / Schlick BRDF |
| Feature<br>PBR Specular-Glossiness | Lite<br>✅ | BJS<br>✅ | Notes<br>KHR\_materials\_pbrSpecularGlossiness |
| Feature<br>Standard Material (Blinn-Phong) | Lite<br>✅ | BJS<br>✅ | Notes<br>Diffuse, specular, ambient, emissive |
| Feature<br>Mesh Vertex Colors | Lite<br>✅ | BJS<br>✅ | Notes<br>PBR automatic; Standard via enableStandardVertexColors() opt-in (Scene 267) |
| Feature<br>Background Material | Lite<br>✅ | BJS<br>✅ | Notes<br>Ground plane + skybox rendering |
| Feature<br>Normal Mapping | Lite<br>✅ | BJS<br>✅ | Notes<br>Cotangent frame, invertNormalMapX |
| Feature<br>Emissive Textures | Lite<br>✅ | BJS<br>✅ | Notes |
| Feature<br>Occlusion (AO) Maps | Lite<br>✅ | BJS<br>✅ | Notes<br>ORM texture packing |
| Feature<br>Metallic Reflectance Map | Lite<br>✅ | BJS<br>✅ | Notes<br>metallicReflectanceTexture support |
| Feature<br>Specular Anti-Aliasing | Lite<br>✅ | BJS<br>✅ | Notes<br>getAARoughnessFactors when normal map present |
| Feature<br>Alpha Blend / Alpha Test | Lite<br>✅ | BJS<br>✅ | Notes<br>OPAQUE, BLEND, MASK modes |
| Feature<br>Double-Sided Rendering | Lite<br>✅ | BJS<br>✅ | Notes |
| Feature<br>Opacity Textures | Lite<br>✅ | BJS<br>✅ | Notes<br>With depth-write disabled for transparent |
| Feature<br>Bump / Height Mapping | Lite<br>✅ | BJS<br>✅ | Notes |
| Feature<br>Lightmap Textures | Lite<br>✅ | BJS<br>✅ | Notes<br>Standard material UV2; PBR via opt-in enablePbrLightmap() + setPbrLightmap() |
| Feature<br>Ambient Textures | Lite<br>✅ | BJS<br>✅ | Notes |
| Feature<br>Reflection Textures | Lite<br>✅ | BJS<br>✅ | Notes<br>Spherical + planar coord modes |
| Feature<br>UV Scaling / Offset | Lite<br>✅ | BJS<br>✅ | Notes |
| Feature<br>UV2 Channel | Lite<br>✅ | BJS<br>✅ | Notes<br>For lightmaps and AO |
| Feature<br>Node Material | Lite<br>✅ | BJS<br>✅ | Notes<br>NME snippet parser with lab-proven core, compatibility, PBR, math/modes, color, UV/texture/procedural, normal/screen/depth/matrix/scene-state, loop, and storage blocks (Scenes 60-89) |
| Feature<br>Shader Material | Lite<br>✅ | BJS<br>✅ | Notes<br>WGSL-only ShaderMaterial with typed uniforms, samplers, defines, alpha blend/test (Scenes 159-163) |
| Feature<br>Material Plugins | Lite<br>✅ | BJS<br>✅ | Notes<br>Opt-in enableMaterialPlugins() — custom WGSL injection on PBR/Standard, zero bundle cost when unused (Scene 217) |
| Feature<br>Material Stencil | Lite<br>✅ | BJS<br>✅ | Notes<br>Opt-in enableMaterialStencil() — per-material stencil write/test (mask & discard) on Standard/PBR/Shader; zero bundle cost when unused |
| Feature<br>PBR Clear Coat | Lite<br>✅ | BJS<br>✅ | Notes<br>Scene 19 |
| Feature<br>PBR Sheen | Lite<br>✅ | BJS<br>✅ | Notes<br>Scene 21 |
| Feature<br>PBR Anisotropy | Lite<br>✅ | BJS<br>✅ | Notes<br>Scene 23 |
| Feature<br>PBR Subsurface / Translucency | Lite<br>✅ | BJS<br>✅ | Notes<br>Scene 26 — thickness map, translucency, tint |
| Feature<br>Material Variants (KHR\_materials\_variants) | Lite<br>✅ | BJS<br>✅ | Notes<br>Scene 27 — runtime variant selection |
| Feature<br>PBR Iridescence | Lite<br>✅ | BJS<br>✅ | Notes<br>Native PBR thin-film iridescence (Scene 177); NME iridescence remains covered separately by Scene 87 |
| Feature<br>Grid Material | Lite<br>✅ | BJS<br>✅ | Notes<br>Procedural GridMaterial parity with @babylonjs/materials (Scene 213) |

* * *

## Lights

| Feature | Lite | BJS | Notes |
| --- | --- | --- | --- |
| Feature<br>Hemispheric Light | Lite<br>✅ | BJS<br>✅ | Notes |
| Feature<br>Directional Light | Lite<br>✅ | BJS<br>✅ | Notes |
| Feature<br>Point Light | Lite<br>✅ | BJS<br>✅ | Notes |
| Feature<br>Spot Light | Lite<br>✅ | BJS<br>✅ | Notes<br>With cone angle + exponent falloff |
| Feature<br>Multi-Light (N lights) | Lite<br>✅ | BJS<br>✅ | Notes<br>Dynamic UBO packing |
| Feature<br>Per-Mesh Light Inclusion | Lite<br>✅ | BJS<br>✅ | Notes<br>Scene 111 — includedOnlyMeshIds-style light selection across Standard, PBR, NME, and supported shadow generators |
| Feature<br>Light Intensity / Color | Lite<br>✅ | BJS<br>✅ | Notes<br>Diffuse + specular per light |
| Feature<br>Area Lights | Lite<br>— | BJS<br>✅ | Notes |

* * *

## Cameras

| Feature | Lite | BJS | Notes |
| --- | --- | --- | --- |
| Feature<br>Arc Rotate Camera | Lite<br>✅ | BJS<br>✅ | Notes<br>Orbit / zoom / pan / inertia |
| Feature<br>Auto-Framing (fitToScene) | Lite<br>✅ | BJS<br>✅ | Notes<br>Default camera for loaded models |
| Feature<br>Free Camera | Lite<br>✅ | BJS<br>✅ | Notes<br>Scene 18, 24, 25 — WASD/arrow controls |
| Feature<br>Geospatial Camera | Lite<br>✅ | BJS<br>✅ | Notes<br>Globe-orbit camera (center/yaw/pitch/radius) with fly-to + controls (Scene 225) |
| Feature<br>Orthographic Projection | Lite<br>✅ | BJS<br>✅ | Notes<br>Any camera via enableOrthographicCamera() opt-in; live/animatable bounds, aspect-derived or off-center (Scene 268) |
| Feature<br>Follow Camera | Lite<br>— | BJS<br>✅ | Notes |
| Feature<br>Universal Camera | Lite<br>— | BJS<br>✅ | Notes |
| Feature<br>VR / XR Camera | Lite<br>— | BJS<br>✅ | Notes |
| Feature<br>Device Orientation Camera | Lite<br>— | BJS<br>✅ | Notes |

* * *

## Mesh & Geometry

| Feature | Lite | BJS | Notes |
| --- | --- | --- | --- |
| Feature<br>Sphere | Lite<br>✅ | BJS<br>✅ | Notes<br>Configurable segments |
| Feature<br>Box | Lite<br>✅ | BJS<br>✅ | Notes |
| Feature<br>Torus | Lite<br>✅ | BJS<br>✅ | Notes<br>Configurable thickness/tessellation |
| Feature<br>Ground Plane | Lite<br>✅ | BJS<br>✅ | Notes |
| Feature<br>Ground from Heightmap | Lite<br>✅ | BJS<br>✅ | Notes<br>GPU texture → vertex displacement |
| Feature<br>Thin Instances | Lite<br>✅ | BJS<br>✅ | Notes<br>add / remove / set / flush API |
| Feature<br>Observable Transforms | Lite<br>✅ | BJS<br>✅ | Notes<br>ObservableVec3 auto-dirty on mutation |
| Feature<br>Transform Hierarchy | Lite<br>✅ | BJS<br>✅ | Notes<br>Version-based lazy world matrix, IWorldMatrixProvider on all entities |
| Feature<br>Clone Transform Node | Lite<br>✅ | BJS<br>✅ | Notes |
| Feature<br>Cylinder | Lite<br>✅ | BJS<br>✅ | Notes<br>Cylinder / cone / prism via diameterTop/Bottom |
| Feature<br>Plane | Lite<br>✅ | BJS<br>✅ | Notes<br>size or width/height |
| Feature<br>Disc / Ring | Lite<br>✅ | BJS<br>✅ | Notes<br>Configurable arc & tessellation |
| Feature<br>Polyhedra | Lite<br>✅ | BJS<br>✅ | Notes<br>15 BJS presets, flat & smooth normals |
| Feature<br>Ribbon / Tube / Extrude | Lite<br>✅ | BJS<br>✅ | Notes<br>Path3D parallel-transport frames, closePath/closeArray, cap modes |
| Feature<br>CSG / CSG2 (Boolean Ops) | Lite<br>✅ | BJS<br>✅ | Notes<br>Scenes 90/91 — legacy mesh CSG plus Manifold-backed CSG2 subtract, intersect, and union/add operations |
| Feature<br>Instanced Meshes | Lite<br>🚫 | BJS<br>✅ | Notes<br>Won't support BJS InstancedMesh API; use thin instances instead |

* * *

## Skeleton & Animation

| Feature | Lite | BJS | Notes |
| --- | --- | --- | --- |
| Feature<br>Skeletal Animation | Lite<br>✅ | BJS<br>✅ | Notes<br>GPU bone textures (rgba32float) |
| Feature<br>4-Bone Skinning | Lite<br>✅ | BJS<br>✅ | Notes<br>JOINTS\_0 / WEIGHTS\_0 |
| Feature<br>8-Bone Skinning | Lite<br>✅ | BJS<br>✅ | Notes<br>JOINTS\_1 / WEIGHTS\_1 |
| Feature<br>Morph Targets | Lite<br>✅ | BJS<br>✅ | Notes<br>Up to 4 targets, position + normal deltas |
| Feature<br>Animation Groups | Lite<br>✅ | BJS<br>✅ | Notes<br>play / pause / stop / seek / loop / speed |
| Feature<br>Linear Interpolation | Lite<br>✅ | BJS<br>✅ | Notes |
| Feature<br>Step Interpolation | Lite<br>✅ | BJS<br>✅ | Notes |
| Feature<br>Cubic Spline | Lite<br>✅ | BJS<br>✅ | Notes |
| Feature<br>Deterministic Seek | Lite<br>✅ | BJS<br>✅ | Notes<br>Fixed-timestep for parity testing |
| Feature<br>Animation Blending | Lite<br>✅ | BJS<br>✅ | Notes<br>Weighted blend, cross-fade, and additive animation groups (Scenes 155-158) |
| Feature<br>Animation Masking | Lite<br>✅ | BJS<br>✅ | Notes<br>AnimationGroupMask include/exclude target-name filtering; opt-in, zero bundle cost when unused (Scene 251) |
| Feature<br>Animation Events | Lite<br>— | BJS<br>✅ | Notes |
| Feature<br>Animation Weights | Lite<br>✅ | BJS<br>✅ | Notes<br>AnimationGroup weight control through AnimationManager |
| Feature<br>Vertex Animation Textures (VAT) | Lite<br>✅ | BJS<br>✅ | Notes<br>Baked skeletal animation played on the GPU, incl. per-instance thin-instanced VAT (Scenes 218-219) |

* * *

## Environment & IBL

| Feature | Lite | BJS | Notes |
| --- | --- | --- | --- |
| Feature<br>Babylon .env Files | Lite<br>✅ | BJS<br>✅ | Notes<br>RGBD cubemap decode |
| Feature<br>HDR Panoramas (.hdr) | Lite<br>✅ | BJS<br>✅ | Notes<br>Equirect → cubemap → prefiltered IBL |
| Feature<br>Image-Based Lighting | Lite<br>✅ | BJS<br>✅ | Notes<br>Split-sum approximation |
| Feature<br>BRDF Lookup Table | Lite<br>✅ | BJS<br>✅ | Notes<br>Pre-baked PNG, RGBD compute decode |
| Feature<br>Spherical Harmonics | Lite<br>✅ | BJS<br>✅ | Notes<br>Irradiance from environment |
| Feature<br>DDS Cube Skybox | Lite<br>✅ | BJS<br>✅ | Notes |
| Feature<br>Cubemap Skybox | Lite<br>✅ | BJS<br>✅ | Notes<br>6-face cube texture |
| Feature<br>HDR Skybox | Lite<br>✅ | BJS<br>✅ | Notes |
| Feature<br>Ground + Skybox Background | Lite<br>✅ | BJS<br>✅ | Notes<br>Fresnel ground opacity, premultiplied alpha |
| Feature<br>Fog (Linear / Exp / Exp²) | Lite<br>✅ | BJS<br>✅ | Notes |
| Feature<br>Environment Rotation | Lite<br>✅ | BJS<br>✅ | Notes |
| Feature<br>Environment Skybox Blur | Lite<br>✅ | BJS<br>✅ | Notes<br>Continuous fractional cubemap LOD |
| Feature<br>Reflection Probes | Lite<br>— | BJS<br>✅ | Notes |

* * *

## Shadows

| Feature | Lite | BJS | Notes |
| --- | --- | --- | --- |
| Feature<br>ESM Shadows (Directional) | Lite<br>✅ | BJS<br>✅ | Notes<br>Depth + Gaussian blur passes |
| Feature<br>Shadow Map Size Config | Lite<br>✅ | BJS<br>✅ | Notes |
| Feature<br>Shadow Bias / Darkness | Lite<br>✅ | BJS<br>✅ | Notes |
| Feature<br>Frustum Edge Falloff | Lite<br>✅ | BJS<br>✅ | Notes |
| Feature<br>PCF Shadows | Lite<br>✅ | BJS<br>✅ | Notes<br>Spot + directional PCF (Scenes 18, 111) |
| Feature<br>Cascaded Shadow Maps | Lite<br>✅ | BJS<br>✅ | Notes<br>Directional CSM, up to 4 cascades, PCF5, Standard + PBR receivers (Scenes 214-215) |
| Feature<br>Point Light Shadows | Lite<br>— | BJS<br>✅ | Notes |
| Feature<br>Spot Light Shadows | Lite<br>✅ | BJS<br>✅ | Notes<br>Scene 18 (PCF) |
| Feature<br>Material-Aware Shadow Depth | Lite<br>✅ | BJS<br>✅ | Notes<br>Shadow material views and alpha-discard casters for Standard, PBR, and NodeMaterial (Scenes 116, 140, 141) |
| Feature<br>Contact Hardening Shadows | Lite<br>— | BJS<br>✅ | Notes |

* * *

## Loaders

| Feature | Lite | BJS | Notes |
| --- | --- | --- | --- |
| Feature<br>glTF 2.0 / GLB | Lite<br>✅ | BJS<br>✅ | Notes<br>Meshes, materials, skins, morphs, animations |
| Feature<br>.babylon Format | Lite<br>✅ | BJS<br>✅ | Notes<br>Meshes, standard materials, lights |
| Feature<br>Environment .env | Lite<br>✅ | BJS<br>✅ | Notes |
| Feature<br>HDR Panorama .hdr | Lite<br>✅ | BJS<br>✅ | Notes |
| Feature<br>Skybox Cube Textures | Lite<br>✅ | BJS<br>✅ | Notes |
| Feature<br>2D Texture Loading | Lite<br>✅ | BJS<br>✅ | Notes<br>With mipmap generation |
| Feature<br>OBJ / MTL | Lite<br>— | BJS<br>✅ | Notes |
| Feature<br>STL | Lite<br>— | BJS<br>✅ | Notes |
| Feature<br>FBX | Lite<br>— | BJS<br>✅ | Notes |
| Feature<br>KTX1 Compressed Textures | Lite<br>✅ | BJS<br>✅ | Notes<br>Scene 25 — ASTC / BC / ETC2 auto-format + PNG fallback |
| Feature<br>KTX2 Textures | Lite<br>✅ | BJS<br>✅ | Notes<br>Scene 112 — KHR\_texture\_basisu glTF texture sources |
| Feature<br>Basis Universal (.basis) | Lite<br>✅ | BJS<br>✅ | Notes<br>Scene 36 — transcoder fetched from BJS CDN; BC7 / ASTC / ETC2 / BC3 auto-select + RGBA32 fallback |

* * *

## glTF 2.0 Extensions (Khronos + vendor)

| Feature | Lite | BJS | Notes |
| --- | --- | --- | --- |
| Feature<br>KHR\_materials\_pbrSpecularGlossiness | Lite<br>✅ | BJS<br>✅ | Notes<br>Archived ext — mapped to metallic-roughness (Scene 6) |
| Feature<br>KHR\_materials\_variants | Lite<br>✅ | BJS<br>✅ | Notes<br>Scene 27 — runtime variant selection |
| Feature<br>KHR\_materials\_unlit | Lite<br>✅ | BJS<br>✅ | Notes<br>Scene 32 — base color output, no lighting |
| Feature<br>KHR\_materials\_clearcoat | Lite<br>✅ | BJS<br>✅ | Notes<br>Scene 28 — glTF loader auto-wires clearcoat + roughness + normal textures |
| Feature<br>KHR\_materials\_sheen | Lite<br>✅ | BJS<br>✅ | Notes<br>Scene 29 — glTF loader with BJS-spec albedo scaling |
| Feature<br>KHR\_materials\_anisotropy | Lite<br>✅ | BJS<br>✅ | Notes<br>glTF loader auto-wires strength + rotation (manual API: Scene 23) |
| Feature<br>KHR\_materials\_volume | Lite<br>✅ | BJS<br>✅ | Notes<br>glTF loader auto-wires attenuation + thickness (Scene 30); manual API Scene 26 |
| Feature<br>KHR\_materials\_transmission | Lite<br>✅ | BJS<br>✅ | Notes<br>Frame-graph scene-texture transmission (Scenes 30/33/112) |
| Feature<br>KHR\_materials\_ior | Lite<br>✅ | BJS<br>✅ | Notes<br>Index of refraction override (Scene 30) |
| Feature<br>KHR\_materials\_specular | Lite<br>✅ | BJS<br>✅ | Notes<br>Dielectric specular intensity/color (Scene 30) |
| Feature<br>KHR\_materials\_iridescence | Lite<br>✅ | BJS<br>✅ | Notes<br>glTF loader auto-wires factor/IOR/thickness and packed texture channels (Scene 178) |
| Feature<br>KHR\_materials\_emissive\_strength | Lite<br>✅ | BJS<br>✅ | Notes<br>HDR emissive multiplier (Scene 31) |
| Feature<br>KHR\_materials\_dispersion | Lite<br>✅ | BJS<br>✅ | Notes<br>Scene 212 — wavelength-dependent (chromatic) refraction on volumetric glass |
| Feature<br>KHR\_lights\_punctual | Lite<br>✅ | BJS<br>✅ | Notes<br>Scene 33 — point / spot / directional lights from glTF |
| Feature<br>KHR\_texture\_transform | Lite<br>✅ | BJS<br>✅ | Notes<br>Material-wide UV offset / scale / rotate resolved at load (Scene 29) |
| Feature<br>KHR\_texture\_basisu | Lite<br>✅ | BJS<br>✅ | Notes<br>Scene 112 — FlightHelmetKTX from BabylonJS/Assets |
| Feature<br>KHR\_draco\_mesh\_compression | Lite<br>✅ | BJS<br>✅ | Notes<br>Draco-compressed mesh geometry (Scene 30) |
| Feature<br>KHR\_mesh\_quantization | Lite<br>✅ | BJS<br>✅ | Notes<br>Scene 211 — 8/16-bit quantized vertex attributes dequantized at load |
| Feature<br>KHR\_animation\_pointer | Lite<br>✅ | BJS<br>✅ | Notes<br>Scene 34 — animate arbitrary JSON pointers (e.g. node visibility) |
| Feature<br>KHR\_node\_visibility | Lite<br>✅ | BJS<br>✅ | Notes<br>Scene 34 — per-node visibility flag |
| Feature<br>KHR\_audio / KHR\_audio\_emitter | Lite<br>— | BJS<br>✅ | Notes<br>Positional / ambient audio |
| Feature<br>KHR\_xmp\_json\_ld | Lite<br>✅ | BJS<br>✅ | Notes<br>Scene 210 — XMP JSON-LD metadata parsed and exposed |
| Feature<br>EXT\_mesh\_gpu\_instancing | Lite<br>✅ | BJS<br>✅ | Notes<br>Scene 35 — per-node instance transforms (TRS accessors → thin instances) |
| Feature<br>EXT\_meshopt\_compression | Lite<br>✅ | BJS<br>✅ | Notes<br>Scene 211 — meshoptimizer bitstream decode (BrainStem skinned + animated) |
| Feature<br>EXT\_texture\_webp | Lite<br>✅ | BJS<br>✅ | Notes<br>Scene 37 — EXT\_texture\_webp source selection with browser-native decode |
| Feature<br>EXT\_texture\_avif | Lite<br>— | BJS<br>✅ | Notes<br>AVIF texture source |
| Feature<br>EXT\_lights\_image\_based | Lite<br>— | BJS<br>✅ | Notes<br>IBL specified in glTF asset |
| Feature<br>MSFT\_lod | Lite<br>— | BJS<br>✅ | Notes<br>Discrete level-of-detail |
| Feature<br>MSFT\_minecraftMesh | Lite<br>— | BJS<br>✅ | Notes<br>Minecraft-style voxel meshes |
| Feature<br>MSFT\_audio\_emitter | Lite<br>— | BJS<br>✅ | Notes<br>Legacy positional audio |
| Feature<br>ExtrasAsMetadata | Lite<br>✅ | BJS<br>✅ | Notes<br>Promote glTF `extras` to `metadata.gltf.extras` |

* * *

## Textures

| Feature | Lite | BJS | Notes |
| --- | --- | --- | --- |
| Feature<br>2D Textures | Lite<br>✅ | BJS<br>✅ | Notes |
| Feature<br>Cube Textures | Lite<br>✅ | BJS<br>✅ | Notes |
| Feature<br>Solid Color Textures | Lite<br>✅ | BJS<br>✅ | Notes<br>Procedural 1×1 fill |
| Feature<br>GPU Mipmap Generation | Lite<br>✅ | BJS<br>✅ | Notes<br>Compute shader mipmaps |
| Feature<br>sRGB Handling | Lite<br>✅ | BJS<br>✅ | Notes<br>Format-based gamma correction |
| Feature<br>Sampler Configuration | Lite<br>✅ | BJS<br>✅ | Notes<br>Filter, address mode, anisotropy |
| Feature<br>InvertY Control | Lite<br>✅ | BJS<br>✅ | Notes |
| Feature<br>Procedural Textures | Lite<br>— | BJS<br>✅ | Notes |
| Feature<br>Video Textures | Lite<br>— | BJS<br>✅ | Notes |
| Feature<br>Dynamic Textures | Lite<br>— | BJS<br>✅ | Notes |
| Feature<br>Render Target Textures | Lite<br>✅ | BJS<br>✅ | Notes<br>Frame-graph RTT + sampled Texture2D, including pass-local material override (Scenes 75, 110) |
| Feature<br>Multi-Render Targets | Lite<br>— | BJS<br>✅ | Notes |

* * *

## Math Utilities

| Feature | Lite | BJS | Notes |
| --- | --- | --- | --- |
| Feature<br>Vec3 / Vec4 | Lite<br>✅ | BJS<br>✅ | Notes<br>add, sub, scale, dot, cross, normalize, lerp |
| Feature<br>Mat4 (4×4 Matrix) | Lite<br>✅ | BJS<br>✅ | Notes<br>Multiply, inverse, lookAt, perspective, compose |
| Feature<br>Quaternion | Lite<br>✅ | BJS<br>✅ | Notes<br>Slerp, toMatrix, from Euler |
| Feature<br>Color3 / Color4 | Lite<br>✅ | BJS<br>✅ | Notes |
| Feature<br>ObservableVec3 | Lite<br>✅ | BJS<br>— | Notes<br>Auto-dirty on mutation (Lite-specific) |
| Feature<br>LH Column-Major Layout | Lite<br>✅ | BJS<br>✅ | Notes<br>Aligned with WGSL/WebGPU conventions |
| Feature<br>★ High-Precision / Floating-Origin Matrices | Lite<br>✅ | BJS<br>⚡ | Notes<br>Scenes 200/201 — F64 matrix caches + eye-relative floating-origin upload remove far-from-origin jitter at ~5e6 world units; BJS offers useHighPrecisionMatrix but not the eye-relative floating-origin path |

* * *

## Architecture & Developer Experience

| Feature | Lite | BJS | Notes |
| --- | --- | --- | --- |
| Feature<br>★ 100% Tree-Shakable | Lite<br>✅ | BJS<br>⚡ | Notes<br>Zero module-level side effects in Lite |
| Feature<br>★ Minimal Bundle Size | Lite<br>✅ | BJS<br>— | Notes<br>Dramatically smaller than BJS for same scene |
| Feature<br>★ Zero Side Effects | Lite<br>✅ | BJS<br>— | Notes<br>No register\*() at import time, no globalThis |
| Feature<br>★ One-Way Data Ownership | Lite<br>✅ | BJS<br>— | Notes<br>Components are plain data; scene is sole owner |
| Feature<br>★ Materials Own Shaders | Lite<br>✅ | BJS<br>— | Notes<br>Self-contained material + pipeline units |
| Feature<br>TypeScript | Lite<br>✅ | BJS<br>✅ | Notes<br>Strict typing throughout |
| Feature<br>Vite Native | Lite<br>✅ | BJS<br>⚡ | Notes<br>First-class Vite integration |
| Feature<br>Familiar BJS-like API | Lite<br>✅ | BJS<br>✅ | Notes<br>Easy migration for BJS developers |
| Feature<br>Hot Material Swap | Lite<br>✅ | BJS<br>✅ | Notes<br>Object.defineProperty setter + rebuild queue |
| Feature<br>Dispose / Cleanup | Lite<br>✅ | BJS<br>✅ | Notes<br>Full GPU resource cleanup on dispose |
| Feature<br>GPU Frame Timer | Lite<br>✅ | BJS<br>✅ | Notes<br>Optional zero-cost GPU frame profiling via WebGPU timestamp queries (setGpuTimingEnabled) |
| Feature<br>Multi-Canvas / Multi-Scene | Lite<br>✅ | BJS<br>✅ | Notes<br>One engine drives many canvases/scenes via createSurface; GPU resources are device-scoped (Scenes 227-228) |

* * *

## Advanced Features

| Feature | Lite | BJS | Notes |
| --- | --- | --- | --- |
| Feature<br>Physics Engine | Lite<br>⚡ | BJS<br>✅ | Notes<br>Havok Physics V2 subset (Scene 40); no Ammo.js/Cannon.js/Oimo compatibility layer |
| Feature<br>Particle System | Lite<br>— | BJS<br>✅ | Notes<br>CPU + GPU particles |
| Feature<br>Post-Processing Pipeline | Lite<br>✅ | BJS<br>✅ | Notes<br>Frame-graph tasks include generic fullscreen passes, Bloom, depth of field, TAA, SMAA, and final image processing/tone mapping. Scene 187 covers SMAA. |
| Feature<br>GUI (2D / 3D UI) | Lite<br>— | BJS<br>✅ | Notes |
| Feature<br>Sprites / SpriteManager | Lite<br>⚡ | BJS<br>✅ | Notes<br>2D layers, depth-hosted sprites, facing/axis-locked/cutout billboards (Scenes 50-57); not the full BJS SpriteManager API |
| Feature<br>Gaussian Splatting | Lite<br>✅ | BJS<br>✅ | Notes<br>.ply / .splat / .sog / .spz loaders, transform baking, material plugin fragments, depth rendering, and GPU picking (Scenes 120-129) |
| Feature<br>Octree / Frustum Culling | Lite<br>— | BJS<br>✅ | Notes |
| Feature<br>Level of Detail (LOD) | Lite<br>— | BJS<br>✅ | Notes |
| Feature<br>Ray Casting / Picking | Lite<br>✅ | BJS<br>✅ | Notes<br>GPU ID pass + CPU ray/triangle details, normal/UV helpers, thin-instance and deformed mesh coverage (Scenes 113-115) |
| Feature<br>WebXR / VR / AR | Lite<br>— | BJS<br>✅ | Notes |
| Feature<br>Glow / Highlight Layer | Lite<br>— | BJS<br>✅ | Notes |
| Feature<br>Screen-Space Reflections | Lite<br>— | BJS<br>✅ | Notes |
| Feature<br>SSAO | Lite<br>— | BJS<br>✅ | Notes |
| Feature<br>Lens Flare | Lite<br>— | BJS<br>✅ | Notes |
| Feature<br>Volumetric Light Scattering | Lite<br>— | BJS<br>✅ | Notes |
| Feature<br>Decals | Lite<br>— | BJS<br>✅ | Notes |
| Feature<br>Solid Particle System | Lite<br>— | BJS<br>✅ | Notes |
| Feature<br>Fluid Rendering | Lite<br>— | BJS<br>✅ | Notes |
| Feature<br>Bones IK | Lite<br>— | BJS<br>✅ | Notes |
| Feature<br>Navigation Mesh | Lite<br>⚡ | BJS<br>✅ | Notes<br>Recast V2 navmesh, crowd pathing, tile-cache obstacles, off-mesh links, and raycast (Scenes 170-175) |
| Feature<br>Device Lost Recovery | Lite<br>✅ | BJS<br>✅ | Notes<br>Opt-in per-kind WebGPU device-loss recovery via enableDeviceLost\*Recovery APIs (Scene 164: Scene) |
| Feature<br>OffscreenCanvas / Worker Rendering | Lite<br>✅ | BJS<br>✅ | Notes<br>Engine runs unchanged on a DOM canvas or an OffscreenCanvas transferred to a Web Worker (Offscreen demo) |
| Feature<br>Text Rendering | Lite<br>✅ | BJS<br>✅ | Notes<br>GPU text renderer with layered layout + editor (Scenes 180-181) |
| Feature<br>Gizmos | Lite<br>✅ | BJS<br>✅ | Notes<br>Position / rotation / scale, bounding-box, camera + light gizmos on a utility layer (Scenes 221-224) |
| Feature<br>Geometry Buffer Renderer | Lite<br>✅ | BJS<br>✅ | Notes<br>Frame-graph geometry renderer producing normal / depth / position textures; feeds DoF + CoC (Scenes 145-149) |
| Feature<br>Large World Rendering (Floating Origin) | Lite<br>✅ | BJS<br>✅ | Notes<br>Camera-relative rendering + multi-region physics for huge world coordinates (Scenes 200-209) |
| Feature<br>Scene Optimizer | Lite<br>— | BJS<br>✅ | Notes |
| Feature<br>Asset Manager | Lite<br>— | BJS<br>✅ | Notes |
| Feature<br>Scene Serialization | Lite<br>— | BJS<br>✅ | Notes |

<!\-\- AUTOGEN:feature-comparison END -->

* * *

## How to read the gap

- **✅ on both sides** means the feature is covered in Lite to parity with Babylon.js — validated by a pixel-diff against Babylon.js where a parity scene exists.
- **⚡ on Lite** means a meaningful subset is available today; the notes describe exactly what is and isn't covered. These are the most likely candidates to fully finish next.
- **— on Lite** means the feature isn't available yet. If your project depends on one of these, Babylon.js is the right option today — and let us know, because your feedback will help shape the Lite roadmap.
- **🚫 on Lite** means the feature is intentionally out of scope (e.g. WebGL, the classic `InstancedMesh` API). These reflect deliberate design trade-offs that buy Lite its size and speed; use the noted alternative (e.g. thin instances).

This table tracks the current state and will be updated regularly as the gaps close between Babylon.lite and Babylon.js.

## Next steps

- 🚀 **[Getting Started](https://doc.babylonjs.com/lite/01-getting-started)** — install Lite, learn the mental model, and render your first scene.
- 🛝 **[Lite Playground](https://doc.babylonjs.com/lite/04-playground)** — try covered features live in your browser, no setup required.
- 🔁 **[Porting Guide](https://doc.babylonjs.com/lite/03-porting-guide)** — translate a Babylon.js scene to Babylon Lite, side by side.
- 🧱 **[Architecture docs](https://doc.babylonjs.com/lite/architecture/00-overview)** — deep dives into the engine internals.
- 🏠 **[Welcome](https://doc.babylonjs.com/lite)** — the big-picture introduction and "which engine should I use?" decision tree.

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