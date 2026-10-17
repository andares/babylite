#!/usr/bin/env node
/**
 * One-command release for @andares/babylite.
 *
 * This repository uses **pnpm only** for its own tooling — every command below
 * is the pnpm form (see AGENTS.md). The package is still *published to the npm
 * registry*; "pnpm" is the package manager, "npm" is the registry. End-user
 * install snippets elsewhere in the repo keep their `npx` form on purpose.
 *
 *   pnpm release patch   # 1.0.1 → 1.0.2
 *   pnpm release minor   # 1.0.1 → 1.1.0   (patch zeroed)
 *   pnpm release major   # 1.0.1 → 2.0.0   (minor + patch zeroed)
 *
 * Exactly one of `major | minor | patch` is required. A higher-level bump
 * zeroes every lower level. Flags: `--dry-run` (plan only), `--no-push`
 * (publish to the registry but skip the GitHub push/release step),
 * `--force-publish` (ignore the origin identity check), `--yes` (accepted for
 * compatibility only — see below).
 *
 * HUMAN-ONLY (see AGENTS.md): who may run a release is a **rule, not a lock**.
 * There used to be a terminal check plus a confirmation prompt here; both were
 * removed on the owner's instruction — one friction point per release cost more
 * than the mistake it guarded against. Agents do not run `pnpm release`, `git
 * push`, or anything else that changes public state; that prohibition lives in
 * AGENTS.md, which is what agents read before touching this repository.
 *
 * Flow:
 *   validate args → warn on dirty git tree (non-blocking)
 *   → gate: `scripts/verify-docs.mjs` + tarball sanity check
 *   → bump package.json AND SKILL.md metadata.version (they must stay equal)
 *     + prepend the release section to CHANGELOG.md (commit subjects since the
 *     previous tag — the same range GitHub summarises for the Release)
 *   → git commit `chore: release vX.Y.Z` + tag `vX.Y.Z`
 *     (via scripts/tag-current.mjs — skips if the tag already exists)
 *   → `pnpm publish --no-git-checks` (`prepublishOnly` re-runs verify-docs as
 *     the publish gate)
 *   → 仅在发布成功后：`git push origin <branch> --tags` + `scripts/github-release.mjs`
 *     创建 GitHub Release（best-effort；未设 token / 已存在 / 失败都只警告不中止，
 *     事后可用 `pnpm gh-release vX.Y.Z` 补建）。
 *
 * 发布前会先 `git push --dry-run`：registry 写入发生在 push 之前，push 失败会把
 * 版本停在"npm 有、GitHub 没有"的状态，所以这个问题必须在改任何东西之前暴露。
 *
 * Why both a registry release and a git push: the registry keeps the versioned
 * artifact, while skills.sh indexes the **public GitHub repository** and needs
 * the bumped `SKILL.md` on the default branch to serve
 * `npx skills add andares/babylite`.
 *
 * Notes:
 *  - Git commit + tag are part of the release. `pnpm publish` is the only step
 *    that touches the network; a failure there leaves the version bumped and
 *    tagged, with the rollback printed below.
 *  - `--no-git-checks` is passed because unrelated uncommitted work in the tree
 *    is warned about, not treated as fatal; the version-bump commit is staged
 *    explicitly.
 *  - The published tarball ships `SKILL.md`, `AGENTS.md`, `references/`, and
 *    `bin/` (package.json "files"); `scripts/` is never published.
 *  - GitHub Release 需要 fine-grained token（Contents: write），存于
 *    GITHUB_TOKEN 环境变量；创建失败不影响已发布的 npm 包。
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PKG_PATH = join(ROOT, 'package.json');
const SKILL_PATH = join(ROOT, 'SKILL.md');
const BUMPS = ['major', 'minor', 'patch'];

const C = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

// pnpm forwards a literal `--` through to the script (npm strips it), so drop it
// and accept both `pnpm release patch --dry-run` and `... patch -- --dry-run`.
const args = process.argv.slice(2).filter((a) => a !== '--');
const flags = args.filter((a) => a.startsWith('--'));
const positional = args.filter((a) => !a.startsWith('--'));
const dryRun = flags.includes('--dry-run');
const skipPush = flags.includes('--no-push');
const forcePublish = flags.includes('--force-publish');

const KNOWN = ['--dry-run', '--no-push', '--force-publish', '--yes'];
const UNKNOWN = flags.filter((f) => !KNOWN.includes(f));
if (!BUMPS.includes(positional[0]) || positional.length !== 1 || UNKNOWN.length > 0) {
  console.error(
    `${C.red}${C.bold}Usage: pnpm release <${BUMPS.join('|')}> [--dry-run] [--no-push] [--force-publish] [--yes]${C.reset}` +
      `\n  Bump the package version and publish to the npm registry (requires exactly one bump argument).` +
      `\n  --dry-run        preview the plan without changing anything.` +
      `\n  --no-push        publish to the registry but skip git push and the GitHub Release.` +
      `\n  --force-publish  publish even when origin does not match package.json repository.url.` +
      `\n  --yes            accepted for compatibility; a release no longer asks or checks anything.`,
  );
  process.exit(1);
}
const bump = positional[0];

let pkg;
try {
  pkg = JSON.parse(readFileSync(PKG_PATH, 'utf8'));
} catch {
  console.error(`${C.red}package.json is missing or not valid JSON: ${PKG_PATH}${C.reset}`);
  process.exit(1);
}
const current = pkg.version;
if (typeof current !== 'string' || !/^\d+\.\d+\.\d+$/.test(current)) {
  console.error(`${C.red}Unexpected package.json version: ${JSON.stringify(current)}${C.reset}`);
  process.exit(1);
}

const [maj, min, pat] = current.split('.').map(Number);
let next;
if (bump === 'major') next = `${maj + 1}.0.0`;
else if (bump === 'minor') next = `${maj}.${min + 1}.0`;
else next = `${maj}.${min}.${pat + 1}`;

// GitHub owner/repo (for the REST API), parsed from package.json repository.url.
const repoMatch = pkg.repository?.url?.match(/github\.com[/:]([^/]+)\/([^/.]+?)(?:\.git)?$/);
const ghRepo = repoMatch ? `${repoMatch[1]}/${repoMatch[2]}` : 'andares/babylite';

console.log(
  `${C.dim}release${C.reset} ${C.bold}${current}${C.reset} → ${C.bold}${C.green}${next}${C.reset} (${bump})`,
);

function step(label) {
  console.log(`\n${C.dim}▸${C.reset} ${C.bold}${label}${C.reset}`);
}

function run(cmd, cmdArgs, opts = {}) {
  const res = spawnSync(cmd, cmdArgs, { stdio: 'inherit', cwd: ROOT, ...opts });
  if (res.status !== 0 && !opts.allowFailure) {
    console.error(`${C.red}Failed: ${cmd} ${cmdArgs.join(' ')}${C.reset}`);
    process.exit(res.status ?? 1);
  }
  return res;
}

const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const git = process.platform === 'win32' ? 'git.exe' : 'git';

function tagExists(tag) {
  return (
    run(git, ['rev-parse', '-q', '--verify', `refs/tags/${tag}`], {
      stdio: 'pipe',
      allowFailure: true,
    }).status === 0
  );
}

const branch =
  run(git, ['branch', '--show-current'], { stdio: 'pipe', allowFailure: true })
    .stdout.toString()
    .trim() || 'master';

if (dryRun) {
  console.log(`\n${C.dim}--dry-run -- nothing changed. Would run:${C.reset}`);
  console.log(
    `  1. push preflight: git push --dry-run origin ${branch} --tags` +
      (skipPush ? `（--no-push：跳过）` : ''),
  );
  console.log(`  2. node scripts/verify-docs.mjs + pnpm pack --dry-run`);
  console.log(`  3. bump package.json + SKILL.md metadata.version + CHANGELOG.md → ${next}`);
  console.log(
    `  4. git commit -m "chore: release v${next}" + tag-current` +
      (tagExists(`v${next}`) ? `（tag v${next} 已存在，跳过打 tag）` : `（git tag v${next}）`),
  );
  console.log(`  5. pnpm publish --no-git-checks`);
  if (skipPush) {
    console.log(`  6. --no-push：跳过 git push 与 GitHub Release`);
  } else {
    console.log(
      `  6. git push origin ${branch} --tags + GitHub Release v${next}` +
        (process.env.GITHUB_TOKEN
          ? `（scripts/github-release.mjs，notes 取自 CHANGELOG.md）`
          : `（未设置 GITHUB_TOKEN → 仅 push，Release 跳过；稍后可 pnpm gh-release v${next} 补建）`),
    );
  }
  process.exit(0);
}

// Publishing is irreversible: a version number can never be reused. Refuse to
// publish from a checkout that cannot be the canonical one — the remote must
// exist and agree with package.json repository.url — so accidentally running
// this in a throwaway clone or a copy cannot burn a version on the registry.
// `--force-publish` overrides for mirrors and forks.
if (!forcePublish) {
  const remote = run(git, ['remote', 'get-url', 'origin'], { stdio: 'pipe', allowFailure: true });
  const remoteUrl = remote.stdout.toString().trim();
  const remoteRepo = remoteUrl
    .match(/(?:github\.com[/:])([^/]+\/[^/\s]+?)(?:\.git)?$/)?.[1]
    ?.toLowerCase();
  if (remote.status !== 0 || remoteRepo === undefined) {
    console.error(
      `${C.red}Refusing to publish: no usable \`origin\` remote in ${ROOT}.${C.reset}` +
        `\n  A release must run in the canonical checkout of ${ghRepo}.` +
        `\n  Pass --force-publish only if you really mean to publish from here.`,
    );
    process.exit(1);
  }
  if (remoteRepo !== ghRepo.toLowerCase()) {
    console.error(
      `${C.red}Refusing to publish: origin is ${remoteRepo} but package.json says ${ghRepo}.${C.reset}` +
        `\n  Pass --force-publish only if you really mean to publish from here.`,
    );
    process.exit(1);
  }
}

// Who may run this is a rule, not a lock (see AGENTS.md): releases and pushes
// are human-only, and the agent side of that is enforced by the document every
// agent reads first. The terminal check and the confirmation prompt that used
// to live here were removed on the owner's instruction — the per-release
// friction cost more than the mistake it guarded against.

// The registry write happens before the git push, so a push that cannot succeed
// would strand the version on npm with no tag and no Release on GitHub. The
// release commit does not exist yet, but credentials, non-fast-forward and tag
// conflicts are decided by the remote — so ask it now, while nothing is final.
if (!skipPush) {
  const dry = run(git, ['push', '--dry-run', 'origin', branch, '--tags'], {
    stdio: 'pipe',
    allowFailure: true,
  });
  if (dry.status !== 0) {
    console.error(
      `${C.red}Refusing to publish: \`git push origin ${branch} --tags\` would fail.${C.reset}` +
        `\n  Resolve that first (upstream moved on, credentials, protected branch).` +
        `\n  Nothing has been bumped, tagged or published.` +
        `\n${`${dry.stdout}${dry.stderr}`.trim().split('\n').join('\n  ')}`,
    );
    process.exit(1);
  }
  console.log(`${C.dim}   push preflight: origin/${branch} reachable, fast-forward${C.reset}`);
}

// Dirty-tree warning (non-blocking; the release commit stages its own files).
const dirty = run(git, ['status', '--porcelain'], { stdio: 'pipe' }).stdout.toString().trim();
if (dirty) {
  console.warn(
    `${C.yellow}Warning: uncommitted changes present:\n${dirty
      .split('\n')
      .map((l) => `  ${l}`)
      .join('\n')}${C.reset}`,
  );
}

// 1. Gate — abort before anything is mutated if the bundle is inconsistent.
step('verify docs bundle');
run(process.execPath, [join(ROOT, 'scripts', 'verify-docs.mjs')]);

step('inspect publish tarball');
// `pnpm pack --json` prints one object ({ name, version, files }); npm prints an
// array of them. Accept either shape so a stray npm/pnpm switch cannot silently
// skip the check.
const pack = run(pnpm, ['pack', '--dry-run', '--json'], { allowFailure: true, stdio: 'pipe' });
let packList;
try {
  const parsed = JSON.parse(pack.stdout.toString());
  packList = (Array.isArray(parsed) ? parsed[0] : parsed)?.files?.map((f) => f.path);
} catch {
  packList = undefined; // a non-JSON diagnostic was printed instead
}
if (pack.status !== 0 || packList === undefined) {
  // pnpm may be unavailable or its store unwritable; verify-docs already checked
  // that "files" covers the bundle, so this is a warning rather than a gate.
  console.warn(`${C.yellow}pnpm pack --dry-run 无法执行，跳过 tarball 检查${C.reset}`);
} else {
  for (const required of ['SKILL.md', 'references/INDEX.md', 'bin/babylite.mjs']) {
    if (!packList.includes(required)) {
      console.error(`${C.red}Tarball would not ship ${required} (check package.json "files")${C.reset}`);
      process.exit(1);
    }
  }
  console.log(`${C.dim}   tarball: ${packList.length} files${C.reset}`);
}

// 2. Bump package.json and SKILL.md metadata.version (kept equal by contract),
//    and prepend the CHANGELOG section for this release.
step(`bump version → ${next}`);
pkg.version = next;
writeFileSync(PKG_PATH, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');

const skill = readFileSync(SKILL_PATH, 'utf8');
const versionLine = /^(\s*version:[ \t]*)"[^"]*"/m;
if (!versionLine.test(skill)) {
  console.error(`${C.red}SKILL.md has no quoted metadata.version line to bump.${C.reset}`);
  process.exit(1);
}
writeFileSync(SKILL_PATH, skill.replace(versionLine, `$1"${next}"`), 'utf8');

// The changelog section covers the same commit range GitHub summarises for the
// Release: everything since the previous tag. It is written before the release
// commit exists, so that commit cannot list itself.
const changelogPath = join(ROOT, 'CHANGELOG.md');
if (!existsSync(changelogPath)) {
  console.error(`${C.red}CHANGELOG.md is missing (each release prepends a section).${C.reset}`);
  process.exit(1);
}
let changelog = readFileSync(changelogPath, 'utf8');
if (changelog.includes(`## [${next}]`)) {
  console.warn(`${C.yellow}CHANGELOG.md already has a section for ${next} — left as is.${C.reset}`);
} else {
  const headingAt = changelog.search(/^## /m);
  if (headingAt === -1) {
    console.error(`${C.red}CHANGELOG.md has no \`## [x.y.z]\` section to prepend to.${C.reset}`);
    process.exit(1);
  }
  const previous = run(git, ['describe', '--tags', '--abbrev=0'], {
    stdio: 'pipe',
    allowFailure: true,
  });
  const range = previous.status === 0 ? `${previous.stdout.toString().trim()}..HEAD` : 'HEAD';
  const subjects = run(git, ['log', '--no-merges', '--pretty=format:%s', range], { stdio: 'pipe' })
    .stdout.toString()
    .trim()
    .split('\n')
    .filter(Boolean);
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate(),
  ).padStart(2, '0')}`;
  const bullets =
    subjects.length > 0
      ? subjects.map((s) => `- ${s}`).join('\n')
      : '- (no commits since the previous tag)';
  const entry = `## [${next}] - ${today}\n\n${bullets}\n`;
  changelog = `${changelog.slice(0, headingAt)}${entry}\n${changelog.slice(headingAt)}`;
  writeFileSync(changelogPath, changelog, 'utf8');
}

// 3. Commit, then tag the release commit via tag-current.mjs.
step(`git commit + tag v${next}`);
run(git, ['add', 'package.json', 'SKILL.md', 'CHANGELOG.md']);
run(git, ['commit', '-m', `chore: release v${next}`]);
run(process.execPath, [join(ROOT, 'scripts', 'tag-current.mjs')]);

// 4. Publish (prepublishOnly re-runs verify-docs as the publish gate).
step('pnpm publish');
const publish = run(pnpm, ['publish', '--no-git-checks'], { allowFailure: true });
if (publish.status !== 0) {
  console.error(
    `${C.red}Publish failed. The version bump is already committed + tagged as v${next}.` +
      `\n  To roll back: git tag -d v${next} && git reset --hard HEAD~1${C.reset}`,
  );
  process.exit(publish.status ?? 1);
}

// 5. GitHub: push branch + tags, then create the Release. skills.sh indexes the
//    public repo, so a failed push also means the new version is not discoverable
//    there — reported loudly but not fatal (the registry publish already succeeded).
if (skipPush) {
  step('skip GitHub push (--no-push)');
  console.log(`${C.yellow}已跳过 git push 与 GitHub Release；skills.sh 只有在推送后才会看到新版本。${C.reset}`);
} else {
  step('git push + GitHub Release');
  const push = run(git, ['push', 'origin', branch, '--tags'], { allowFailure: true });
  if (push.status !== 0) {
    console.warn(
      `${C.yellow}git push 失败（可能此前已推过，可忽略）。` +
        `若远端还没有 tag v${next}，Release 将无法指向 release commit，skills.sh 也看不到新版本。${C.reset}`,
    );
  }
  // The Release itself lives in scripts/github-release.mjs — the same helper
  // `pnpm gh-release <tag>` runs.
  if (!process.env.GITHUB_TOKEN) {
    console.warn(
      `${C.yellow}未设置 GITHUB_TOKEN — 跳过 GitHub Release 创建。` +
        `npm registry 已发布 v${next}，稍后可补建：pnpm gh-release v${next}${C.reset}`,
    );
  } else {
    const rel = run(
      process.execPath,
      [join(ROOT, 'scripts', 'github-release.mjs'), `v${next}`],
      { allowFailure: true },
    );
    if (rel.status !== 0) {
      console.warn(
        `${C.yellow}GitHub Release v${next} 未创建成功（npm registry 已发布该版本），` +
          `可重试：pnpm gh-release v${next}${C.reset}`,
      );
    }
  }
}

console.log(
  `\n${C.green}${C.bold}✅ Published v${current} → v${next}${C.reset}` +
    `\n${C.dim}Tag: v${next} · commit: chore: release v${next} · npm registry` +
    (skipPush ? '' : ' · GitHub Release') +
    `\nskills.sh（无需注册/提交）：确认 https://github.com/${ghRepo} 为公开仓库后，` +
    `用户即可 npx skills add ${ghRepo}${C.reset}`,
);
