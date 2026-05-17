"""Entity detection for artist names and music-related entities."""

import spacy
from typing import List, Dict, Set
import re
from fuzzywuzzy import fuzz
from backend.utils.config import settings
from backend.utils.logger import app_logger


class EntityDetector:
    """Detect artist names and music entities in text."""

    def __init__(self):
        self.model_name = settings.SPACY_MODEL
        self.nlp = None
        self._initialized = False

        # Common artist name patterns
        self.artist_indicators = {
            "by", "from", "featuring", "feat", "ft", "artist",
            "singer", "rapper", "band", "musician", "producer"
        }

        # Known artists cache (would be populated from database)
        self.known_artists: Set[str] = set()

    def initialize(self):
        """Load spaCy model."""
        if self._initialized:
            return

        try:
            app_logger.info(f"Loading spaCy model for entity detection: {self.model_name}")
            self.nlp = spacy.load(self.model_name)
            self._initialized = True
            app_logger.info("Entity detector initialized successfully")

        except OSError:
            app_logger.warning(f"spaCy model {self.model_name} not found, downloading...")
            import subprocess
            subprocess.run(["python", "-m", "spacy", "download", self.model_name])
            self.nlp = spacy.load(self.model_name)
            self._initialized = True

        except Exception as e:
            app_logger.error(f"Failed to initialize entity detector: {e}")
            raise

    def load_known_artists(self, artists: List[str]):
        """Load known artist names for better matching."""
        self.known_artists = set(artist.lower() for artist in artists)
        app_logger.info(f"Loaded {len(self.known_artists)} known artists")

    def detect_entities(self, text: str) -> Dict[str, List[str]]:
        """Detect named entities in text."""
        if not self._initialized:
            self.initialize()

        if not text or not text.strip():
            return {"persons": [], "organizations": [], "locations": []}

        try:
            doc = self.nlp(text)

            entities = {
                "persons": [],
                "organizations": [],
                "locations": []
            }

            for ent in doc.ents:
                if ent.label_ == "PERSON":
                    entities["persons"].append(ent.text)
                elif ent.label_ == "ORG":
                    entities["organizations"].append(ent.text)
                elif ent.label_ in ["GPE", "LOC"]:
                    entities["locations"].append(ent.text)

            # Remove duplicates
            for key in entities:
                entities[key] = list(set(entities[key]))

            return entities

        except Exception as e:
            app_logger.error(f"Error detecting entities: {e}")
            return {"persons": [], "organizations": [], "locations": []}

    def detect_artist_mentions(self, text: str) -> List[str]:
        """Detect potential artist mentions in text."""
        if not self._initialized:
            self.initialize()

        if not text or not text.strip():
            return []

        try:
            # First, use NER to find person names
            entities = self.detect_entities(text)
            potential_artists = entities["persons"].copy()

            # Also check organizations (bands)
            potential_artists.extend(entities["organizations"])

            # Pattern matching for artist mentions
            text_lower = text.lower()

            # Look for patterns like "by [Artist]", "from [Artist]"
            for indicator in self.artist_indicators:
                pattern = rf'\b{indicator}\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)'
                matches = re.findall(pattern, text)
                potential_artists.extend(matches)

            # Match against known artists
            matched_artists = []
            for artist in potential_artists:
                artist_lower = artist.lower()

                # Exact match
                if artist_lower in self.known_artists:
                    matched_artists.append(artist)
                else:
                    # Fuzzy match
                    for known_artist in self.known_artists:
                        if fuzz.ratio(artist_lower, known_artist) > 85:
                            matched_artists.append(artist)
                            break

            # Remove duplicates while preserving case
            seen = set()
            unique_artists = []
            for artist in matched_artists:
                artist_lower = artist.lower()
                if artist_lower not in seen:
                    seen.add(artist_lower)
                    unique_artists.append(artist)

            return unique_artists

        except Exception as e:
            app_logger.error(f"Error detecting artist mentions: {e}")
            return []

    def extract_artist_from_title(self, title: str) -> List[str]:
        """Extract artist name from video/post title."""
        if not title:
            return []

        # Common patterns in music titles
        patterns = [
            r'^([^-]+)\s*-',  # "Artist - Song"
            r'\(([^)]+)\)',   # "(Artist)"
            r'by\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',  # "by Artist"
            r'ft\.?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',  # "ft. Artist"
        ]

        artists = []
        for pattern in patterns:
            matches = re.findall(pattern, title)
            artists.extend(matches)

        # Clean and deduplicate
        cleaned_artists = []
        for artist in artists:
            artist = artist.strip()
            if len(artist) > 2 and artist not in cleaned_artists:
                cleaned_artists.append(artist)

        return cleaned_artists


# Global entity detector instance
entity_detector = EntityDetector()
