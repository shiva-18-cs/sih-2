"""
Source-Grounded RAG Generator.
Strictly grounds answers in retrieved document chunks.
No fabrication - if evidence is insufficient, returns a clear "Insufficient Evidence" response.
"""
import re
import logging
import time
from typing import List, Dict, Any, Optional, Tuple

logger = logging.getLogger(__name__)

# Hallucination guard: minimum evidence chunks required for a confident answer
MIN_EVIDENCE_CHUNKS = 1
CONFIDENCE_THRESHOLD = 0.20


# Domain keywords that definitely do not exist in the CIL/CMPDI coal repository
OUT_OF_DOMAIN_KEYWORDS = {
    "uranium", "copper", "enrichment", "nuclear", "crude", "petroleum", "bauxite", 
    "zinc", "gold", "silver", "diamond", "aluminum", "aluminium", "lithium"
}

GENERIC_STOP_WORDS = {
    "the", "a", "an", "is", "are", "was", "were", "of", "in", "at", "to", "for", "and", 
    "or", "what", "how", "how much", "how many", "which", "where", "when", "who", "did", 
    "does", "total", "achieved", "recorded", "reported", "mine", "sample", "limited", "ltd",
    "subsidiary", "according", "during", "between", "year", "fy", "coalfields"
}

def generate_grounded_answer(
    query: str,
    retrieved_chunks: List[Dict[str, Any]],
) -> Tuple[str, List[Dict[str, Any]], bool]:
    """
    Generate a source-grounded answer from retrieved chunks.
    
    Returns:
        (answer_text, used_sources, is_insufficient_evidence)
    """
    query_lower = query.lower()
    
    # 1. Negative anti-hallucination check: out-of-domain topics
    for kw in OUT_OF_DOMAIN_KEYWORDS:
        if kw in query_lower:
            return _insufficient_evidence_response(query), [], True
            
    if not retrieved_chunks:
        return _insufficient_evidence_response(query), [], True

    # 2. Extract substantive content words from query
    query_tokens = [w.strip("?,.:;\"'") for w in query_lower.split()]
    substantive_tokens = [w for w in query_tokens if len(w) > 3 and w not in GENERIC_STOP_WORDS]
    
    # Check if substantive tokens have any match in the retrieved chunks
    all_chunks_text = " ".join(c["chunk_text"].lower() for c in retrieved_chunks)
    if substantive_tokens:
        matched_tokens = [t for t in substantive_tokens if t in all_chunks_text]
        if not matched_tokens:
            return _insufficient_evidence_response(query), [], True

    # Filter to chunks with good overlap or similarity
    relevant = [c for c in retrieved_chunks if c.get("similarity", 0) >= CONFIDENCE_THRESHOLD]
    if not relevant:
        relevant = retrieved_chunks[:3]

    # Build answer using deterministic extraction from chunks
    answer, sources = _extract_and_synthesize(query, relevant)
    if not sources:
        return _insufficient_evidence_response(query), [], True
        
    return answer, sources, False


def _extract_and_synthesize(
    query: str,
    chunks: List[Dict[str, Any]]
) -> Tuple[str, List[Dict[str, Any]]]:
    """
    Rule-based extraction + synthesis from retrieved chunks.
    Identifies numbers, key metrics, and statements relevant to the query.
    """
    query_lower = query.lower()
    sources_used = []
    key_facts = []

    # Detect query intent
    is_production = any(kw in query_lower for kw in ["production", "output", "coal", "mt", "million", "tonne"])
    is_geological = any(kw in query_lower for kw in ["reserve", "resource", "seam", "drill", "bore", "geological"])
    is_safety = any(kw in query_lower for kw in ["accident", "fatality", "injury", "safety", "dgms"])
    is_comparison = any(kw in query_lower for kw in ["compare", "versus", "vs", "difference", "trend"])
    is_financial = any(kw in query_lower for kw in ["revenue", "cost", "expenditure", "profit", "financial"])

    for i, chunk in enumerate(chunks[:6]):
        text = chunk["chunk_text"]
        doc_name = chunk["document_name"]
        page = chunk["page_no"]
        sub = chunk.get("subsidiary", "Unknown")
        year = chunk.get("year", "Unknown")

        # Extract numeric facts matching query keywords
        extracted = _extract_relevant_sentences(text, query_lower)
        if extracted:
            key_facts.append({
                "source_idx": i + 1,
                "doc": doc_name,
                "page": page,
                "subsidiary": sub,
                "year": year,
                "facts": extracted,
                "similarity": chunk["similarity"]
            })
            sources_used.append({
                "document_name": doc_name,
                "page_no": page,
                "snippet_text": extracted[0] if extracted else text[:200],
                "similarity_score": chunk["similarity"],
                "metric_tag": _detect_metric_tag(extracted, is_production, is_geological, is_safety),
            })

    if not key_facts:
        # Use top chunks directly
        for i, chunk in enumerate(chunks[:3]):
            sources_used.append({
                "document_name": chunk["document_name"],
                "page_no": chunk["page_no"],
                "snippet_text": chunk["chunk_text"][:300],
                "similarity_score": chunk["similarity"],
                "metric_tag": "General",
            })
        answer = _compose_general_answer(query, chunks[:3])
        return answer, sources_used

    answer = _compose_structured_answer(query, key_facts, is_production, is_geological, is_safety, is_comparison)
    return answer, sources_used


def _extract_relevant_sentences(text: str, query_lower: str) -> List[str]:
    """Extract sentences from text that are most relevant to the query."""
    # Split into sentences
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    query_words = set(query_lower.split()) - {"the", "a", "an", "is", "are", "was", "were", "of", "in", "at", "to", "for", "and", "or"}
    
    scored = []
    for s in sentences:
        s = s.strip()
        if len(s) < 20:
            continue
        s_lower = s.lower()
        overlap = sum(1 for w in query_words if w in s_lower)
        has_number = bool(re.search(r'\d+\.?\d*', s))
        score = overlap + (0.5 if has_number else 0)
        if score > 0:
            scored.append((score, s))
    
    scored.sort(reverse=True)
    return [s for _, s in scored[:4]]


def _detect_metric_tag(facts: List[str], is_prod: bool, is_geo: bool, is_safety: bool) -> str:
    joined = " ".join(facts).lower()
    if is_prod or any(kw in joined for kw in ["mt", "tonne", "production", "output"]):
        return "Production"
    if is_geo or any(kw in joined for kw in ["reserve", "seam", "resource"]):
        return "Geological"
    if is_safety or any(kw in joined for kw in ["accident", "fatality", "safety"]):
        return "Safety"
    return "General"


def _compose_structured_answer(
    query: str,
    key_facts: List[Dict],
    is_production: bool,
    is_geological: bool,
    is_safety: bool,
    is_comparison: bool,
) -> str:
    lines = [f"**Answer based on {len(key_facts)} source document(s):**\n"]

    for fact_group in key_facts:
        sub = fact_group["subsidiary"] or "Unknown Subsidiary"
        year = fact_group["year"] or "Unknown Year"
        doc = fact_group["doc"]
        pg = fact_group["page"]
        lines.append(f"📄 **Source:** {doc} (Page {pg}) | {sub} | {year}")
        for fact in fact_group["facts"][:3]:
            lines.append(f"  • {fact}")
        lines.append("")

    lines.append(
        f"*All information above is sourced directly from the indexed CMPDI/CIL documents. "
        f"Confidence scores range from {min(f['similarity'] for f in key_facts):.2f} to "
        f"{max(f['similarity'] for f in key_facts):.2f}.*"
    )
    return "\n".join(lines)


def _compose_general_answer(query: str, chunks: List[Dict]) -> str:
    lines = [f"**Relevant information found in {len(chunks)} document(s):**\n"]
    for i, chunk in enumerate(chunks):
        lines.append(f"📄 **[{i+1}] {chunk['document_name']}** (Page {chunk['page_no']})")
        lines.append(chunk["chunk_text"][:400])
        lines.append("")
    lines.append("*This response is grounded in the retrieved document chunks above.*")
    return "\n".join(lines)


def _insufficient_evidence_response(query: str) -> str:
    return (
        f"**Insufficient Evidence**\n\n"
        f"No sufficiently relevant documents were found for: *\"{query}\"*\n\n"
        f"Possible reasons:\n"
        f"  • The query refers to data not yet ingested into the knowledge base.\n"
        f"  • Try refining your query with specific subsidiary names, years, or metric types.\n"
        f"  • Ingest additional reports via the Document Ingestion module.\n\n"
        f"*This system does not generate answers without source evidence to avoid hallucination.*"
    )
