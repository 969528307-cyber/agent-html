#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

echo "=== [$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Daily build start ==="

echo "[1/3] Auto-publishing ready candidates..."
npm run auto:publish 2>&1

echo "[2/3] Building public dist..."
npm run build:public 2>&1

echo "[3/3] Build complete. dist/ is ready."
echo "=== [$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Daily build done ==="

# Deployment step:
# If using Vercel, add: curl -X POST "$VERCEL_DEPLOY_HOOK_URL"
# If using Cloudflare Pages, add: curl -X POST "$CF_DEPLOY_HOOK_URL"
# If using rsync to a VPS, add: rsync -avz --delete dist/ user@host:/var/www/agentk.it/
