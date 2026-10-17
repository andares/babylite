#!/usr/bin/env node
/**
 * babylite — install this skill bundle into an agent's skill directory.
 *
 *   npx @andares/babylite install              # → ~/.agents/skills/babylite (global)
 *   npx @andares/babylite install --project    # → ./.agents/skills/babylite
 *   npx @andares/babylite install --to <dir>   # → exact destination directory
 *   npx @andares/babylite paths                # show candidate skill roots
 *
 * Why this exists: npm installs into `node_modules/`, which no agent scans for
 * skills. This command copies the bundle (SKILL.md + references/) into a
 * directory the agent actually reads. It only ever writes to the target
 * directory, never executes anything from the bundle, refuses to overwrite a
 * directory it did not create unless `--force` is passed, and refuses to write
 * through a symlink (a link already *is* an installation — see `install`).
 *
 * The alternative install path needs no npm at all:
 *   npx skills add andares/babylite
 */
import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readlinkSync,
  readdirSync,
  realpathSync,
  rmSync,
  statSync,
} from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SKILL_NAME = 'babylite';

const C = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

/** Files and directories that make up the installable skill. */
const BUNDLE = ['SKILL.md', 'references'];

// Candidate roots, matching what the skills CLI and DSH discover.
const ROOTS = [
  { label: '全局（推荐）', path: join(homedir(), '.agents', 'skills') },
  { label: '全局 DSH', path: join(homedir(), '.dsh', 'skills') },
  { label: 'Claude Code', path: join(homedir(), '.claude', 'skills') },
  { label: '项目', path: join(process.cwd(), '.agents', 'skills') },
  { label: '项目 DSH', path: join(process.cwd(), '.dsh', 'skills') },
];

function usage(exitCode) {
  const out = exitCode === 0 ? console.log : console.error;
  out(
    `${C.bold}babylite${C.reset} — install the Babylon Lite offline API skill\n\n` +
      `Usage:\n` +
      `  babylite install [--project] [--to <dir>] [--force] [--dry-run]\n` +
      `  babylite paths\n` +
      `  babylite --version | --help\n\n` +
      `Options:\n` +
      `  --project    install into ./.agents/skills/${SKILL_NAME} instead of the home directory\n` +
      `  --to <dir>   install into exactly this directory\n` +
      `  --force      overwrite an existing installation\n` +
      `  --dry-run    print what would happen without writing anything\n\n` +
      `A symlinked target is refused: a link already is an installation, and copying\n` +
      `through it would rewrite — or delete — whatever sits behind the link.\n\n` +
      `Or install without npm:  npx skills add andares/babylite\n`,
  );
  process.exit(exitCode);
}

/** True when `dir` looks like a previous install of this skill. */
function isOwnInstall(dir) {
  const skillPath = join(dir, 'SKILL.md');
  if (!existsSync(skillPath)) return false;
  try {
    return new RegExp(`^name:[ \t]*${SKILL_NAME}[ \t]*$`, 'm').test(readFileSync(skillPath, 'utf8'));
  } catch {
    return false;
  }
}

/** lstat that does not throw: undefined when `path` does not exist at all. */
function lstatOrUndefined(path) {
  try {
    return lstatSync(path);
  } catch {
    return undefined;
  }
}

function install(target, { force, dryRun, retry }) {
  if (!existsSync(join(ROOT, 'SKILL.md'))) {
    console.error(`${C.red}SKILL.md not found next to this script (${ROOT}).${C.reset}`);
    process.exit(1);
  }

  const existing = lstatOrUndefined(target);

  // A symlinked target already *is* an installation — usually a git checkout kept
  // live by `git pull` (see the README). Copying into it would silently rewrite
  // that checkout, and when the link points back at this very bundle the copy
  // would delete its own source. Refuse rather than guess.
  if (existing?.isSymbolicLink()) {
    let points = readlinkSync(target);
    try {
      points = realpathSync(target);
    } catch {
      points += ' (broken link)'; // dangling: keep the raw link text
    }
    console.error(
      `${C.red}${target} is a symlink → ${points}${C.reset}\n` +
        `  A link already works as an installation: the agent reads whatever it points at, so there\n` +
        `  is nothing to copy. Update that directory itself (e.g. \`git pull\`). If you do want a\n` +
        `  standalone copy instead, drop the link first:\n` +
        `    rm ${target}\n` +
        `    ${retry}`,
    );
    process.exit(1);
  }
  if (existing !== undefined && !existing.isDirectory()) {
    console.error(`${C.red}${target} exists and is not a directory.${C.reset}`);
    process.exit(1);
  }
  // Installing onto the bundle's own source tree would delete the files it is
  // about to copy; catch that here instead of failing half-way through.
  if (existing !== undefined && realpathSync(target) === realpathSync(ROOT)) {
    console.error(
      `${C.red}${target} is this bundle's own source directory.${C.reset}\n` +
        `  Nothing to install — the bundle is already there.`,
    );
    process.exit(1);
  }

  const exists = existing !== undefined;
  if (exists && !force && !isOwnInstall(target)) {
    const entries = readdirSync(target).length;
    console.error(
      `${C.red}${target} already exists${entries > 0 ? ' and is not empty' : ''} and was not ` +
        `created by this installer.${C.reset}\n  Re-run with --force to overwrite it.`,
    );
    process.exit(1);
  }

  const files = BUNDLE.flatMap((entry) => collect(join(ROOT, entry)));
  if (dryRun) {
    console.log(`${C.dim}--dry-run -- nothing written. Would copy:${C.reset}`);
    console.log(`  ${ROOT} → ${target}`);
    console.log(`  ${files.length} files: ${BUNDLE.join(', ')}`);
    return;
  }

  mkdirSync(target, { recursive: true });
  for (const entry of BUNDLE) {
    const from = join(ROOT, entry);
    const to = join(target, entry);
    if (statSync(from).isDirectory()) {
      rmSync(to, { recursive: true, force: true });
      cpSync(from, to, { recursive: true });
    } else {
      cpSync(from, to);
    }
  }

  console.log(`${C.green}✅ Installed ${SKILL_NAME} → ${target}${C.reset}`);
  console.log(`${C.dim}   ${files.length} files · restart or refresh your agent session to pick it up.${C.reset}`);
}

/** Lists file paths under `path` (a file yields itself) for dry-run reporting. */
function collect(path) {
  if (!existsSync(path)) return [];
  if (!statSync(path).isDirectory()) return [path];
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) =>
    collect(join(path, entry.name)),
  );
}

const args = process.argv.slice(2);
const command = args[0];
const flags = args.slice(1).filter((a) => a.startsWith('--'));
const toIndex = args.indexOf('--to');
const toValue = toIndex === -1 ? undefined : args[toIndex + 1];

if (command === '--version' || command === '-v') {
  // A missing or malformed package.json should read as one clear line, not a stack trace.
  try {
    const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
    console.log(pkg.version);
    process.exit(0);
  } catch (error) {
    console.error(`${C.red}Could not read package.json next to this script: ${error.message}${C.reset}`);
    process.exit(1);
  }
}
if (command === undefined || command === '--help' || command === '-h' || command === 'help') {
  usage(command === undefined ? 1 : 0);
}
if (command === 'paths') {
  for (const root of ROOTS) {
    const mark = existsSync(root.path) ? `${C.green}exists${C.reset}` : `${C.dim}absent${C.reset}`;
    console.log(`  ${root.label.padEnd(14)} ${root.path}  ${mark}`);
  }
  process.exit(0);
}
if (command !== 'install') {
  console.error(`${C.red}Unknown command: ${command}${C.reset}\n`);
  usage(1);
}
const unknown = flags.filter((f) => f !== '--project' && f !== '--force' && f !== '--dry-run' && f !== '--to');
if (unknown.length > 0 || (toIndex !== -1 && toValue === undefined)) {
  console.error(`${C.red}Unknown or incomplete option: ${unknown[0] ?? '--to <dir>'}${C.reset}\n`);
  usage(1);
}

const target = resolveTarget(toValue, flags);
install(target, {
  force: flags.includes('--force'),
  dryRun: flags.includes('--dry-run'),
  retry: retryCommand(toValue, flags),
});

/** Resolves the install destination: `--to` > `--project` > the global shared directory. */
function resolveTarget(toValue, flags) {
  if (toValue !== undefined) return resolve(toValue);
  if (flags.includes('--project')) return join(process.cwd(), '.agents', 'skills', SKILL_NAME);
  return join(homedir(), '.agents', 'skills', SKILL_NAME);
}

/** The same install command, for the "drop the symlink then re-run" hint. */
function retryCommand(toValue, flags) {
  if (toValue !== undefined) return `npx @andares/babylite install --to ${toValue}`;
  return `npx @andares/babylite install${flags.includes('--project') ? ' --project' : ''}`;
}
