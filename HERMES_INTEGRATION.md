# Wapsell + Hermes: Documentación Técnica y Funcional

**Versión:** 1.0  
**Fecha:** 2026-06-13  
**Descripción:** Integración del agente Hermes (vía Waseller SDK) en Wapsell para generar respuestas naturales con RAG.

---

## Tabla de Contenidos

1. [Arquitectura General](#arquitectura-general)
2. [Componentes Principales](#componentes-principales)
3. [Flujo de Datos Completo](#flujo-de-datos-completo)
4. [Hermes: AgentLoop en Detalle](#hermes-agentloop-en-detalle)
5. [Hindsight: El Motor de RAG](#hindsight-el-motor-de-rag)
6. [Integración en Wapsell](#integración-en-wapsell)
7. [Ejemplo Completo: Paso a Paso](#ejemplo-completo-paso-a-paso)
8. [Configuración y Variables](#configuración-y-variables)
9. [Troubleshooting](#troubleshooting)
10. [Roadmap Futuro](#roadmap-futuro)

---

## Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTE WEB (Next.js)                    │
│                    http://localhost:3000/demo                   │
└────────────────────┬────────────────────────────────────────────┘
                     │ HTTP POST /chat/message
                     │ {user_id, message}
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND API (FastAPI)                        │
│                   http://localhost:8000                         │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Endpoint POST /chat/message                      │  │
│  │                                                          │  │
│  │  1. Autenticate user (check user_id)                    │  │
│  │  2. Save user message to DB                             │  │
│  │  3. Call Hermes Agent ──────────┐                       │  │
│  │                                  │                       │  │
│  │  await hermes_client.agent_loop.respond(...)            │  │
│  │                                  │                       │  │
│  │  4. Get natural response ◄───────┘                       │  │
│  │  5. Save agent response to DB                           │  │
│  │  6. Return ChatResponse                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         HERMES AGENT SUBSYSTEM (Waseller SDK)           │  │
│  │                                                          │  │
│  │  WapsellClient (orchestrator)                           │  │
│  │    ├── AgentLoop (5-stage processing)                  │  │
│  │    ├── Hindsight (RAG vector store)                     │  │
│  │    ├── BuyerMemory (conversation history)              │  │
│  │    └── LLM (OpenRouter → Claude/GPT)                   │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         DATABASES                                        │  │
│  │                                                          │  │
│  │  SQLite (Wapsell)      PostgreSQL (future)             │  │
│  │  ├── users             ├── facts (Hindsight)           │  │
│  │  ├── sessions          ├── buyer_memory               │  │
│  │  ├── properties        └── tenant_config              │  │
│  │  └── chat_messages                                     │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                     ↑ HTTP 200
                     │ ChatResponse {reply}
                     │
                  BROWSER
```

---

## Componentes Principales

### 1. **WapsellClient** (Orquestador Principal)

Ubicación: `wapsell.client.WapsellClient` (del SDK Waseller)

**Responsabilidad:** Inicializar y coordinar todos los subsistemas.

**Instancia en Wapsell:**
```python
# services/api/main.py, línea ~440
hermes_client = init_hermes_client()
```

**Qué contiene:**
- `agent_loop` → AgentLoop (5-stage message processor)
- `tenants` → TenantManager (multi-tenant orchestration)
- `hindsight` → HindsightPort (RAG vector store)
- `memory` → BuyerMemoryPort (conversation history)
- `gateway` → WhatsAppGatewayPort (future: WhatsApp integration)
- `llm` → LLMPort (language model backend)

---

### 2. **AgentLoop** (El Corazón de Hermes)

Ubicación: `wapsell.agent.loop.AgentLoop`

**Responsabilidad:** Procesar un mensaje en 5 etapas determinísticas.

**Firma:**
```python
async def respond(
    self,
    tenant: Tenant,      # Tenant del cliente
    buyer_id: str,       # Buyer ID (ej: "demo:user-123")
    message: str         # Mensaje del usuario
) -> AgentTurn          # Respuesta con metadata
```

**Retorna:**
```python
@dataclass
class AgentTurn:
    reply: str                      # La respuesta natural
    model: str                      # Modelo usado (ej: "claude-3-haiku")
    facts_cited: tuple[Fact, ...]  # Propiedades usadas en RAG
    history_used: int              # Turnos de historial incluidos
    handoff: Optional[HandoffDecision]  # Si se pasó a humano
    resources_cited: tuple[Resource, ...]  # Recursos estructurados
```

---

### 3. **Hindsight** (Motor de RAG)

Ubicación: `wapsell.ingestion.hindsight`

**Responsabilidad:** Almacenar y buscar hechos (propiedades) por relevancia semántica.

**Tipos:**
- `InMemoryHindsight` → búsqueda en memoria (testing, local)
- `PostgresHindsight` → índice GIN tsvector en Postgres (producción)

**API:**
```python
# Agregar un hecho
hindsight.add_fact(Fact(
    id="prop_001",
    content="Departamento 2 amb Palermo Soho, $85k",
    source="properties_seed",
    tenant_id="demo"
))

# Buscar hechos relevantes
facts = hindsight.query(
    text="Busco departamento en Palermo",
    tenant_id="demo",
    top_k=5
)
# → Devuelve los 5 Facts más relevantes
```

**¿Cómo busca?**
- `InMemoryHindsight`: búsqueda substring (simple pero funciona)
- `PostgresHindsight`: índice GIN tsvector (full-text search)
- En producción: embeddings + pgvector (no implementado aún)

---

### 4. **BuyerMemory** (Historial de Conversación)

Ubicación: `wapsell.memory.buyer.BuyerMemoryPort`

**Responsabilidad:** Recordar la conversación anterior del buyer.

**API:**
```python
# Guardar una interacción
await memory.remember(
    buyer_id="demo:user-123",
    interaction=BuyerInteraction(
        text="Busco departamento",
        role="buyer"  # o "agent"
    )
)

# Recuperar historial
history = await memory.recall(
    buyer_id="demo:user-123",
    turns=5  # últimos 5 turnos
)
```

**¿Por qué es importante?**
- Hermes incluye el historial en el prompt
- El LLM "ve" la conversación anterior
- Permite continuidad: "¿Cuál tiene más dormitorios?" (refiere a propiedades previas)

---

### 5. **Tenant** (Multi-tenancy)

Ubicación: `wapsell.models.Tenant`

**Responsabilidad:** Aislar datos y configuración por cliente.

```python
@dataclass
class Tenant:
    id: str           # "demo"
    slug: str         # "demo" (URL-safe)
    name: str         # "Demo Tenant"
    plan: str         # "pro", "starter", etc
    model: str        # "anthropic/claude-3-haiku" (LLM a usar)
    created_at: str   # ISO timestamp
```

**Cómo funciona en Wapsell:**
- Todos los datos están scoped a `tenant_id="demo"`
- Las Facts en Hindsight solo se buscan en el tenant correcto
- La memoria del buyer solo contiene el historial de su tenant
- En producción: múltiples tenants en un solo servidor

---

## Flujo de Datos Completo

### Escenario: Usuario envía "Busco departamento en Palermo"

```
┌─────────────────────────────────────────────────────────────┐
│ 1. FRONTEND (Next.js)                                       │
│                                                             │
│ User clicks "Enviar" → mensaje: "Busco depto en Palermo"  │
│                                                             │
│ fetch('http://localhost:8000/chat/message', {             │
│   method: 'POST',                                           │
│   body: JSON.stringify({                                   │
│     message: "Busco departamento en Palermo"              │
│   }),                                                       │
│   credentials: 'include'  // HTTPOnly cookie with session  │
│ })                                                          │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP POST /chat/message
                     │ (con cookie wapsell_session)
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. BACKEND: POST /chat/message                              │
│                                                             │
│ async def chat_message(req, user_id=None):                │
│                                                             │
│ a) Authenticate:                                           │
│    user = get_user_by_id(user_id)  ← de SQLite           │
│    if not user: raise 401                                 │
│                                                             │
│ b) Save user message:                                      │
│    save_chat_message(user_id, "user", "Busco depto...")  │
│    → INSERT INTO chat_messages (...) ← SQLite             │
│                                                             │
│ c) Compose buyer_id:                                       │
│    buyer_id = f"demo:{user_id}"  ← ej: "demo:user-123"  │
│                                                             │
│ d) Get demo tenant:                                        │
│    demo_tenant = Tenant(id="demo", slug="demo", ...)     │
│                                                             │
│ e) Call Hermes Agent:                                      │
│    agent_turn = await hermes_client.agent_loop.respond(   │
│        tenant=demo_tenant,                                 │
│        buyer_id="demo:user-123",                          │
│        message="Busco departamento en Palermo"            │
│    )                                                        │
└────────────────────┬────────────────────────────────────────┘
                     │ Entra a AgentLoop.respond()
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. HERMES: AgentLoop.respond() — 5 ETAPAS                   │
│                                                             │
│ ETAPA 1: RECALL (Memoria)                                  │
│ ─────────────────────────────────────────────────────────  │
│ history = await memory.recall(                            │
│     buyer_id="demo:user-123",                             │
│     turns=5                                                │
│ )                                                           │
│                                                             │
│ history = [                                                │
│   BuyerInteraction("Hola", role="buyer"),                │
│   BuyerInteraction("Bienvenido!", role="agent"),         │
│   BuyerInteraction("Busco departamento", role="buyer"),  │
│   BuyerInteraction("¿En qué zona?", role="agent"),       │
│ ]                                                           │
│                                                             │
│ ETAPA 2: RAG (Hindsight Search)                            │
│ ─────────────────────────────────────────────────────────  │
│ facts = hindsight.query(                                  │
│     text="Busco departamento en Palermo",                │
│     tenant_id="demo",                                     │
│     top_k=5                                               │
│ )                                                           │
│                                                             │
│ facts = [                                                  │
│   Fact(content="Departamento 2 amb Palermo Soho, $85k"),│
│   Fact(content="Monoambiente Recoleta, $72k"),          │
│   Fact(content="Departamento 3 amb Belgrano, $1.8k/m"), │
│   ... (máx 5)                                             │
│ ]                                                           │
│                                                             │
│ ETAPA 3: COMPOSE (Armar Prompt)                            │
│ ─────────────────────────────────────────────────────────  │
│ messages = [                                               │
│   LLMMessage(                                             │
│     role="system",                                         │
│     content="""                                            │
│     Eres agente de ventas inmobiliario para Demo Inc.    │
│     Tu nombre es Hermes.                                  │
│     Ayudas a compradores a encontrar propiedades.        │
│                                                            │
│     ## Catalog facts                                       │
│     - Departamento 2 amb Palermo Soho, $85k             │
│     - Monoambiente Recoleta, $72k                        │
│     - ...                                                  │
│     """                                                    │
│   ),                                                       │
│   LLMMessage(role="user", content="Hola"),              │
│   LLMMessage(role="assistant", content="Bienvenido!"),  │
│   LLMMessage(role="user", content="Busco departamento"),│
│   LLMMessage(role="assistant", content="¿En qué zona?"),│
│   LLMMessage(                                             │
│     role="user",                                          │
│     content="Busco departamento en Palermo"              │
│   ),                                                       │
│ ]                                                          │
│                                                             │
│ ETAPA 4: LLM CALL                                          │
│ ─────────────────────────────────────────────────────────  │
│ response = await llm.complete(messages)                   │
│                                                             │
│ (LLM = OpenRouter → Claude/GPT)                           │
│                                                             │
│ response.text = """                                        │
│ Vi que buscas en Palermo. Tenemos una opción excelente:  │
│                                                            │
│ **Departamento 2 amb Palermo Soho - $85.000**            │
│ Luminoso con balcón, piso alto. Ideal para inversor.     │
│                                                            │
│ También te muestro otras zonas por si te interesa:       │
│ - Monoambiente Recoleta ($72k)                           │
│ - Departamento Belgrano ($1.8k/mes)                      │
│                                                            │
│ ¿Cuál te interesa conocer más?                           │
│ """                                                        │
│                                                             │
│ ETAPA 5: RETURN (AgentTurn)                                │
│ ─────────────────────────────────────────────────────────  │
│ agent_turn = AgentTurn(                                    │
│     reply="Vi que buscas en Palermo...",                 │
│     model="claude-3-haiku",                              │
│     facts_cited=(...),  # [Palermo, Recoleta, Belgrano] │
│     history_used=4,     # 4 turnos de historial          │
│     handoff=None                                          │
│ )                                                          │
└────────────────────┬────────────────────────────────────────┘
                     │ Devuelve AgentTurn
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. BACKEND: Procesar AgentTurn                              │
│                                                             │
│ reply = agent_turn.reply                                   │
│                                                             │
│ f) Save agent response:                                    │
│    save_chat_message(user_id, "agent", reply)            │
│    → INSERT INTO chat_messages (...) ← SQLite             │
│                                                             │
│ g) Return response:                                        │
│    return ChatResponse(reply=reply)                        │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP 200 JSON
                     │ {reply: "Vi que buscas en Palermo..."}
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. FRONTEND: Mostrar respuesta                              │
│                                                             │
│ const data = await response.json()                         │
│ → {reply: "Vi que buscas en Palermo..."}                 │
│                                                             │
│ // Agregar a chat UI                                      │
│ messages.push({                                            │
│   role: "agent",                                          │
│   text: data.reply,                                       │
│   timestamp: new Date()                                   │
│ })                                                         │
│                                                             │
│ // Re-render chat                                         │
│ showMessage(data.reply)                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Hermes: AgentLoop en Detalle

### Las 5 Etapas Explicadas

#### **ETAPA 1: RECALL**

```python
# services/api/main.py: Implícito en BuyerMemory
# wapsell.memory.buyer_memory.recall() busca:

SELECT * FROM buyer_interactions
WHERE buyer_id = 'demo:user-123'
ORDER BY created_at DESC
LIMIT 5;

# Resultado: últimos 5 turnos de conversación
```

**¿Por qué?**
- El LLM necesita contexto
- "¿Cuál tiene más dormitorios?" requiere saber qué propiedades se mencionaron

**Límite:** Por defecto 5 turnos (configurable)

---

#### **ETAPA 2: RAG (Retrieval-Augmented Generation)**

```python
# services/api/main.py, línea ~465
facts = hindsight.query(
    text="Busco departamento en Palermo",
    tenant_id="demo",
    top_k=5
)

# InMemoryHindsight: búsqueda substring
# SELECT * FROM facts
# WHERE tenant_id='demo'
#   AND (content LIKE '%palermo%'
#        OR content LIKE '%departamento%')
# LIMIT 5

# Result:
# [
#   Fact(id='prop_001', content='Departamento 2 amb Palermo Soho...'),
#   Fact(id='prop_003', content='Monoambiente Recoleta...'),
#   ...
# ]
```

**¿Por qué es importante?**
- Sin RAG: el LLM inventa propiedades
- Con RAG: el LLM solo recomienda lo que existe
- Reduce alucinaciones (hallucinations)

**Cómo se cargan las propiedades:**
```python
# services/api/main.py, línea ~460
# En init_hermes_client():

for title, description, prop_type, price, bedrooms, location in properties:
    fact_text = f"{title}. {description}. {bedrooms} dormitorios, {prop_type}, ${price:,.0f}, {location}"
    fact = Fact(
        id=secrets.token_urlsafe(12),
        content=fact_text,
        source="properties_seed",
        tenant_id="demo"
    )
    client.hindsight.add_fact(fact)
```

---

#### **ETAPA 3: COMPOSE**

```python
# wapsell.agent.soul.SoulBuilder construye el prompt:

messages = [
    {
        "role": "system",
        "content": """
        Eres Hermes, agente de ventas inmobiliario para Demo Inc.
        Tu objetivo es ayudar a compradores a encontrar la propiedad perfecta.
        
        ## Catalog facts
        - Departamento 2 amb Palermo Soho. Luminoso con balcón, piso alto...
        - Monoambiente Recoleta. Moderno y equipado, apto crédito...
        
        ## Recent conversation
        User: Busco departamento
        Agent: ¿En qué zona?
        
        ## Your instructions
        1. Recomend only from catalog facts
        2. Be conversational and natural
        3. Ask clarifying questions
        4. Suggest related properties
        """
    },
    {"role": "user", "content": "Hola"},
    {"role": "assistant", "content": "Bienvenido!"},
    {"role": "user", "content": "Busco departamento en Palermo"}
]
```

**¿Qué es SOUL?**
- "System Oriented Unified Language"
- Prompt template por tenant
- Define comportamiento del agente
- En Wapsell: default SOUL (puede customizarse)

---

#### **ETAPA 4: LLM CALL**

```python
# wapsell.llm.port (LLMPort)
# En Wapsell: EchoLLM en local, OpenRouterLLM en producción

response = await llm.complete(messages=[...])

# OpenRouter → Claude/GPT-4
# (requiere OPENROUTER_API_KEY en .env)

# Response:
# {
#   "text": "Vi que buscas en Palermo. Tenemos una opción excelente...",
#   "model": "anthropic/claude-3-haiku",
#   "stop_reason": "end_turn"
# }
```

**¿Qué LLM se usa?**
- Local: `EchoLLM` (devuelve mock responses)
- Producción: OpenRouter API key
- Tenant configurable en `Tenant.model`

---

#### **ETAPA 5: RETURN**

```python
# wapsell.agent.loop.AgentTurn
agent_turn = AgentTurn(
    reply="Vi que buscas en Palermo. Tenemos...",
    model="claude-3-haiku",
    facts_cited=(
        Fact(content="Departamento 2 amb Palermo..."),
        Fact(content="Monoambiente Recoleta..."),
    ),
    history_used=4,  # 4 turnos de historial
    handoff=None,
    resources_cited=()
)

# El backend extrae: agent_turn.reply
# Lo guarda en chat_messages
# Lo devuelve al frontend
```

---

## Hindsight: El Motor de RAG

### ¿Cómo funciona la búsqueda?

#### **InMemoryHindsight (Actual en Wapsell)**

```python
# wapsell.ingestion.hindsight.InMemoryHindsight

class InMemoryHindsight:
    def __init__(self):
        self.facts: list[Fact] = []
    
    def add_fact(self, fact: Fact):
        self.facts.append(fact)
    
    def query(self, text: str, tenant_id: str, top_k: int = 5):
        # Búsqueda substring simple
        search_terms = text.lower().split()
        
        matches = []
        for fact in self.facts:
            if fact.tenant_id != tenant_id:
                continue  # Tenant scoping
            
            score = 0
            for term in search_terms:
                if term in fact.content.lower():
                    score += 1
            
            if score > 0:
                matches.append((fact, score))
        
        # Ordenar por score, devolver top_k
        matches.sort(key=lambda x: x[1], reverse=True)
        return [fact for fact, _ in matches[:top_k]]
```

**Ventajas:**
- ✅ Funciona sin dependencias externas
- ✅ Ideal para desarrollo local
- ✅ Determinístico

**Limitaciones:**
- ❌ No entiende semántica ("barato" ≠ "accesible")
- ❌ No maneja sinónimos
- ❌ Lento con muchos facts (O(n))

#### **PostgresHindsight (Futuro en Wapsell)**

```sql
-- Base de datos Postgres
CREATE TABLE facts (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    source TEXT,
    tenant_id TEXT NOT NULL,
    created_at TIMESTAMP,
    content_tsvector tsvector GENERATED ALWAYS AS (
        to_tsvector('spanish', content)
    ) STORED
);

-- Índice GIN para búsqueda full-text
CREATE INDEX idx_facts_tsvector ON facts USING GIN(content_tsvector);

-- Búsqueda:
SELECT * FROM facts
WHERE tenant_id = 'demo'
  AND content_tsvector @@ plainto_tsquery('spanish', 'palermo departamento')
ORDER BY ts_rank(content_tsvector, plainto_tsquery('spanish', 'palermo departamento')) DESC
LIMIT 5;
```

**Ventajas:**
- ✅ Full-text search (entiende lenguaje)
- ✅ Rápido con índices
- ✅ Soporta múltiples idiomas

---

## Integración en Wapsell

### Archivo Principal: `services/api/main.py`

```python
# ════════════════════════════════════════════════════════════
# 1. IMPORTS (línea 1-30)
# ════════════════════════════════════════════════════════════

from wapsell.client import WapsellClient
from wapsell.models import Fact, Tenant

# ════════════════════════════════════════════════════════════
# 2. INICIALIZACIÓN DE HERMES (línea ~440-470)
# ════════════════════════════════════════════════════════════

def init_hermes_client():
    """Initialize WapsellClient with properties loaded as Facts in Hindsight."""
    
    # (a) Crear cliente
    client = WapsellClient()
    
    # (b) Crear tenant demo
    try:
        client.tenants.create("demo", Tenant(...))
    except:
        pass  # Tenant ya existe
    
    # (c) Cargar propiedades en Hindsight
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT title, description, type, price, bedrooms, location FROM properties")
    properties = cursor.fetchall()
    conn.close()
    
    for title, description, prop_type, price, bedrooms, location in properties:
        fact_text = f"{title}. {description}. {bedrooms} dormitorios, {prop_type}, ${price:,.0f}, {location}"
        fact = Fact(
            id=secrets.token_urlsafe(12),
            content=fact_text,
            source="properties_seed",
            tenant_id="demo"
        )
        client.hindsight.add_fact(fact)
    
    return client

# ════════════════════════════════════════════════════════════
# 3. CREAR INSTANCIA GLOBAL (línea ~475)
# ════════════════════════════════════════════════════════════

hermes_client = init_hermes_client()

# ════════════════════════════════════════════════════════════
# 4. ENDPOINT /chat/message (línea ~600-650)
# ════════════════════════════════════════════════════════════

@app.post("/chat/message", response_model=ChatResponse)
async def chat_message(req: ChatRequest, user_id: str = None):
    """Send a message and get a response from Hermes agent with RAG."""
    try:
        # Validar usuario
        if not user_id:
            raise HTTPException(status_code=401, detail="user_id required")
        
        user = get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        # Guardar mensaje del usuario en SQLite
        save_chat_message(user_id, "user", req.message)
        
        # Componer buyer_id (tenant:user_id)
        buyer_id = f"demo:{user_id}"
        
        # Obtener tenant
        demo_tenant = hermes_client.tenants.repository.find(id="demo")
        
        # ★★★ LLAMAR A HERMES (LA LÍNEA MÁGICA) ★★★
        agent_turn = await hermes_client.agent_loop.respond(
            tenant=demo_tenant,           # Tenant actual
            buyer_id=buyer_id,            # Identificador del comprador
            message=req.message           # Mensaje del usuario
        )
        
        # Extraer respuesta natural
        reply = agent_turn.reply
        
        # Guardar respuesta del agente en SQLite
        save_chat_message(user_id, "agent", reply)
        
        # Devolver respuesta al frontend
        return ChatResponse(reply=reply)
    
    except HTTPException:
        raise
    except Exception as exc:
        logging.error(f"Chat error: {str(exc)}")
        raise HTTPException(status_code=500, detail=str(exc))
```

---

## Ejemplo Completo: Paso a Paso

### Escenario Real: Usuario "juan@example.com" busca apartamento

#### **Paso 1: Usuario se registra**

```
Frontend: POST /auth/register
Body: {
  "email": "juan@example.com",
  "password": "Password123",
  "name": "Juan García"
}

Backend:
- Hash password
- Insert into users table
- Create session
- Set HTTPOnly cookie

Response: 201 Created
```

#### **Paso 2: Usuario inicia sesión**

```
Frontend: POST /auth/login
Body: {
  "email": "juan@example.com",
  "password": "Password123"
}

Backend:
- Find user by email
- Verify password
- Create session token
- Set HTTPOnly cookie wapsell_session=<token>

Frontend:
- Cookie saved automatically
- Redirect to /demo
```

#### **Paso 3: Frontend carga /demo/chat**

```
Frontend: GET /demo/chat
- useRequireAuth hook checks auth
- Fetch GET /auth/me (con cookie)

Backend:
- Verify cookie session
- Return user: {id: "user-xyz", email: "juan@..."}

Frontend:
- Load chat history
- Fetch GET /messages?user_id=user-xyz
- Display empty chat (first time)
```

#### **Paso 4: Usuario envía primer mensaje**

```javascript
// Frontend: components/DemoChat
User types: "Busco apartamento de 2 dormitorios"
Clicks "Enviar"

fetch('/chat/message?user_id=user-xyz', {
  method: 'POST',
  body: JSON.stringify({
    message: "Busco apartamento de 2 dormitorios"
  }),
  credentials: 'include'  // Envía la cookie
})
```

**Backend: POST /chat/message**

```python
# Línea 1: Validar
user_id = "user-xyz"  # De query params
user = get_user_by_id(user_id)  # ✓ Existe

# Línea 2: Guardar en BD
save_chat_message(
    "user-xyz",
    "user",
    "Busco apartamento de 2 dormitorios"
)
# INSERT INTO chat_messages
#   (id, user_id, role, content, created_at)
# VALUES
#   ('msg-abc123', 'user-xyz', 'user', '...', '2026-06-13T...')

# Línea 3: Componer buyer_id
buyer_id = "demo:user-xyz"

# Línea 4: Obtener tenant
demo_tenant = Tenant(id="demo", slug="demo", name="Demo Tenant")

# Línea 5: LLAMAR A HERMES
agent_turn = await hermes_client.agent_loop.respond(
    tenant=demo_tenant,
    buyer_id="demo:user-xyz",
    message="Busco apartamento de 2 dormitorios"
)

# DENTRO DE HERMES (AgentLoop):
#
# ETAPA 1: RECALL
#   Busca historial previo de "demo:user-xyz"
#   → history = []  (primer mensaje)
#
# ETAPA 2: RAG
#   Busca en Hindsight:
#     SELECT * FROM facts
#     WHERE tenant_id='demo'
#       AND content LIKE '%dormitorio%'
#     LIMIT 5
#   → facts = [
#       Fact("Departamento 2 amb Palermo Soho. ... 2 dormitorios..."),
#       Fact("Departamento 3 amb Belgrano. ... 3 dormitorios..."),
#       Fact("PH 3 amb San Telmo. ... 3 dormitorios..."),
#       Fact("Departamento 2 amb Caballito. ... 2 dormitorios..."),
#     ]
#
# ETAPA 3: COMPOSE
#   Arma prompt:
#   messages = [
#     {role: "system", content: """
#       Eres Hermes, agente inmobiliario...
#       
#       ## Catalog facts
#       - Departamento 2 amb Palermo Soho, 2 dorm, $85k
#       - Departamento 3 amb Belgrano, 3 dorm, $1.8k/mes
#       - PH 3 amb San Telmo, 3 dorm, $120k
#       - Departamento 2 amb Caballito, 2 dorm, $1.2k/mes
#     """},
#     {role: "user", content: "Busco apartamento de 2 dormitorios"}
#   ]
#
# ETAPA 4: LLM CALL
#   response = await openrouter_llm.complete(messages)
#   → "Perfecto, tengo varias opciones de 2 dormitorios..."
#
# ETAPA 5: RETURN
#   agent_turn = AgentTurn(
#     reply="Perfecto, tengo varias opciones...",
#     facts_cited=[...],
#     model="claude-3-haiku",
#     history_used=0
#   )

# Línea 6: Extraer respuesta
reply = agent_turn.reply
# "Perfecto, tengo varias opciones de 2 dormitorios..."

# Línea 7: Guardar respuesta
save_chat_message("user-xyz", "agent", reply)
# INSERT INTO chat_messages
#   (id, user_id, role, content, created_at)
# VALUES
#   ('msg-def456', 'user-xyz', 'agent', 'Perfecto, ...', '2026-06-13T...')

# Línea 8: Devolver
return ChatResponse(reply="Perfecto, tengo varias opciones...")
```

**Frontend: Recibe respuesta**

```javascript
const data = await response.json()
// {reply: "Perfecto, tengo varias opciones..."}

// Agregar a UI
messages.push({
  role: "agent",
  text: data.reply,
  timestamp: new Date()
})

// Re-render chat → Usuario ve respuesta natural
```

#### **Paso 5: Usuario envía segundo mensaje**

```
User: "¿Cuál tiene mejor ubicación?"

Frontend: POST /chat/message
Body: {message: "¿Cuál tiene mejor ubicación?"}

Backend: POST /chat/message
- Save user message
- buyer_id = "demo:user-xyz"

HERMES:
- ETAPA 1: RECALL
  → Busca historial anterior
  → history = [
      "Busco apartamento de 2 dormitorios",
      "Perfecto, tengo varias opciones..."
    ]
  
- ETAPA 2: RAG
  → Busca hechos relevantes para "mejor ubicación"
  → facts = [
      "Departamento 2 amb Palermo Soho, 2 dorm, $85k, PALERMO",
      "Departamento 2 amb Caballito, 2 dorm, $1.2k/mes, CABALLITO",
    ]
  
- ETAPA 3: COMPOSE
  → Arma prompt con:
     - System: SOUL del agente
     - Historial anterior (2 mensajes)
     - Facts de 2 dorm + ubicación
     - Nuevo mensaje: "¿Cuál tiene mejor ubicación?"
  
- ETAPA 4: LLM
  → Claude/OpenRouter genera:
     "Palermo es una zona muy buscada, más central que Caballito..."
  
- ETAPA 5: RETURN
  → AgentTurn con respuesta natural

Frontend: Muestra "Palermo es una zona muy buscada..."
```

---

## Configuración y Variables

### Variables de Entorno

```bash
# .env (en services/api/)

# LLM
OPENROUTER_API_KEY=sk-...  # Para usar OpenRouter en producción

# Wapsell
WAPSELL_TENANT_ID=demo     # Tenant principal
WAPSELL_MODEL=anthropic/claude-3-haiku  # Modelo por defecto

# Database
DATABASE_URL=sqlite:///wapsell.db  # Local
```

### Configuración de Tenant

```python
# En init_hermes_client()
demo_tenant = Tenant(
    id="demo",
    slug="demo",
    name="Demo Tenant",
    plan="pro",
    model="anthropic/claude-3-haiku"  # ← Modelo a usar
)

# Para múltiples tenants (producción):
tenants = [
    Tenant(id="acme", slug="acme", name="ACME Inc", model="anthropic/claude-3-opus"),
    Tenant(id="startup", slug="startup", name="StartUp Ltd", model="openai/gpt-4"),
]
```

---

## Troubleshooting

### Problema: Respuestas genéricas ("¿Qué tipo de inmueble te interesa?")

**Causa:** RAG no encuentra propiedades relevantes.

**Solución:**
1. Verificar propiedades están en Hindsight:
   ```bash
   curl http://localhost:8000/properties
   # Debe devolver: {"total": 10, "sample": [...]}
   ```

2. Verificar búsqueda:
   ```python
   # En services/api/main.py, agregar endpoint de debug
   @app.get("/debug/search")
   def debug_search(q: str = "palermo"):
       facts = search_properties(q, limit=5)
       return {"query": q, "facts": [f.content for f in facts]}
   
   # Luego test: curl http://localhost:8000/debug/search?q=palermo
   ```

### Problema: "Hermes agent error: ..."

**Causa:** Error en AgentLoop (LLM, memoria, etc).

**Solución:**
1. Revisar logs:
   ```
   tail -f services/api/uvicorn.log | grep "Chat error"
   ```

2. Verificar LLM está disponible:
   - ¿LocalLLM corriendo?
   - ¿OPENROUTER_API_KEY configurada?
   - ¿Cuota disponible?

3. Verificar Hindsight:
   ```python
   print(f"Facts en Hindsight: {len(hermes_client.hindsight.facts)}")
   ```

### Problema: Respuestas no tienen contexto de historial

**Causa:** BuyerMemory no carga historial anterior.

**Solución:**
1. Verificar chat_messages en BD:
   ```sqlite
   SELECT COUNT(*) FROM chat_messages WHERE user_id='user-xyz';
   ```

2. Verificar memoria está usando BD:
   ```python
   # Debe ser InMemoryBuyerMemory (local)
   memory = hermes_client.memory
   print(type(memory))  # InMemoryBuyerMemory
   ```

---

## Roadmap Futuro

### Fase 1 (Actual)
- ✅ InMemoryHindsight (búsqueda substring)
- ✅ InMemoryBuyerMemory (historial en memoria)
- ✅ EchoLLM / OpenRouter (LLM mock o real)
- ✅ Single tenant (demo)

### Fase 2 (Próximo)
- ⏳ PostgreSQL Hindsight (full-text search)
- ⏳ Persistent BuyerMemory (Postgres)
- ⏳ Multi-tenant orchestration
- ⏳ WhatsApp gateway integration

### Fase 3 (Futuro)
- ⏳ Vector embeddings + pgvector (semantic search)
- ⏳ Real-time skill execution (catalog-lookup, sales-logic)
- ⏳ Handoff to human agent
- ⏳ Multi-language SOUL templates

---

## Resumen: Hermes en Wapsell

| Componente | Ubicación | Responsabilidad |
|-----------|-----------|------------------|
| **WapsellClient** | wapsell.client | Orquestador principal |
| **AgentLoop** | wapsell.agent.loop | 5-stage message processor |
| **Hindsight** | wapsell.ingestion | RAG (búsqueda de hechos) |
| **BuyerMemory** | wapsell.memory | Historial de conversación |
| **LLM** | wapsell.llm | Backend de modelo (Claude/GPT) |
| **Tenant** | wapsell.models | Multi-tenancy |

**Flujo en una línea:**
```
Usuario → FastAPI → hermes_client.agent_loop.respond() 
  → RECALL → RAG → COMPOSE → LLM → AgentTurn 
  → reply → Frontend
```

---

## Documentos Relacionados

- [README.md](README.md) — Guía general de Wapsell
- [DEPLOYMENT.md](DEPLOYMENT.md) — Cómo deployar a producción
- [ARCHITECTURE.md](ARCHITECTURE.md) — Arquitectura general del sistema
- [HermesSell Documentation](../HermesSell/docs/PHASES.md) — Documentación del proyecto original

---

**Última actualización:** 2026-06-13  
**Versión:** 1.0  
**Autor:** Claude Code + User Feedback
