"""Extractor de catálogos Tokko — parsea propiedades de sitios Tokko."""

import re
import requests
from typing import List, Dict, Optional
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class TokkoExtractor:
    """Extrae propiedades de un sitio Tokko."""

    def __init__(self, base_url: str, timeout: int = 10):
        """
        Args:
            base_url: URL del sitio Tokko (ej: https://www.ejemplo.com/)
            timeout: segundos para timeout de requests
        """
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        })

    def _fetch(self, url: str, **kwargs) -> Optional[BeautifulSoup]:
        """Fetch and parse HTML."""
        try:
            r = self.session.get(url, timeout=self.timeout, **kwargs)
            r.raise_for_status()
            return BeautifulSoup(r.text, "html.parser")
        except Exception as e:
            logger.error(f"Fetch error {url}: {e}")
            return None

    def get_property_count(self) -> Optional[int]:
        """Extract total property count from listing page."""
        url = f"{self.base_url}/Propiedades"
        soup = self._fetch(url)
        if not soup:
            return None

        # Regex: resultados[a-zA-Z]?-subtitulo"[^>]*>\s*(\d+)
        text = soup.get_text()
        match = re.search(r"resultados[a-zA-Z]?-subtitulo[^>]*>\s*(\d+)", soup.prettify())
        if match:
            return int(match.group(1))

        # Fallback: look for any "X resultados" pattern
        match = re.search(r"(\d+)\s+resultados", text, re.IGNORECASE)
        if match:
            return int(match.group(1))

        return None

    def get_property_listing_urls(self, max_pages: int = 100) -> List[str]:
        """Get URLs of individual property pages by paginating."""
        urls = []
        page = 1

        while page <= max_pages:
            # Try ?page=N first
            url = f"{self.base_url}/Propiedades?page={page}"
            soup = self._fetch(url)
            if not soup:
                break

            # Find property links: /p/{id}-{slug}
            prop_links = soup.find_all("a", href=re.compile(r"/p/\d+"))
            if not prop_links:
                break

            for link in prop_links:
                href = link.get("href")
                if href:
                    full_url = urljoin(self.base_url, href)
                    if full_url not in urls:
                        urls.append(full_url)

            logger.info(f"Page {page}: found {len(prop_links)} properties")
            page += 1

        return urls

    def get_property_details(self, url: str) -> Optional[Dict]:
        """Extract property details from /p/{id} page."""
        soup = self._fetch(url)
        if not soup:
            return None

        try:
            # Extract all text and structured data
            text = soup.get_text()

            # Regex patterns for common fields
            patterns = {
                "precio": r"\$\s*([\d.,]+)",
                "moneda": r"(USD|ARS|Dólar|Peso)",
                "m2_cubiertos": r"(\d+)\s*m[²2](\s+cubiertos)?",
                "m2_totales": r"(\d+)\s*m[²2](\s+totales)?",
                "ambientes": r"(\d+)\s+ambientes?",
                "dormitorios": r"(\d+)\s+dormitorios?",
                "banos": r"(\d+)\s+ba[ñn]os?",
                "piso": r"Piso:\s*(\d+)",
                "barrio": r"(?:Barrio|Zona):\s*([^,\n]+)",
                "ciudad": r"(?:Ciudad):\s*([^,\n]+)",
                "operacion": r"(Venta|Alquiler|Renta)",
                "balcon": r"(?:Balcón|Terraza):\s*(Sí|No|True|False)",
                "cochera": r"(?:Cochera|Garage):\s*(Sí|No|True|False)",
            }

            result = {"url": url}
            for key, pattern in patterns.items():
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    result[key] = match.group(1) if match.groups() else match.group(0)

            # Extract ID from URL
            match = re.search(r"/p/(\d+)", url)
            if match:
                result["id"] = match.group(1)

            return result
        except Exception as e:
            logger.error(f"Detail extraction error {url}: {e}")
            return None

    def extract_all(self) -> List[Dict]:
        """Extract all properties."""
        count = self.get_property_count()
        logger.info(f"Expected {count} properties")

        urls = self.get_property_listing_urls()
        logger.info(f"Found {len(urls)} property URLs")

        properties = []
        for url in urls:
            details = self.get_property_details(url)
            if details:
                properties.append(details)

        return properties

    def to_rag_format(self, properties: List[Dict]) -> List[Dict]:
        """Convert properties to RAG schema (100_departamentos.csv format)."""
        rag_properties = []

        for p in properties:
            # Parse numeric fields
            try:
                precio = float(re.sub(r"[^\d.]", "", p.get("precio", "0")))
            except:
                precio = 0

            try:
                m2_cubiertos = int(re.search(r"\d+", p.get("m2_cubiertos", "0")).group(0))
            except:
                m2_cubiertos = 0

            try:
                ambientes = int(re.search(r"\d+", p.get("ambientes", "0")).group(0))
            except:
                ambientes = 0

            try:
                dormitorios = int(re.search(r"\d+", p.get("dormitorios", "0")).group(0))
            except:
                dormitorios = 0

            try:
                banos = int(re.search(r"\d+", p.get("banos", "0")).group(0))
            except:
                banos = 0

            # Generate content for RAG
            content = (
                f"{'Departamento' if ambientes < 4 else 'Propiedad'} "
                f"de {ambientes} ambientes, {dormitorios} dormitorios y {banos} baños. "
                f"Ubicado en {p.get('barrio', 'zona desconocida')}, {p.get('ciudad', '')}. "
                f"Cuenta con balcón: {p.get('balcon', 'N/A')}, cochera: {p.get('cochera', 'N/A')}. "
                f"Operación: {p.get('operacion', 'N/A')}. "
                f"Precio: {p.get('moneda', 'USD')} {precio:.0f}."
            )

            rag_property = {
                "id": p.get("id", ""),
                "tipo": "departamento" if ambientes < 4 else "propiedad",
                "precio_usd": precio if p.get("moneda") == "USD" else precio * 0.01,  # rough conversion
                "m2_cubiertos": m2_cubiertos,
                "m2_totales": m2_cubiertos,  # fallback
                "ambientes": ambientes,
                "dormitorios": dormitorios,
                "banos": banos,
                "barrio": p.get("barrio", ""),
                "ciudad": p.get("ciudad", ""),
                "balcon": "1" if "sí" in str(p.get("balcon", "")).lower() else "0",
                "cochera": "1" if "sí" in str(p.get("cochera", "")).lower() else "0",
                "operacion": p.get("operacion", ""),
                "content": content,
            }
            rag_properties.append(rag_property)

        return rag_properties
