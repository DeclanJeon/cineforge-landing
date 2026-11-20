#!/usr/bin/env bash
# Deploy cineforge-landing to Cloudflare Pages whenever origin/main moves.
#
# Runs from a systemd user timer on this machine, so no Cloudflare API token is
# stored anywhere: it reuses the wrangler OAuth session that `npx wrangler login`
# created. If the machine is off nothing is lost — the timer is Persistent=true
# and catches up on the next boot.
set -uo pipefail

PROJECT="/home/declan/Documents/Projects/Products/01_Persnal_Work/cineforge-landing"
export PATH="/home/declan/.local/opt/flucto-cli/bin:$PATH"

cd "$PROJECT" || exit 0

MARKER="$PROJECT/.deploy-sha"
LOG="$PROJECT/.deploy.log"

log() { printf '%s %s\n' "$(date -Is)" "$*" >>"$LOG"; }

git fetch --quiet origin main 2>/dev/null || { log "fetch failed — will retry"; exit 0; }

TARGET="$(git rev-parse origin/main)"
DEPLOYED="$(cat "$MARKER" 2>/dev/null || echo none)"
[ "$TARGET" = "$DEPLOYED" ] && exit 0

if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  log "working tree is dirty at $TARGET — skipped"
  exit 0
fi

git checkout --quiet main 2>/dev/null || true

if ! git merge-base --is-ancestor HEAD "$TARGET" 2>/dev/null; then
  log "local main carries commits that are not on origin — needs a human, skipped"
  exit 0
fi

git merge --ff-only --quiet "$TARGET"

[ -d node_modules ] || npm ci >>"$LOG" 2>&1

if npm run build >>"$LOG" 2>&1 &&
  npx --yes wrangler@latest pages deploy dist \
    --project-name cineforge --branch main --commit-dirty=true >>"$LOG" 2>&1; then
  printf '%s' "$TARGET" >"$MARKER"
  log "deployed $TARGET"
else
  log "FAILED deploying $TARGET (see above)"
  exit 1
fi
