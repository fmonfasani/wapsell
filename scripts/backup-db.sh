#!/usr/bin/env bash
# Online backup of the Wapsell SQLite DB (WAL-safe) with rotation.
#
# Uses SQLite's online backup API (via python3) so it's safe to run while the
# API is writing — no locking, consistent snapshot including WAL contents.
#
# Install on the VPS (cron, every 6h):
#   chmod +x /opt/wapsell/scripts/backup-db.sh
#   ( crontab -l 2>/dev/null; echo '0 */6 * * * /opt/wapsell/scripts/backup-db.sh >> /var/log/wapsell-backup.log 2>&1' ) | crontab -
#
# Restore:
#   gunzip -c /opt/wapsell/backups/wapsell-YYYYMMDD-HHMMSS.db.gz > restored.db
#   docker compose stop api && cp restored.db /var/lib/docker/volumes/wapsell_wapsell-db/_data/wapsell.db && docker compose start api
set -euo pipefail

DB="${WAPSELL_DB_FILE:-/var/lib/docker/volumes/wapsell_wapsell-db/_data/wapsell.db}"
DEST="${WAPSELL_BACKUP_DIR:-/opt/wapsell/backups}"
KEEP="${WAPSELL_BACKUP_KEEP:-28}"   # ~7 days at every-6h

mkdir -p "$DEST"
TS="$(date +%Y%m%d-%H%M%S)"
OUT="$DEST/wapsell-$TS.db"

if [ ! -f "$DB" ]; then
  echo "$(date -Is) ERROR: db not found at $DB" >&2
  exit 1
fi

python3 - "$DB" "$OUT" <<'PY'
import sqlite3, sys
src, dst = sys.argv[1], sys.argv[2]
s = sqlite3.connect(src); d = sqlite3.connect(dst)
with d:
    s.backup(d)          # online, WAL-safe snapshot
s.close(); d.close()
PY

gzip -f "$OUT"

# Rotation: keep the newest $KEEP, delete the rest.
ls -1t "$DEST"/wapsell-*.db.gz 2>/dev/null | tail -n +$((KEEP + 1)) | xargs -r rm -f

echo "$(date -Is) backup ok: ${OUT}.gz ($(du -h "${OUT}.gz" | cut -f1))"
