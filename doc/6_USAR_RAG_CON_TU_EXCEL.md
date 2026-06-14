# 🚀 USAR RAG CON TU EXCEL - Guía Paso a Paso

**Fecha**: 2026-06-13  
**Para**: Tu demo con propiedades.xlsx  
**Objetivo**: Probar RAG + AgentLoop con Hermes con tus datos reales

---

## 📊 Tu Excel vs Datos Actuales

### Tu Excel: propiedades.xlsx
```
Ubicación: d:\Software Development\Porfolio\propiedades.xlsx
Propiedades: 30 (fila 2-31)
Estructura: id, tipo_operacion, tipo_propiedad, barrio, precio_usd, etc.
Barrios: Palermo, Belgrano, Tigre, San Isidro, Recoleta, Caballito, La Boca, etc.
```

### Datos Actuales (Wapsell)
```
Ubicación: services/api/main.py (hardcodeado)
Propiedades: 10
Estructura: title, location, price, bedrooms
Barrios: Palermo, La Boca, San Telmo, Belgrano, etc.
```

---

## ✅ PASO 1: Actualizar main.py para Cargar tu Excel

### Ubicación del Archivo
```python
# ANTES: Datos hardcodeados en seed_properties()
# DESPUÉS: Cargar desde tu Excel
```

### Código a Modificar

**Archivo**: `services/api/main.py`  
**Función**: `seed_properties(cursor)` (línea ~41)

#### ANTES (❌ Datos hardcodeados):
```python
def seed_properties(cursor):
    """Seed database with 10 demo properties."""
    now = datetime.now(UTC).isoformat()
    properties = [
        ("prop_001", "Departamento 2 amb Palermo Soho", "Luminoso con balcón, piso alto", "compra", 85000, 2, 1, "Palermo", "Borges 1650, CABA", 65),
        ("prop_002", "PH 3 amb San Telmo", "Con patio y cochera", "compra", 120000, 3, 2, "San Telmo", "Defensa 2100, CABA", 120),
        # ... más hardcodeado
    ]
```

#### DESPUÉS (✅ Cargar desde Excel):
```python
def seed_properties(cursor):
    """Seed database from propiedades.xlsx"""
    import openpyxl
    
    now = datetime.now(UTC).isoformat()
    excel_path = r"d:\Software Development\Porfolio\propiedades.xlsx"
    
    try:
        wb = openpyxl.load_workbook(excel_path)
        ws = wb['Propiedades']
        
        for row in ws.iter_rows(min_row=2, max_row=ws.max_row, values_only=True):
            if row[0] is None:  # Skip empty rows
                continue
                
            # Mapear columnas del Excel a la tabla
            prop_id = f"prop_{row[0]:03d}"  # id
            tipo_operacion = row[1]  # venta/alquiler
            tipo_propiedad = row[2]  # departamento, casa, ph
            barrio = row[3]  # Palermo, Belgrano, etc
            precio = row[5]  # precio_usd
            habitaciones = row[8]  # habitaciones
            descripcion = row[16]  # descripcion
            address = f"{barrio}, Buenos Aires"
            m2 = row[7] or 0  # m2_cubiertos
            
            # tipo_operacion → "compra" o "alquiler" (usar como type)
            prop_type = "compra" if tipo_operacion == "venta" else "alquiler"
            
            cursor.execute("""
                INSERT INTO properties (id, title, description, type, price, bedrooms, bathrooms, location, address, area, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                prop_id,
                f"{tipo_propiedad.capitalize()} en {barrio}",
                descripcion or "",
                prop_type,
                precio,
                habitaciones,
                1,  # bathrooms (no en tu Excel, usar default)
                barrio,
                address,
                m2,
                now
            ))
        
        wb.close()
        print(f"✓ Loaded {ws.max_row - 1} properties from Excel")
        
    except Exception as e:
        print(f"Error loading Excel: {e}")
        # Fallback a hardcodeado si falla
        # ... código original ...
```

---

## ✅ PASO 2: Actualizar Hindsight para tus Datos

**Ubicación**: `init_hermes_client()` en `main.py` (línea ~480)

### CAMBIO:
```python
# Hindsight se llenará automáticamente con los datos del Excel
# porque usamos la misma tabla properties

# Verificación:
test_query = client.hindsight.query(text="Palermo", tenant_id="demo", top_k=3)
logging.info(f"Hindsight loaded {len(test_query)} facts")
```

---

## ✅ PASO 3: Actualizar search_properties() si es Necesario

La función actual ya funciona porque:
- Busca en `title`, `description`, `location`, `type`
- Tu Excel tendrá estos campos después de insertarlos

**Verificación**: El search_properties() actual ya soporta:
- ✅ Búsqueda por barrio (location)
- ✅ Búsqueda por tipo (compra/alquiler)
- ✅ Búsqueda por descripción

---

## ✅ PASO 4: Probar el Setup

### 4.1 Reiniciar API
```bash
cd d:\Software Development\Porfolio\wapsell\services\api
python -m uvicorn main:app --reload
```

### 4.2 Verificar que los datos se cargaron
```bash
python -c "
import sqlite3

conn = sqlite3.connect('wapsell.db')
c = conn.cursor()

# Contar propiedades
c.execute('SELECT COUNT(*) FROM properties')
count = c.fetchone()[0]
print(f'Propiedades cargadas: {count}')

# Mostrar algunas
c.execute('SELECT id, title, location, price FROM properties LIMIT 5')
for row in c.fetchall():
    print(f'  {row}')

conn.close()
"
```

**Esperado**: 30 propiedades cargadas desde tu Excel

### 4.3 Test rápido de RAG
```bash
curl -X POST http://localhost:8000/chat/message?user_id=g1k6fWqnoDY4e7_NI1LjaQ \
  -H "Content-Type: application/json" \
  -d '{"message":"Palermo"}' | jq .reply
```

**Esperado**: Devuelve propiedades de Palermo desde tu Excel

---

## ✅ PASO 5: Probar RAG + AgentLoop

### 5.1 Test Simple: Query que encuentra propiedades
```bash
# Query que SÍ debe encontrar propiedades
curl -X POST http://localhost:8000/chat/message?user_id=g1k6fWqnoDY4e7_NI1LjaQ \
  -H "Content-Type: application/json" \
  -d '{"message":"Departamento Palermo"}' | jq .reply

# Respuesta esperada:
# "¡Excelente! Encontré propiedades que te podrían interesar:
#  • Departamento en Palermo (2 dorm) en Palermo - $95,000
#  ¿Te gustaría conocer más detalles?"
```

### 5.2 Test Fallback: Query sin propiedades
```bash
# Query que NO debe encontrar propiedades (fallback a Agent)
curl -X POST http://localhost:8000/chat/message?user_id=g1k6fWqnoDY4e7_NI1LjaQ \
  -H "Content-Type: application/json" \
  -d '{"message":"Hola, cómo estás?"}' | jq .reply

# Respuesta esperada: Respuesta del agente Hermes
# "¡Hola! Estoy aquí para ayudarte a encontrar la propiedad..."
```

### 5.3 Test Hermes AgentLoop Completo
```python
# Script: test_hermes_con_tu_excel.py

import asyncio
from wapsell.client import WapsellClient
from wapsell.models import Tenant
from wapsell.llm.port import OpenRouterLLM
import os
from dotenv import load_dotenv

load_dotenv()

async def test():
    # 1. Inicializar LLM
    llm = OpenRouterLLM(api_key=os.getenv("OPENROUTER_API_KEY"))
    
    # 2. Inicializar WapsellClient
    client = WapsellClient(llm=llm)
    
    # 3. Crear tenant
    tenant = Tenant(
        id="demo",
        name="Demo Tenant",
        plan="pro",
        model="openai/gpt-4o-mini"
    )
    
    try:
        client.tenants.create("demo", tenant)
    except:
        pass
    
    # 4. Test queries
    test_queries = [
        "Quiero departamento en Palermo",
        "Casa en Tigre",
        "Alquiler barato",
        "Hola, cuéntame sobre inmuebles",
        "Busco con piscina y quincho"
    ]
    
    print("=" * 70)
    print("TESTING RAG + AGENTLOOP CON TU EXCEL")
    print("=" * 70)
    
    for query in test_queries:
        print(f"\nQuery: {query}")
        print("-" * 70)
        
        try:
            # Llamar al AgentLoop
            agent_turn = await client.agent.respond(
                tenant=tenant,
                buyer_id="demo:test_user",
                message=query
            )
            
            print(f"Response: {agent_turn.reply[:200]}...")
            print(f"Facts cited: {len(agent_turn.facts_cited)}")
            
        except Exception as e:
            print(f"Error: {e}")

# Ejecutar
asyncio.run(test())
```

**Guardar como**: `services/api/test_excel_rag.py`  
**Ejecutar**:
```bash
cd services/api
python test_excel_rag.py
```

---

## ✅ PASO 6: Integración con tu Demo (HermesSell)

### Opción A: Usar el mismo API (Recomendado)
```javascript
// En tu demo (HermesSell/dashboard)
// El frontend YA está configurado para apuntar a http://localhost:8000

// En chat-demo/page.tsx:
const response = await fetch('http://localhost:8000/chat/message?user_id=...', {
  method: 'POST',
  body: JSON.stringify({ message: userMessage })
})
```

### Opción B: Usar múltiples APIs
Si quieres un API separado para HermesSell:
```bash
# Crear otro puerto
cd services/api
python -m uvicorn main:app --port 8001

# Luego acceder a http://localhost:8001
```

---

## 📋 Checklist de Implementación

- [ ] Descargué/copié propiedades.xlsx a location correcta
- [ ] Actualicé seed_properties() en main.py
- [ ] Reinicié API con `uvicorn main:app --reload`
- [ ] Verificué que 30 propiedades se cargaron
- [ ] Test rápido: curl a /chat/message devuelve propiedades
- [ ] Test fallback: query sin propiedades devuelve agente
- [ ] Ejecuté test_excel_rag.py
- [ ] Verifiqué RAG + AgentLoop funcionan juntos
- [ ] Accedí a demo desde navegador
- [ ] Probé 5 queries en la demo

---

## 🧪 Queries para Probar con tu Excel

```
UBICACIONES (barrios en tu Excel):
  • "Palermo"
  • "Belgrano"
  • "Tigre"
  • "San Isidro"
  • "Recoleta"
  • "Caballito"
  • "La Boca"

TIPOS:
  • "Departamento"
  • "Casa"
  • "PH"
  • "Venta"
  • "Alquiler"

COMBOS:
  • "Departamento en Palermo"
  • "Casa Tigre"
  • "Alquiler barato"
  • "Villa con piscina"
  • "Departamento 2 ambientes"

FALLBACK (no deben encontrar):
  • "Hola"
  • "Qué tal"
  • "Cuéntame historias"
```

---

## 📊 Diferencias: RAG vs AgentLoop

### RAG (Búsqueda en BD)
```
Query: "Departamento Palermo"
  ↓
search_properties() → encuentra propiedades
  ↓
Respuesta: "¡Excelente! Encontré..."
Tiempo: ~0.5s
Costo: Gratis (solo BD)
```

### AgentLoop (Sin propiedades)
```
Query: "Hola"
  ↓
search_properties() → 0 resultados
  ↓
hermes_client.agent.respond() → LLM genera respuesta
  ↓
Respuesta: "¡Hola! Estoy aquí para..."
Tiempo: ~2s
Costo: LLM API call (~0.01 USD)
```

### Combinado (Lo que tenemos)
```
Query: Cualquier cosa
  ↓
¿Hay propiedades relevantes?
  SÍ → RAG (rápido, gratis)
  NO → AgentLoop (conversacional, inteligente)
  ↓
Mejor UX + Menor costo
```

---

## 🔍 Debugging

Si algo no funciona:

### "No encuentra propiedades"
```python
# Verificar que se cargaron
python -c "
import sqlite3
conn = sqlite3.connect('wapsell.db')
c = conn.cursor()
c.execute('SELECT COUNT(*) FROM properties')
print(f'Total propiedades: {c.fetchone()[0]}')

# Buscar por barrio
c.execute('SELECT title FROM properties WHERE location LIKE \"%Palermo%\"')
print(f'Propiedades Palermo: {len(c.fetchall())}')
conn.close()
"
```

### "Error cargando Excel"
```python
# Verificar que el archivo existe y está accesible
import os
excel = r'd:\Software Development\Porfolio\propiedades.xlsx'
print(f'Existe: {os.path.exists(excel)}')
print(f'Tamaño: {os.path.getsize(excel)} bytes')

# Intentar leer
import openpyxl
wb = openpyxl.load_workbook(excel)
print(f'Sheets: {wb.sheetnames}')
```

### "AgentLoop no funciona"
```bash
# Verificar que OpenRouter API funciona
curl -X POST "https://openrouter.ai/api/v1/chat/completions" \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"openai/gpt-4o-mini","messages":[{"role":"user","content":"Hola"}]}'
```

---

## 🎯 Resultado Final

Después de seguir estos pasos:

```
✓ RAG funciona con tus 30 propiedades del Excel
✓ AgentLoop funciona como fallback
✓ Tu demo accede al API local
✓ Puedes probar búsquedas reales
✓ Puedes ver cómo Hermes entiende y responde
```

---

## ❓ Próximas Preguntas

**"¿Cómo actualizo las propiedades?"**  
→ Edita `propiedades.xlsx` y reinicia el API

**"¿Cómo cambio de modelo LLM?"**  
→ Edita `.env` y cambia `OPENROUTER_MODEL=`

**"¿Cómo agrego más barrios?"**  
→ Agrega filas al Excel y reinicia

**"¿Cómo veo los logs del AgentLoop?"**  
→ Mira `services/api/api.log` después de actualizar main.py con logging

---

**Status**: 📋 GUÍA COMPLETA  
**Tiempo para completar**: 30-45 minutos  
**Dificultad**: ⭐⭐ Fácil  
**Resultado**: RAG + AgentLoop funcionando con tus datos
