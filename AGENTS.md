# AGENTS.md

给在本仓库工作的 agent 的项目说明。**先读完本文件再动手改任何东西。**

## 项目是什么

本仓库是**一个 agent skill**，把 Babylon Lite（`@babylonjs/lite`）的官方文档做成**离线可查**的资料包，
让 agent 在开发基于 `@babylonjs/lite` 的项目时，能直接从本仓库内的文档拿到 API 事实，**不必联网检索、也不靠记忆**。

- 交付形态：skill 目录包 `<name>/SKILL.md`，仓库根即 skill 目录，`name: babylite`。
- 分发渠道：**公开 GitHub 仓库**（skills.sh 直接索引，`npx skills add andares/babylite`）
  与 **npm 包 `@andares/babylite`**（含安装器 CLI，`npx @andares/babylite install`）。
- 目标使用者：在被开发项目中写 Babylon Lite 代码的 agent（不是本仓库的开发工具）。
- 不提供：`@babylonjs/lite` 的源码、可运行示例工程。本仓库**只有文档 + 一个安装器**。

Babylon Lite 是 Babylon.js 的 WebGPU 原生渲染器，API 形态是**工厂函数 + 纯数据实体**，
与 `@babylonjs/core` 的类式 API 完全不同——这正是需要一个专门速查 skill 的原因。

## 目录结构

```text
.
├── SKILL.md                  # skill 入口：触发描述 + 检索协议 + 高频陷阱（agent 实际读到的文件）
├── AGENTS.md                 # 本文件：项目说明与维护流程
├── README.md                 # 面向人的介绍与安装方式
├── LICENSE
├── package.json              # npm 包 @andares/babylite（发布与版本，见约定 8–9）
├── bin/babylite.mjs          # 安装器 CLI：把 skill 复制进 agent 的 skill 目录
├── references/               # 全部资料，随 skill 一起分发
│   ├── INDEX.md              # 第 1 跳：效果词（中/英）→ API 范围 + 主题文件 + 原文档 URL
│   ├── README.md             # 速查自身的使用说明、铁律、数据来源
│   ├── topics/               # 第 2 跳：13 个主题，含 API 范围表 + 最小示例 + 源页清单
│   │   └── NN-*.md
│   └── raw-doc/              # 第 3 跳：官方 61 页的完整 markdown 快照（可 grep），另含 _nav-index.md
│       ├── 0N-*.md
│       └── architecture/NN-*.md
└── scripts/
    ├── verify-docs.mjs       # 校验：链接、路径、包一致性
    ├── publish.mjs           # 一键发布：校验 → bump → commit+tag → npm publish → push
    └── tag-current.mjs       # 给当前版本打本地 tag（已存在则跳过）
```

`references/topics/` 与 `references/raw-doc/` 的区别：
**topics 是蒸馏结果**（人读，回答"用哪个 API"），**raw-doc 是原文快照**（机器 grep，回答"边界行为/完整选项是什么"）。

## 不得破坏的约定

1. **路径一律相对 skill base directory**（仓库根）。
   `references/INDEX.md`、`references/raw-doc/architecture/06-pbr-material.md` 这类写法在 SKILL.md、topics 头部、
   参考文档中都表示"相对仓库根"。不要引入 `../`、绝对路径或 `babylite/` 前缀。
2. **raw-doc 的文件名与官方 URL 路径一一对应**，且每个文件头部的 YAML 保留 `title` / `source` / `section`。
   改文件名或删字段会让 `INDEX.md` 里的原文档 URL 无法与本地文件互查。
3. **不要手改 raw-doc 的正文**。它是快照，只允许整体替换（刷新）；要补充解读请写进 `topics/`。
4. **topics 头部必须列出该主题的源页快照路径**（第 3 跳入口）。这是 topics 与 raw-doc 之间的唯一定位关系。
5. **速查不给完整签名表**。精确签名属于被开发项目的 `node_modules/@babylonjs/lite/**.d.ts`；
   不要把猜测的签名写进 topics 当作事实。速查只写"效果 → API 范围 → 要点/陷阱"。
6. **判据优先级**：`node_modules` 源码 > `raw-doc` 快照 > `topics`/`INDEX` 蒸馏 > 模型记忆。
   凡写入本仓库的 API 事实，必须能在 `raw-doc` 中找到出处。
7. **SKILL.md 的 frontmatter 必须保持有效**：`name` 为 kebab-case（当前 `babylite`），`description` 面向触发匹配、
   前 200 字符内出现最关键触发词。frontmatter 解析失败会导致整个 skill 被静默丢弃。
8. **版本号只有一个事实来源的两个副本**：`package.json` 的 `version` 与 `SKILL.md` 的 `metadata.version` 必须相等。
   改版本请走 `npm run release`（它同时写两处），不要手改其一；`verify-docs.mjs` 会拦截不一致。
9. **`package.json` 的 `files` 必须覆盖 `SKILL.md` 与 `references`**，否则 npm 装出来的包缺文档。
   `scripts/` 与 `bin/` 之外不要新增需要随包分发的顶层目录而不更新 `files`。
10. **安装器只做复制，不做别的**：`bin/babylite.mjs` 只往目标 skill 目录写 `SKILL.md` + `references/`，
    不得执行包内脚本、不得联网、不得越出目标目录；覆盖他人目录必须要求 `--force`。

## 作为使用方（在被开发项目中）

agent 被加载本 skill 后，按 SKILL.md 的检索协议走：`references/INDEX.md` → `references/topics/NN-*.md`
→ `references/raw-doc/**` → 项目内 `node_modules/@babylonjs/lite/**.d.ts`。
核心提醒：**先在本 skill 内查，不要先联网**；Lite 用工厂函数，不要写 `@babylonjs/core` 的类式代码。

## 作为维护方（更新本仓库）

### 刷新流程（上游文档变更时）

1. 重新抓取 https://doc.babylonjs.com/lite/ 左侧菜单全部页面，产出新的 `raw-doc/` 快照；
   保持"文件名 ↔ URL 路径"对应与文件头 `title` / `source` / `section` 元信息。
2. 更新 `references/raw-doc/_nav-index.md` 的菜单索引表。
3. 依据新快照重新蒸馏 `references/INDEX.md` 与 `references/topics/`，并同步更新
   每个 topic 头部的"源页快照"路径清单。
4. 更新三处版本标记：`SKILL.md` 的 `metadata.docs-snapshot`、`references/README.md` 的抓取时间与页数、
   本文件的约定（如有变化）。
5. 跑校验脚本（下节），全绿才算完成。

### 校验

```bash
node scripts/verify-docs.mjs
```

校验内容：`SKILL.md` frontmatter 必需字段与 kebab-case 名称；`INDEX.md` 中所有 `topics/*.md` 链接存在；
所有 topic 头部列出的 `references/raw-doc/**` 路径存在；全仓库 markdown 内部链接可解析；
文档中不存在 `babylite/` 前缀或指向仓库外的相对路径；`raw-doc` 页数与 `_nav-index.md` 记录一致；
`package.json` 存在且名称/版本/`files`/`bin` 与 skill 包一致（约定 8–10）。

### 发布与分发

```bash
npm run release patch                  # 1.0.0 → 1.0.1（也支持 minor / major）
npm run release patch -- --dry-run     # 只打印计划，不改任何东西
npm run release patch -- --no-push     # 发 npm，但不 push、不建 GitHub Release
npm run tag-current                    # 仅给当前版本打本地 tag（已存在则跳过）
```

`scripts/publish.mjs` 的步骤：校验（`verify-docs.mjs` + `npm pack --dry-run` 检查 tarball 内容）
→ 同时 bump `package.json` 与 `SKILL.md` 的 `metadata.version` → `chore: release vX.Y.Z` commit
→ `tag-current.mjs` 打 `vX.Y.Z` → `npm publish`（`prepublishOnly` 会再跑一次校验）
→ 仅在 npm 成功后 push 分支与 tag，并用 `GITHUB_TOKEN` 建 GitHub Release（best-effort，失败只警告）。

发布失败回滚：`git tag -d vX.Y.Z && git reset --hard HEAD~1`。

**两个渠道的关系**：

| 渠道 | 来源 | 安装方式 | 说明 |
| --- | --- | --- | --- |
| skills.sh | 公开 GitHub 仓库 | `npx skills add andares/babylite` | **无需注册、无需提交、无需审核**：skills.sh 索引公开 GitHub 仓库中的 `SKILL.md`（仓库根即可）。所以发布 = push 到公开仓库 |
| npm | package.json | `npx @andares/babylite install` | npm 装到 `node_modules/`，agent 不扫描该目录，故包内 `bin` 安装器负责复制进 skill 目录 |

skills.sh 注意点：

- 榜单按 `skills` CLI 的匿名安装遥测排序；**仓库要先被装过一次**（例如自己跑一次 `npx skills add andares/babylite`）
  才会出现在榜单/仓库页上。
- 可选：仓库根加 `skills.sh.json` 自定义仓库页分组；本仓库只有一个 skill，**不需要**。
- README 里的徽章 `https://skills.sh/b/andares/babylite` 在收录后才会显示数字。
- 若仓库转为私有，skills.sh 将不再能索引。
- 不得提交隐藏安装脚本或凭证收集代码；`bin/babylite.mjs` 的行为约束见约定 10。

### 改动前的检查清单

- 改文档后必须重跑 `node scripts/verify-docs.mjs`，并人工抽查 3 个 topic 的链接可达。
- 新增 API 事实必须同时在 `topics/` 与该主题的 `raw-doc` 源页中可查；只有 topics 有、raw-doc 没有的，视为待核实。
- 不要在 `references/` 下新增二进制、图片或大规模冗余文件：skill 会在安装时整体复制。

## 来源与许可

- 文档内容来自 Babylon.js 官方文档 https://doc.babylonjs.com/lite/ （Apache-2.0 项目的公开文档），
  抓取快照时间为 2026-08-29；每页头部保留 `source:` 原始 URL。
- 本仓库代码与整理内容以 MIT 许可发布（见 `LICENSE`）。
- 上游文档更新快于本快照，且以官方文档为准；本仓库的价值是**离线与检索速度**，不是权威性。
