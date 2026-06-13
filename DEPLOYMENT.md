# Deployment Guide — Wapsell

Complete guide for deploying Wapsell to production.

## Prerequisites

- Git access to repository
- SSH access to VPS (root@89.167.96.239)
- GitHub account with write access
- Docker installed on VPS

## Deployment Strategies

### Strategy 1: Automatic (Recommended)

Every push to `main` automatically deploys via GitHub Actions.

**Setup (One-time)**

1. **Configure GitHub Secrets**

   Go to: Settings → Secrets and variables → Actions

   Add:
   - `VPS_HOST`: `89.167.96.239`
   - `VPS_USER`: `root`
   - `VPS_SSH_KEY`: Your SSH private key (from `~/.ssh/id_ed25519`)

2. **Test the workflow**

   ```bash
   git push origin main
   ```

   Watch workflow: Actions tab on GitHub

**How it works**

```
git push main
  ↓
GitHub Actions triggers
  ↓
SSH to VPS as root
  ↓
cd /opt/wapsell && git pull
  ↓
docker compose down (stop old containers)
  ↓
docker compose build (rebuild images)
  ↓
docker compose up -d (start services)
  ↓
Health check: curl http://localhost:3010/es
  ↓
✅ Deployed!
```

### Strategy 2: Manual Deploy (Backup)

If GitHub Actions is having issues, deploy manually.

**One-time SSH Setup**

```bash
# From your laptop
ssh-keygen -t ed25519 -f ~/.ssh/deploy_key
# Press enter 2x for no passphrase

# Copy public key to VPS
ssh-copy-id -i ~/.ssh/deploy_key.pub root@89.167.96.239
```

**Deploy Command**

```bash
cd wapsell
./scripts/deploy.sh main root 89.167.96.239
```

**Manual Alternative (if script not available)**

```bash
ssh root@89.167.96.239 "
  cd /opt/wapsell && \
  git fetch origin && \
  git pull origin main && \
  docker compose down && \
  docker compose build && \
  docker compose up -d && \
  sleep 15 && \
  curl -sf http://localhost:3010/es && echo '✅ Deployed!'
"
```

## VPS Setup (Initial)

### 1. SSH to VPS

```bash
ssh root@89.167.96.239
```

### 2. Clone Repository

```bash
cd /opt
git clone https://github.com/fmonfasani/wapsell.git
cd wapsell
```

### 3. Configure Environment

```bash
# Create .env if needed (defaults are fine for local development)
cat > .env << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000
EOF
```

### 4. Start Services

```bash
docker compose up -d
```

### 5. Verify Deployment

```bash
# Check containers
docker compose ps

# Check logs
docker compose logs app
docker compose logs api

# Health check
curl http://localhost:3010/es
curl http://localhost:8000/health
```

## Monitoring

### Check Service Status

```bash
ssh root@89.167.96.239 "cd /opt/wapsell && docker compose ps"
```

### View Logs

**Frontend logs:**
```bash
ssh root@89.167.96.239 "cd /opt/wapsell && docker compose logs app --tail 50"
```

**Backend logs:**
```bash
ssh root@89.167.96.239 "cd /opt/wapsell && docker compose logs api --tail 50"
```

### Restart Services

```bash
ssh root@89.167.96.239 "cd /opt/wapsell && docker compose restart"
```

### Database Access

```bash
# SSH to VPS
ssh root@89.167.96.239

# Enter API container
docker exec -it wapsell-api bash

# Query database
sqlite3 wapsell.db "SELECT * FROM users;"
```

## Troubleshooting

### "Connection refused" on deployment

**Issue:** Health check fails after deploy

**Solution:**
```bash
# Wait longer for services to start
ssh root@89.167.96.239 "cd /opt/wapsell && sleep 30 && docker compose logs"

# Or check port conflicts
ssh root@89.167.96.239 "netstat -tulpn | grep LISTEN"
```

### "Permission denied" on SSH

**Issue:** Can't SSH to VPS

**Solution:**
```bash
# Check SSH key permissions
ls -la ~/.ssh/id_ed25519
chmod 600 ~/.ssh/id_ed25519

# Test connection
ssh -v root@89.167.96.239
```

### Docker image build fails

**Issue:** `docker compose build` fails

**Solution:**
```bash
# Check Docker status
ssh root@89.167.96.239 "systemctl status docker"

# Restart Docker
ssh root@89.167.96.239 "systemctl restart docker"

# Clean up old images
ssh root@89.167.96.239 "docker system prune -a"
```

### Database corruption

**Issue:** SQLite database is locked or corrupted

**Solution:**
```bash
# Backup database
ssh root@89.167.96.239 "cd /opt/wapsell/services/api && cp wapsell.db wapsell.db.backup"

# Delete database (it will be recreated)
ssh root@89.167.96.239 "cd /opt/wapsell/services/api && rm wapsell.db"

# Restart API
ssh root@89.167.96.239 "cd /opt/wapsell && docker compose restart api"
```

## Rollback

### If deployment breaks production

**Quick rollback to previous commit:**

```bash
ssh root@89.167.96.239 "
  cd /opt/wapsell && \
  git log --oneline | head -10  # See recent commits
  git reset --hard HEAD~1       # Go back one commit
  docker compose down && \
  docker compose build && \
  docker compose up -d
"
```

**Or redeploy known-good version:**

```bash
ssh root@89.167.96.239 "
  cd /opt/wapsell && \
  git checkout <commit-hash> && \
  docker compose down && \
  docker compose build && \
  docker compose up -d
"
```

## DNS & SSL (Nginx)

Currently proxied through VPS nginx.

**Frontend:**
```nginx
server {
    listen 443 ssl;
    server_name wapsell.com;
    ssl_certificate /etc/ssl/certs/wapsell.com.crt;
    ssl_certificate_key /etc/ssl/private/wapsell.com.key;
    
    location / {
        proxy_pass http://localhost:3010;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Backend (API):**
```nginx
server {
    listen 443 ssl;
    server_name api.wapsell.com;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
    }
}
```

## Scaling Considerations

### Database
Currently SQLite. For production scale:
- Migrate to PostgreSQL
- Add connection pooling
- Setup automated backups

### API
- Add load balancer (nginx)
- Run multiple API instances
- Use Docker scaling: `docker compose up -d --scale api=3`

### Caching
- Add Redis for session storage
- Cache LLM responses

## Security Hardening

- [ ] Enable HTTPS/SSL certificates
- [ ] Rate limiting on auth endpoints
- [ ] WAF (Web Application Firewall)
- [ ] DDoS protection (Cloudflare)
- [ ] Database encryption at rest
- [ ] Regular security audits
- [ ] Database backups (automated)
- [ ] Log aggregation & monitoring

## Backup Strategy

### Automated Backups (Recommended)

Create cron job on VPS:

```bash
# SSH to VPS
ssh root@89.167.96.239

# Edit crontab
crontab -e

# Add this line (backup daily at 2 AM)
0 2 * * * cd /opt/wapsell/services/api && cp wapsell.db /backups/wapsell-$(date +%Y%m%d).db && find /backups -name "wapsell-*.db" -mtime +30 -delete
```

### Manual Backup

```bash
ssh root@89.167.96.239 "
  mkdir -p /backups
  cp /opt/wapsell/services/api/wapsell.db /backups/wapsell-$(date +%Y%m%d-%H%M%S).db
"
```

## Monitoring & Alerts

### Health Checks

GitHub Actions workflow already includes health checks:
```bash
curl -sf http://localhost:3010/es
curl -sf http://localhost:8000/health
```

### Metrics to Monitor

- API response time
- Database query performance
- Docker container memory/CPU
- Deployment success/failure rate
- Error rates in logs

### Set Up Monitoring (Future)

- Prometheus for metrics
- Grafana for dashboards
- Sentry for error tracking
- Datadog or New Relic for APM

## Deployment Checklist

- [ ] Code reviewed and tested locally
- [ ] All tests pass: `pytest test_main.py -v`
- [ ] Commit message follows convention
- [ ] Push to feature branch, create PR
- [ ] PR reviewed and approved
- [ ] Merge to main
- [ ] GitHub Actions workflow runs
- [ ] Deployment completes (health checks pass)
- [ ] Verify production: https://wapsell.com
- [ ] Monitor logs for errors

## Support

- **Deployment issues:** Check GitHub Actions logs first
- **SSH access:** Verify key permissions and IP allowlist
- **Database issues:** See VPS troubleshooting section

---

**Last updated:** 2026-06-13
