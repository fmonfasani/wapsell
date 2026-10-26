# Wapsell Production Deployment Guide - Hetzner VPS

**Target:** Hetzner VPS (89.167.96.239)  
**Status:** ✅ Ready for Deployment  
**Last Updated:** 2026-10-26  

---

## Pre-Deployment Checklist

- [ ] Hetzner VPS provisioned with Ubuntu 22.04 LTS
- [ ] SSH key configured for passwordless access
- [ ] Node.js 20.x LTS installed
- [ ] npm 10+ installed
- [ ] Nginx reverse proxy configured
- [ ] PM2 or systemd for process management
- [ ] SSL/TLS certificate (Let's Encrypt recommended)
- [ ] Firewall rules configured (80, 443 open)

---

## 1. Server Setup (One-time)

### 1.1 Connect to Hetzner VPS

```bash
ssh root@89.167.96.239
```

### 1.2 Install Node.js 20 LTS

```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should be v20.x.x
npm --version   # Should be 10.x.x
```

### 1.3 Install PM2 (Process Manager)

```bash
sudo npm install -g pm2

# Allow PM2 to auto-start on reboot
sudo pm2 startup systemd -u root --hp /root
```

### 1.4 Install Nginx

```bash
sudo apt-get install -y nginx

# Enable and start Nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 1.5 Install SSL Certificate (Let's Encrypt)

```bash
sudo apt-get install -y certbot python3-certbot-nginx

# Get certificate (replace with your domain)
sudo certbot certonly --nginx -d wapsell.example.com

# Auto-renewal (already configured by default)
sudo systemctl enable certbot.timer
```

---

## 2. Application Deployment

### 2.1 Clone Repository

```bash
# Create app directory
sudo mkdir -p /var/www/wapsell
cd /var/www/wapsell

# Clone from GitHub
git clone https://github.com/yourusername/wapsell.git .
```

### 2.2 Build Application

```bash
cd /var/www/wapsell

# Use build script (Linux/macOS)
bash scripts/build-prod.sh

# OR for Windows-built artifacts, just verify:
npm ci --omit=dev
npm run build
```

### 2.3 Create Environment File

```bash
# Copy and configure template
cp .env.production.example .env.production

# Edit with actual values
nano .env.production
```

**Required values to set:**
- `NEXT_PUBLIC_DOMAIN=wapsell.example.com`
- Any API keys or secrets needed

### 2.4 Start Application with PM2

```bash
# Create ecosystem config
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'wapsell',
    script: '.next/standalone/server.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/wapsell/error.log',
    out_file: '/var/log/wapsell/output.log',
    merge_logs: true,
    max_memory_restart: '1G',
    watch: false,
    ignore_watch: ['.next', 'node_modules', 'public'],
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    listen_timeout: 3000,
  }],
};
EOF

# Create log directory
sudo mkdir -p /var/log/wapsell
sudo chown -R root:root /var/log/wapsell

# Start application
pm2 start ecosystem.config.js

# Save PM2 config for auto-start
pm2 save
```

---

## 3. Nginx Configuration

### 3.1 Create Nginx Config

```bash
sudo cat > /etc/nginx/sites-available/wapsell << 'EOF'
upstream wapsell_backend {
  # Point to PM2 cluster instances
  server localhost:3000;
  server localhost:3001;
  keepalive 32;
}

server {
  listen 80;
  listen [::]:80;
  server_name wapsell.example.com;
  
  # Redirect to HTTPS
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  listen [::]:443 ssl http2;
  server_name wapsell.example.com;

  # SSL Configuration
  ssl_certificate /etc/letsencrypt/live/wapsell.example.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/wapsell.example.com/privkey.pem;
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;
  ssl_prefer_server_ciphers on;
  ssl_session_cache shared:SSL:10m;
  ssl_session_timeout 10m;

  # Security Headers
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-XSS-Protection "1; mode=block" always;
  add_header Referrer-Policy "strict-origin-when-cross-origin" always;

  # Logging
  access_log /var/log/nginx/wapsell_access.log;
  error_log /var/log/nginx/wapsell_error.log;

  # Gzip compression
  gzip on;
  gzip_types text/plain text/css text/js text/xml text/javascript 
             application/javascript application/x-javascript application/json;
  gzip_min_length 1024;
  gzip_comp_level 6;

  # Cache static assets
  location /_next/static/ {
    proxy_pass http://wapsell_backend;
    proxy_cache_valid 200 365d;
    expires 365d;
    add_header Cache-Control "public, immutable";
    add_header X-Cache-Status $upstream_cache_status;
  }

  # Cache images & fonts
  location ~* \.(svg|woff2?|ttf|eot|otf)$ {
    proxy_pass http://wapsell_backend;
    expires 365d;
    add_header Cache-Control "public, immutable";
  }

  # Public files
  location /public/ {
    proxy_pass http://wapsell_backend;
    expires 1h;
    add_header Cache-Control "public, max-age=3600";
  }

  # Dynamic pages - cache for 1 hour, revalidate
  location / {
    proxy_pass http://wapsell_backend;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Connection "";
    proxy_cache_valid 200 1h;
    proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
    add_header X-Cache-Status $upstream_cache_status;
  }

  # Health check endpoint
  location /health {
    access_log off;
    proxy_pass http://wapsell_backend;
  }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/wapsell /etc/nginx/sites-enabled/wapsell
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## 4. Monitoring & Maintenance

### 4.1 PM2 Monitoring

```bash
# Real-time monitoring
pm2 monit

# View logs
pm2 logs wapsell

# Check status
pm2 status
```

### 4.2 Nginx Health Check

```bash
# Test endpoint
curl -I https://wapsell.example.com/health

# Check logs
sudo tail -f /var/log/nginx/wapsell_access.log
sudo tail -f /var/log/nginx/wapsell_error.log
```

### 4.3 Server Monitoring

```bash
# CPU & Memory
top
htop (if installed)

# Disk usage
df -h

# Check for OOM kills
dmesg | tail -20
```

---

## 5. Updates & Rollbacks

### 5.1 Deploy New Version

```bash
cd /var/www/wapsell

# Stash any local changes
git stash

# Pull latest
git pull origin main

# Rebuild
bash scripts/build-prod.sh

# Restart PM2
pm2 restart wapsell --update-env
```

### 5.2 Rollback to Previous Version

```bash
cd /var/www/wapsell

# Check build history
pm2 save

# Revert git
git revert HEAD

# Rebuild & restart
bash scripts/build-prod.sh
pm2 restart wapsell
```

---

## 6. Performance Targets

Monitor these metrics after deployment:

### Response Time
```bash
# Check with ApacheBench
ab -n 100 -c 10 https://wapsell.example.com/
```

**Target:** < 500ms p95

### Build Metrics
- Build size: ~64 MB (.next folder)
- Bundle (gzipped): ~240 KB
- Build time: ~30 seconds
- Pages pre-rendered: 36 static routes

### Core Web Vitals
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

---

## 7. Troubleshooting

### Application won't start

```bash
# Check error logs
pm2 logs wapsell --err

# Verify environment
env | grep NEXT_PUBLIC
cat .env.production

# Test locally
node .next/standalone/server.js
```

### High memory usage

```bash
# Check process memory
ps aux | grep node

# Increase PM2 memory limit in ecosystem.config.js
max_memory_restart: '2G'

# Restart
pm2 restart wapsell
```

### Nginx 502 Bad Gateway

```bash
# Check if Node.js is running
pm2 status

# Check Nginx error log
sudo tail -f /var/log/nginx/wapsell_error.log

# Verify proxy configuration
sudo nginx -t
```

### SSL certificate renewal issues

```bash
# Manual renewal
sudo certbot renew --dry-run

# Auto-renewal should work, but check:
sudo systemctl status certbot.timer
```

---

## 8. Backup & Disaster Recovery

### 8.1 Backup Strategy

```bash
# Backup database (if added)
# Backup configuration
sudo tar -czf /backups/wapsell-backup-$(date +%Y%m%d).tar.gz \
  /var/www/wapsell/.env.production \
  /var/www/wapsell/ecosystem.config.js \
  /etc/nginx/sites-available/wapsell

# Store backups
sudo aws s3 cp /backups/ s3://your-bucket/backups/ --recursive
```

### 8.2 Recovery

```bash
# Restore from backup
sudo tar -xzf wapsell-backup-20261026.tar.gz -C /

# Rebuild application
cd /var/www/wapsell
bash scripts/build-prod.sh

# Restart
pm2 restart wapsell
```

---

## 9. Scaling Recommendations

When traffic increases:

### 1. **Vertical Scaling**
- Upgrade Hetzner VPS CPU/RAM
- Increase PM2 instances: `instances: 'max'`

### 2. **Horizontal Scaling** (Future)
- Multiple VPS behind load balancer
- Shared Redis for caching
- CDN for static assets

### 3. **Performance Tuning**
- Enable Redis ISR cache handler
- Implement image optimization pipeline
- Monitor Core Web Vitals with RUM

---

## 10. Support & Resources

- **Next.js Docs:** https://nextjs.org/docs
- **PM2 Docs:** https://pm2.keymetrics.io/docs
- **Nginx Docs:** https://nginx.org/en/docs/
- **Hetzner Support:** https://support.hetzner.com/

---

**Deployment prepared by:** Claude Haiku 4.5  
**Date:** 2026-10-26  
**Status:** ✅ Ready for Production
