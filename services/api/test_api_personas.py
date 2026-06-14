"""
Integration test: Test persona system with actual API endpoints.
Run this AFTER starting the API server.
"""

import requests
import json
from time import sleep

BASE_URL = "http://localhost:8000"

def test_chat_with_personas():
    """Test chat endpoint with different persona messages."""

    # First, register a test user
    print("=" * 70)
    print("STEP 1: Register Test User")
    print("=" * 70)

    register_response = requests.post(
        f"{BASE_URL}/auth/register",
        json={
            "email": "persona_test@example.com",
            "password": "TestPassword123!"
        }
    )

    if register_response.status_code != 201:
        print(f"Registration failed: {register_response.text}")
        return

    user = register_response.json()
    user_id = user["id"]
    print(f"✓ User registered: {user_id}\n")

    # Test messages for different personas
    test_messages = [
        ("Busco departamento de lujo en Palermo", "PREMIUM"),
        ("Necesito analizar rentabilidad de propiedades", "INVESTOR"),
        ("Cuéntame, ¿cómo funciona esto?", "FIRST_TIME"),
        ("Algo moderno y trendy en Palermo", "MILLENNIAL"),
        ("Dame barato y rápido", "CASUAL"),
        ("Busco datos del mercado actual", "PROFESSIONAL"),
        ("Necesito seguridad, ubicación con reputación", "SENIOR"),
    ]

    print("=" * 70)
    print("STEP 2: Test Chat with Different Personas")
    print("=" * 70)

    for message, expected_persona in test_messages:
        print(f"\nMessage: '{message}'")
        print(f"Expected Persona: {expected_persona}")
        print("-" * 70)

        try:
            response = requests.post(
                f"{BASE_URL}/chat/message?user_id={user_id}",
                json={"message": message}
            )

            if response.status_code == 200:
                reply = response.json()["reply"]
                print(f"Reply Preview: {reply[:100]}...\n")
                sleep(0.5)
            else:
                print(f"Error: {response.status_code} - {response.text}\n")
        except Exception as e:
            print(f"Connection error: {e}\n")

    # Get persona analytics
    print("\n" + "=" * 70)
    print("STEP 3: Get Persona Analytics")
    print("=" * 70)

    try:
        # Get user's persona
        persona_response = requests.get(
            f"{BASE_URL}/analytics/persona/{user_id}"
        )

        if persona_response.status_code == 200:
            persona_data = persona_response.json()
            print(f"\nUser Persona Profile:")
            print(f"  Persona: {persona_data['persona']}")
            print(f"  Confidence: {persona_data['confidence']:.2%}")
            print(f"  Interactions: {persona_data['interactions']}")
            print(f"  Conversions: {persona_data['conversions']}")
            print(f"  Satisfaction: {persona_data['avg_satisfaction']:.2f}/5.0")

        # Get all personas stats
        stats_response = requests.get(
            f"{BASE_URL}/analytics/personas"
        )

        if stats_response.status_code == 200:
            stats = stats_response.json()
            print(f"\nGlobal Persona Statistics:")
            print(f"  Best Performing: {stats['best_performing']}")
            print(f"  Total Profiles: {stats['total_profiles']}")

            for persona_name, persona_stats in stats['personas'].items():
                if persona_stats.get('buyer_count', 0) > 0:
                    print(f"\n  {persona_name.upper()}:")
                    print(f"    Buyers: {persona_stats['buyer_count']}")
                    print(f"    Conversion Rate: {persona_stats['conversion_rate']:.1%}")
                    print(f"    Avg Satisfaction: {persona_stats['avg_satisfaction']:.2f}")
    except Exception as e:
        print(f"Analytics error: {e}")

    print("\n" + "=" * 70)
    print("[SUCCESS] Integration test completed")
    print("=" * 70)


if __name__ == "__main__":
    print("\nINTEGRATION TEST: Persona System with Live API\n")
    print("Make sure the API is running:")
    print("  cd services/api")
    print("  python -m uvicorn main:app --reload\n")

    try:
        test_chat_with_personas()
    except requests.exceptions.ConnectionError:
        print("ERROR: Could not connect to API at http://localhost:8000")
        print("Make sure the API server is running!")
