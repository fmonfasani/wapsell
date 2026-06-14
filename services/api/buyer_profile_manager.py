"""
Persistent Buyer Profile Manager

Manages buyer personas and learning metrics across sessions.
Tracks which responses work best for each buyer type.
"""

from datetime import datetime, UTC
from typing import Optional, Dict, List
from dataclasses import dataclass, asdict
import json
import sqlite3
from buyer_personas import PersonaType, PersonaDetector, PersonaProfile


@dataclass
class BuyerProfileRecord:
    """Persistent record of buyer profile and metrics."""
    buyer_id: str
    detected_persona: str
    confidence_score: float  # 0-1, higher = more certain
    first_detected: str  # ISO timestamp
    last_updated: str  # ISO timestamp
    total_interactions: int = 0
    successful_responses: int = 0  # Responses buyer engaged with
    conversions: int = 0  # Completed sales/leads
    avg_satisfaction: float = 0.0  # 1-5 scale (learned from engagement)
    persona_switches: int = 0  # Times persona changed


class BuyerProfileDatabase:
    """Stores and retrieves buyer profiles from SQLite."""

    def __init__(self, db_path: str = "wapsell.db"):
        self.db_path = db_path
        self._ensure_table_exists()

    def _ensure_table_exists(self):
        """Create buyer_profiles table if it doesn't exist."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS buyer_profiles (
                buyer_id TEXT PRIMARY KEY,
                detected_persona TEXT NOT NULL,
                confidence_score REAL,
                first_detected TEXT,
                last_updated TEXT,
                total_interactions INTEGER DEFAULT 0,
                successful_responses INTEGER DEFAULT 0,
                conversions INTEGER DEFAULT 0,
                avg_satisfaction REAL DEFAULT 0.0,
                persona_switches INTEGER DEFAULT 0
            )
        """)
        conn.commit()
        conn.close()

    def get_or_create(self, buyer_id: str) -> BuyerProfileRecord:
        """Get existing profile or create new one."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute(
            "SELECT * FROM buyer_profiles WHERE buyer_id = ?",
            (buyer_id,)
        )
        row = cursor.fetchone()
        conn.close()

        if row:
            return BuyerProfileRecord(
                buyer_id=row[0],
                detected_persona=row[1],
                confidence_score=row[2],
                first_detected=row[3],
                last_updated=row[4],
                total_interactions=row[5],
                successful_responses=row[6],
                conversions=row[7],
                avg_satisfaction=row[8],
                persona_switches=row[9],
            )
        else:
            now = datetime.now(UTC).isoformat()
            new_profile = BuyerProfileRecord(
                buyer_id=buyer_id,
                detected_persona=PersonaType.CASUAL.value,
                confidence_score=0.0,
                first_detected=now,
                last_updated=now,
            )
            self.save(new_profile)
            return new_profile

    def save(self, profile: BuyerProfileRecord):
        """Save or update profile."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute("""
            INSERT OR REPLACE INTO buyer_profiles
            (buyer_id, detected_persona, confidence_score, first_detected, last_updated,
             total_interactions, successful_responses, conversions, avg_satisfaction, persona_switches)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            profile.buyer_id,
            profile.detected_persona,
            profile.confidence_score,
            profile.first_detected,
            profile.last_updated,
            profile.total_interactions,
            profile.successful_responses,
            profile.conversions,
            profile.avg_satisfaction,
            profile.persona_switches,
        ))
        conn.commit()
        conn.close()

    def update_persona(self, buyer_id: str, new_persona: PersonaType, confidence: float):
        """Update buyer persona and track switches."""
        profile = self.get_or_create(buyer_id)

        if profile.detected_persona != new_persona.value:
            profile.persona_switches += 1

        profile.detected_persona = new_persona.value
        profile.confidence_score = confidence
        profile.last_updated = datetime.now(UTC).isoformat()
        self.save(profile)

    def record_interaction(self, buyer_id: str, successful: bool = False):
        """Record an interaction (message) from buyer."""
        profile = self.get_or_create(buyer_id)
        profile.total_interactions += 1
        if successful:
            profile.successful_responses += 1
        profile.last_updated = datetime.now(UTC).isoformat()
        self.save(profile)

    def record_conversion(self, buyer_id: str):
        """Record a conversion (lead/sale)."""
        profile = self.get_or_create(buyer_id)
        profile.conversions += 1
        profile.last_updated = datetime.now(UTC).isoformat()
        self.save(profile)

    def update_satisfaction(self, buyer_id: str, rating: float):
        """Update average satisfaction rating (1-5)."""
        profile = self.get_or_create(buyer_id)

        # Calculate weighted average
        total_ratings = profile.total_interactions
        current_avg = profile.avg_satisfaction

        if total_ratings > 0:
            new_avg = (current_avg * (total_ratings - 1) + rating) / total_ratings
        else:
            new_avg = rating

        profile.avg_satisfaction = min(5.0, max(1.0, new_avg))
        profile.last_updated = datetime.now(UTC).isoformat()
        self.save(profile)


class BuyerProfileManager:
    """High-level manager for buyer profiles with learning."""

    def __init__(self, db_path: str = "wapsell.db"):
        self.db = BuyerProfileDatabase(db_path)
        self.persona_detector = PersonaDetector()

    def get_or_detect_persona(self, buyer_id: str, message: str) -> tuple[PersonaType, float]:
        """
        Get existing persona or detect from message.

        Returns:
            (PersonaType, confidence_score)
        """
        profile = self.db.get_or_create(buyer_id)
        current_persona = PersonaType(profile.detected_persona)

        # Detect new persona from message
        detected = self.persona_detector.detect(message, current_persona)

        # Calculate confidence based on interaction history
        confidence = min(
            1.0,
            (profile.total_interactions / 10) + 0.3  # Confidence grows with interactions
        )

        # Update if persona changed
        if detected != current_persona:
            self.db.update_persona(buyer_id, detected, confidence)

        return detected, confidence

    def get_persona_stats(self, persona: PersonaType) -> Dict:
        """Get aggregated statistics for a persona type."""
        conn = sqlite3.connect(self.db.db_path)
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                COUNT(*) as buyers,
                AVG(total_interactions) as avg_interactions,
                AVG(conversions) as avg_conversions,
                AVG(avg_satisfaction) as avg_satisfaction,
                SUM(conversions) as total_conversions
            FROM buyer_profiles
            WHERE detected_persona = ?
        """, (persona.value,))

        row = cursor.fetchone()
        conn.close()

        if row and row[0] > 0:
            return {
                "persona": persona.value,
                "buyer_count": row[0],
                "avg_interactions": row[1],
                "avg_conversions": row[2],
                "avg_satisfaction": row[3],
                "total_conversions": row[4],
                "conversion_rate": (row[4] or 0) / (row[0] or 1),
            }
        return {"persona": persona.value, "buyer_count": 0}

    def get_best_performing_persona(self) -> Optional[PersonaType]:
        """Get persona with highest conversion rate."""
        best_persona = None
        best_rate = 0.0

        for persona_type in PersonaType:
            stats = self.get_persona_stats(persona_type)
            rate = stats.get("conversion_rate", 0.0)
            if rate > best_rate:
                best_rate = rate
                best_persona = persona_type

        return best_persona

    def record_response_engagement(self, buyer_id: str, was_engaged: bool, satisfaction: float = 0.0):
        """
        Record buyer engagement with response.

        Args:
            buyer_id: Buyer ID
            was_engaged: True if buyer engaged with response
            satisfaction: Optional satisfaction rating (1-5)
        """
        self.db.record_interaction(buyer_id, was_engaged)
        if satisfaction > 0:
            self.db.update_satisfaction(buyer_id, satisfaction)
