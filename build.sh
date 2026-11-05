#!/bin/sh
# Cloudflare Pages build: publish only the site, never agent files.
# Dashboard: Build command `sh build.sh`, Build output directory `dist`.
# Dot-folders (.lead/, .claude/) are skipped by `*`; add new internal files to the case list.
set -e
rm -rf dist && mkdir dist
for f in *; do
  case "$f" in
    dist|docs|CLAUDE.md|README.md|build.sh) ;;
    *) cp -R "$f" dist/ ;;
  esac
done
ls dist
