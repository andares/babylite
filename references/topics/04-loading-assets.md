# 04 · 模型与环境加载

> **效果检索词**：加载模型 / glTF / GLB / KTX2 / basisu · HDR 全景 / 环境贴图 / IBL / environment · .babylon · 天空盒 / skybox / 背景 / background · 地面 ground · 立方体贴图 cube texture · Texture2D · 压缩纹理 KTX · Draco / meshopt
> **源页快照**（skill 根相对路径，含完整源码级细节）：`references/raw-doc/architecture/04-loaders.md` · `references/raw-doc/architecture/05-background-skybox.md` · `references/raw-doc/architecture/19-loader-hdr.md` · `references/raw-doc/architecture/20-loader-babylon.md` · `references/raw-doc/architecture/09-texture-2d.md`

## API 范围

| API | 用途 | 要点 |
| --- | --- | --- |
| `await loadGltf(engine, source)` | 加载 glTF/GLB 模型 | 接收 **EngineContext（不是 SceneContext）**；`source` 可为 URL / `ArrayBuffer` / `Blob`（GLB-vs-glTF 按魔数检测，不看扩展名；本地数据须自包含）。返回 `AssetContainer`，随后 `addToScene(scene, result)` 装配 |
| `addToScene(scene, assetContainer)` | 装配加载结果 | 遍历 entities 注册、自动 tick `animationGroups`、应用 `clearColor`、设置 `camera`；等价 BJS `SceneLoader.Append` |
| `AssetContainer`（内部/数据结构） | 加载结果统一形状 | `entities` / `animationGroups` / `clearColor` / `camera` / `cameras`（须显式挑选赋给 `scene.camera`，不会自动激活）/ `materialVariants`（配 `selectVariant()` / `getVariantNames()`）/ `skeletons`（`enableBoneControl()` 后填充）/ `xmpMetadata` |
| `enableGltfCameras()` | 导入 glTF 内嵌相机 | **opt-in**：先调用再 `loadGltf`；每台相机经 `node.camera` 实例化进 `AssetContainer.cameras`（见 02 主题相机） |
| `setDracoBaseUrl(url)` / `setMeshoptBaseUrl(url)` | 自托管压缩几何解码器 | 覆盖 draco_decoder / meshopt_decoder 拉取地址（默认站点根 `/`）；**须在触发该编解码器的资源加载前调用**；解码器懒加载，不用零字节 |
| `await loadEnvironment(scene, url, options)` | 加载 .env 环境贴图（IBL + 背景） | `options.brdfUrl` **必填**（RGBD 编码 BRDF LUT PNG）；可选 `groundTextureUrl` / `skipSkybox` / `skipGround` / `skyboxUrl` / `skyboxSize`（默认 1000）；等价 BJS `CreateFromPrefilteredData` / `createDefaultEnvironment` |
| `await loadHdrEnvironment(scene, url, options?)` | 加载 .hdr（RGBE）全景为 IBL | `HdrLoadOptions`：`faceSize`（默认 256）/ `useCubemapSkybox` / `skipGround` / `skyboxSize`；内部 GPU compute 全流水线（equirect→cubemap、GGX 预滤波、BRDF LUT）；等价 BJS `HDRCubeTexture` |
| `await loadDdsEnvironment(scene, url, opts)` | 加载预滤波 DDS cubemap 环境 | rgba16float，全 mip 直传 + 从 mip 0 算 SH + 解码 BRDF LUT PNG（见 04 源页 equivalence map） |
| `await loadBabylon(engine, url, opts?)` | 加载 .babylon 场景文件 | `LoadBabylonOptions`：`maxMeshes` / `loadTextures`（默认 true）；返回同一 `AssetContainer`；标准材质（Blinn-Phong）+ 点光源 + clearColor；**不支持骨骼/动画/morph**；坐标已是左手系 |
| `await loadTexture2D(engine, url, opts?)` | 加载 PNG/JPG 为 Texture2D | `Texture2DOptions`：`mipMaps`(默认 true) / `addressModeU/V`('repeat') / `minFilter` / `magFilter`('linear') / `invertY`(默认 true) / `srgb`(默认 false；PBR 反照率贴图设 true)；无 dispose API，调用方 `texture.destroy()`；等价 BJS `new Texture(url, scene)` |
| `await loadKtxTexture2D(engine, baseUrl, suffixes, opts?)` | KTX1 压缩纹理（ASTC/BC/ETC2） | 按后缀优先级探测设备支持格式，全失败回退 `loadTexture2D(engine, baseUrl)`；完全 tree-shakable，不导入零字节 |
| `uploadKtx2Texture2D(engine, buffer, sRGB)` | 内部/低层：KTX2 上传 | glTF `KHR_texture_basisu` 专用动态路径，**不导出公共 barrel**；解码器脚本（babylon.ktx2Decoder.js）在遇到 KTX2 资产后才懒加载 |
| `loadSkybox(scene, baseUrl, ext, size)` | 6 面立方图天空盒 | 面向 StandardMaterial 场景；注册延迟 builder 在引擎启动时建管线；等价 BJS `new CubeTexture(url, scene)` + skybox mesh |
| `loadCubeTexture(device, baseUrl, extension?)` | 内部/低层：加载 6 面立方贴图 | 拼 `${baseUrl}_px/_nx/_py/_ny/_pz/_nz${ext}`（ext 默认 `.jpg`）并行抓取并生成 mipmap |
| `addDdsEnvironmentBackground(scene, options)` | 内部/低层：DDS 天空盒+地面编排 | `options`：`skyboxUrl` / `groundTextureUrl` / `skyboxSize` / `enableNoise`(默认 true)；常配合 `skipSkybox`+`skipGround` 的环境光照使用 |

⚠️ **心智模型**：加载结果不是"直接进场景"——`loadGltf`/`loadBabylon` 只返回 `AssetContainer`，必须再过一次
`addToScene(scene, result)` 才注册进场景。glTF 特性（KTX2、Draco、meshopt、XMP、相机）全是动态模块：
不用该扩展的资源零字节，但 enable/setter 类调用（`enableGltfCameras`、`setDracoBaseUrl`）别当噪音删掉。

## 最小示例（模型 + HDR 环境，参照 04/19 源页示例结构）

```ts
import {
    createEngine, createSceneContext, addToScene, registerScene, startEngine,
    loadGltf, loadHdrEnvironment,
} from "@babylonjs/lite";

const engine = await createEngine(canvas);
const scene = createSceneContext(engine);

// 1. 加载 glTF 模型：loadGltf 拿 engine，结果交给 addToScene
const assets = await loadGltf(engine, "https://example.com/FlightHelmet.glb");
addToScene(scene, assets);            // entities + 动画组 + 相机在此装配

// 2. 加载 HDR 全景环境贴图（IBL 光照 + 天空盒背景）
await loadHdrEnvironment(scene, "https://example.com/room.hdr", {
    useCubemapSkybox: true,           // HDR cubemap 作为天空盒
    // skipGround: true,              // 不要默认地面
});

// .env 环境则用（brdfUrl 必填）：
// await loadEnvironment(scene, "https://example.com/room.env", {
//     brdfUrl: "https://example.com/brdf.png",
//     groundTextureUrl: "https://assets.babylonjs.com/core/environments/backgroundGround.png",
// });

await registerScene(scene);
await startEngine(engine);
```

（.babylon 路线：`const result = await loadBabylon(engine, "https://example.com/scene.babylon"); addToScene(scene, result);`
—— 参照 20 源页 Usage 一节。）

## 相关效果

| 效果 | 关键 API | 原文档 |
| --- | --- | --- |
| 加载 glTF/GLB 模型 | `loadGltf` + `addToScene` | https://doc.babylonjs.com/lite/architecture/04-loaders/ |
| glTF 内嵌相机 | `enableGltfCameras()` + `AssetContainer.cameras` | https://doc.babylonjs.com/lite/architecture/04-loaders/#gltf-camera-node-property-gltf-feature-camerats |
| KTX2 / KHR_texture_basisu 模型贴图 | glTF 特性模块自动触发（`uploadKtx2Texture2D` 内部） | https://doc.babylonjs.com/lite/architecture/09-texture-2d/#ktx2--khr_texture_basisu-loading |
| .env / DDS 环境贴图（IBL） | `loadEnvironment`（`brdfUrl` 必填） | https://doc.babylonjs.com/lite/architecture/04-loaders/ |
| .hdr 全景环境 / IBL | `loadHdrEnvironment` | https://doc.babylonjs.com/lite/architecture/19-loader-hdr/ |
| 天空盒背景（HDR/DDS/纯色/立方图） | `loadHdrEnvironment({useCubemapSkybox})` / `loadSkybox` | https://doc.babylonjs.com/lite/architecture/05-background-skybox/ |
| 默认地面（半透明+菲涅尔） | `loadEnvironment` 的 `groundTextureUrl` / `skipGround` | https://doc.babylonjs.com/lite/architecture/05-background-skybox/#bjs-ground-diffuse-texture-backgroundgroundpng |
| 加载 .babylon 场景 | `loadBabylon` + `addToScene` | https://doc.babylonjs.com/lite/architecture/20-loader-babylon/ |
| 单张贴图 / 压缩纹理（KTX1） | `loadTexture2D` / `loadKtxTexture2D` | https://doc.babylonjs.com/lite/architecture/09-texture-2d/ |
| Draco / meshopt 压缩模型 | glTF 扩展自动触发 + `setDracoBaseUrl` / `setMeshoptBaseUrl` | https://doc.babylonjs.com/lite/architecture/04-loaders/ |
