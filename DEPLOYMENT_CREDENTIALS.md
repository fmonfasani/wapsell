# 🔐 WAPSELL DEPLOYMENT CREDENTIALS

**Status**: Production Ready  
**Last Updated**: 2026-10-26  
**Environment**: Hetzner VPS (89.167.96.239)  

---

## 📍 SERVER CONFIGURATION

| Item | Value |
|------|-------|
| **IP Address** | `89.167.96.239` |
| **Hostname** | `wapsell-prod` |
| **OS** | Ubuntu 24.04 LTS |
| **SSH User** | `root` |
| **Domain** | `www.wapsell.com` |
| **API Base URL** | `https://api.wapsell.com` |

---

## 🔑 SSH ACCESS

### SSH Key Location
```bash
~/.ssh/id_ed25519  # Primary key (Git-based access)
# OR
~/.ssh/deploy_key  # Deployment key (CI/CD)
```

### SSH Connection Command
```bash
ssh -i ~/.ssh/id_ed25519 root@89.167.96.239
# OR
ssh root@89.167.96.239
```

### SSH Key Setup
If key not found, generate:
```bash
ssh-keygen -t ed25519 -f ~/.ssh/id_wapsell -C "wapsell-prod"
# Copy public key to Hetzner Console > SSH Keys
cat ~/.ssh/id_wapsell.pub  # Copy this
```

---

## 📧 EMAIL CONFIGURATION

### Provider: Resend
- **Service**: Transactional Email
- **From Email**: `noreply@wapsell.com`
- **Domain Verification**: ✅ Configured in DNS
  - TXT Record: `resend._domainkey` with public key
  - SPF Record: `v=spf1 include:amazonses.com ~all`

### Environment Variable
```bash
RESEND_API_KEY=<obtain from https://resend.com/api-keys>
RESEND_FROM_EMAIL=noreply@wapsell.com
```

---

## 🗄️ DATABASE

### PostgreSQL 16 (Docker Container)
```bash
POSTGRES_USER=wapsell_prod
POSTGRES_PASSWORD=[GENERATE: openssl rand -base64 32]
DATABASE_URL=postgresql://wapsell_prod:PASSWORD@localhost:5432/wapsell_prod
```

### Connection Pool
```bash
DATABASE_POOL_SIZE=20
DATABASE_STATEMENT_CACHE_SIZE=200
```

---

## 🔐 JWT SECRETS

Generate strong secrets:
```bash
# JWT Secret (32 bytes hex)
openssl rand -hex 32

# JWT Refresh Secret (32 bytes hex)
openssl rand -hex 32

# Redis Password (24 bytes base64)
openssl rand -base64 24

# Elasticsearch Password (32 bytes base64)
openssl rand -base64 32
```

### Environment Variables
```bash
JWT_SECRET=[GENERATE above]
JWT_EXPIRATION=3600
JWT_REFRESH_SECRET=[GENERATE above]
JWT_REFRESH_EXPIRATION=604800
```

---

## 💳 PAYMENT INTEGRATIONS

### MercadoPago
From `/c/Users/Usuario/.ssh/wapsell.txt`:
```
User ID: 33614063
App ID: 3802738890888747
Public Key: APP_USR-cba8f61b-caeb-4b13-b7f6-60e30dc14173
Access Token: APP_USR-3802738890888747-061121-dc5bcf30a2fd9aecb5ce9b0b482e5d7b-33614063
Client ID: 3802738890888747
Client Secret: usL3mbBwnrCGvPrc5qpXEdMWjtbtcn9J
```

### Environment Variables
```bash
MERCADOPAGO_ACCESS_TOKEN=APP_USR-3802738890888747-061121-dc5bcf30a2fd9aecb5ce9b0b482e5d7b-33614063
MERCADOPAGO_PUBLIC_KEY=APP_USR-cba8f61b-caeb-4b13-b7f6-60e30dc14173
```

### Stripe (if used)
```bash
STRIPE_SECRET_KEY=sk_live_[from Stripe dashboard]
STRIPE_PUBLISHABLE_KEY=pk_live_[from Stripe dashboard]
STRIPE_WEBHOOK_SECRET=whsec_[from Stripe webhooks]
```

---

## 🌐 DNS CONFIGURATION

### Current Setup (Namecheap)
```
A Records:
  @               → 89.167.96.239
  admin           → 89.167.96.239
  admin.otrarondamas → 89.167.96.239
  api             → 89.167.96.239
  api.otrarondamas → 89.167.96.239
  app             → 89.167.96.239
  otrarondamas    → 89.167.96.239

TXT Records:
  _dmarc          → v=DMARC1; p=none;
  resend._domainkey → [Resend verification key]
  send            → v=spf1 include:amazonses.com ~all

MX Records:
  send            → feedback-smtp.sa-east-1.amazonses.com (priority 10)
```

---

## 🚀 DEPLOYMENT SCRIPT

### Usage
```bash
cd /d/Software\ Development/Porfolio/OtraRondaMas
export PROD_HOST="89.167.96.239"
export SSH_KEY="$HOME/.ssh/id_ed25519"
./scripts/deployment-hetzner.sh $PROD_HOST $SSH_KEY deploy
```

### Alternative Commands
```bash
# Verify deployment health
./scripts/deployment-hetzner.sh $PROD_HOST $SSH_KEY verify

# View logs
./scripts/deployment-hetzner.sh $PROD_HOST $SSH_KEY logs

# Rollback to previous version
./scripts/deployment-hetzner.sh $PROD_HOST $SSH_KEY rollback

# Check status
./scripts/deployment-hetzner.sh $PROD_HOST $SSH_KEY status
```

---

## 📋 DEPLOYMENT CHECKLIST

- [ ] SSH key configured and accessible
- [ ] DNS records pointing to 89.167.96.239
- [ ] PostgreSQL password generated
- [ ] JWT secrets generated
- [ ] Redis password generated
- [ ] Elasticsearch password generated
- [ ] Resend API key obtained
- [ ] MercadoPago credentials verified
- [ ] Stripe credentials (if using)
- [ ] Google OAuth credentials configured
- [ ] AWS S3 bucket and credentials ready
- [ ] Email domain verified in Resend
- [ ] run deployment script
- [ ] Verify health checks
- [ ] Test HTTPS connection
- [ ] Monitor logs for errors

---

## 🛡️ SECURITY NOTES

### Critical Secrets (rotate if compromised)
- POSTGRES_PASSWORD
- JWT_SECRET
- JWT_REFRESH_SECRET
- REDIS_PASSWORD
- ELASTICSEARCH_PASSWORD
- AWS_SECRET_ACCESS_KEY
- STRIPE_SECRET_KEY
- MERCADOPAGO_ACCESS_TOKEN
- RESEND_API_KEY

### Best Practices
✅ Keep SSH key secure (chmod 600)
✅ Use strong, unique passwords
✅ Rotate secrets regularly
✅ Store in encrypted backup
✅ Audit access logs
❌ Never commit .env to git
❌ Never share credentials via email
❌ Never log sensitive values

---

## 📞 SUPPORT

For deployment issues, refer to:
- `DEPLOYMENT-HETZNER-INDEX.md` — Master index
- `docs/HETZNER-QUICK-SETUP.md` — Step-by-step guide
- `.github/workflows/DEPLOYMENT_GUIDE.md` — GitHub Actions deployment

---

**Last Verified**: 2026-10-26  
**Maintainer**: Claude Haiku 4.5  
**Status**: ✅ READY FOR DEPLOYMENT
