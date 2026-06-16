#!/usr/bin/env python3
"""Load prospects (immobiliarias) from leads_final.csv to Wapsell DB."""

import csv
import sqlite3
import os
from urllib.parse import urlparse
from datetime import datetime
import uuid

# Read the CSV
csv_path = "/opt/scraper_ml_inmuebles/leads_final.csv"
prospects = []

with open(csv_path, 'r', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    for row in reader:
        if row.get('wa_status') == 'ok':
            prospects.append(row)

print(f"✓ Loaded {len(prospects)} prospects with wa_status=ok")

# Connect to Wapsell DB
db_path = "/var/lib/docker/volumes/wapsell_wapsell-db/_data/wapsell.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Create prospects table
cursor.execute("""
    CREATE TABLE IF NOT EXISTS prospects (
        id TEXT PRIMARY KEY,
        nombre TEXT NOT NULL,
        website TEXT,
        plataforma TEXT,
        whatsapp TEXT NOT NULL UNIQUE,
        tier TEXT,
        cant_propiedades INTEGER,
        url_maps TEXT,
        metadata TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
""")

# Load with dedup
loaded = 0
skipped = 0
seen_phones = set()

for p in prospects:
    phone = p.get('whatsapp_final', '').strip()
    if not phone:
        continue

    if phone in seen_phones:
        skipped += 1
        continue

    seen_phones.add(phone)

    website = p.get('website', '').strip()
    prospect_id = str(uuid.uuid4())[:8]

    try:
        cursor.execute("""
            INSERT OR IGNORE INTO prospects
            (id, nombre, website, plataforma, whatsapp, tier, cant_propiedades, url_maps, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            prospect_id,
            p.get('nombre', '').strip(),
            website,
            p.get('plataforma', '').strip(),
            phone,
            p.get('tier', '').strip(),
            int(p.get('cant_propiedades', 0) or 0),
            p.get('url_maps', '').strip(),
            f"method={p.get('metodo')},count_source={p.get('count_fuente')}"
        ))
        loaded += 1
    except Exception as e:
        print(f"Error: {e}")
        skipped += 1

conn.commit()

# Verify
cursor.execute("SELECT COUNT(*) FROM prospects")
total = cursor.fetchone()[0]
cursor.execute("SELECT tier, COUNT(*) FROM prospects GROUP BY tier ORDER BY tier")
by_tier = cursor.fetchall()

print(f"\n✓ Loaded {loaded} prospects (skipped {skipped})")
print(f"✓ Total in prospects table: {total}")
print(f"\nBy tier:")
for tier, count in by_tier:
    print(f"  {tier}: {count}")

cursor.execute("SELECT nombre, whatsapp FROM prospects ORDER BY RANDOM() LIMIT 3")
print(f"\nSample:")
for name, wa in cursor.fetchall():
    print(f"  {name[:50]}: {wa}")

conn.close()
