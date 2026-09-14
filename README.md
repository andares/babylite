# babylite

[![skills.sh](https://skills.sh/b/andares/babylite)](https://skills.sh/andares/babylite)
[![npm](https://img.shields.io/npm/v/@andares/babylite.svg)](https://www.npmjs.com/package/@andares/babylite)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

一个 **agent skill**：把 [Babylon Lite](https://doc.babylonjs.com/lite/)（`@babylonjs/lite`）的官方文档做成**离线可查**的资料包。
装了它之后，agent 在写基于 `@babylonjs/lite` 的项目时，可以直接在本地查到"这个效果该调哪个 API、参数怎么传、坑在哪"，
**不需要联网检索，也不需要凭记忆猜签名**。

```bash
npx @andares/babylite install     # 推荐：装一次到共享目录 ~/.agents/skills/，Pi / DSH / Codex / Cursor… 都能发现
```

## 为什么需要它

`@babylonjs/lite` 是 Babylon.js 的 WebGPU 原生渲染器，API 形态是**工厂函数 + 纯数据实体**
（`createEngine` / `createSceneContext` / `addToScene` / `registerScene` / `startEngine`），
与 `@babylonjs/core` 的类式 API（`new Scene(engine)` / `new PBRMaterial()`）完全不同。
模型对 Babylon.js 全量版的记忆在这里是**负资产**：写出来的类式代码在 Lite 里根本不存在，而模型对 Lite 的细节记忆又很少。
本仓库用"离线快照 + 效果索引"补上这块，并顺手纠正类式 API 的惯性。

## 内容

```text
SKILL.md                      # skill 入口：检索协议 + 高频陷阱表
AGENTS.md                     # 项目说明与维护流程
package.json                  # npm 包 @andares/babylite（发布用，pnpm 管理）
pnpm-lock.yaml                # pnpm 锁文件
bin/babylite.mjs              # 安装器 CLI：把 skill 复制进 agent 的 skill 目录
references/
├── INDEX.md                  # 第 1 跳：效果词（中/英）→ API 范围 + 主题文件 + 原文档 URL
├── README.md                 # 速查使用说明、铁律、数据来源
├── topics/                   # 第 2 跳：13 个主题（API 范围表 + 最小示例）
└── raw-doc/                  # 第 3 跳：官方 61 页完整 markdown 快照（可 grep）
scripts/verify-docs.mjs       # 链接、路径与发布包一致性校验
scripts/publish.mjs           # 一键发布（校验 → bump → commit+tag → pnpm publish → push）
```

三层资料的分工：**`INDEX.md` 回答"用哪个 API"**，**`topics/` 回答"怎么写"**，
**`raw-doc/` 回答"边界行为和完整选项是什么"**。

覆盖范围（13 个主题）：场景/引擎、相机与操控、灯光与阴影、模型与环境加载、PBR/标准材质、
着色器与后处理、动画（骨骼/morph/VAT）、网格几何与数学、GPU 拾取、粒子/精灵/文字/音频、
物理与 WebXR、无头渲染与性能工程、从 Babylon.js 迁移。

## 安装

本 skill 就是一个目录包（`SKILL.md` + `references/`）。**装一次到共享 skill 目录即可，不需要按 agent 分别安装、也不需要 `-a` 指定。**

### 推荐：装到共享目录

```bash
npx @andares/babylite install            # → ~/.agents/skills/babylite（所有项目可用）
npx @andares/babylite install --project  # → ./.agents/skills/babylite（仅当前项目）
```

`.agents/skills/` 是当前生态正在收敛的共享目录，装一次这些 agent 就能自动发现：

- **全局** `~/.agents/skills/`：Pi、DSH、Zed、Cline、Dexto、Kimi Code CLI、Loaf、Sarvam Code、Warp
- **项目级** `.agents/skills/` 覆盖面更广，另有 Codex、Cursor、GitHub Copilot、Gemini CLI、OpenCode、Kilo Code、Antigravity、Droid 等（20+ 个 agent）
- Pi 另外也接受 `~/.pi/agent/skills/` 与 `<项目>/.pi/skills/`，DSH 另外也接受 `~/.dsh/skills/`；一般不必用到

安装器只往目标目录写 `SKILL.md` + `references/`，**不执行包内脚本、不联网**。目标是本 skill 的既有安装会原地更新；是别人的目录则拒绝，需 `--force`。

### 不在共享约定里的 agent

`skills` CLI 会**自动探测**你装了哪些 agent，并按各自专有目录铺软链——一份正本 + 多条软链，不是重复拷贝（`--copy` 才真拷贝）：

```bash
npx skills add andares/babylite        # 自动探测；交互确认装到哪些 agent
npx skills add andares/babylite --all  # 所有 skill → 所有 agent，不提示
```

Claude Code（`~/.claude/skills/`）等用它。DSH 不在该 CLI 的 agent 列表内，所以 DSH 走上一条命令或 `/skill install github:andares/babylite`。

> ⚠️ 别用 `-g -a universal`：该 CLI 把 `universal` 的**全局**路径映射到 `~/.config/agents/skills/`，**不在共享约定上**，Pi 与 DSH 都不会读它。（它的项目级路径 `.agents/skills/` 才是对的。）

### 手动安装 / 想固定版本

```bash
git clone git@github.com:andares/babylite.git ~/.agents/skills/babylite

# 或从已有克隆软链过去，git pull 后即时生效
ln -s /path/to/babylite ~/.agents/skills/babylite
```

### 目录对照

| 范围 | 路径 | 谁读 |
| --- | --- | --- |
| 全局（推荐） | `~/.agents/skills/babylite/` | Pi、DSH、Zed、Cline、Warp… |
| 当前项目（推荐） | `<项目根>/.agents/skills/babylite/` | 上述 + Codex、Cursor、Copilot、Gemini CLI、OpenCode… |
| DSH 专有 | `~/.dsh/skills/`、`<项目根>/.dsh/skills/` | 仅 DSH（一般不必用） |
| 各 agent 专有 | `~/.claude/skills/`、`~/.cursor/skills/`… | 交给 `npx skills add` 自动处理 |

安装后 skill 列表里应出现 `babylite`；没出现就刷新/重启会话（本 skill 是纯文档包，无需 `trust` 即可读取）。

## 使用

装好后 agent 会在遇到 `@babylonjs/lite` 相关任务时自动加载本 skill 并按其检索协议查文档。
如果你要手动确认内容——人或 agent 都可以直接读：

```bash
# 从"效果"找 API（中/英检索词都行）
grep -n "大规模实例\|thin instance" references/INDEX.md

# 直接看某个主题
sed -n '1,60p' references/topics/08-meshes-geometry.md

# 在官方原文快照里全文检索（比速查更深）
grep -rn "setThinInstances" references/raw-doc/
```

对被开发项目而言，**最权威的签名来源仍是项目内 `node_modules/@babylonjs/lite/**.d.ts`**——它与安装版本严格一致。
本仓库的定位是"离线 + 快"，不是"权威"：判据优先级为 `node_modules` 源码 > `raw-doc` 快照 > `topics`/`INDEX` > 模型记忆。

## 数据来源与时效

- 抓取源：<https://doc.babylonjs.com/lite/> 左侧菜单全部 **61 页**（另加 `_nav-index.md` 菜单索引）。
- 抓取时间：**2026-08-29**；每个快照文件头部保留 `title` / `source`（原始 URL）/ `section`。
- 与线上文档冲突时**以官方文档为准**；刷新流程见 `AGENTS.md`，改完跑 `node scripts/verify-docs.mjs` 校验。
- 官方文档更新快于本快照，欢迎提 issue 提醒刷新。

## 开发与发布（维护者）

本仓库**只用 pnpm** 管理自己的开发流程（`packageManager` 已固定，锁文件为 `pnpm-lock.yaml`）；
包本身仍然发布到 npm registry。用户侧的安装命令与这里无关。

```bash
pnpm install                     # 无依赖，仅用于同步锁文件
pnpm verify                      # 跑校验（等价 node scripts/verify-docs.mjs）
pnpm release patch               # 1.0.0 → 1.0.1；也支持 minor / major
pnpm release patch --dry-run     # 只打印计划
pnpm release patch --no-push     # 发布但不 push / 不建 GitHub Release
pnpm tag-current                 # 仅给当前版本打本地 tag
```

一条命令完成：校验 → bump `package.json` 与 `SKILL.md` 版本 → commit + tag → `pnpm publish` →
push 分支与 tag → 建 GitHub Release（需 `GITHUB_TOKEN`，缺省只提示）。发布后 skills.sh 会随仓库同步。
细节与回滚见 `AGENTS.md`。

## 许可

本仓库整理内容以 [MIT](LICENSE) 发布；文档原文版权归 Babylon.js 项目所有（其公开文档随 Babylon.js 以 Apache-2.0 发布）。
