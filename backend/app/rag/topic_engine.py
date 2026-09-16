"""
Topic Engine: Extracts term frequencies from document chunks for word cloud visualization.
Uses simple TF-IDF-inspired scoring with domain-specific stop words.
"""
import re
import logging
from collections import Counter
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.document import DocumentChunk, Document

logger = logging.getLogger(__name__)

# Domain-specific stop words (extend standard English stops)
STOP_WORDS = {
    "the", "a", "an", "is", "are", "was", "were", "of", "in", "at", "to",
    "for", "and", "or", "but", "it", "its", "this", "that", "with", "from",
    "by", "as", "on", "be", "has", "have", "had", "not", "been", "will",
    "would", "could", "should", "may", "shall", "which", "who", "what",
    "how", "when", "where", "than", "per", "during", "into", "through",
    "report", "annual", "total", "also", "year", "data", "table", "figure",
    "said", "also", "such", "other", "more", "over", "under", "about",
    "above", "below", "between", "within", "without", "along",
    # Numeric noise
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
}

# Mining/Geological domain terms to boost
DOMAIN_BOOST = {
    "coal": 2.0, "production": 2.0, "mine": 1.8, "mining": 1.8,
    "geological": 1.8, "geological": 1.8, "seam": 2.0, "reserve": 1.8,
    "overburden": 2.0, "striping": 1.5, "excavation": 1.5,
    "safety": 1.8, "accident": 1.8, "fatality": 1.8, "injury": 1.5,
    "subsidiary": 1.5, "ncsl": 2.0, "emsl": 2.0, "ccsl": 2.0,
    "cmpdi": 2.0, "cil": 1.8, "opencast": 1.8, "underground": 1.8,
    "dragline": 1.8, "shovel": 1.5, "explosive": 1.5, "blasting": 1.5,
    "revenue": 1.5, "environmental": 1.5, "compliance": 1.5,
    "rehabilitation": 1.5, "monitoring": 1.3, "quality": 1.3,
    "grade": 1.3, "drilling": 1.8, "borehole": 1.8, "core": 1.5,
    "washery": 1.8, "dispatch": 1.5, "loading": 1.3, "transport": 1.3,
}


def get_topic_summary(
    db: Session,
    subsidiary: Optional[str] = None,
    year: Optional[int] = None,
    max_words: int = 60,
) -> Dict[str, Any]:
    """
    Compute word frequencies from document chunks for a word cloud.
    Returns list of {word, count, weight} dicts.
    """
    q = (
        db.query(DocumentChunk, Document)
        .join(Document, DocumentChunk.document_id == Document.id)
    )
    if subsidiary:
        q = q.filter(Document.subsidiary == subsidiary)
    if year:
        q = q.filter(Document.report_year == year)

    rows = q.limit(500).all()

    if not rows:
        return {"words": [], "total_docs": 0, "total_chunks": 0}

    word_counts: Counter = Counter()
    doc_ids = set()

    for chunk, doc in rows:
        doc_ids.add(doc.id)
        text = chunk.chunk_text.lower()
        # Extract words (alpha only, length 3-20)
        words = re.findall(r'\b[a-z]{3,20}\b', text)
        for w in words:
            if w not in STOP_WORDS:
                boost = DOMAIN_BOOST.get(w, 1.0)
                word_counts[w] += boost

    # Build output with top words
    top_words = word_counts.most_common(max_words)
    max_count = top_words[0][1] if top_words else 1

    result = [
        {
            "word": word,
            "count": round(count, 2),
            "weight": round(count / max_count, 4),  # normalized 0-1
        }
        for word, count in top_words
    ]

    # Also get document-type breakdown
    type_counts: Counter = Counter()
    for _, doc in rows:
        type_counts[doc.document_type or "Unknown"] += 1

    return {
        "words": result,
        "total_docs": len(doc_ids),
        "total_chunks": len(rows),
        "document_type_breakdown": dict(type_counts),
        "filters": {"subsidiary": subsidiary, "year": year},
    }
