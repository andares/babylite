---
name: babylite
description: "Use when writing, reviewing, debugging, or porting code that uses @babylonjs/lite (Babylon.js Lite, the WebGPU factory-function renderer) — and prefer it over web searching, because this skill bundles an offline snapshot plus a distilled effect index of the whole official doc set. Triggers: @babylonjs/lite or babylite imports; createEngine / createSceneContext / addToScene / registerScene / startEngine; porting @babylonjs/core class-style code (new Scene, new PBRMaterial, scene.render); PBR/subsurface/clearcoat materials; CSM or ESM shadows; frame graph, post-process, WGSL shader material; thin instances; animation groups, skeleton, morph, VAT; GPU picking; node particles, sprites, text, audio; Havok physics; WebXR; null/headless engine; device-lost recovery. Also use when asked which Babylon Lite API to call, or for offline Babylon Lite docs."
whenToUse: "Any task that reads, writes, reviews, or migrates Babylon Lite (@babylonjs/lite) code, or that needs Babylon Lite API facts without network access."
metadata:
  version: "1.0.1"
  docs-snapshot: "2026-08-29"
  upstream: "https://doc.babylonjs.com/lite/"
---

# Babylon Lite（`@babylonjs/lite`）离线 API 速查

本 skill 自带 Babylon Lite 官方文档的**本地原文快照**与**按效果索引的蒸馏速查**。
开发/调试基于 `@babylonjs/lite` 的项目时，**先在本 skill 内检索，不要先联网查文档**。

## 路径约定（先读）

- 本 skill 的 base directory 就是含本 `SKILL.md` 的仓库根目录。
- **本 skill 中的一切文件路径都相对 base directory**，如 `references/INDEX.md` 实际是 `<base>/references/INDEX.md`。
  在被开发项目里工作时，用 base directory 拼绝对路径再读文件。
- Markdown 链接（如 `references/INDEX.md` 内的 `topics/01-scene-setup.md`）按常规相对其所在文件解析。

## 铁律

1. **只用 `@babylonjs/lite` 原生工厂函数 API**：`await createEngine(canvas)` → `createSceneContext(engine)` →
   `addToScene(scene, entity)` → `await registerScene(scene)` → `await startEngine(engine)`。
2. **禁止 `@babylonjs/core` 类式写法**：`new Scene(engine)`、`new PBRMaterial()`、`scene.render()`、`mesh.dispose()`
   在 Lite 里都不存在。Lite 是"纯数据实体 + 自由函数"，没有类实例。
3. `@babylonjs/lite-compat` 只是构建期改写 import 的过渡兼容层，**不是原生路径**，新代码不要走它。
4. 速查**不提供完整签名表**。要精确的参数/返回类型/可选值，读被开发项目的
   `node_modules/@babylonjs/lite/**.d.ts`（与安装版本严格一致，优先级高于本 skill 的快照）。
5. 遇 `@babylonjs/core` 旧代码要改写时，不要凭记忆逐行翻译，先查 `references/topics/13-porting-compat.md`。

## 检索协议

按顺序用最浅的够用跳数，不要一次读一堆文件：

| 跳 | 查什么 | 何时停 |
| --- | --- | --- |
| 1 | `references/INDEX.md` — 效果词（中/英）→ 关键 API 范围 + 主题文件 + 原文档 URL | 已知函数名与关键参数即停 |
| 2 | `references/topics/NN-*.md` — API 范围表 + 最小示例 + 相关效果 | 拿到可照抄的最小示例即停 |
| 3 | `references/raw-doc/**` — 主题文件顶部列出的"源页快照"，含完整示例与源码级细节 | 需要边界行为/完整选项时 |
| 4 | `<项目>/node_modules/@babylonjs/lite/**.d.ts` | 需要精确签名时 |

主题路由（第 2 跳入口，细节在第 1 跳索引里）：

| 主题文件 | 覆盖范围 |
| --- | --- |
| `references/topics/01-scene-setup.md` | 引擎/场景初始化、渲染循环、每帧回调、增删实体、显隐、错误码 |
| `references/topics/02-cameras-controls.md` | 轨道/自由/正交/地球相机、大世界浮动原点、相机矩阵 |
| `references/topics/03-lights-shadows.md` | 四种灯、ESM/PCF/CSM 阴影、阴影投射注册、静态阴影缓存 |
| `references/topics/04-loading-assets.md` | glTF/GLB、Draco/meshopt、IBL/.env/HDR、天空盒、`.babylon`、Texture2D/KTX |
| `references/topics/05-materials-pbr.md` | PBR（次表面/透射/清漆/绒毛/各向异性）、标准材质、grid、stencil、A2C |
| `references/topics/06-shaders-postfx.md` | WGSL 自定义材质、frame graph、后处理、bloom/SSGI、G-buffer、异步管线编译 |
| `references/topics/07-animation.md` | 动画组、权重混合、cross-fade、掩码、骨骼控制、morph、VAT |
| `references/topics/08-meshes-geometry.md` | 几何生成、高度图、父子层级、thin instances、几何更新、线段、mat4/vec3 |
| `references/topics/09-picking-interaction.md` | GPU 拾取、精确面/UV 拾取、thin instance 拾取、拾取贡献者 |
| `references/topics/10-particles-text-audio.md` | Node Particle、精灵/广告牌/图集、文字、音频/空间音频/频谱 |
| `references/topics/11-physics-xr.md` | Havok 刚体、碰撞/触发器、射线与形状检测、角色控制器、WebXR |
| `references/topics/12-headless-performance.md` | Null 引擎、固定步长、资源池、storage buffer、包体、设备丢失恢复 |
| `references/topics/13-porting-compat.md` | BJS→Lite 对照表、lite-compat、功能差距总表、Playground |

离线全文检索（比逐个读文件快，且能翻到速查没蒸馏到的细节）：

```bash
# 找某个 API 出现在哪些页（<base> 换成 skill base directory 的绝对路径）
grep -rn "setThinInstances" <base>/references/raw-doc/
# 找某主题里的函数签名/参数说明（raw-doc 保留原始代码块）
grep -rn -A 20 "createCsmDirectionalShadowGenerator" <base>/references/raw-doc/architecture/17-cascaded-shadow.md
# 按 API 名反查速查索引
grep -n "registerScene" <base>/references/INDEX.md
```

## 高频陷阱（写错就白跑一遍）

| 症状 | 正确做法 | 详见 |
| --- | --- | --- |
| 场景不渲染 / 报未注册 | 所有 `addToScene` 之后调一次 `await registerScene(scene)`，再 `await startEngine(engine)`；两步都要 await，且一引擎只配一场景 | 01 |
| 加载函数传错对象 | `loadGltf(engine, source)` / `loadBabylon(engine, url)` / `loadTexture2D(engine, url)` 收 **engine**；`loadEnvironment(scene, url)` / `loadHdrEnvironment(scene, url)` 收 **scene** | 04 |
| `loadEnvironment` 报缺少参数 | `brdfUrl` 是**必填**项，不是可选项 | 04 |
| 阴影完全不出现 | 必须显式 `setShadowTaskCasterMeshes(shadowGenerator, casterMeshes)`，接收网格 `mesh.receiveShadows = true`，并用 `registerSceneWithShadowSupport(scene)` 替代 `registerScene` | 03 |
| 开关类能力调了没反应 | 大量能力是 **opt-in**：先调对应 `enable*` / setter，如 `enableStandardVertexColors`、`enableMirroredMeshes(scene)`、`enableMaterialPlugins(scene)`、`enableBoneControl()`、`enableDetailedPicking(picker)`、`enableAsyncShaderPipelineCompilation(engine)` | 05/06/07/09/12 |
| 改了材质属性画面不变 | 改完调 `markMaterialUboDirty(material)`（或 `rebuildMaterial`）；自发光用 `setPbrEmissive(material, color)`，别直接写 `_emissiveColor` | 05 |
| 相机不能转 / 键盘没反应 | 操控不在构造时附带：单独调 `attachControl(camera, canvas, scene)` 或 `attachFreeControl(camera, canvas, scene)`（地球相机用 `attachGeospatialControls`） | 02 |
| 移除对象用了 `dispose()` | Lite 用 `removeFromScene(scene, entity)`，它同时停止渲染并释放 GPU 资源 | 01 |
| 拾取结果拿不到 | 拾取是 GPU 异步的：`createGpuPicker(scene)` → `await pickAsync(picker, x, y, { filter })`，不用时 `disposePicker(picker)` | 09 |
| 阴影/光照数量或顺序受限 | `setMaxLights(n)` 必须在管线创建前调用；排除网格用 `light.excludedMeshIds` / `includedOnlyMeshIds`；CSM 静态缓存 `enableCsmStaticCache` 必须在场景注册前 | 03 |
| 想照搬 BJS 的后处理管线 | Lite 没有 `SSAO2RenderingPipeline` 这类管线；屏幕空间效果走 frame-graph 任务族（`createGeometryRendererTask` + `createScreenSpaceGlobalIlluminationPostProcessTask` 等） | 06 |
| 大坐标场景抖动 | `createEngine(canvas, { useFloatingOrigin: true, useHighPrecisionMatrix: true })`，需要时 `getFloatingOriginOffset(scene)` | 02 |

## 边界

- 项目用的是 `@babylonjs/core`（Babylon.js 全量版）而非 `@babylonjs/lite` 时，本 skill 只对**迁移**场景有用（第 13 主题）。
- 本快照抓取于 2026-08-29（官方 61 页）。与线上文档冲突时以线上文档为准，并按 `AGENTS.md` 的流程刷新本 skill。
- 维护本 skill（刷新快照、重蒸馏、校验链接）见仓库根 `AGENTS.md`。
