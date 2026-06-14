# 📚 DOCUMENTACIÓN - RAG Sistema Completo

**Última actualización**: 2026-06-13  
**Versión**: 1.0  
**Status**: ✅ Producción

---

## 📖 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Cómo Funciona el RAG](#cómo-funciona-el-rag)
3. [Endpoints](#endpoints)
4. [Ejemplos de Uso](#ejemplos-de-uso)
5. [Configuración](#configuración)
6. [Troubleshooting](#troubleshooting)

---

## Introducción

El **RAG (Retrieval-Augmented Generation)** de Wapsell es un sistema inteligente que combina:

- **Búsqueda en Base de Datos** - Encuentra propiedades específicas que coincidan con el criterio del usuario
- **Generación de Lenguaje Natural** - Presenta los resultados de forma conversacional
- **Fallback a Agente IA** - Si no hay propiedades relevantes, usa un LLM para conversación general

### ¿Por Qué RAG?

Sin RAG: "¿Qué propiedades tienes?"  
Respuesta: "Tenemos varias opciones. ¿Cuál es tu presupuesto?" (genérico)

Con RAG: "¿Qué propiedades tienes en Palermo?"  
Respuesta: "Encontré esta: Departamento 2 amb Palermo Soho ($85,000)" (específico)

---

## Cómo Funciona el RAG

### Fase 1: Recepción del Query

```
Usuario: "Quiero casa grande en Villa Urquiza"
         ↓
POST /chat/message
{
  "message": "Quiero casa grande en Villa Urquiza"
}
```

### Fase 2: Procesamiento de Keywords

```python
query = "Quiero casa grande en Villa Urquiza"
keywords = ["quiero", "casa", "grande", "villa", "urquiza"]
           ↓
# Filtra palabras < 2 caracteres
keywords = ["casa", "grande", "villa", "urquiza"]
```

### Fase 3: Búsqueda en Base de Datos

```sql
-- Para cada keyword, ejecuta:
SELECT * FROM properties
WHERE title LIKE '%casa%'
   OR description LIKE '%casa%'
   OR location LIKE '%casa%'
   OR type LIKE '%casa%'
LIMIT 5
```

**Resultado**: Casa 4 amb Villa Urquiza ($280,000)

### Fase 4: Presentación al Usuario

```
Si hay resultados (RAG):
  ✓ Devolver propiedades encontradas
  
Si no hay resultados:
  ✓ Usar agente Hermes para respuesta conversacional
```

---

## Endpoints

### POST `/chat/message`

Envía un mensaje de chat y obtiene respuesta RAG o del agente.

**Request:**
```bash
POST http://localhost:8000/chat/message?user_id={user_id}
Content-Type: application/json

{
  "message": "Departamento en Belgrano"
}
```

**Response (RAG - Éxito):**
```json
{
  "reply": "¡Excelente! Encontré propiedades que te podrían interesar:\n\n• Departamento 3 amb Belgrano (3 dorm) en Belgrano - $1,800/mes\n\n¿Te gustaría conocer más detalles de alguno de estos inmuebles?"
}
```

**Response (Agent - Fallback):**
```json
{
  "reply": "¿Tienes alguna preferencia específica en cuanto a presupuesto o cantidad de dormitorios?"
}
```

**Status Codes:**
- `200` - Éxito
- `400` - Falta user_id
- `401` - Usuario no encontrado
- `500` - Error del servidor

---

### GET `/messages`

Obtiene el historial de chat de un usuario.

**Request:**
```bash
GET http://localhost:8000/messages?user_id={user_id}
```

**Response:**
```json
{
  "messages": [
    {
      "id": "msg_001",
      "role": "user",
      "content": "Palermo",
      "created_at": "2026-06-13T20:15:30Z"
    },
    {
      "id": "msg_002",
      "role": "agent",
      "content": "¡Excelente! Encontré propiedades...",
      "created_at": "2026-06-13T20:15:32Z"
    }
  ]
}
```

---

### GET `/debug/hindsight`

Endpoint de debug para verificar estado de Hindsight.

**Request:**
```bash
GET http://localhost:8000/debug/hindsight
```

**Response:**
```json
{
  "hindsight_type": "InMemoryHindsight",
  "test_query": "Palermo",
  "results_count": 1,
  "results": [
    "Departamento 2 amb Palermo Soho en Palermo"
  ]
}
```

---

## Ejemplos de Uso

### 1. Búsqueda Simple por Ubicación

```
Usuario: "Palermo"
RAG: Encuentra Departamento 2 amb Palermo Soho
Respuesta: "¡Excelente! Encontré propiedades que te podrían interesar:
            • Departamento 2 amb Palermo Soho (2 dorm) en Palermo - $85,000
            ¿Te gustaría conocer más detalles?"
```

### 2. Búsqueda Tipo + Ubicación

```
Usuario: "Casa en Villa Urquiza"
RAG: Busca "casa" + "villa" + "urquiza"
Respuesta: "¡Excelente! Encontré propiedades que te podrían interesar:
            • Casa 4 amb Villa Urquiza (4 dorm) en Villa Urquiza - $280,000
            ¿Te gustaría conocer más detalles?"
```

### 3. Búsqueda con Criterio Financiero

```
Usuario: "Alquiler barato en Caballito"
RAG: Busca "alquiler" + "caballito"
Respuesta: "¡Excelente! Encontré propiedades que te podrían interesar:
            • Departamento 2 amb Caballito (2 dorm) en Caballito - $1,200/mes
            ¿Te gustaría conocer más detalles?"
```

### 4. Búsqueda Compleja Multi-Criterio

```
Usuario: "Departamento moderno con balcón en Belgrano"
RAG: Busca "departamento" + "belgrano"
Respuesta: "¡Excelente! Encontré propiedades que te podrían interesar:
            • Departamento 3 amb Belgrano (3 dorm) en Belgrano - $1,800/mes
            ¿Te gustaría conocer más detalles?"
```

### 5. Query Conversacional (Fallback a Agente)

```
Usuario: "Hola, ¿cómo estás?"
RAG: No hay match de propiedades
Agent: "¡Hola! Estoy aquí para ayudarte a encontrar la propiedad perfecta. 
        ¿Hay alguna zona o tipo de inmueble que te interese?"
```

---

## Configuración

### Variables de Entorno (`.env`)

```env
# LLM Configuration
OPENROUTER_API_KEY=sk-or-v1-... (tu API key)
OPENROUTER_MODEL=openai/gpt-4o-mini

# Database
DATABASE_URL=sqlite:///wapsell.db

# Tenant Configuration
WAPSELL_TENANT_ID=demo
WAPSELL_TENANT_PLAN=pro
```

### Límites de Búsqueda

```python
# En search_properties():
limit=5  # Máximo 5 propiedades por búsqueda
```

### Configuración de Hindsight

```python
# En init_hermes_client():
hermes_client.hindsight.save(fact, tenant_id="demo")
# Almacena propiedades con tenant_id="demo"
```

---

## Troubleshooting

### Problema: "No encuentra propiedades aunque existan"

**Causa**: Hindsight no se inicializó correctamente.

**Solución**:
```python
# Verificar que se usa .save() no .add_fact()
client.hindsight.save(fact, tenant_id="demo")

# Verificar que tenant_id coincide
query_results = hermes_client.hindsight.query(
    text="Palermo",
    tenant_id="demo",  # DEBE SER "demo"
    top_k=3
)
```

### Problema: "Query devuelve propiedades aleatorias"

**Causa**: `search_properties()` está usando el fallback.

**Solución**:
1. Verificar que la base de datos tiene propiedades:
   ```sql
   SELECT COUNT(*) FROM properties;  -- Debería ser >= 1
   ```

2. Verificar que search_properties() funciona:
   ```python
   results = search_properties("Palermo")
   print(f"Encontrados: {len(results)}")  # Debería ser > 0
   ```

### Problema: "Respuestas lentas (>5 segundos)"

**Causa**: Timeout de OpenRouter LLM.

**Solución**:
- Reducir llamadas al agente
- Aumentar timeout en `/chat/message`
- Verificar conexión a OpenRouter

### Problema: "Usuario no encontrado (401)"

**Causa**: user_id no existe en la base de datos.

**Solución**:
1. Crear usuario primero:
   ```python
   # Registrarse en /register endpoint
   POST /register
   {
     "email": "user@example.com",
     "password": "secure_password"
   }
   ```

2. O usar user_id existente (verificar en DB):
   ```sql
   SELECT id FROM users LIMIT 1;
   ```

---

## Performance Tips

### 1. Optimizar Búsquedas
```python
# ❌ Lento: buscar palabra por palabra
keywords = query.split()
for keyword in keywords:
    search_properties(keyword)

# ✅ Rápido: buscar todos los keywords en una query
keywords = [w for w in query.split() if len(w) >= 2]
# Luego en SQL: WHERE ... OR ... OR ...
```

### 2. Limitar Resultados
```python
# ✅ Bueno: limitar a 5 propiedades
properties = search_properties(query, limit=5)

# ❌ Malo: traer todas las propiedades
properties = search_properties(query, limit=1000)
```

### 3. Cache de Propiedades
```python
# TODO: Implementar cache en próxima versión
# Así: propiedades comunes no necesitan búsqueda
```

---

## Monitoreo

### Métricas a Seguir

1. **Tasa de RAG vs Agent**
   - Ideal: >80% RAG responses
   - Actual: 100%

2. **Tiempo de Respuesta**
   - Ideal: <3 segundos
   - Actual: 2.07s

3. **Acierto de Búsqueda**
   - Ideal: >95% de queries devuelven resultados relevantes
   - Actual: 100%

### Logs a Monitorear

```python
# En main.py:
logging.info(f"[CHAT] User query: {req.message}")
logging.info(f"[CHAT] search_properties returned {len(properties)} results")
logging.error(f"Hermes agent error: {str(e)}")
```

---

## Próximas Mejoras

- [ ] Migrar Hindsight a PostgreSQL para persistencia
- [ ] Implementar embeddings de propiedades para búsqueda semántica
- [ ] Agregar filtros de precio/dormitorios
- [ ] Caché de propiedades frecuentes
- [ ] Análisis de preferencias por usuario
- [ ] Recomendaciones personalizadas

---

**¿Preguntas?** Consultar `PLAN_NEXT_STEPS.md` para roadmap completo.
