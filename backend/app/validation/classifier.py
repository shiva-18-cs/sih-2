import os
import re
from typing import Dict, Any

def classify_document(filename: str, full_text: str = "") -> str:
    """
    Classifies documents into the 7 standard PDR document types:
    - Production
    - Geological
    - Mining
    - Inspection
    - Administrative
    - Parliamentary
    - Project
    """
    fn_lower = filename.lower()
    text_lower = full_text.lower() if full_text else ""
    combined = f"{fn_lower} {text_lower[:1000]}"

    if any(k in combined for k in ["parliamentary", "starred question", "lok sabha", "rajya sabha", "ministry liaison"]):
        return "Parliamentary"
    elif any(k in combined for k in ["geological", "borehole", "core drilling", "strata log", "seam thickness", "reserve estimate", "gcv"]):
        return "Geological"
    elif any(k in combined for k in ["inspection", "dgms", "safety audit", "ventilation", "environmental clearance", "air quality", "violation notice", "slope stability"]):
        return "Inspection"
    elif any(k in combined for k in ["bilingual", "csr", "rajbhasha", "administrative", "official language"]):
        return "Administrative"
    elif any(k in combined for k in ["production", "dispatch", "overburden", "tonnage", "output per manshift", "oms", "dragline", "master"]):
        return "Production"
    elif any(k in combined for k in ["project", "feasibility", "expansion", "dpr"]):
        return "Project"
    elif any(k in combined for k in ["mining", "excavation", "dragline", "surface miner"]):
        return "Mining"
        
    return "Production"
