#!/usr/bin/env node
/**
 * Create (or backfill) the GitHub Release for a tag that is already on the remote.
 *
 * `pnpm release <bump>` creates the Release at the end of a successful run, but
 * that step is deliberately best-effort — npm already has the version by then —
 * so it can leave a tag without a Release entry behind:
 *
 *   1. the version was published before this step existed (v1.0.1 was), or
 *   2. GITHUB_TOKEN was missing / the API call failed at release time.
 *
 * This script repairs that: it is idempotent (an existing Release is reported
 * and left alone), it refuses a tag that is not on `origin` (the API would
 * otherwise create one from the wrong commit), and it asks GitHub to generate
 * the release notes from the commits since the previous tag.
 *
 *   pnpm gh-release v1.0.1            # create the missing Release for v1.0.1
 *   pnpm gh-release v1.0.1 --dry-run  # print the plan, touch nothing
 *
 * HUMAN-ONLY, like `pnpm release` (see AGENTS.md): it changes public state, and
 * who runs it is a **rule, not a lock** — the terminal check and the confirmation
 * prompt were removed together with those in publish.mjs. The token must be able
 * to write Releases: fine-grained needs `Contents: Read and write`, classic
 * needs `repo`.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const curl = process.platform === 'win32' ? 'curl.exe' : 'curl';
const git = process.platform === 'win32' ? 'git.exe' : 'git';

const C = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

const args = process.argv.slice(2).filter((a) => a !== '--');
const flags = args.filter((a) => a.startsWith('--'));
const positional = args.filter((a) => !a.startsWith('--'));
const KNOWN = ['--dry-run', '--yes', '--update'];
const unknown = flags.filter((f) => !KNOWN.includes(f));
const dryRun = flags.includes('--dry-run');
const update = flags.includes('--update');
const tag = positional[0];

if (tag === undefined || positional.length !== 1 || unknown.length > 0 || !/^v\d+\.\d+\.\d+$/.test(tag)) {
  console.error(
    `${C.red}${C.bold}Usage: pnpm gh-release <vX.Y.Z> [--dry-run] [--yes] [--update]${C.reset}` +
      `\n  Create the GitHub Release for <tag> (the tag must already be pushed to origin).` +
      `\n  --dry-run  preview the plan and the notes without calling the API.` +
      `\n  --yes      accepted for compatibility; the call no longer asks or checks anything.` +
      `\n  --update   an existing Release keeps its notes; this rewrites them from CHANGELOG.md.`,
  );
  process.exit(1);
}

/** owner/repo for the REST API, parsed from package.json repository.url. */
function ghRepoFromPackageJson() {
  let pkg;
  try {
    pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
  } catch {
    console.error(`${C.red}package.json is missing or not valid JSON${C.reset}`);
    process.exit(1);
  }
  const match = pkg.repository?.url?.match(/github\.com[/:]([^/]+)\/([^/.]+?)(?:\.git)?$/);
  return match ? `${match[1]}/${match[2]}` : 'andares/babylite';
}

const ghRepo = ghRepoFromPackageJson();

/** Runs a command, inheriting stdio unless the caller wants the output captured. */
function run(cmd, cmdArgs, opts = {}) {
  const res = spawnSync(cmd, cmdArgs, { cwd: ROOT, ...opts });
  if (res.error) {
    console.error(`${C.red}Could not run ${cmd}: ${res.error.message}${C.reset}`);
    process.exit(1);
  }
  return res;
}

/**
 * One GitHub API call. Returns the HTTP status code and, for non-dry runs, the
 * raw body/headers so the caller can tell success from a pre-existing Release.
 */
function api(method, url, { token, body } = {}) {
  const curlArgs = [
    '-sS',
    '-X',
    method,
    '-H',
    'Accept: application/vnd.github+json',
    '-H',
    'X-GitHub-Api-Version: 2022-11-28',
    '-w',
    '\n%{http_code}',
  ];
  if (token) curlArgs.push('-H', `Authorization: Bearer ${token}`);
  if (body !== undefined) curlArgs.push('-d', JSON.stringify(body));
  const res = run(curl, [...curlArgs, url], { stdio: 'pipe', allowFailure: true });
  const lines = res.stdout.toString().trimEnd().split('\n');
  const code = lines.pop()?.trim() ?? '';
  return { status: res.status, code, body: lines.join('\n') };
}

/**
 * Explains a 401/403 in terms of what this token actually needs, without ever
 * printing the token itself. Fine-grained tokens are the common trap: Releases
 * live under the "Contents" permission, and read-only access still passes the
 * repo/read checks below.
 */
function authHint(token) {
  let kind;
  if (token.startsWith('github_pat_')) kind = 'this is a fine-grained token (github_pat_…) and it needs';
  else if (token.startsWith('ghp_')) kind = 'this is a classic token (ghp_…) and it needs';
  else kind = 'this token needs';
  return (
    `\n  ${C.yellow}The token cannot write Releases: ${kind}${C.reset}` +
    `\n    fine-grained: \`Contents: Read and write\` for ${ghRepo} — Releases live under Contents` +
    `\n                 https://github.com/settings/personal-access-tokens` +
    `\n    classic:      the \`repo\` scope (\`public_repo\` is enough for a public repo)` +
    `\n                 https://github.com/settings/tokens/new?scopes=repo` +
    `\n  Without any token:  gh auth login -h github.com -w` +
    `\n                      env -u GITHUB_TOKEN gh release create ${tag} --generate-notes`
  );
}

/**
 * Release notes from CHANGELOG.md: the section of `tag`, which `pnpm release`
 * wrote from the commit subjects of the very same range. GitHub's own
 * `generate_release_notes` only lists merged pull requests, and this repository
 * pushes straight to master — the generated body came out as a bare compare
 * link, so the changelog is the better source. Returns '' when there is no
 * section, and the caller falls back to GitHub's generator.
 */
function notesFromChangelog(tag) {
  const version = tag.replace(/^v/, '');
  let changelog;
  try {
    changelog = readFileSync(join(ROOT, 'CHANGELOG.md'), 'utf8');
  } catch {
    return '';
  }
  const section = changelog.split(/^## \[/m).find((part) => part.startsWith(`${version}]`));
  if (section === undefined) return '';
  // Keep the bullet block verbatim from its first `- ` line: wrapped bullets have
  // continuation lines that must not be dropped.
  const lines = section.split('\n').slice(1);
  const firstBullet = lines.findIndex((line) => line.trimStart().startsWith('- '));
  if (firstBullet === -1) return '';
  const bullets = lines.slice(firstBullet).join('\n').trim();
  return `${bullets}\n\n**Full changelog:** https://github.com/${ghRepo}/blob/${tag}/CHANGELOG.md`;
}

const notes = notesFromChangelog(tag);
const payload =
  notes === ''
    ? { tag_name: tag, name: tag, generate_release_notes: true }
    : { tag_name: tag, name: tag, body: notes };

if (dryRun) {
  console.log(`${C.dim}--dry-run -- nothing sent. Would create:${C.reset}`);
  console.log(`  GitHub Release ${C.bold}${tag}${C.reset} in ${ghRepo}`);
  console.log(`  POST https://api.github.com/repos/${ghRepo}/releases`);
  console.log(`  body: ${JSON.stringify(payload)}`);
  console.log(
    notes === ''
      ? `${C.dim}  notes: GitHub's generator (no CHANGELOG section for ${tag})${C.reset}`
      : `${C.dim}  notes: ${notes.split('\n').filter(Boolean).length} lines from CHANGELOG.md${C.reset}`,
  );
  console.log(
    `${C.dim}  Requires GITHUB_TOKEN (Contents: write); an existing Release for ${tag} is left alone` +
      ` unless --update is passed.${C.reset}`,
  );
  process.exit(0);
}

const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error(
    `${C.red}GITHUB_TOKEN is not set — cannot create the Release.${C.reset}` +
      `\n  Use a token with Contents: write (fine-grained) or the \`repo\` scope (classic) on ${ghRepo}.`,
  );
  process.exit(1);
}

// Who may run this is a rule, not a lock (see AGENTS.md), exactly as in
// publish.mjs: the terminal check and the confirmation prompt were removed on
// the owner's instruction.

// Idempotency first: an existing Release means there is nothing to repair —
// unless --update was passed, which rewrites its notes from CHANGELOG.md (the
// earlier releases were created before the notes had a source at all).
const existing = api('GET', `https://api.github.com/repos/${ghRepo}/releases/tags/${tag}`, { token });
if (existing.code === '401' || existing.code === '403') {
  console.error(`${C.red}GitHub rejected the token (HTTP ${existing.code}).${C.reset}${authHint(token)}`);
  process.exit(1);
}
if (existing.code === '200' && !update) {
  console.log(`${C.green}Release ${tag} already exists in ${ghRepo} — nothing to do.${C.reset}`);
  console.log(`${C.dim}   --update rewrites its notes from CHANGELOG.md.${C.reset}`);
  process.exit(0);
}
if (existing.code === '200' && update) {
  if (notes === '') {
    console.error(
      `${C.red}CHANGELOG.md has no section for ${tag} — nothing to write.${C.reset}` +
        `\n  Add the section (or drop --update to leave the existing Release alone).`,
    );
    process.exit(1);
  }
  let id;
  try {
    id = JSON.parse(existing.body).id;
  } catch {
    id = undefined;
  }
  if (typeof id !== 'number') {
    console.error(
      `${C.red}Could not read the Release id from the API response.${C.reset}` +
        `\n  ${existing.body.split('\n').slice(0, 3).join('\n  ')}`,
    );
    process.exit(1);
  }
  const patched = api('PATCH', `https://api.github.com/repos/${ghRepo}/releases/${id}`, {
    token,
    body: { body: notes },
  });
  if (patched.status === 0 && patched.code === '200') {
    console.log(`${C.green}✅ Release ${tag} notes updated from CHANGELOG.md${C.reset}`);
    process.exit(0);
  }
  console.error(
    `${C.red}Failed to update the Release (HTTP ${patched.code || '?'}).${C.reset}` +
      `\n  ${patched.body.split('\n').slice(0, 3).join('\n  ')}` +
      (patched.code === '401' || patched.code === '403' ? authHint(token) : ''),
  );
  process.exit(1);
}

// The API would happily create a *new* tag from the default branch if the tag
// were missing, which silently points the Release at the wrong commit.
const remote = run(git, ['ls-remote', '--tags', 'origin', `refs/tags/${tag}`], { stdio: 'pipe' });
if (remote.stdout.toString().trim() === '') {
  console.error(
    `${C.red}Tag ${tag} is not on origin.${C.reset}` +
      `\n  Push it first (git push origin ${tag}), so the Release points at the release commit.`,
  );
  process.exit(1);
}

const created = api('POST', `https://api.github.com/repos/${ghRepo}/releases`, { token, body: payload });
if (created.status === 0 && created.code === '201') {
  console.log(`${C.green}✅ GitHub Release ${tag} created in ${ghRepo}${C.reset}`);
  console.log(
    notes === ''
      ? `${C.dim}   Notes: generated by GitHub (add a CHANGELOG.md section for richer notes).${C.reset}`
      : `${C.dim}   Notes: from CHANGELOG.md.${C.reset}`,
  );
  process.exit(0);
}

console.error(
  `${C.red}Failed to create the Release (HTTP ${created.code || '?'}).${C.reset}` +
    `\n  ${created.body.split('\n').slice(0, 3).join('\n  ')}` +
    (created.code === '401' || created.code === '403' ? authHint(token) : ''),
);
process.exit(1);
