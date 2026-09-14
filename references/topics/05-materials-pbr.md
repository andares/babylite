# 05 · 材质与渲染效果（PBR / 标准材质）

> **效果检索词**：PBR · 次表面散射 subsurface / SSS / 皮肤 skin / 蜡 wax / 玉石 · 透射 translucency · 半透明 · 清漆 clearcoat · 织物绒毛 sheen · 各向异性 anisotropy · 自发光 emissive · 标准材质 standard material · 网格 grid · stencil 模板 · alpha-to-coverage 抗锯齿
> **源页快照**（skill 根相对路径，含完整源码级细节）：`references/raw-doc/architecture/06-pbr-material.md` · `references/raw-doc/architecture/08-standard-material.md` · `references/raw-doc/architecture/25-grid-material.md` · `references/raw-doc/architecture/40-material-stencil.md` · `references/raw-doc/architecture/51-alpha-to-coverage.md`

## API 范围

| API | 用途 | 要点 |
| --- | --- | --- |
| `createPbrMaterial(props)` | PBR 材质工厂 | props 为纯数据对象 `PbrMaterialProps`；创建后赋给 `mesh.material` |
| — 基础贴图 | `baseColorTexture` / `normalTexture(+normalTextureScale)` / `ormTexture`（R=occlusion, G=roughness, B=metallic 打包）/ `emissiveTexture` / `specGlossTexture` | 材质扩展按需注册（Tree-shaking：没用的功能零开销） |
| — 基础参数 | `metallicFactor` / `roughnessFactor` / `occlusionStrength` / `reflectance` / `metallicF0Factor` / `doubleSided` / `alpha` / `alphaBlend` / `alphaCutOff` / `unlit(+unlitColor)` / `skyboxMode` | 物理光照 `usePhysicalLightFalloff` 可选 |
| — **次表面 `subsurface`** | `{ scattering: { diffusionDistance: [r,g,b], metersPerUnit }, translucency: { intensity, color, diffusionDistance }, thickness: { texture, min, max }, tint: { color, atDistance }, refraction: { … } }` | **散射 = 皮肤/蜡/玉石 SSS；透射 = 叶/帘半透明背光**。属于可选扩展，按需启用（首标志 `PBR_HAS_SUBSURFACE`） |
| — 图层效果 | `clearCoat: { intensity, roughness, indexOfRefraction, texture, useF0Remap }` · `sheen: { color, roughness, intensity, texture }` · `anisotropy: { intensity, direction }` · `transmissive` | 各图层是独立 fragment 模块，按需编译 |
| `setPbrEmissive(material, color)` | 自发光 | **必须用 setter**：直接赋 `_emissiveColor` 会跳过扩展注册（同样注意 `setPbrAnisotropy` 等 setter 族） |
| `markMaterialUboDirty(material)` | 材质参数变更后标记 | 修改材质数据后需要时调用，驱动 UBO 重传 |
| `rebuildMaterial(scene, material)` | 变更材质配置后重建 | 渲染对象已存在后改配置/清配置（如局部 IBL）用它 |
| `enableMaterialStencil()` | 材质模板测试 | 按需启用（见 40 源页） |
| `setStandardBumpTexture` / `setStandardEmissiveTexture` / `setStandardReflectionCubeTexture` | 标准材质贴图 | 标准材质（`createStandardMaterial()`）的多张贴图是 **opt-in** 的，需显式 setter 启用；顶点色 `enableStandardVertexColors`、UV 变换 `enableMaterialUvTransform` 同理 |
| `createGridMaterial(opts)` | 网格/检查线材质 | 调试用，替代 BJS 的 GridMaterial（在 @babylonjs/materials） |

⚠️ **包体权衡**：PBR 的每个特性（IBl、clearcoat、sheen、反射、发光、光照贴图、morph、骨骼、阴影接收…）是独立
fragment 模块——只有场景真的用到才进 bundle。不影响视觉效果，但别把"enable/注册"类调用当噪音删掉。

## 最小示例

次表面散射（皮肤/蜡质感）：

```ts
import { createEngine, createSceneContext, createSphere, createPbrMaterial, addToScene, registerScene, startEngine } from "@babylonjs/lite";

const engine = await createEngine(canvas);
const scene = createSceneContext(engine);

const wax = createPbrMaterial({
    baseColorFactor: [0.95, 0.92, 0.85, 1],
    roughnessFactor: 0.35,
    subsurface: {
        scattering: { diffusionDistance: [0.6, 0.4, 0.3], metersPerUnit: 1 },                              // 散射(SSS)
        translucency: { intensity: 0.5, color: [1, 0.95, 0.9], diffusionDistance: [0.8, 0.6, 0.4] },      // 透射
    },
});

const sphere = createSphere(engine, { diameter: 2, segments: 32 });
sphere.material = wax;
addToScene(scene, sphere);

await registerScene(scene);
await startEngine(engine);
```

（渲染对象装配、材质属性更完整示例见 `references/raw-doc/architecture/06-pbr-material.md`；材质 props 接口全文在该页
"Material Props" 一节。）

## 相关效果

| 效果 | 关键 API | 原文档 |
| --- | --- | --- |
| 次表面散射 / 皮肤 / 玉石 | `createPbrMaterial` + `subsurface.scattering` | https://doc.babylonjs.com/lite/architecture/06-pbr-material/ |
| 半透明透射 / 叶片 / 窗帘 | `subsurface.translucency` | 同上 |
| 清漆 / 汽车漆 | `clearCoat` 参数组 | 同上 |
| 织物 / 天鹅绒 | `sheen` 参数组 | 同上 |
| 金属拉丝 / 光盘 | `anisotropy` 参数组 | 同上 |
| 局部环境 IBL | `setPbrLocalEnvironmentProbeSet` / `clearPbrLocalEnvironment`（需 `rebuildMaterial`） | 同上 |
| 标准材质 + 贴图 | `createStandardMaterial` + setter 族 | https://doc.babylonjs.com/lite/architecture/08-standard-material/ |
| 模板效果（遮罩/描边） | `enableMaterialStencil()` | https://doc.babylonjs.com/lite/architecture/40-material-stencil/ |
| 半透明抗锯齿边缘 | alpha-to-coverage（见 51 源页） | https://doc.babylonjs.com/lite/architecture/51-alpha-to-coverage/ |
| 阴影接收 / 光照 | 见 03 主题（shadow generator） | https://doc.babylonjs.com/lite/architecture/16-shadow-generator/ |