#!/usr/bin/env python
"""Test RAG with 100 queries to validate performance."""

import requests
import json
import time
from collections import defaultdict

BASE_URL = "http://localhost:8000"
USER_ID = "g1k6fWqnoDY4e7_NI1LjaQ"

# List of locations in our database
LOCATIONS = [
    "Palermo", "La Boca", "San Telmo", "Recoleta", "Caballito",
    "Villa Urquiza", "Microcentro", "Belgrano", "Balvanera", "Villa Crespo"
]

# Keywords to mix
TYPES = ["compra", "alquiler", "departamento", "casa", "ph"]
SIZES = ["pequeño", "grande", "2 dorm", "3 dorm", "4 dorm", "monoambiente"]
FEATURES = ["barato", "moderno", "histórico", "luminoso", "con patio", "balcón"]

# Generate 100 diverse queries
queries = [
    # Simple location searches
    *[f"Propiedades en {loc}" for loc in LOCATIONS[:5]],

    # Direct locations
    *LOCATIONS[:10],

    # Type + location combinations
    *[f"Departamento en {loc}" for loc in LOCATIONS[:5]],
    *[f"Casa en {loc}" for loc in LOCATIONS[5:]],
    *[f"PH en {loc}" for loc in LOCATIONS[::2]],

    # Rental searches
    *[f"Alquiler en {loc}" for loc in LOCATIONS[:5]],
    *[f"Para alquilar {loc}" for loc in LOCATIONS[5:]],

    # Buying searches
    *[f"Compra en {loc}" for loc in LOCATIONS[:5]],
    *[f"Para comprar {loc}" for loc in LOCATIONS[5:]],

    # Size/features
    *[f"{size} en {loc}" for size in SIZES[:3] for loc in LOCATIONS[:2]],

    # Complex queries
    "Quiero departamento grande en Palermo",
    "Busco casa para alquilar en Villa Urquiza",
    "Necesito monoambiente barato en Microcentro",
    "Departamento moderno con balcón en Belgrano",
    "Propiedad histórica en La Boca",
    "Inmueble luminoso para compra en Recoleta",
    "Casa con patio en San Telmo",
    "Alquiler económico en Caballito",
    "PH en zona céntrica",
    "Departamento grande 4 ambientes",

    # Phrase variations
    "Tengo presupuesto para Palermo",
    "Busco en La Boca",
    "¿Tienen en Villa Urquiza?",
    "Propiedades disponibles Belgrano",
    "Qué hay en Recoleta",
    "Muestren Caballito",
    "Interesado San Telmo",
    "Opciones Microcentro",
    "Algo en Balvanera",
    "Ubicaciones Vila Crespo",
]

# Pad to 100 with random combinations
while len(queries) < 100:
    import random
    loc = random.choice(LOCATIONS)
    query = random.choice([
        f"{random.choice(TYPES)} en {loc}",
        f"{random.choice(SIZES)} {loc}",
        f"{loc} {random.choice(FEATURES)}",
        loc,
    ])
    if query not in queries:
        queries.append(query)

queries = queries[:100]

print(f"Testing RAG with {len(queries)} diverse queries...\n")

# Track results
results = {
    "total": len(queries),
    "rag_responses": 0,
    "agent_responses": 0,
    "errors": 0,
    "response_times": [],
    "by_location": defaultdict(lambda: {"rag": 0, "agent": 0}),
    "failed_queries": []
}

# Send queries
for i, query in enumerate(queries, 1):
    try:
        start = time.time()
        response = requests.post(
            f"{BASE_URL}/chat/message?user_id={USER_ID}",
            json={"message": query},
            timeout=10
        )
        elapsed = time.time() - start
        results["response_times"].append(elapsed)

        if response.status_code == 200:
            data = response.json()
            reply = data.get("reply", "")

            # Detect if RAG (contains specific properties) or agent (generic response)
            is_rag = "$" in reply or "Excelente" in reply and ("•" in reply or "-" in reply)

            if is_rag:
                results["rag_responses"] += 1
            else:
                results["agent_responses"] += 1

            # Track by location mentioned in query
            for loc in LOCATIONS:
                if loc.lower() in query.lower():
                    if is_rag:
                        results["by_location"][loc]["rag"] += 1
                    else:
                        results["by_location"][loc]["agent"] += 1

            status = "[RAG]" if is_rag else "[AGN]"
            print(f"{i:3d}. {status} | {query[:50]:50s} | {elapsed:.2f}s")
        else:
            results["errors"] += 1
            results["failed_queries"].append((query, response.status_code))
            print(f"{i:3d}. [ERR] | {query[:50]:50s} | Status {response.status_code}")

    except Exception as e:
        results["errors"] += 1
        results["failed_queries"].append((query, str(e)))
        print(f"{i:3d}. [ERR] | {query[:50]:50s} | {str(e)[:30]}")

# Print statistics
print("\n" + "="*80)
print("RAG VALIDATION RESULTS")
print("="*80)
print(f"Total Queries:        {results['total']}")
print(f"RAG Responses:        {results['rag_responses']} ({results['rag_responses']/results['total']*100:.1f}%)")
print(f"Agent Responses:      {results['agent_responses']} ({results['agent_responses']/results['total']*100:.1f}%)")
print(f"Errors:               {results['errors']}")
print(f"Avg Response Time:    {sum(results['response_times'])/len(results['response_times']):.2f}s")

print("\nBy Location:")
for loc in LOCATIONS:
    if loc in results["by_location"]:
        rag = results["by_location"][loc]["rag"]
        agent = results["by_location"][loc]["agent"]
        total = rag + agent
        if total > 0:
            print(f"  {loc:15s}: RAG {rag}/{total} ({rag/total*100:.0f}%)")

if results["failed_queries"]:
    print(f"\nFailed Queries ({len(results['failed_queries'])}):")
    for query, error in results["failed_queries"][:5]:
        print(f"  - {query[:50]:50s} | {str(error)[:40]}")

print("\n" + "="*80)
if results["rag_responses"] >= results["total"] * 0.7:
    print("[OK] RAG is performing well! (>70% RAG responses)")
elif results["rag_responses"] >= results["total"] * 0.5:
    print("[!] RAG performance is moderate (50-70% RAG responses)")
else:
    print("[X] RAG needs improvement (<50% RAG responses)")
print("="*80)
