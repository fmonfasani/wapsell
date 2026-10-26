# Quick Start - Production Deployment

**TL;DR for deploying Wapsell to Hetzner VPS**

## Pre-requisites
- Hetzner VPS with Ubuntu 22.04 LTS
- SSH access to `root@89.167.96.239`
- Domain configured to point to VPS IP

## 1-2-3 Deploy (5 minutes)

### Step 1: SSH into Server
```bash
ssh root@89.167.96.239
```

### Step 2: Setup Environment (first time only)
```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs npm nginx certbot python3-certbot-nginx

# Install PM2
sudo npm install -g pm2
sudo pm2 startup systemd -u root --hp /root

# Setup directories
sudo mkdir -p /var/www/wapsell /var/log/wapsell
```

### Step 3: Get SSL Certificate
```bash
sudo certbot certonly --nginx -d wapsell.example.com
```

### Step 4: Deploy App
```bash
cd /var/www/wapsell
git clone https://github.com/yourusername/wapsell.git .
cp .env.production.example .env.production
# Edit .env.production with your domain
nano .env.production

# Build
bash scripts/build-prod.sh

# Start with PM2
pm2 start ecosystem.config.js
pm2 save

# Setup Nginx (use config from DEPLOYMENT_HETZNER.md)
sudo cp docs/nginx-wapsell.conf /etc/nginx/sites-available/wapsell
sudo ln -sf /etc/nginx/sites-available/wapsell /etc/nginx/sites-enabled/wapsell
sudo nginx -t
sudo systemctl reload nginx
```

### Step 5: Verify
```bash
pm2 status
curl -I https://wapsell.example.com/health
```

✅ **Done!** App is live at `https://wapsell.example.com`

---

## Common Commands

```bash
# Monitor app
pm2 logs wapsell

# Restart after code changes
cd /var/www/wapsell && git pull && bash scripts/build-prod.sh
pm2 restart wapsell

# Check status
pm2 status

# View Nginx logs
tail -f /var/log/nginx/wapsell_access.log
```

---

## Performance Check

```bash
# Response time
ab -n 100 -c 10 https://wapsell.example.com/

# Check Core Web Vitals
# Use https://pagespeed.web.dev (Google PageSpeed Insights)
```

---

## Troubleshooting

**502 Bad Gateway?**
```bash
pm2 status  # Check if app is running
pm2 logs wapsell --err  # Check errors
```

**High memory?**
```bash
# Edit ecosystem.config.js and increase:
max_memory_restart: '2G'
pm2 restart wapsell
```

**SSL issues?**
```bash
sudo certbot renew --dry-run
sudo systemctl reload nginx
```

---

## Files Reference

- **Build config:** `next.config.js`
- **Environment:** `.env.production.example`
- **Build script:** `scripts/build-prod.sh`
- **Full guide:** `DEPLOYMENT_HETZNER.md`
- **Optimization details:** `OPTIMIZATION_REPORT.md`
- **Metrics:** `BUILD_OPTIMIZATION_SUMMARY.txt`

---

**Ready?** Start with [DEPLOYMENT_HETZNER.md](DEPLOYMENT_HETZNER.md) for step-by-step instructions.
