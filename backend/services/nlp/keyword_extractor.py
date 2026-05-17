"""Keyword extraction using spaCy and TF-IDF."""

import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
from typing import List, Dict, Set
import re
from collections import Counter
from backend.utils.config import settings
from backend.utils.logger import app_logger


class KeywordExtractor:
    """Extract keywords and important terms from text."""

    def __init__(self):
        self.model_name = settings.SPACY_MODEL
        self.nlp = None
        self._initialized = False

        # Music-related keywords to boost
        self.music_terms = {
            "album", "song", "track", "single", "ep", "mixtape", "release",
            "music", "artist", "band", "rapper", "singer", "producer",
            "genre", "pop", "rock", "hip hop", "rap", "jazz", "country",
            "concert", "tour", "performance", "live", "show",
            "lyrics", "beat", "melody", "chorus", "verse",
            "spotify", "youtube", "soundcloud", "apple music"
        }

    def initialize(self):
        """Load spaCy model."""
        if self._initialized:
            return

        try:
            app_logger.info(f"Loading spaCy model: {self.model_name}")
            self.nlp = spacy.load(self.model_name)
            self._initialized = True
            app_logger.info("spaCy model loaded successfully")

        except OSError:
            app_logger.warning(f"spaCy model {self.model_name} not found, downloading...")
            import subprocess
            subprocess.run(["python", "-m", "spacy", "download", self.model_name])
            self.nlp = spacy.load(self.model_name)
            self._initialized = True

        except Exception as e:
            app_logger.error(f"Failed to load spaCy model: {e}")
            raise

    def extract_keywords(self, text: str, max_keywords: int = 10) -> List[str]:
        """Extract keywords from text using spaCy."""
        if not self._initialized:
            self.initialize()

        if not text or not text.strip():
            return []

        try:
            doc = self.nlp(text.lower())

            # Extract nouns, proper nouns, and adjectives
            keywords = []
            for token in doc:
                if (token.pos_ in ["NOUN", "PROPN", "ADJ"] and
                    not token.is_stop and
                    not token.is_punct and
                    len(token.text) > 2):
                    keywords.append(token.lemma_)

            # Count frequency
            keyword_counts = Counter(keywords)

            # Boost music-related terms
            for keyword in keyword_counts:
                if keyword in self.music_terms:
                    keyword_counts[keyword] *= 2

            # Get top keywords
            top_keywords = [kw for kw, _ in keyword_counts.most_common(max_keywords)]

            return top_keywords

        except Exception as e:
            app_logger.error(f"Error extracting keywords: {e}")
            return []

    def extract_noun_phrases(self, text: str, max_phrases: int = 5) -> List[str]:
        """Extract noun phrases from text."""
        if not self._initialized:
            self.initialize()

        if not text or not text.strip():
            return []

        try:
            doc = self.nlp(text.lower())
            phrases = [chunk.text for chunk in doc.noun_chunks if len(chunk.text.split()) <= 3]

            # Remove duplicates while preserving order
            seen = set()
            unique_phrases = []
            for phrase in phrases:
                if phrase not in seen:
                    seen.add(phrase)
                    unique_phrases.append(phrase)

            return unique_phrases[:max_phrases]

        except Exception as e:
            app_logger.error(f"Error extracting noun phrases: {e}")
            return []

    def extract_keywords_tfidf(self, texts: List[str], max_keywords: int = 10) -> List[List[str]]:
        """Extract keywords using TF-IDF across multiple documents."""
        if not texts:
            return []

        try:
            # Clean texts
            cleaned_texts = [self._clean_text(text) for text in texts]

            # TF-IDF vectorization
            vectorizer = TfidfVectorizer(
                max_features=100,
                stop_words='english',
                ngram_range=(1, 2),
                min_df=1,
                max_df=0.8
            )

            tfidf_matrix = vectorizer.fit_transform(cleaned_texts)
            feature_names = vectorizer.get_feature_names_out()

            # Extract top keywords for each document
            keywords_per_doc = []
            for doc_idx in range(tfidf_matrix.shape[0]):
                doc_vector = tfidf_matrix[doc_idx].toarray()[0]
                top_indices = doc_vector.argsort()[-max_keywords:][::-1]
                top_keywords = [feature_names[i] for i in top_indices if doc_vector[i] > 0]
                keywords_per_doc.append(top_keywords)

            return keywords_per_doc

        except Exception as e:
            app_logger.error(f"Error in TF-IDF keyword extraction: {e}")
            return [[] for _ in texts]

    def _clean_text(self, text: str) -> str:
        """Clean text for processing."""
        # Remove URLs
        text = re.sub(r'http\S+|www\S+', '', text)
        # Remove special characters but keep spaces
        text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text)
        # Remove extra whitespace
        text = ' '.join(text.split())
        return text.lower()


# Global keyword extractor instance
keyword_extractor = KeywordExtractor()
