# 🚀 PLAN DE NEXT STEPS - Roadmap Futuro

**Fecha**: 2026-06-13  
**Horizon**: Q3-Q4 2026  
**Status**: PLANIFICACIÓN

---

## 📋 Resumen Ejecutivo

El RAG está **completamente funcional** y listo para producción. Las siguientes mejoras son **opcionales** pero recomendadas para:

- Mejor performance a escala
- Capacidades avanzadas de búsqueda
- Experiencia de usuario mejorada
- Personalización

---

## 🎯 Fases del Roadmap

### FASE 0: INMEDIATO (Esta semana)
**Status**: Hacer ahora  
**Esfuerzo**: 1-2 horas

#### 0.1 Deploy a Producción
- [ ] Actualizar `.env` en servidor de producción
- [ ] Desplegar código a Hetzner VPS
- [ ] Verificar conectividad API
- [ ] Test de carga inicial

**Comando**:
```bash
ssh user@89.167.96.239
cd /opt/wapsell
git pull origin pr/naming-finalize
docker-compose up -d
```

#### 0.2 Monitoreo Inicial
- [ ] Configurar logs en servidor
- [ ] Alertas de errores
- [ ] Dashboard de métricas básicas

**Métricas a Monitor**:
```
- Requests per minute
- Average response time (target: <3s)
- Error rate (target: <1%)
- RAG vs Agent ratio (target: >80% RAG)
```

---

### FASE 1: CORTO PLAZO (Próximas 2-4 semanas)
**Status**: Alta prioridad  
**Esfuerzo**: 20-40 horas

#### 1.1 Migrar Hindsight a PostgreSQL
**Por qué**: Persistencia, escalabilidad, concurrent access

**Cambios necesarios**:
```python
# ANTES (en-memoria)
hermes_client.hindsight.save(fact, tenant_id="demo")

# DESPUÉS (PostgreSQL)
class PostgresHindsight(Hindsight):
    def __init__(self, db_url: str):
        self.conn = psycopg2.connect(db_url)
    
    def save(self, fact: Fact, tenant_id: str):
        self.conn.execute("""
            INSERT INTO hindsight_facts (id, content, tenant_id)
            VALUES (%s, %s, %s)
        """, (fact.id, fact.content, tenant_id))
```

**Tareas**:
- [ ] Crear tabla PostgreSQL
- [ ] Implementar PostgresHindsight
- [ ] Migrar datos existentes
- [ ] Test de persistencia
- [ ] Deploy

**Estimado**: 20 horas

#### 1.2 Migrar BuyerMemory a Persistente
**Por qué**: Mantener historial de conversaciones entre sesiones

**Cambios necesarios**:
```python
# ANTES (en-memoria)
memory = InMemoryBuyerMemory()

# DESPUÉS (PostgreSQL)
class PersistentBuyerMemory(BuyerMemory):
    def __init__(self, db_url: str):
        self.conn = psycopg2.connect(db_url)
    
    def remember(self, buyer_id: str, fact: str):
        self.conn.execute("""
            INSERT INTO buyer_memory (buyer_id, fact, created_at)
            VALUES (%s, %s, NOW())
        """, (buyer_id, fact))
```

**Tareas**:
- [ ] Crear tabla PostgreSQL
- [ ] Implementar PersistentBuyerMemory
- [ ] Cargar historial al iniciar sesión
- [ ] Test de persistencia
- [ ] Deploy

**Estimado**: 15 horas

---

### FASE 2: MEDIANO PLAZO (4-8 semanas)
**Status**: Media prioridad  
**Esfuerzo**: 40-80 horas

#### 2.1 Embeddings + Búsqueda Semántica
**Por qué**: Entender significado, no solo keywords

**Ejemplo**:
```
Usuario: "Busco departamento lujoso"
Sin embeddings: No encuentra (no hay "lujoso" en BD)
Con embeddings: Encuentra propiedades con amenities premium
```

**Implementación**:
```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')

# En indexación:
for prop in properties:
    embedding = model.encode(prop['title'] + " " + prop['description'])
    save_embedding(prop_id, embedding)

# En búsqueda:
query_embedding = model.encode(user_query)
similar_props = vector_search(query_embedding, top_k=5)
```

**Tareas**:
- [ ] Elegir modelo de embeddings
- [ ] Crear tabla vector_index en PostgreSQL
- [ ] Indexar todas las propiedades existentes
- [ ] Implementar búsqueda vectorial
- [ ] Combinar con búsqueda keyword actual
- [ ] Test de calidad
- [ ] Deploy

**Estimado**: 40 horas

#### 2.2 Filtros Avanzados
**Por qué**: Búsquedas más precisas

**Filtros a Agregar**:
```python
# Precio
- min_price: 50000
- max_price: 500000

# Características
- bedrooms: [2, 3, 4]  # Array de opciones
- amenities: ["piscina", "gym", "portería"]

# Tipo
- type: "alquiler"  # compra o alquiler

# Área
- min_area: 50m²
- max_area: 200m²

# Ejemplo de uso
POST /search
{
  "query": "Palermo",
  "filters": {
    "type": "alquiler",
    "min_price": 1000,
    "max_price": 2000,
    "bedrooms": [2, 3]
  }
}
```

**Tareas**:
- [ ] Crear endpoint `/search` con filtros
- [ ] Integrar filtros con búsqueda
- [ ] Frontend: agregar UI de filtros
- [ ] Test de filtros
- [ ] Deploy

**Estimado**: 20 horas

#### 2.3 Recomendaciones Personalizadas
**Por qué**: Mejorar engagement

**Lógica**:
```python
def get_recommendations(buyer_id: str) -> List[Property]:
    # 1. Analizar historial de búsquedas
    searches = get_buyer_searches(buyer_id)
    
    # 2. Extraer preferencias
    # - Ubicaciones más buscadas
    # - Rangos de precio
    # - Tipos preferidos
    
    # 3. Buscar propiedades similares
    # - Misma ubicación
    # - Precio similar
    # - Características similares
    
    # 4. Devolver top 5
    return recommendations[:5]
```

**Tareas**:
- [ ] Crear tabla buyer_preferences
- [ ] Extraer preferencias del historial
- [ ] Implementar lógica de recomendación
- [ ] API endpoint `/recommendations`
- [ ] Frontend: mostrar recomendaciones
- [ ] Test
- [ ] Deploy

**Estimado**: 20 horas

---

### FASE 3: LARGO PLAZO (8-16 semanas)
**Status**: Baja prioridad / Features premium  
**Esfuerzo**: 80+ horas

#### 3.1 Soporte Multi-idioma
**Por qué**: Expandir a otros mercados

**Idiomas**:
- [ ] Portugués (Brasil)
- [ ] Francés
- [ ] Italiano

**Implementación**:
```python
# i18n con next-intl (ya existe en frontend)
# Backend: agregar traducción de respuestas

from google.cloud import translate_v2

def translate_response(text: str, target_lang: str) -> str:
    client = translate_v2.Client()
    result = client.translate_text(text, target_language=target_lang)
    return result['translatedText']
```

**Tareas**:
- [ ] Google Cloud Translation API
- [ ] Traducción de respuestas
- [ ] Traducción de propiedades
- [ ] Test en múltiples idiomas
- [ ] Deploy

**Estimado**: 30 horas

#### 3.2 WhatsApp Integration
**Por qué**: Alcance más amplio de usuarios

**Flujo**:
```
User: Envía mensaje en WhatsApp
  ↓
Webhook recibe mensaje
  ↓
ParseRichtext → Hermes agent
  ↓
Agent → Respuesta
  ↓
WhatsApp API devuelve respuesta
```

**Tareas**:
- [ ] Meta WhatsApp API setup
- [ ] Webhook endpoint
- [ ] Integrar con Hermes
- [ ] Manejo de rich content (imágenes)
- [ ] Test
- [ ] Deploy

**Estimado**: 40 horas

#### 3.3 Admin Dashboard
**Por qué**: Gestión de propiedades sin código

**Features**:
```
- CRUD de propiedades
- Analytics (búsquedas, conversiones)
- Gestión de usuarios
- Configuración del agent
- Logs y monitoring
```

**Tech Stack**:
- React + TypeScript
- Recharts para gráficos
- Tanstack Table para tablas

**Estimado**: 40 horas

#### 3.4 Smart Scheduling
**Por qué**: Agendar visitas automáticamente

**Flujo**:
```
Usuario: "Quiero visitar el departamento de Palermo el viernes"
  ↓
Agent: Extrae intent + fecha
  ↓
Sistema: Busca horarios disponibles
  ↓
Confirmación: "Te envío confirmación al email"
```

**Tareas**:
- [ ] Intent recognition
- [ ] Calendar API integration
- [ ] Email confirmations
- [ ] Notification system
- [ ] Test
- [ ] Deploy

**Estimado**: 30 horas

---

## 📊 Timeline Consolidado

```
┌─────────────────────────────────────────────────────────────┐
│ TIMELINE DE ROADMAP                                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ESTA SEMANA      Deploy a Prod                    1-2h     │
│                  Monitoreo                        included   │
│                  ✅ CRÍTICO                                  │
│                                                              │
│ SEM 2-4          PostgreSQL Hindsight            20h       │
│                  Memory persistente              15h       │
│                  ✅ RECOMENDADO                             │
│                                                              │
│ SEM 5-8          Embeddings/Semántica            40h       │
│                  Filtros avanzados               20h       │
│                  Recomendaciones                 20h       │
│                  🟡 OPCIONAL PERO BUENO                     │
│                                                              │
│ SEM 9-16         Multi-idioma                    30h       │
│                  WhatsApp                        40h       │
│                  Admin Dashboard                 40h       │
│                  Smart Scheduling                30h       │
│                  🟢 FEATURES PREMIUM                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘

Total estimado: 50-100 horas adicionales de desarrollo
Tiempo calendario: 4 meses (dependiendo de velocidad de team)
```

---

## 💰 Prioridad por ROI

### 🥇 MÁXIMA PRIORIDAD (Deploy ahora)
- Deploy a producción
- Monitoreo

### 🥈 ALTA PRIORIDAD (Primeras 2-4 semanas)
- PostgreSQL Hindsight (necesario para escala)
- Memory persistente (mejora UX)

### 🥉 MEDIA PRIORIDAD (Próximo mes)
- Embeddings (mejor búsqueda)
- Filtros (conversiones)
- Recomendaciones (engagement)

### 📍 BAJA PRIORIDAD (Futuro)
- Multi-idioma (expansión)
- WhatsApp (nuevo canal)
- Admin Dashboard (internal)
- Smart Scheduling (automation)

---

## 📈 Métricas para Medir Éxito

### Fase 0 (Deploy)
- [ ] Zero downtime deployment
- [ ] All tests passing
- [ ] Uptime > 99.9%

### Fase 1 (Database)
- [ ] Query time < 500ms
- [ ] Concurrent users support
- [ ] Data persistence verified

### Fase 2 (Features)
- [ ] Search relevance > 90%
- [ ] User satisfaction > 4.5/5
- [ ] Conversion rate +20%

### Fase 3 (Expansion)
- [ ] 100% test coverage
- [ ] <100ms response time
- [ ] 10k+ monthly users

---

## 🔄 Proceso de Revisión

Cada fase incluye:

```
1. Planning meeting (1h)
2. Implementation (estimate)
3. Testing (estimate * 0.25)
4. Code review
5. Deploy to staging
6. User acceptance testing
7. Deploy to production
8. Post-deployment monitoring (1 week)
```

---

## 🤝 Responsabilidades

### Backend Developer
- Implementar cambios en main.py
- PostgreSQL migrations
- API testing

### Frontend Developer
- Actualizar UI para nuevas features
- Admin dashboard
- Mobile responsiveness

### DevOps
- Deploy automation
- Monitoring setup
- Scaling

### QA
- Test coverage
- Performance testing
- UAT

---

## 🎓 Documentación Pendiente

- [ ] API docs (OpenAPI/Swagger)
- [ ] Architecture ADRs
- [ ] Deployment runbooks
- [ ] Troubleshooting guide
- [ ] User guide

---

## 🚨 Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|--------|------------|
| PostgreSQL migration breaks data | Media | Alto | Backup first, test en staging |
| Performance degrades at scale | Baja | Alto | Index queries, cache results |
| LLM API becomes bottleneck | Baja | Medio | Implement request queuing |
| User data privacy concerns | Baja | Alto | GDPR compliance, encryption |

---

## ✅ Criterios de Éxito

- [ ] 0 production incidents in first week
- [ ] >95% test coverage
- [ ] <2s avg response time
- [ ] >80% RAG response rate
- [ ] User feedback score >4.5/5
- [ ] <5% error rate

---

## 📞 Contacto & Escalación

**Problemas técnicos**: Crear issue en GitHub  
**Cambios en roadmap**: Reunión con stakeholders  
**Performance issues**: Alert a DevOps inmediatamente  

---

**Status**: 🟢 LISTO PARA IMPLEMENTAR  
**Next Meeting**: Después del deploy a producción  
**Document Version**: 1.0  
**Last Updated**: 2026-06-13
