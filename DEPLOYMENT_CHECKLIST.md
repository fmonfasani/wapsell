# Deployment Checklist - Wapsell Production

**Target:** Hetzner VPS (89.167.96.239)  
**Date:** _____________  
**Deployed by:** _____________  

Use this checklist to ensure all steps are completed before and after deployment.

---

## PRE-DEPLOYMENT (Local Verification)

### Code & Build
- [ ] Latest code pulled from `main` branch
- [ ] `npm run build` completes successfully (no errors)
- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes (warnings acceptable)
- [ ] All 36 routes pre-rendered in build output
- [ ] Bundle size verified (~240 KB gzipped)

### Documentation
- [ ] OPTIMIZATION_REPORT.md reviewed
- [ ] DEPLOYMENT_HETZNER.md reviewed
- [ ] QUICK_START_PRODUCTION.md reviewed
- [ ] .env.production.example reviewed for required values

### Configuration Files
- [ ] next.config.js reviewed (optimization settings)
- [ ] scripts/build-prod.sh reviewed
- [ ] ecosystem.config.js created/updated
- [ ] Nginx config prepared (from DEPLOYMENT_HETZNER.md)

### Git & Commits
- [ ] All changes committed: `git status` is clean
- [ ] Commit messages follow convention
- [ ] Recent commits reviewed: `git log --oneline -5`

---

## SERVER SETUP (First-time only)

### Hetzner VPS Access
- [ ] SSH key configured for `root@89.167.96.239`
- [ ] Password login disabled
- [ ] Firewall rules: port 80, 443 open
- [ ] Storage: At least 20 GB free (`df -h`)

### System Updates
- [ ] OS updated: `sudo apt-get update && upgrade`
- [ ] Node.js 20.x installed: `node --version` → v20.x.x
- [ ] npm 10+ installed: `npm --version` → 10.x.x
- [ ] PM2 installed globally: `pm2 --version`
- [ ] Nginx installed: `nginx -v`
- [ ] Git installed: `git --version`

### System Configuration
- [ ] Log directory created: `/var/log/wapsell`
- [ ] App directory created: `/var/www/wapsell`
- [ ] PM2 auto-startup configured: `sudo pm2 startup`
- [ ] Firewall rules configured (UFW or iptables)

### SSL Certificate
- [ ] Certbot installed: `certbot --version`
- [ ] SSL certificate obtained: `sudo certbot certonly --nginx -d wapsell.example.com`
- [ ] Certificate auto-renewal configured
- [ ] Certificate paths verified in Nginx config

---

## APPLICATION DEPLOYMENT

### Repository
- [ ] Repository cloned: `ls /var/www/wapsell/.git`
- [ ] Branch confirmed: `git rev-parse --abbrev-ref HEAD` → main
- [ ] HEAD SHA noted: `git rev-parse HEAD`

### Environment
- [ ] `.env.production` created from `.env.production.example`
- [ ] Domain value set: `NEXT_PUBLIC_DOMAIN=wapsell.example.com`
- [ ] All required values filled (no placeholders)
- [ ] File permissions: `chmod 600 .env.production`
- [ ] File not world-readable: `ls -la .env.production`

### Build
- [ ] `bash scripts/build-prod.sh` executed successfully
- [ ] Build completed without errors
- [ ] Build time noted: _________ seconds
- [ ] Output size noted: _________ MB
- [ ] `.next` folder contains build artifacts
- [ ] `.next/server/` directory exists
- [ ] Static assets in `.next/static/`

### Process Management
- [ ] `ecosystem.config.js` created/updated
- [ ] `npm` dependencies installed: `npm ci --omit=dev`
- [ ] PM2 app started: `pm2 start ecosystem.config.js`
- [ ] PM2 status checked: `pm2 status`
- [ ] PM2 saved for auto-startup: `pm2 save`
- [ ] PM2 monitoring verified: `pm2 monit`

### Reverse Proxy
- [ ] Nginx config file created: `/etc/nginx/sites-available/wapsell`
- [ ] Nginx config symlinked: `/etc/nginx/sites-enabled/wapsell`
- [ ] Default site disabled (if applicable)
- [ ] Nginx config validated: `sudo nginx -t`
- [ ] Nginx reloaded: `sudo systemctl reload nginx`
- [ ] Nginx status: `sudo systemctl status nginx`

---

## VERIFICATION (Immediate Post-Deployment)

### Application Health
- [ ] PM2 shows app running: `pm2 logs wapsell | head -20`
- [ ] No error messages in logs
- [ ] Memory usage acceptable: < 500 MB
- [ ] CPU usage acceptable: < 20%
- [ ] Response to health check: `curl -I http://localhost:3000/health`

### Web Accessibility
- [ ] HTTP redirects to HTTPS: `curl -I http://wapsell.example.com`
- [ ] HTTPS responsive: `curl -I https://wapsell.example.com`
- [ ] Status code: 200
- [ ] SSL certificate valid: Check in browser
- [ ] Home page loads: Visit in browser
- [ ] Locale routes work: `/es`, `/en` load correctly
- [ ] Auth pages accessible: `/auth/login`, `/auth/register`

### Performance Check
- [ ] First Load JS: 107 KB (from build output)
- [ ] Response time acceptable: < 500ms
  ```bash
  ab -n 100 -c 10 https://wapsell.example.com/
  ```
- [ ] No 502/503 errors in logs
- [ ] Nginx cache headers present: `X-Cache-Status`

### Security Check
- [ ] Security headers present:
  ```bash
  curl -I https://wapsell.example.com | grep -i "Strict-Transport-Security"
  ```
- [ ] HTTPS only (no insecure cookies)
- [ ] X-Frame-Options set (SAMEORIGIN)
- [ ] X-Content-Type-Options set (nosniff)

### Logging
- [ ] PM2 logs accessible: `pm2 logs wapsell`
- [ ] Nginx access logs created: `/var/log/nginx/wapsell_access.log`
- [ ] Nginx error logs checked: `/var/log/nginx/wapsell_error.log`
- [ ] Application logs writing: `tail -f /var/log/wapsell/output.log`

---

## MONITORING & ALERTING (First 24h)

### Real-time Monitoring
- [ ] PM2 auto-restart working (restart app, observe it restarts)
- [ ] Memory not increasing continuously: `watch free -h`
- [ ] Disk usage stable: `watch df -h`
- [ ] CPU load acceptable: `top`

### Log Monitoring
- [ ] Nginx error log empty (or only warnings): `tail -20 /var/log/nginx/wapsell_error.log`
- [ ] PM2 error log clean: `pm2 logs wapsell --err`
- [ ] No repeated errors observed

### Load Test (Optional)
- [ ] Stress test: `ab -n 1000 -c 50 https://wapsell.example.com/`
- [ ] App survives load without 502 errors
- [ ] Response time under 2s for p95

### Alert Setup (Optional)
- [ ] Monitoring service configured (Uptime Robot, Better Stack, etc.)
- [ ] Error notifications enabled
- [ ] Response time alerts set (threshold: 5s)
- [ ] Downtime alerts enabled

---

## POST-DEPLOYMENT TASKS

### Documentation
- [ ] This checklist completed & dated
- [ ] Deployment date documented
- [ ] Current SHA recorded: `git rev-parse HEAD`
- [ ] Any issues/notes documented below

### Backup & Recovery
- [ ] Configuration backed up:
  ```bash
  sudo tar -czf /backups/wapsell-backup-$(date +%Y%m%d).tar.gz \
    /var/www/wapsell/.env.production \
    /var/www/wapsell/ecosystem.config.js \
    /etc/nginx/sites-available/wapsell
  ```
- [ ] Backup stored safely (S3, external storage, etc.)
- [ ] Recovery procedure tested (optional)

### Team Communication
- [ ] Team notified of successful deployment
- [ ] Link shared: `https://wapsell.example.com`
- [ ] Status page updated (if applicable)
- [ ] Slack/Discord notification sent (if configured)

### Monitoring Alert
- [ ] Uptime monitoring service verified (if configured)
- [ ] Alert responses tested (optional)

---

## ROLLBACK PROCEDURE (If Needed)

### Immediate Rollback
- [ ] Stop current app: `pm2 stop wapsell`
- [ ] Check last good commit: `git log --oneline -5`
- [ ] Revert to known good: `git revert HEAD` or `git checkout <SHA>`
- [ ] Rebuild: `bash scripts/build-prod.sh`
- [ ] Restart: `pm2 restart wapsell`

### Full Rollback
- [ ] Stop PM2: `pm2 kill`
- [ ] Restore from backup:
  ```bash
  sudo tar -xzf /backups/wapsell-backup-YYYYMMDD.tar.gz -C /
  ```
- [ ] Restart: `pm2 start ecosystem.config.js`

---

## COMMON ISSUES & SOLUTIONS

| Issue | Solution |
|-------|----------|
| 502 Bad Gateway | `pm2 logs wapsell --err` - check errors |
| High memory | Edit `max_memory_restart` in ecosystem.config.js |
| Slow response | Check `top` for CPU, `df -h` for disk |
| SSL errors | `sudo certbot renew --dry-run` |
| Nginx not reloading | `sudo nginx -t` to find syntax error |

---

## SIGN-OFF

**Deployment Date:** ___________________  
**Deployed By:** ___________________  
**Approved By:** ___________________  
**Notes/Issues:**

```
_____________________________________________________________________________

_____________________________________________________________________________

_____________________________________________________________________________
```

**Deployment Status:** [ ] ✅ SUCCESS [ ] ⚠️ PARTIAL [ ] ❌ FAILED

**Follow-up Actions Required:**
- [ ] None
- [ ] Monitor for 24 hours
- [ ] Fix issue #: _______
- [ ] Rollback planned
- [ ] Other: _________________________________________

---

**Reference Documents:**
- DEPLOYMENT_HETZNER.md (detailed guide)
- QUICK_START_PRODUCTION.md (fast deployment)
- OPTIMIZATION_REPORT.md (metrics & analysis)
- BUILD_OPTIMIZATION_SUMMARY.txt (overview)

**Support Contact:** _____________________________  
**Escalation Contact:** _____________________________  

---

*Checklist version 1.0 - Last updated 2026-10-26*
