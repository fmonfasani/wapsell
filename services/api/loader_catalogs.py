"""Load property catalogs (Dataset B) into Wapsell DB for the RAG."""

import sqlite3
import csv
from typing import List, Dict
from datetime import datetime, timezone
import uuid


class CatalogLoader:
    """Load catalogs to the properties table (or a dedicated tenant_catalogs table)."""

    def __init__(self, db_path: str):
        self.db_path = db_path
        self.conn = sqlite3.connect(db_path)
        self._ensure_schema()

    def _ensure_schema(self):
        """Create tenant_catalogs table if missing."""
        cursor = self.conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tenant_catalogs (
                id TEXT PRIMARY KEY,
                prospect_id TEXT,
                property_id TEXT NOT NULL,
                tipo TEXT,
                precio_usd REAL,
                m2_cubiertos INTEGER,
                m2_totales INTEGER,
                ambientes INTEGER,
                dormitorios INTEGER,
                banos INTEGER,
                barrio TEXT,
                ciudad TEXT,
                balcon BOOLEAN,
                cochera BOOLEAN,
                operacion TEXT,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (prospect_id) REFERENCES prospects(id)
            )
        """)
        self.conn.commit()

    def load_rag_format(self, prospect_id: str, properties: List[Dict]) -> int:
        """Load properties from RAG-format dict list. Returns count inserted."""
        cursor = self.conn.cursor()
        loaded = 0

        for p in properties:
            try:
                catalog_id = str(uuid.uuid4())[:8]
                cursor.execute("""
                    INSERT INTO tenant_catalogs
                    (id, prospect_id, property_id, tipo, precio_usd, m2_cubiertos,
                     m2_totales, ambientes, dormitorios, banos, barrio, ciudad,
                     balcon, cochera, operacion, content)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    catalog_id,
                    prospect_id,
                    p.get("id", ""),
                    p.get("tipo", ""),
                    p.get("precio_usd", 0),
                    p.get("m2_cubiertos", 0),
                    p.get("m2_totales", 0),
                    p.get("ambientes", 0),
                    p.get("dormitorios", 0),
                    p.get("banos", 0),
                    p.get("barrio", ""),
                    p.get("ciudad", ""),
                    p.get("balcon", False),
                    p.get("cochera", False),
                    p.get("operacion", ""),
                    p.get("content", ""),
                ))
                loaded += 1
            except Exception as e:
                print(f"Error loading property {p.get('id')}: {e}")

        self.conn.commit()
        return loaded

    def load_csv(self, prospect_id: str, csv_path: str) -> int:
        """Load properties from CSV (100_departamentos format). Returns count."""
        properties = []
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            properties = list(reader)

        return self.load_rag_format(prospect_id, properties)

    def get_catalog_for_prospect(self, prospect_id: str) -> List[Dict]:
        """Get all properties for a prospect (for the RAG)."""
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT id, tipo, precio_usd, m2_cubiertos, m2_totales, ambientes,
                   dormitorios, banos, barrio, ciudad, balcon, cochera, operacion, content
            FROM tenant_catalogs
            WHERE prospect_id = ?
        """, (prospect_id,))

        rows = cursor.fetchall()
        return [
            {
                "id": r[0],
                "tipo": r[1],
                "precio_usd": r[2],
                "m2_cubiertos": r[3],
                "m2_totales": r[4],
                "ambientes": r[5],
                "dormitorios": r[6],
                "banos": r[7],
                "barrio": r[8],
                "ciudad": r[9],
                "balcon": r[10],
                "cochera": r[11],
                "operacion": r[12],
                "content": r[13],
            }
            for r in rows
        ]

    def close(self):
        self.conn.close()
