#!/usr/bin/env python
"""Test improved search_properties function."""

import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "wapsell.db")

def search_properties_improved(query: str, limit: int = 5) -> list:
    """Search properties by keyword (improved)."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Extract keywords from query (2+ chars, case-insensitive)
    keywords = [w.lower() for w in query.split() if len(w) >= 2]

    # Build WHERE clause for each keyword
    results = []
    if keywords:
        for keyword in keywords:
            search_term = f"%{keyword}%"
            # Use COLLATE NOCASE for case-insensitive search in SQLite
            cursor.execute("""
                SELECT id, title, description, type, price, bedrooms, location
                FROM properties
                WHERE title LIKE ? COLLATE NOCASE
                   OR description LIKE ? COLLATE NOCASE
                   OR location LIKE ? COLLATE NOCASE
                   OR type LIKE ? COLLATE NOCASE
                LIMIT ?
            """, (search_term, search_term, search_term, search_term, limit))

            keyword_results = cursor.fetchall()
            results.extend(keyword_results)

            # Stop if we have enough results
            if len(results) >= limit:
                break

    # Remove duplicates while preserving order
    seen = set()
    unique_results = []
    for r in results:
        if r[0] not in seen:
            seen.add(r[0])
            unique_results.append(r)
            if len(unique_results) >= limit:
                break

    conn.close()
    return unique_results

# Test searches
queries = [
    "Palermo",
    "La Boca",
    "Villa Urquiza",
    "Quiero una propiedad en Palermo",
    "Busco PH en La Boca",
    "Casa grande Villa Urquiza",
    "Departamento alquiler Caballito",
    "alquiler",
    "compra"
]

for q in queries:
    print(f"\nQuery: '{q}'")
    results = search_properties_improved(q)
    print(f"Results: {len(results)}")
    for r in results[:2]:
        print(f"  - {r[1]} ({r[3]}) en {r[6]} - ${r[4]:,.0f}")
