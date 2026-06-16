#!/usr/bin/env python3
"""CLI: Extract Tokko catalog and load to Wapsell DB.

Usage:
    python3 extract_catalog.py <tokko_url> <prospect_id> [--db /path/to/wapsell.db]

Example:
    python3 extract_catalog.py https://www.gustavodesimone.com my-prospect-id
"""

import sys
import argparse
import logging
from extractors_tokko import TokkoExtractor
from loader_catalogs import CatalogLoader

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


def main():
    parser = argparse.ArgumentParser(
        description="Extract Tokko catalog and load to Wapsell DB"
    )
    parser.add_argument("tokko_url", help="Base URL of Tokko site (e.g., https://example.com)")
    parser.add_argument("prospect_id", help="Prospect ID in Wapsell DB")
    parser.add_argument(
        "--db",
        default="/var/lib/docker/volumes/wapsell_wapsell-db/_data/wapsell.db",
        help="Path to Wapsell DB (default: production path)"
    )

    args = parser.parse_args()

    logger.info(f"Starting extraction from {args.tokko_url}")
    logger.info(f"Prospect ID: {args.prospect_id}")
    logger.info(f"DB: {args.db}")

    # Extract
    extractor = TokkoExtractor(args.tokko_url)

    count = extractor.get_property_count()
    logger.info(f"Expected ~{count} properties")

    logger.info("Fetching property listing URLs...")
    urls = extractor.get_property_listing_urls(max_pages=10)
    logger.info(f"Found {len(urls)} property URLs")

    logger.info("Extracting property details...")
    properties = extractor.extract_all()
    logger.info(f"Extracted {len(properties)} properties with details")

    # Convert to RAG format
    logger.info("Converting to RAG format...")
    rag_properties = extractor.to_rag_format(properties)

    # Load to DB
    logger.info(f"Loading to DB...")
    loader = CatalogLoader(args.db)
    loaded = loader.load_rag_format(args.prospect_id, rag_properties)
    loader.close()

    logger.info(f"✓ Loaded {loaded} properties for prospect {args.prospect_id}")
    logger.info("Done!")


if __name__ == "__main__":
    main()
