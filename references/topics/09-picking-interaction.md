# 09 · 拾取与交互（GPU Picking）

> **效果检索词**：拾取/拾取器 pick · 射线 ray · hover 悬停 · 点击 click · 命中检测 hit test · pickedMesh/pickedPoint · 面拾取 faceId/barycentric · thin instance 拾取 · 高斯泼溅拾取 Gaussian splatting pick · 广告牌拾取 billboard pick
> **源页快照**（skill 根相对路径，含完整源码级细节）：`references/raw-doc/architecture/18-picking.md`

## API 范围

| API | 用途 | 要点 |
| --- | --- | --- |
| `createGpuPicker(scene)` | 创建绑定场景的 GPU 拾取器 | 返回纯状态对象 `GpuPicker`（无类方法，全部用独立函数）；1×1 渲染目标在**首次 pick 时**才懒分配 |
| `pickAsync(picker, x, y, options?)` | 在像素 (x, y) 执行一次拾取 | 异步（GPU 读回）；`PickOptions`: `filter`（按 mesh 过滤）/ `ignore`（穿透拾取身后表面）/ `discard`（自定义 WGSL 丢弃规则）/ `debugLabel`；返回 `PickingInfo` |
| `disposePicker(picker)` | 释放拾取器 GPU 资源 | 销毁 ID/depth/detail 目标、staging buffer、scene UBO 与各 contributor 状态 |
| `enableDetailedPicking(picker)` | 开启精确图元级拾取 | **opt-in**；仅当设备支持 WebGPU `primitive-index` 特性时生效（`createEngine` 会在可用时自动请求该特性），否则为 no-op、保持基础模式；**没有 CPU 三角形搜索回退** |
| `getPickedNormal(info, useWorldCoordinates?)` | 重心坐标插值拾取点法线 | 等价 BJS `pickingInfo.getNormal(..., true)`；world-adjusted 命中时返回 `null` |
| `getPickedUV(info)` | 重心坐标插值拾取点 UV | 等价 BJS `pickingInfo.getTextureCoordinates()` |
| `PickingInfo`（类型） | 拾取结果 | `hit` / `distance` / `pickedPoint` / `pickedMesh`（Mesh 或 GaussianSplattingMesh）/ `faceId`（无 detailed 时 -1）/ `bu` `bv`（重心坐标）/ `subMeshId` / `thinInstanceIndex`（非 thin 为 -1）/ `ray`（detailed 运行时设置） |
| `PickOptions.ignore` / `PickIgnore`（类型） | 内部/低层：忽略选中体直接操纵 | 忽略整 mesh（含全部 thin）或仅忽略单个/连续区间 thin instance，同一深度排序 GPU pass 内 discard，无需二次拾取 |
| `PickDiscardRule` / `PickDiscardStorage`（类型） | 内部/低层：GPU 丢弃谓词 | 自定义 `wgsl` + 可选 `worldAdjustWgsl`（镜像顶点位移）+ `storage` 绑定 + `vertexData` 属性（`normal/uv/uv2/tangent/color` flat 插值）；WGSL/布局变更时**必须改 `key`** 否则缓存管线失效 |
| `_cpuPositions` / `_cpuNormals` / `_cpuUvs` / `_cpuIndices`（Mesh 字段） | 内部/低层：CPU 几何缓存 | 供重心插值重建；由 `createMeshFromData`、glTF / .babylon loader 自动填充，无需拷贝 |
| `createPickingRay` / `registerPickSource` / `pickBillboardSprite` | 内部/低层：配套入口 | `createPickingRay`（ray.ts，射线构造）；可选可拾取实体通过 `registerPickSource` 注册 contributor；`pickBillboardSprite` 读取 `info._spritePick` 命中载荷 |

⚠️ **心智模型**：拾取是 **GPU 1×1 离屏 pass**（pick-zoomed VP，只有被选像素存活），不是 BJS 的 CPU `scene.pick`。
`Mesh.visible` **不是**拾取门槛（gizmo 用隐形放大碰撞体保持可拾取）；排除 mesh 要用 `Mesh.pickable === false`、
`filter` 或 `ignore`。异步读回期间场景变异不会重映射 ID（ID 范围在录制时快照）。

## 最小示例

页面无完整端到端示例，以下为参照 18-picking 页 Lifecycle 一节结构的最小伪例：

```ts
import { createGpuPicker, enableDetailedPicking, pickAsync, getPickedNormal, disposePicker } from "@babylonjs/lite";

const picker = createGpuPicker(scene);          // 1. 创建：纯状态，目标懒分配
enableDetailedPicking(picker);                   // 2. 可选：设备支持 primitive-index 时启用精确 faceId/bu/bv

// 3. 点击/hover 处理器中拾取屏幕像素 (x, y)
const info = await pickAsync(picker, x, y, {
    filter: (mesh) => mesh !== ground,           // 排除地面等不可交互 mesh
});
if (info.hit) {
    console.log(info.pickedMesh, info.pickedPoint, info.distance);
    const n = getPickedNormal(info, true);       // 世界坐标插值法线（需 detailed 模式数据）
}

// 4. 不再拾取时释放 GPU 资源
disposePicker(picker);
```

## 相关效果

| 效果 | 关键 API | 原文档 |
| --- | --- | --- |
| 点击/hover 选中网格 | `createGpuPicker` + `pickAsync` | https://doc.babylonjs.com/lite/architecture/18-picking/ |
| 精确面/UV/法线拾取 | `enableDetailedPicking` + `getPickedNormal` / `getPickedUV` | https://doc.babylonjs.com/lite/architecture/18-picking/#exact-gpu-detailed-results |
| 选中体穿透拾取（直接操纵） | `PickOptions.ignore` | https://doc.babylonjs.com/lite/architecture/18-picking/#ignore-one-visible-identity |
| 自定义 GPU 丢弃规则 / 位移镜像 | `PickDiscardRule`（`wgsl` / `worldAdjustWgsl`） | https://doc.babylonjs.com/lite/architecture/18-picking/#pick-vertex-world-adjustment |
| thin instance 单实例拾取 | `pickAsync` → `info.thinInstanceIndex` | https://doc.babylonjs.com/lite/architecture/18-picking/ |
| 高斯泼溅 / 广告牌拾取 | contributor（`registerPickSource` / `attachGaussianSplattingMesh` / 广告牌 `pickBillboardSprite`） | https://doc.babylonjs.com/lite/architecture/18-picking/#pick-contributors-optional-entity-types |
| BJS→Lite 拾取对照 | `scene.pick` → `pickAsync` 等 | https://doc.babylonjs.com/lite/architecture/18-picking/#babylonjs-equivalence-map |
