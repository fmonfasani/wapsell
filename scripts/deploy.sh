#!/bin/bash
# Deploy Wapsell to /opt/wapsell on VPS via SSH
# Usage: ./scripts/deploy.sh [branch] [user] [host]
# Example: ./scripts/deploy.sh main root 89.167.96.239

set -e

BRANCH="${1:-main}"
SSH_USER="${2:-root}"
SSH_HOST="${3:-89.167.96.239}"
DEPLOY_PATH="/opt/wapsell"
APP_PORT="${APP_PORT:-3010}"

echo "🚀 Deploying Wapsell from branch: $BRANCH"
echo "   Target: $SSH_USER@$SSH_HOST:$DEPLOY_PATH"

ssh "$SSH_USER@$SSH_HOST" "
  set -e

  echo '📦 Pulling latest code...'
  cd $DEPLOY_PATH
  git fetch origin
  git checkout $BRANCH
  git pull origin $BRANCH

  echo '🛑 Stopping current container...'
  docker compose down || true

  echo '🔨 Building Docker image...'
  docker compose build

  echo '✅ Starting container...'
  docker compose up -d

  echo '⏳ Waiting for health check (15s)...'
  sleep 15

  echo '🔍 Running health check...'
  if curl -sf http://localhost:$APP_PORT/es > /dev/null; then
    echo '✨ Wapsell deployed successfully!'
    echo '   URL: https://wapsell.com'
    exit 0
  else
    echo '❌ Health check failed - container may still be starting'
    docker compose logs app | tail -20
    exit 1
  fi
"
