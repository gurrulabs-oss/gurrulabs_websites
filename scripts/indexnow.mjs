#!/usr/bin/env node
// IndexNow submitter. Usage: node scripts/indexnow.mjs [--dry-run] [--changed <git-ref>]
// Default: submit every <loc> in sitemap.xml. --changed <ref>: only pages whose generated index.html changed in
// `git diff --name-only <ref> HEAD` (sitemap/robots/llms changes alone submit nothing); an unknown ref submits all.
// --dry-run prints the URLs and JSON body and sends nothing. node: built-ins only.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const ci = args.indexOf('--changed');
const ref = ci >= 0 ? args[ci + 1] : null;
if (ci >= 0 && (!ref || ref.startsWith('--'))) die('--changed needs a git ref');

const keyFiles = readdirSync(ROOT).filter(f => /^[0-9a-f]{32}\.txt$/.test(f) && readFileSync(join(ROOT, f), 'utf8').trim() === f.slice(0, -4));
if (keyFiles.length !== 1) die(`expected exactly one IndexNow key file in the repo root, found ${keyFiles.length}`);
const key = keyFiles[0].slice(0, -4);

const sitemap = readFileSync(join(ROOT, 'sitemap.xml'), 'utf8');
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim());
const { origin, host } = new URL(locs[0]);

let urlList = locs;
if (ref) {
  let files = null;
  try { files = execFileSync('git', ['diff', '--name-only', ref, 'HEAD'], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).split('\n').filter(Boolean); }
  catch { console.error(`ref ${ref} unknown here (new branch or shallow clone): submitting all URLs`); }
  if (files) {
    urlList = locs.filter(u => files.includes(u.slice(origin.length + 1) + 'index.html'));
    if (!urlList.length) { console.log(`no page changed since ${ref}; nothing to submit`); process.exit(0); }
  }
}

const body = { host, key, keyLocation: `${origin}/${key}.txt`, urlList };
if (dryRun) {
  console.log(urlList.join('\n'));
  console.log(JSON.stringify(body, null, 2));
  console.error(`[dry-run] ${urlList.length} URL(s); nothing sent`);
  process.exit(0);
}
// Yandex, not api.indexnow.org: Bing answers 403 UserForbiddedToAccessSite for www.gurrulabs.com (key file is fine,
// Yandex accepts it); IndexNow engines share submissions, so Bing still gets the URLs.
const res = await fetch('https://yandex.com/indexnow', { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' }, body: JSON.stringify(body) });
console.log(`IndexNow: ${res.status} ${res.statusText} (${urlList.length} URLs)`);
if (res.status !== 200 && res.status !== 202) { console.error(await res.text().catch(() => '')); process.exit(1); }

function die(msg) { console.error(msg); process.exit(1); }
