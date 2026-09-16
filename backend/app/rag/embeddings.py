"""
Embedding service for RAG pipeline.
Uses sentence-transformers (all-MiniLM-L6-v2) to generate 384-d embeddings.
Embeddings are stored as JSON lists in DocumentChunk.embedding.
Cosine similarity is computed in Python (pgvector fallback when postgres is available).
"""
import json
import logging
import math
from typing import List, Optional

logger = logging.getLogger(__name__)

# Lazy singleton for the embedding model
_model = None

def _get_model():
    global _model
    if _model is None:
        try:
            from sentence_transformers import SentenceTransformer
            logger.info("Loading sentence-transformers model all-MiniLM-L6-v2 ...")
            _model = SentenceTransformer("all-MiniLM-L6-v2")
            logger.info("Embedding model loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load sentence-transformers: {e}")
            _model = None
    return _model


def embed_texts(texts: List[str]) -> List[Optional[List[float]]]:
    """
    Returns a list of 384-d float vectors, one per text.
    Returns None for a text if the model is unavailable.
    """
    model = _get_model()
    if model is None:
        return [None] * len(texts)
    try:
        vectors = model.encode(texts, batch_size=32, show_progress_bar=False, convert_to_numpy=True)
        return [v.tolist() for v in vectors]
    except Exception as e:
        logger.error(f"Embedding error: {e}")
        return [None] * len(texts)


def embed_query(query: str) -> Optional[List[float]]:
    """Embed a single query string. Returns None on failure."""
    results = embed_texts([query])
    return results[0] if results else None


def cosine_similarity(a: List[float], b: List[float]) -> float:
    """Pure-python cosine similarity between two vectors."""
    if not a or not b or len(a) != len(b):
        return 0.0
    dot = sum(x * y for x, y in zip(a, b))
    mag_a = math.sqrt(sum(x * x for x in a))
    mag_b = math.sqrt(sum(x * x for x in b))
    if mag_a == 0 or mag_b == 0:
        return 0.0
    return dot / (mag_a * mag_b)
