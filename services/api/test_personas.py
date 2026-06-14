"""
Quick test of the persona detection and response formatting system.
"""

import tempfile
import os
from buyer_personas import (
    PersonaDetector, ResponseTemplateGenerator, PersonaType, PERSONA_PROFILES
)
from buyer_profile_manager import BuyerProfileDatabase, BuyerProfileManager

def test_persona_detection():
    """Test persona detection from different message types."""
    detector = PersonaDetector()

    test_cases = [
        ("Busco departamento de lujo en Palermo", PersonaType.PREMIUM),
        ("Necesito análisis de rentabilidad para inversión", PersonaType.INVESTOR),
        ("Cuéntame, ¿cómo funciona el proceso de compra?", PersonaType.FIRST_TIME),
        ("Me interesa algo moderno y con buena vibra", PersonaType.MILLENNIAL),
        ("Quiero algo barato y rápido", PersonaType.CASUAL),
        ("Busco datos precisos sobre el mercado", PersonaType.PROFESSIONAL),
        ("Seguridad y reputación son lo más importante", PersonaType.SENIOR),
    ]

    print("=" * 70)
    print("PERSONA DETECTION TEST")
    print("=" * 70)

    for message, expected in test_cases:
        detected = detector.detect(message)
        match = "[OK]" if detected == expected else "[FAIL]"
        print(f"{match} '{message[:50]}...'")
        print(f"  Expected: {expected.value}, Got: {detected.value}\n")


def test_response_templates():
    """Test response formatting for different personas."""
    sample_properties = [
        ("prop_1", "Departamento 2 amb Palermo", "Luminoso con balcón", "compra", 85000, 2, "Palermo"),
        ("prop_2", "PH 3 amb San Telmo", "Con patio y cochera", "compra", 120000, 3, "San Telmo"),
        ("prop_3", "Casa La Boca", "Refaccionada", "alquiler", 2500, 4, "La Boca"),
    ]

    print("\n" + "=" * 70)
    print("RESPONSE TEMPLATE TEST")
    print("=" * 70)

    for persona in [PersonaType.PREMIUM, PersonaType.PROFESSIONAL, PersonaType.CASUAL]:
        print(f"\n{persona.value.upper()}:")
        print("-" * 70)

        response = ResponseTemplateGenerator.format_property_list(
            properties=sample_properties,
            persona=persona,
            intro=True
        )
        print(response)

        followup = ResponseTemplateGenerator.format_followup(persona)
        print(f"Seguimiento: {followup}")
        print()


def test_profile_persistence():
    """Test profile saving and loading."""
    print("\n" + "=" * 70)
    print("PROFILE PERSISTENCE TEST")
    print("=" * 70)

    # Create temporary database file
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tmp:
        db_path = tmp.name

    try:
        manager = BuyerProfileManager(db_path=db_path)
        test_user = "test_user_123"

        # Get or create profile
        profile = manager.db.get_or_create(test_user)
        print(f"1. Created profile: {profile.buyer_id}, persona: {profile.detected_persona}")

        # Detect persona
        persona, confidence = manager.get_or_detect_persona(test_user, "Busco algo lujoso")
        print(f"2. Detected persona: {persona.value} (confidence: {confidence:.2f})")

        # Record interactions
        manager.record_response_engagement(test_user, was_engaged=True, satisfaction=4.5)
        manager.record_response_engagement(test_user, was_engaged=True, satisfaction=4.8)
        manager.db.record_conversion(test_user)

        # Check updated profile
        updated = manager.db.get_or_create(test_user)
        print(f"3. After interactions:")
        print(f"   - Total interactions: {updated.total_interactions}")
        print(f"   - Successful responses: {updated.successful_responses}")
        print(f"   - Conversions: {updated.conversions}")
        print(f"   - Avg satisfaction: {updated.avg_satisfaction:.2f}")

        # Get stats
        stats = manager.get_persona_stats(persona)
        print(f"4. Persona stats: {stats}")
    finally:
        # Clean up
        if os.path.exists(db_path):
            os.remove(db_path)


def test_no_results_response():
    """Test response when no properties found."""
    print("\n" + "=" * 70)
    print("NO RESULTS RESPONSE TEST")
    print("=" * 70)

    for persona in [PersonaType.PREMIUM, PersonaType.CASUAL, PersonaType.INVESTOR]:
        response = ResponseTemplateGenerator.format_no_results_response(
            persona=persona,
            query="Mansión con playa privada"
        )
        print(f"\n{persona.value.upper()}:")
        print(response)


if __name__ == "__main__":
    print("\nRUNNING PERSONA SYSTEM TESTS\n")

    test_persona_detection()
    test_response_templates()
    test_profile_persistence()
    test_no_results_response()

    print("\n" + "=" * 70)
    print("[SUCCESS] ALL TESTS COMPLETED")
    print("=" * 70)
