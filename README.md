# Wapsell — AI-Powered Real Estate Sales Agent

A complete B2B SaaS platform with a free demo, user authentication, and an AI-powered chat agent for real estate inquiries.

## ✨ Features

- **User Authentication** — Email/password registration and login with HTTPOnly cookies
- **Protected Demo** — Free demo requires authentication
- **AI Chat Agent** — Conversational interface for property inquiries (RAG-ready)
- **Responsive Design** — Mobile-friendly interface built with Next.js
- **Bilingual** — Full support for Spanish and English (next-intl)
- **Auto-Deploy** — GitHub Actions + Docker on every push to main
- **Comprehensive Tests** — 12 backend unit tests + test suite

## 🏗️ Tech Stack

### Frontend
- **Next.js 14** — React framework with SSR
- **TypeScript** — Type-safe development
- **Tailwind CSS** — Utility-first styling
- **next-intl** — Internationalization (ES/EN)

### Backend
- **FastAPI** — High-performance Python API
- **SQLite** — Lightweight database (Postgres-ready)
- **Pydantic** — Data validation with EmailStr
- **HTTPOnly Cookies** — Secure session management

### DevOps
- **Docker** — Containerization
- **GitHub Actions** — CI/CD pipeline (auto-deploy)
- **Hetzner VPS** — Production (89.167.96.239:/opt/wapsell)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker & Docker Compose (optional)

### Frontend (Local)

```bash
cd wapsell
npm install
npm run dev
# → http://localhost:3000/es
```

### Backend (Local)

```bash
cd services/api
pip install -r requirements.txt
python -m uvicorn main:app --reload
# → http://localhost:8000
```

### Both Services (Docker)

```bash
docker compose up
# Frontend: http://localhost:3010
# API: http://localhost:8000
```

## 📋 API Endpoints

### Authentication
```
POST   /auth/register     — Register new user (validation included)
POST   /auth/login        — Log in (returns HTTPOnly cookie)
POST   /auth/logout       — Log out (clears cookie)
GET    /auth/me           — Get current user
```

### Chat
```
POST   /chat/message      — Send message, get agent response
```

### Health
```
GET    /health            — API health check
```

## 🗂️ Project Structure

```
wapsell/
├── app/[locale]/
│   ├── auth/
│   │   ├── register/page.tsx      Form with validations
│   │   ├── login/page.tsx         Login form
│   │   └── layout.tsx
│   ├── demo/
│   │   ├── page.tsx               Protected route
│   │   ├── chat/page.tsx          Agent chat interface
│   │   └── layout.tsx
│   └── layout.tsx                 Global layout with Navbar
├── components/
│   └── Navbar.tsx                 User menu + logout
├── lib/
│   ├── useAuth.ts                 Auth hooks (useAuth, useRequireAuth)
│   ├── constants.ts
│   └── useAuth.test.ts            Test template
├── services/api/
│   ├── main.py                    FastAPI app (all endpoints)
│   ├── test_main.py               12 unit tests
│   ├── requirements.txt
│   └── Dockerfile
├── .github/workflows/
│   └── deploy.yml                 GitHub Actions (auto-deploy)
├── scripts/
│   └── deploy.sh                  Manual SSH deployment
├── docker-compose.yml
├── Dockerfile
├── TESTING.md                     Test guide
└── README.md                       This file
```

## 🔐 Authentication Flow

```
1. User registers → /auth/register
   - Email validation (EmailStr)
   - Password strength (8+ chars, uppercase, digit)
   - Create user in SQLite
   - Set HTTPOnly cookie
   - Redirect to /demo

2. User logs in → /auth/login
   - Verify email + password
   - Create session (7-day expiry)
   - Set HTTPOnly cookie

3. Protected routes → /demo, /demo/chat
   - Check session cookie via /auth/me
   - If invalid → redirect to /auth/login
   - If valid → allow access

4. User logs out → /auth/logout
   - Clear session cookie
   - Redirect to /auth/login
```

## 🧪 Testing

### Run Backend Tests
```bash
cd services/api
pytest test_main.py -v
```

**Coverage:** 12 tests including:
- Registration (success, validation, duplicates)
- Login (success, invalid credentials)
- Session management
- Chat endpoint

See [TESTING.md](TESTING.md) for full guide.

## 🌐 Deployment

### Manual Deploy (Local → VPS)
```bash
./scripts/deploy.sh main root 89.167.96.239
```

Script handles:
- SSH to VPS
- Git pull latest code
- Docker compose rebuild
- Health check

### Automatic Deploy (GitHub → VPS)

Every push to `main` triggers:
1. GitHub Actions workflow
2. SSH to VPS via secrets
3. Pull code, rebuild, restart
4. Health check verification

**Configure GitHub Secrets:**
- `VPS_HOST`: `89.167.96.239`
- `VPS_USER`: `root`
- `VPS_SSH_KEY`: Your SSH private key

### Production URLs
- **Landing:** https://wapsell.com
- **Demo:** https://wapsell.com/demo
- **API:** https://api.wapsell.com

## 🔧 Development

### Adding a Feature
```bash
git checkout -b feat/feature-name
# Make changes
npm run dev                    # Frontend
python -m uvicorn main:app    # Backend
pytest test_main.py           # Tests
git commit -m "feat(scope): description"
git push origin feat/feature-name
# Create PR on GitHub
```

### Debugging
```bash
# Frontend
npm run dev -- --debug

# Backend
python -m uvicorn main:app --reload --log-level debug

# Database
sqlite3 services/api/wapsell.db ".tables"
```

## ✅ Security

- ✅ Email validation
- ✅ Password strength requirements (8+ chars, uppercase, digit)
- ✅ HTTPOnly cookies (XSS protection)
- ✅ Session expiration (7 days)
- ✅ CORS same-origin
- ⚠️ TODO: bcrypt instead of SHA256
- ⚠️ TODO: HTTPS enforcement
- ⚠️ TODO: Rate limiting
- ⚠️ TODO: CSRF protection

## 🚧 Future Enhancements

- [ ] OAuth (Google, GitHub)
- [ ] Real LLM integration (OpenAI/Claude)
- [ ] Stripe/MercadoPago payments
- [ ] Data ingestion (CSV, PDF, XLSX)
- [ ] Admin dashboard
- [ ] WhatsApp integration
- [ ] PostgreSQL migration
- [ ] WebSocket for real-time chat
- [ ] Email verification

## 📖 Documentation

- [TESTING.md](TESTING.md) — Testing guide & setup
- [Architecture docs](docs/) — Coming soon
- [API docs](http://localhost:8000/docs) — Swagger UI (local)

## 📝 Commit Convention

```
feat(scope): description         New feature
fix(scope): description          Bug fix
docs(scope): description         Documentation
test(scope): description         Tests
refactor(scope): description     Refactoring
perf(scope): description         Performance
chore(scope): description        Maintenance
```

## 📞 Support

- GitHub Issues: https://github.com/fmonfasani/wapsell/issues
- Email: support@wapsell.com

---

**7-Day Build** — Auth + Chat + Tests + Deploy ✨

Last updated: 2026-06-13
