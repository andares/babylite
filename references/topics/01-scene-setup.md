# 01 · 场景搭建与渲染循环

> **效果检索词**：初始化 / 起步 / engine setup · 场景 scene · 渲染循环 render loop · 每帧 onBeforeRender · 添加/移除对象 · 显隐 show/hide · 错误码 error code
> **源页快照**（skill 根相对路径，含完整源码级细节）：`references/raw-doc/00-welcome.md` · `references/raw-doc/01-getting-started.md` · `references/raw-doc/architecture/00-overview.md` · `references/raw-doc/architecture/01-scene.md` · `references/raw-doc/architecture/22-engine.md`

## API 范围（按调用顺序）

| API | 用途 | 要点 |
| --- | --- | --- |
| `await createEngine(canvas)` | 创建 WebGPU 引擎 | 一切的第一步，必须 await；也支持离屏/换设备场景 |
| `createSceneContext(engine)` | 创建场景（纯数据对象） | 一个引擎一个场景（"one scene, one engine"）；不是类实例 |
| `addToScene(scene, entity)` | 注册实体（网格/灯/相机/材质等） | 不调用则不渲染；`removeFromScene(scene, entity)` 移除即停止渲染与释放 GPU 资源（等价旧 `dispose()`） |
| `registerScene(scene)` | 完成场景组装 | **必须在所有 addToScene 之后**调用一次；之后改配置需重建/标记（如 `rebuildMaterial`） |
| `await startEngine(engine)` | 启动渲染循环 | 等价旧 `engine.runRenderLoop(() => scene.render())`；渲染循环由此接管 |
| `onBeforeRender(scene, fn)` | 每帧回调 | 替代 `scene.onBeforeRenderObservable.add(fn)` |
| `attachControl(camera, canvas, scene)` | 轨道相机操控 | 自由相机用 `attachFreeControl(camera, canvas, scene)`；操控是独立函数，不在相机构造时附带 |
| `setSubtreeVisible(node, false)` | 隐藏节点及其子树 | 比移除轻量，适合对象池/临时显隐（不重传 GPU 数据） |
| `createTransformNode()` | 父子层级 | 世界矩阵惰性传播；`cloneTransformNode()` 克隆子树 |
| `enableErrorDecoding()` / `decodeError(err)` | 错误信息解码 | 默认错误只是数字码 `#<code>`；dev 下 `enableErrorDecoding()` 全量开启，生产可用 `decodeError` 按需还原 |
| `disposeScene(scene)` / `resizeEngine` / `setEngineSize` | 生命周期/尺寸 | 清理场景；引擎尺寸变更/离屏用 |
| `waitForGpuIdle()` / `getRenderTaskGpuTimings()` | GPU 时序 | `setGpuTimingEnabled` 开启后取渲染任务耗时 |

⚠️ **心智模型（与 Babylon.js 的差异）**：Lite 是"纯数据 + 自由函数"——没有 `new Scene()`、没有类方法；
实体是普通对象，行为全在树摇友好的独立函数里。忘了类式 API，用工厂函数 + `addToScene`。

## 最小示例（官方起步示例）

```ts
import {
    createEngine, createSceneContext, createHemisphericLight,
    createSphere, createPbrMaterial, addToScene, registerScene, startEngine,
} from "@babylonjs/lite";

const engine = await createEngine(canvas);
const scene = createSceneContext(engine);

addToScene(scene, createHemisphericLight([0, 1, 0], 1.0));

const sphere = createSphere(engine, { segments: 16, diameter: 2 });
sphere.material = createPbrMaterial({ baseColorFactor: [0.9, 0.1, 0.1, 1], metallicFactor: 0.1, roughnessFactor: 0.4 });
addToScene(scene, sphere);

await registerScene(scene);   // 所有实体添加完成后
await startEngine(engine);    // 开始渲染
```

## 相关效果

| 效果 | 关键 API | 原文档 |
| --- | --- | --- |
| 加载模型/环境 | `loadGltf` / `loadEnvironment`（见 04 主题） | https://doc.babylonjs.com/lite/architecture/04-loaders/ |
| 默认相机 | `createDefaultCamera(scene)`（见 02 主题） | https://doc.babylonjs.com/lite/architecture/02-camera/ |
| 无 GPU 服务器端 | `createNullEngine` / `runHeadlessSteps`（见 12 主题） | https://doc.babylonjs.com/lite/05-headless-null-engine/ |
| BJS→Lite 全对照表 | porting-guide Quick Reference（见 13 主题） | https://doc.babylonjs.com/lite/03-porting-guide/ |