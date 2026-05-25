"""
Entry point for the ingestion service.
Runs the Last.fm/MusicBrainz/YouTube ingestion orchestrator continuously.
"""

import asyncio
import sys
from backend.services.ingestion.orchestrator_lastfm import ingestion_orchestrator
from backend.utils.logger import app_logger


async def main():
    """Main entry point for ingestion service."""
    try:
        app_logger.info("=" * 60)
        app_logger.info("Starting Music Trend Intelligence - Ingestion Service")
        app_logger.info("=" * 60)

        # Start the orchestrator (runs indefinitely)
        await ingestion_orchestrator.start()

    except KeyboardInterrupt:
        app_logger.info("Received shutdown signal")
        ingestion_orchestrator.stop()
    except Exception as e:
        app_logger.error(f"Fatal error in ingestion service: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
