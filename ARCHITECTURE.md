# Architecture — Wapsell

System design and component overview.

## System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (Client)                      │
│  https://wapsell.com  https://wapsell.com/demo              │
└────────────────┬────────────────────────────────────────────┘
                 │ HTTPS (nginx reverse proxy)
                 ↓
┌─────────────────────────────────────────────────────────────┐
│                    Nginx (VPS:443)                           │
│  - TLS termination                                           │
│  - Reverse proxy → localhost:3010 (frontend)                │
│  - Reverse proxy → localhost:8000 (API)                     │
└────────────────┬────────────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        ↓                 ↓
┌──────────────┐   ┌──────────────┐
│ Frontend     │   │ Backend API  │
│ Next.js:3010 │   │ FastAPI:8000 │
└──────┬───────┘   └──────┬───────┘
       │                  │
       │ HTTP Cookies     │ SQLite
       │ JSON/REST        │ Session
       │                  │ Storage
       └──────────────────┘
```

## Core Components

### 1. Frontend (Next.js 14)

**Location:** `/app`, `/components`, `/lib`

**Responsibilities:**
- User registration & login
- Protected routes (demo)
- Chat interface
- Navbar & user menu
- Internationalization (ES/EN)

**Key Files:**
- `app/[locale]/auth/register/page.tsx` — Registration with validation
- `app/[locale]/auth/login/page.tsx` — Login form
- `app/[locale]/demo/chat/page.tsx` — Chat interface
- `lib/useAuth.ts` — Auth hooks (useAuth, useRequireAuth)
- `components/Navbar.tsx` — Navigation with user menu

**Technology:**
- Next.js 14 (App Router, SSR)
- TypeScript for type safety
- Tailwind CSS for styling
- next-intl for i18n
- React hooks for state management

### 2. Backend API (FastAPI)

**Location:** `/services/api`

**Responsibilities:**
- User registration with validation
- Authentication & session management
- Chat message processing
- Health checks

**Endpoints:**
```
POST   /auth/register     — Register user (validation + password strength)
POST   /auth/login        — Authenticate user (set HTTPOnly cookie)
POST   /auth/logout       — Logout (clear session)
GET    /auth/me           — Get current user from session
POST   /chat/message      — Process chat message (returns agent response)
GET    /health            — Health check
```

**Technology:**
- FastAPI for async API
- Pydantic for data validation
- SQLite for persistence
- HTTPOnly cookies for sessions
- SHA256 hashing for passwords (upgrade to bcrypt)

### 3. Database (SQLite)

**Location:** `/services/api/wapsell.db`

**Schema:**

```sql
-- Users table
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
);

-- Sessions table
CREATE TABLE sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**Considerations:**
- SQLite good for MVP/small scale
- Ready to migrate to PostgreSQL
- No authentication layer (local only)

## Authentication Flow

### Registration

```
Frontend: POST /auth/register
  {
    "email": "user@example.com",
    "password": "Password123",
    "name": "John Doe"
  }
    ↓
Backend validation:
  - Email format (EmailStr)
  - Password strength (8+ chars, uppercase, digit)
  - Name length (2-100 chars)
    ↓
Hash password (SHA256)
Generate user ID (secrets.token_urlsafe)
Insert into users table
Create session (7-day expiry)
Set HTTPOnly cookie: wapsell_session=<token>
    ↓
Frontend: Redirect to /demo
```

### Login

```
Frontend: POST /auth/login
  {
    "email": "user@example.com",
    "password": "Password123"
  }
    ↓
Backend:
  - Find user by email
  - Verify password (compare hashes)
  - Create session (7-day expiry)
  - Set HTTPOnly cookie
    ↓
Frontend: Redirect to /demo
```

### Session Verification

```
Frontend: GET /auth/me
  (Browser automatically sends wapsell_session cookie)
    ↓
Backend:
  - Extract token from cookie
  - Query sessions table
  - Check expiration
  - Return user info OR 401
    ↓
Frontend:
  - If 200 → render authenticated UI
  - If 401 → redirect to /auth/login
```

## Security Architecture

### Password Security

Current: SHA256 hashing
```python
password_hash = hashlib.sha256(password.encode()).hexdigest()
```

**Issues:**
- No salt (vulnerable to rainbow tables)
- No work factor (fast to brute-force)

**Upgrade needed:**
```python
import bcrypt
password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=12))
```

### Cookie Security

**HTTPOnly flag** ✅
```python
response.set_cookie(
    key="wapsell_session",
    value=token,
    httponly=True,      # ← Prevents XSS access
    secure=False,       # TODO: True in HTTPS-only
    samesite="lax",     # ← Prevents CSRF
    expires=expires_at,
    path="/",
)
```

**Benefits:**
- XSS cannot steal cookie (JavaScript blocked)
- CSRF tokens optional (same-site prevents most attacks)
- Secure flag prevents HTTP transmission (TODO: enable in prod)

### Rate Limiting (TODO)

Need to add to prevent brute-force:
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/auth/login")
@limiter.limit("5/minute")
async def login(req: LoginRequest, response: Response):
    ...
```

## Data Flow

### Chat Message Processing

```
User sends message in /demo/chat
    ↓
Frontend: POST /chat/message?user_id={id}
  {
    "message": "Busco algo en Palermo"
  }
    ↓
Backend:
  - Extract user_id from query
  - Verify user exists (optional)
  - Process message (currently mock responses)
    ↓
Response logic (mock):
  - If "palermo" in message → return "Palermo recommendations"
  - If "precio" in message → return "Price info"
  - Default → return generic response
    ↓
Frontend receives:
  {
    "reply": "Tenemos excelentes departamentos en Palermo..."
  }
    ↓
Display in chat UI
```

**Future: Real LLM Integration**

```
Message
  ↓
Vector embedding (OpenAI)
  ↓
Semantic search (property database)
  ↓
RAG context (top 5 matching properties)
  ↓
Prompt engineering (system + context + user message)
  ↓
LLM call (Claude/GPT-4)
  ↓
Response
```

## Deployment Architecture

### Local Development

```
npm run dev (Next.js on :3000)
python -m uvicorn main:app (FastAPI on :8000)

Browser connects to both directly
```

### Production (VPS)

```
GitHub main branch
  ↓
GitHub Actions triggers
  ↓
SSH to root@89.167.96.239
  ↓
cd /opt/wapsell
git pull origin main
docker compose down
docker compose build
docker compose up -d
  ↓
Docker containers:
  - wapsell-app (Next.js on :3010)
  - wapsell-api (FastAPI on :8000)
  ↓
Nginx reverse proxy:
  https://wapsell.com → localhost:3010
  https://api.wapsell.com → localhost:8000
  ↓
Browser connects through Nginx (TLS)
```

## API Contract

### Types

```typescript
// User
interface User {
  id: string;
  email: string;
  created_at: string;
}

// Chat
interface ChatRequest {
  message: string;
}

interface ChatResponse {
  reply: string;
}

// Error
interface ErrorResponse {
  detail: string;  // Error message
}
```

### Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | /auth/me, /chat/message |
| 201 | Created | /auth/register |
| 204 | No content | /auth/logout |
| 401 | Unauthorized | /auth/me without cookie |
| 409 | Conflict | /auth/register with duplicate email |
| 422 | Validation error | Invalid password strength |
| 500 | Server error | Database connection failed |

## Performance Considerations

### Frontend
- **Lazy loading** — Next.js automatic code splitting
- **Image optimization** — next/image
- **Static export** — Pre-render landing pages
- **Caching** — Browser cache + CDN (future)

### Backend
- **Async I/O** — FastAPI (uvicorn)
- **Connection pooling** — TODO (SQLite is single-threaded)
- **Caching** — Redis for sessions (TODO)
- **Database indexing** — Add index on `users.email`

### Database
- **Query optimization** — Currently simple lookups
- **Sharding** — Not needed for MVP scale
- **Replication** — TODO for high availability

## Monitoring & Observability

### Current
- Health check endpoint: GET /health
- Docker logs: `docker compose logs`
- GitHub Actions workflow logs

### Recommended (TODO)
- Structured logging (JSON format)
- Error tracking (Sentry)
- Performance monitoring (Prometheus + Grafana)
- User analytics (Posthog)
- Uptime monitoring (Pingdom)

## Scalability Path

### Phase 1 (Current)
- Single-instance deployment
- SQLite database
- Static secrets

### Phase 2 (Next)
- Database: PostgreSQL with replication
- Caching: Redis for sessions
- Secrets: Environment variables / AWS Secrets Manager
- CI/CD: Multi-environment (staging, prod)

### Phase 3 (Future)
- Kubernetes orchestration
- Load balancing (multiple API instances)
- Global CDN (content delivery)
- Multi-region deployment
- Database sharding

## Testing Architecture

### Unit Tests (Backend)
- Test individual endpoints
- Mock database calls
- Validate error handling

### Integration Tests (Planned)
- Test auth flow end-to-end
- Test chat with mocked LLM
- Test session persistence

### E2E Tests (Planned)
- Cypress/Playwright browser tests
- Full user flows (register → login → chat)
- Cross-browser compatibility

## Security Checklist

- ✅ HTTPS ready (Nginx TLS termination)
- ✅ HTTPOnly cookies
- ✅ Password validation (length, complexity)
- ✅ Email validation
- ✅ Session expiration
- ⚠️ Rate limiting (TODO)
- ⚠️ SQL injection prevention (Pydantic validates)
- ⚠️ CSRF protection (SameSite cookie set)
- ❌ OWASP A01: Broken access control (TODO: audit)
- ❌ OWASP A03: Injection (using Pydantic + SQLite safe)

---

**Last updated:** 2026-06-13
