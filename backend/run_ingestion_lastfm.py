"""
Main entry point for running data ingestion with Last.fm and MusicBrainz APIs.
This version uses real APIs: Last.fm for trending data and MusicBrainz for metadata.
"""

import asyncio
import sys
from backend.services.ingestion.orchestrator_lastfm import ingestion_orchestrator
from backend.utils.logger import app_logger


async def main():
    """Main entry point."""
    try:
        app_logger.info("=" * 60)
        app_logger.info("Starting Music Trend Intelligence - Data Ingestion Service")
        app_logger.info("APIs: Last.fm + MusicBrainz")
        app_logger.info("=" * 60)
        await ingestion_orchestrator.start()
    except KeyboardInterrupt:
        app_logger.info("Received shutdown signal")
        ingestion_orchestrator.stop()
    except Exception as e:
        app_logger.error(f"Fatal error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
