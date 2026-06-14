#!/usr/bin/env python
"""Debug script to test AgentLoop.respond() directly."""

import asyncio
import os
import sys
from dotenv import load_dotenv

# Load env
load_dotenv()

from wapsell.client import WapsellClient
from wapsell.models import Fact, Tenant
from wapsell.llm.port import OpenRouterLLM
import sqlite3

# Initialize LLM
api_key = os.getenv("OPENROUTER_API_KEY")
print(f"[DEBUG] OpenRouter API Key: {api_key[:20]}...")

llm = OpenRouterLLM(api_key=api_key)
print(f"[DEBUG] LLM initialized: {llm}")

# Initialize WapsellClient
hermes_client = WapsellClient(llm=llm)
print(f"[DEBUG] WapsellClient initialized")

# Load properties into Hindsight
conn = sqlite3.connect("wapsell.db")
c = conn.cursor()
c.execute("SELECT id, title, location FROM properties LIMIT 10")
props = c.fetchall()
conn.close()

print(f"\n[DEBUG] Loading {len(props)} properties into Hindsight...")
for prop_id, title, location in props:
    fact = Fact(
        id=prop_id,
        content=f"{title} en {location}",
        source="properties_seed",
        tenant_id="demo"
    )
    hermes_client.hindsight.add_fact(fact)
    print(f"  - Saved: {title}")

# Test Hindsight query
print(f"\n[DEBUG] Testing Hindsight.query('Palermo')...")
results = hermes_client.hindsight.query(text="Palermo", tenant_id="demo", top_k=3)
print(f"[DEBUG] Query results: {results}")

# Test AgentLoop.respond()
print(f"\n[DEBUG] Testing AgentLoop.respond()...")
demo_tenant = Tenant(
    id="demo",
    slug="demo",
    name="Demo Tenant",
    plan="pro",
    model="openai/gpt-4o-mini"
)

async def test_agent():
    try:
        print("[DEBUG] Testing AgentLoop stages...")

        # Stage 1: RECALL - check what the hindsight returns
        print("\n[STAGE 1] RECALL - Query Hindsight...")
        recall_results = hermes_client.hindsight.query(text="Palermo", tenant_id="demo", top_k=3)
        print(f"Hindsight results: {[f.content for f in recall_results]}")

        # Stage 2-5: Full agent response
        print("\n[STAGES 2-5] Full agent.respond()...")
        agent_turn = await hermes_client.agent.respond(
            tenant=demo_tenant,
            buyer_id="demo:test_user",
            message="Quiero departamentos en Palermo"
        )
        print(f"Agent response: {agent_turn.reply}")

        # Check agent turn details
        print(f"\nAgent turn details:")
        print(f"  - reply: {agent_turn.reply}")
        for attr in dir(agent_turn):
            if not attr.startswith('_') and attr != 'reply':
                try:
                    val = getattr(agent_turn, attr)
                    if not callable(val):
                        print(f"  - {attr}: {val}")
                except:
                    pass

    except Exception as e:
        print(f"[ERROR] Agent failed: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()

asyncio.run(test_agent())
