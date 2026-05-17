"""Sentiment analysis using HuggingFace transformers."""

from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
import torch
from typing import Dict, List, Optional
from backend.utils.config import settings
from backend.utils.logger import app_logger


class SentimentAnalyzer:
    """Sentiment analysis for music-related text using transformers."""

    def __init__(self):
        self.model_name = settings.SENTIMENT_MODEL
        self.model = None
        self.tokenizer = None
        self.pipeline = None
        self._initialized = False

    def initialize(self):
        """Load sentiment analysis model."""
        if self._initialized:
            return

        try:
            app_logger.info(f"Loading sentiment model: {self.model_name}")

            # Load model and tokenizer
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.model = AutoModelForSequenceClassification.from_pretrained(self.model_name)

            # Create pipeline
            device = 0 if torch.cuda.is_available() else -1
            self.pipeline = pipeline(
                "sentiment-analysis",
                model=self.model,
                tokenizer=self.tokenizer,
                device=device,
                truncation=True,
                max_length=512
            )

            self._initialized = True
            app_logger.info("Sentiment model loaded successfully")

        except Exception as e:
            app_logger.error(f"Failed to load sentiment model: {e}")
            raise

    def analyze(self, text: str) -> Dict[str, any]:
        """Analyze sentiment of a single text."""
        if not self._initialized:
            self.initialize()

        if not text or not text.strip():
            return {
                "label": "neutral",
                "score": 0.0,
                "normalized_score": 0.0
            }

        try:
            # Truncate very long text
            text = text[:1000]

            result = self.pipeline(text)[0]

            # Convert to normalized score (-1 to 1)
            label = result["label"].lower()
            confidence = result["score"]

            if "positive" in label:
                normalized_score = confidence
            elif "negative" in label:
                normalized_score = -confidence
            else:
                normalized_score = 0.0

            return {
                "label": "positive" if normalized_score > 0 else "negative" if normalized_score < 0 else "neutral",
                "score": confidence,
                "normalized_score": normalized_score
            }

        except Exception as e:
            app_logger.error(f"Error analyzing sentiment: {e}")
            return {
                "label": "neutral",
                "score": 0.0,
                "normalized_score": 0.0
            }

    def analyze_batch(self, texts: List[str], batch_size: int = 8) -> List[Dict[str, any]]:
        """Analyze sentiment for multiple texts efficiently."""
        if not self._initialized:
            self.initialize()

        if not texts:
            return []

        try:
            # Filter and truncate texts
            processed_texts = [text[:1000] if text else "" for text in texts]

            results = []
            for i in range(0, len(processed_texts), batch_size):
                batch = processed_texts[i:i + batch_size]
                batch_results = self.pipeline(batch)

                for result in batch_results:
                    label = result["label"].lower()
                    confidence = result["score"]

                    if "positive" in label:
                        normalized_score = confidence
                    elif "negative" in label:
                        normalized_score = -confidence
                    else:
                        normalized_score = 0.0

                    results.append({
                        "label": "positive" if normalized_score > 0 else "negative" if normalized_score < 0 else "neutral",
                        "score": confidence,
                        "normalized_score": normalized_score
                    })

            app_logger.info(f"Analyzed sentiment for {len(results)} texts")
            return results

        except Exception as e:
            app_logger.error(f"Error in batch sentiment analysis: {e}")
            return [{"label": "neutral", "score": 0.0, "normalized_score": 0.0}] * len(texts)

    def get_average_sentiment(self, texts: List[str]) -> float:
        """Calculate average sentiment score for multiple texts."""
        if not texts:
            return 0.0

        results = self.analyze_batch(texts)
        scores = [r["normalized_score"] for r in results]

        return sum(scores) / len(scores) if scores else 0.0


# Global sentiment analyzer instance
sentiment_analyzer = SentimentAnalyzer()
