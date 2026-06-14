"""
Buyer Persona Detection & Classification System

Detects buyer type from conversation patterns and adapts responses accordingly.
Learns which approaches work best for each persona type over time.
"""

from dataclasses import dataclass, field
from typing import Optional, List, Dict
from enum import Enum
import json


class PersonaType(str, Enum):
    """Buyer persona types."""
    PREMIUM = "premium"  # Luxury focus, high budget, quality-driven
    PROFESSIONAL = "professional"  # Executive, corporate, serious buyer
    CASUAL = "casual"  # Friendly, quick decisions, price-sensitive
    MILLENNIAL = "millennial"  # Tech-savvy, modern, trendy
    SENIOR = "senior"  # Traditional, cautious, relationship-driven
    INVESTOR = "investor"  # Data-driven, ROI-focused, long-term
    FIRST_TIME = "first_time"  # Uncertain, questions-heavy, educational


class FormalnessLevel(str, Enum):
    """Response formality level per persona."""
    FORMAL = "formal"  # Executive, professional language
    SEMI_FORMAL = "semi_formal"  # Balanced, professional but approachable
    CASUAL = "casual"  # Friendly, conversational


@dataclass
class PersonaProfile:
    """Profile for a specific buyer persona."""
    type: PersonaType
    formality: FormalnessLevel
    keywords: List[str]  # Language indicators for this persona
    tone_descriptors: List[str]  # How to respond
    focus_areas: List[str]  # What matters to them
    avg_response_rating: float = 0.0  # Learning: avg satisfaction with responses
    total_interactions: int = 0
    successful_conversions: int = 0

    def conversion_rate(self) -> float:
        """Calculate conversion rate for this persona."""
        if self.total_interactions == 0:
            return 0.0
        return self.successful_conversions / self.total_interactions


# Define persona profiles
PERSONA_PROFILES: Dict[PersonaType, PersonaProfile] = {
    PersonaType.PREMIUM: PersonaProfile(
        type=PersonaType.PREMIUM,
        formality=FormalnessLevel.FORMAL,
        keywords=["lujo", "premium", "exclusivo", "de autor", "diseño", "amenities", "piscina", "spa"],
        tone_descriptors=["exclusive", "consultative", "sophisticated", "VIP treatment"],
        focus_areas=["amenities", "design", "location prestige", "exclusivity", "quality"],
    ),
    PersonaType.PROFESSIONAL: PersonaProfile(
        type=PersonaType.PROFESSIONAL,
        formality=FormalnessLevel.SEMI_FORMAL,
        keywords=["ejecutivo", "corporativo", "empresa", "oficina", "rentable", "rentabilidad", "datos"],
        tone_descriptors=["efficient", "data-driven", "straightforward", "professional"],
        focus_areas=["ROI", "location", "business potential", "efficiency"],
    ),
    PersonaType.CASUAL: PersonaProfile(
        type=PersonaType.CASUAL,
        formality=FormalnessLevel.CASUAL,
        keywords=["barato", "económico", "presupuesto", "rápido", "simple", "fácil"],
        tone_descriptors=["friendly", "quick", "helpful", "down-to-earth"],
        focus_areas=["price", "convenience", "speed", "simplicity"],
    ),
    PersonaType.MILLENNIAL: PersonaProfile(
        type=PersonaType.MILLENNIAL,
        formality=FormalnessLevel.SEMI_FORMAL,
        keywords=["moderno", "tech", "wifi", "coworking", "startup", "joven", "trendy", "vibrante"],
        tone_descriptors=["modern", "trendy", "tech-forward", "casual-professional"],
        focus_areas=["modern amenities", "location vibe", "community", "tech features"],
    ),
    PersonaType.SENIOR: PersonaProfile(
        type=PersonaType.SENIOR,
        formality=FormalnessLevel.FORMAL,
        keywords=["seguridad", "calidad", "experiencia", "confiable", "reputación", "años"],
        tone_descriptors=["trustworthy", "experienced", "attentive", "traditional"],
        focus_areas=["security", "quality", "reputation", "established location"],
    ),
    PersonaType.INVESTOR: PersonaProfile(
        type=PersonaType.INVESTOR,
        formality=FormalnessLevel.SEMI_FORMAL,
        keywords=["inversión", "rentabilidad", "retorno", "datos", "análisis", "mercado", "crecimiento"],
        tone_descriptors=["analytical", "data-driven", "professional", "strategic"],
        focus_areas=["ROI potential", "market data", "growth", "portfolio"],
    ),
    PersonaType.FIRST_TIME: PersonaProfile(
        type=PersonaType.FIRST_TIME,
        formality=FormalnessLevel.CASUAL,
        keywords=["primera", "primera vez", "no sé", "ayuda", "explica", "cómo", "pasos"],
        tone_descriptors=["educational", "patient", "helpful", "supportive"],
        focus_areas=["education", "guidance", "reassurance", "process clarity"],
    ),
}


class PersonaDetector:
    """Detects buyer persona from conversation messages."""

    @staticmethod
    def detect(message: str, previous_persona: Optional[PersonaType] = None) -> PersonaType:
        """
        Detect buyer persona from message content.

        Args:
            message: User's message
            previous_persona: If known, can reinforce it

        Returns:
            Detected PersonaType
        """
        message_lower = message.lower()
        scores: Dict[PersonaType, int] = {p: 0 for p in PersonaType}

        # Score each persona based on keyword matches
        for persona_type, profile in PERSONA_PROFILES.items():
            for keyword in profile.keywords:
                if keyword in message_lower:
                    scores[persona_type] += 1

        # Find highest scoring persona
        best_persona = max(scores, key=scores.get)

        # If no clear match, use heuristics
        if scores[best_persona] == 0:
            best_persona = PersonaDetector._heuristic_detect(message_lower)

        # Reinforce previous if similar
        if previous_persona and scores.get(previous_persona, 0) > 0:
            best_persona = previous_persona

        return best_persona

    @staticmethod
    def _heuristic_detect(message_lower: str) -> PersonaType:
        """Use heuristics if no keyword match found."""
        # Check message length (longer = more professional)
        if len(message_lower) > 100:
            return PersonaType.PROFESSIONAL

        # Check for questions (first-time buyer indicator)
        if "?" in message_lower or "cómo" in message_lower or "ayuda" in message_lower:
            return PersonaType.FIRST_TIME

        # Check for numeric interest (investor)
        if any(char.isdigit() for char in message_lower):
            return PersonaType.INVESTOR

        # Default to casual for simple queries
        return PersonaType.CASUAL


class ResponseTemplateGenerator:
    """Generates professional, persona-aware responses."""

    @staticmethod
    def format_property_list(
        properties: List[tuple],
        persona: PersonaType,
        intro: bool = True
    ) -> str:
        """
        Format property list according to persona style.

        Args:
            properties: List of (id, title, desc, type, price, beds, location)
            persona: Buyer persona type
            intro: Include intro line

        Returns:
            Formatted property list string
        """
        if not properties:
            return ""

        profile = PERSONA_PROFILES[persona]
        lines = []

        # Persona-specific intro
        if intro:
            if persona == PersonaType.PREMIUM:
                lines.append("He seleccionado estas exclusivas propiedades que se alinean con tu perfil:")
            elif persona == PersonaType.PROFESSIONAL:
                lines.append("Encontré estas opciones que podrían interesarte:")
            elif persona == PersonaType.CASUAL:
                lines.append("¡Excelente! Aquí hay algunas opciones que encontré:")
            elif persona == PersonaType.MILLENNIAL:
                lines.append("¡Mira estas opciones que encontré!")
            elif persona == PersonaType.SENIOR:
                lines.append("Le presento estas propiedades seleccionadas:")
            elif persona == PersonaType.INVESTOR:
                lines.append("Estos inmuebles podrían ser de tu interés:")
            elif persona == PersonaType.FIRST_TIME:
                lines.append("Te muestro algunas opciones para que comiences:")
            lines.append("")

        # Format each property
        for prop in properties[:5]:  # Max 5 properties
            prop_id, title, desc, prop_type, price, beds, location = prop

            price_str = f"${price:,.0f}" if prop_type == "compra" else f"${price:,.0f}/mes"
            bed_str = f"{beds} dorm" if beds else "Sin info"

            # Persona-specific detail level
            if persona == PersonaType.PREMIUM:
                line = f"• {title} – {bed_str} en {location} | {price_str}"
                if desc:
                    line += f" | {desc}"
            elif persona == PersonaType.PROFESSIONAL:
                line = f"• {title} | {bed_str} | {location} | {price_str}"
                if desc:
                    line += f" – {desc}"
            elif persona == PersonaType.CASUAL:
                line = f"• {title} ({bed_str}) en {location} - {price_str}"
            elif persona == PersonaType.MILLENNIAL:
                line = f"• {title} – {bed_str} | {location} | {price_str}"
            elif persona == PersonaType.SENIOR:
                line = f"• {title} ({bed_str} dormitorios) en {location} – {price_str}"
            elif persona == PersonaType.INVESTOR:
                line = f"• {title} | {bed_str} | {location} | {price_str}"
                if desc:
                    line += f" | {desc}"
            elif persona == PersonaType.FIRST_TIME:
                line = f"• {title} ({bed_str}) en {location} - {price_str}"
            else:
                line = f"• {title} ({bed_str}) en {location} - {price_str}"

            lines.append(line)

        lines.append("")
        return "\n".join(lines)

    @staticmethod
    def format_followup(persona: PersonaType, property_count: int = 0) -> str:
        """Generate persona-appropriate follow-up question."""
        if persona == PersonaType.PREMIUM:
            return "¿Cuál de estas opciones resuena más contigo? Puedo brindarte detalles de diseño, amenities exclusivos y ubicación."
        elif persona == PersonaType.PROFESSIONAL:
            return "¿Cuál te interesa analizar? Tengo información completa de rentabilidad y datos del mercado."
        elif persona == PersonaType.CASUAL:
            return "¿Alguna te llama la atención? Te doy más info sin problema."
        elif persona == PersonaType.MILLENNIAL:
            return "¿Cuál te atrae más? Cuéntame qué busca y te muestro opciones mejores."
        elif persona == PersonaType.SENIOR:
            return "¿Le gustaría conocer más detalles de alguna de estas propiedades? Estoy disponible para ayudarle."
        elif persona == PersonaType.INVESTOR:
            return "¿Alguna de estas opciones se ajusta a tu estrategia de inversión? Puedo compartirte análisis completo."
        elif persona == PersonaType.FIRST_TIME:
            return "¿Cuál de estas te parece interesante? Te explico el proceso paso a paso para que entiendas todo bien."
        else:
            return "¿Te gustaría conocer más detalles de alguno de estos inmuebles?"

    @staticmethod
    def format_no_results_response(persona: PersonaType, query: str) -> str:
        """Persona-aware response when no properties found."""
        if persona == PersonaType.PREMIUM:
            return f"No encontré exactamente lo que buscas en '{query}'. Te sugiero explorar ubicaciones premium como San Isidro o Recoleta. ¿Prefieres que amplíe la búsqueda o que te hable de opciones exclusivas?"
        elif persona == PersonaType.PROFESSIONAL:
            return f"No hay coincidencias exactas para '{query}'. ¿Puedo ajustar los criterios de búsqueda? Me gustaría entender mejor: ¿ubicación, presupuesto o tipo de propiedad es lo más importante?"
        elif persona == PersonaType.CASUAL:
            return f"No encontré nada exacto con '{query}'. ¿Probamos otra búsqueda? Cuéntame qué buscas sin preocuparte por la precisión."
        elif persona == PersonaType.MILLENNIAL:
            return f"Sin resultados para '{query}'. ¿Qué te parece si expandimos la búsqueda? ¿Ubicaciones alternativas o cambios en lo que buscas?"
        elif persona == PersonaType.SENIOR:
            return f"No tengo propiedades que coincidan exactamente con '{query}'. ¿Podemos refinar la búsqueda juntos? Estoy aquí para ayudarle a encontrar lo que busca."
        elif persona == PersonaType.INVESTOR:
            return f"No hay opciones exactas en '{query}'. Dados tus criterios de inversión, ¿me permites sugerir alternativas con mejor potencial de rentabilidad?"
        elif persona == PersonaType.FIRST_TIME:
            return f"No encontré nada con '{query}'. No te preocupes, es normal. ¿Podemos intentar de nuevo? Por ejemplo: barrio, presupuesto o si es para comprar o alquilar."
        else:
            return f"No encontré propiedades con '{query}'. ¿Probamos otra búsqueda?"


# Persona-aware insight generation
class PersonaInsights:
    """Generate insights based on persona and interaction history."""

    @staticmethod
    def get_persona_summary(persona: PersonaType) -> str:
        """Get persona summary for internal use."""
        profile = PERSONA_PROFILES[persona]
        return (
            f"Tipo: {persona.value.upper()}\n"
            f"Formalidad: {profile.formality.value}\n"
            f"Enfoque: {', '.join(profile.focus_areas)}\n"
            f"Tono: {', '.join(profile.tone_descriptors)}"
        )
