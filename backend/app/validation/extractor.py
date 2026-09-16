import re
from typing import List, Dict, Any, Optional

SUBSIDIARY_PATTERNS = [
    ("Northern Coalfields Sample Ltd", r"(northern\s+coalfields|ncsl|उत्तरी\s+कोयला)"),
    ("Eastern Mining Sample Ltd", r"(eastern\s+mining|emsl|पूर्वी\s+खनन)"),
    ("Central Collieries Sample Ltd", r"(central\s+collieries|ccsl|केंद्रीय\s+कोलियरीज)"),
    ("Coal India Limited (Sample Multi-Subsidiary)", r"(coal\s+india|cil\s+subsidiaries|कोल\s+इंडिया)"),
]

MINE_PATTERNS = [
    ("Sample Mine-A", r"(sample\s+mine[- ]a|mine[- ]a)"),
    ("Sample Mine-B", r"(sample\s+mine[- ]b|mine[- ]b)"),
    ("Sample Mine-C", r"(sample\s+mine[- ]c|mine[- ]c)"),
    ("Sample Mine-D", r"(sample\s+mine[- ]d|mine[- ]d)"),
    ("Sample Mine-E", r"(sample\s+mine[- ]e|mine[- ]e)"),
    ("Sample Mine-F", r"(sample\s+mine[- ]f|mine[- ]f)"),
    ("Sample Mine-G", r"(sample\s+mine[- ]g|mine[- ]g)"),
]

DEPARTMENT_PATTERNS = [
    ("Production & Operations", r"(production\s+&\s+operations|mining\s+operations)"),
    ("Geology & Exploration", r"(geology\s+&\s+exploration|geological\s+survey)"),
    ("Safety & DGMS Compliance", r"(safety\s+&\s+dgms|mines\s+safety|safety\s+audit)"),
    ("Environment & Forestry", r"(environment\s+&\s+forestry|environmental\s+clearance)"),
    ("Corporate Affairs & Ministry Liaison", r"(corporate\s+affairs|ministry\s+liaison|parliamentary)"),
    ("Administration & Rajbhasha Cell", r"(administration|rajbhasha|csr)"),
]

def extract_entities_from_text(text: str, filename: str = "", page_no: int = 1) -> List[Dict[str, Any]]:
    """
    Extracts structured entities, keywords, and numeric figures from text with provenance.
    """
    entities = []
    text_lower = text.lower()
    fn_lower = filename.lower()
    combined = f"{filename} {text}"

    # 1. Extract Subsidiary
    for canonical_name, pattern in SUBSIDIARY_PATTERNS:
        if re.search(pattern, combined, re.IGNORECASE):
            entities.append({
                "page_no": page_no,
                "entity_type": "subsidiary",
                "entity_name": canonical_name,
                "normalized_value": canonical_name,
                "metric_value": None,
                "unit": None,
                "confidence": 1.0
            })
            break

    # 2. Extract Mine / Project
    for canonical_mine, pattern in MINE_PATTERNS:
        if re.search(pattern, combined, re.IGNORECASE):
            entities.append({
                "page_no": page_no,
                "entity_type": "mine",
                "entity_name": canonical_mine,
                "normalized_value": canonical_mine,
                "metric_value": None,
                "unit": None,
                "confidence": 1.0
            })

    # 3. Extract Year
    years_found = set(re.findall(r"\b(19\d\d|20\d\d)\b", combined))
    for yr_str in sorted(years_found, reverse=True):
        yr = int(yr_str)
        if 1990 <= yr <= 2030:
            entities.append({
                "page_no": page_no,
                "entity_type": "year",
                "entity_name": f"FY {yr}",
                "normalized_value": str(yr),
                "metric_value": float(yr),
                "unit": "Year",
                "confidence": 1.0
            })

    # 4. Extract Department
    for canonical_dept, pattern in DEPARTMENT_PATTERNS:
        if re.search(pattern, combined, re.IGNORECASE):
            entities.append({
                "page_no": page_no,
                "entity_type": "department",
                "entity_name": canonical_dept,
                "normalized_value": canonical_dept,
                "metric_value": None,
                "unit": None,
                "confidence": 1.0
            })
            break

    # 5. Extract Coal Seams & Grades
    seam_matches = re.findall(r"\b(seam\s+(?:[iIvVxX]+|[a-zA-Z0-9_-]+))\b", text, re.IGNORECASE)
    for sm in set(seam_matches):
        entities.append({
            "page_no": page_no,
            "entity_type": "coal_seam",
            "entity_name": sm.title(),
            "normalized_value": sm.upper(),
            "metric_value": None,
            "unit": None,
            "confidence": 0.95
        })

    grade_matches = re.findall(r"\b(grade\s+g\d+)\b", text, re.IGNORECASE)
    for gm in set(grade_matches):
        entities.append({
            "page_no": page_no,
            "entity_type": "coal_grade",
            "entity_name": gm.title(),
            "normalized_value": gm.upper(),
            "metric_value": None,
            "unit": None,
            "confidence": 0.95
        })

    # 6. Extract Numerical Metrics with Units
    # Metric: Coal Production (e.g. 10.50 MT, 26.30 Million Tonnes)
    prod_matches = re.findall(r"(?:production|produced|output)[^\d\n\r]{0,30}?(\d+\.?\d*)\s*(?:mt|million\s+tonnes)", text, re.IGNORECASE)
    for p_val in prod_matches:
        try:
            val = float(p_val)
            if 0.5 <= val <= 200.0:
                entities.append({
                    "page_no": page_no,
                    "entity_type": "metric",
                    "entity_name": "Coal Production",
                    "normalized_value": f"{val:.2f} MT",
                    "metric_value": val,
                    "unit": "MT",
                    "confidence": 0.95
                })
        except ValueError:
            pass

    # Metric: Overburden Removal (e.g. 34.50 MCu.M, 81.70 Million Cubic Metres)
    ob_matches = re.findall(r"(?:overburden|removal|ob)[^\d\n\r]{0,30}?(\d+\.?\d*)\s*(?:mcu\.m|million\s+cubic\s+metres|m\s*cu\.m)", text, re.IGNORECASE)
    for ob_val in ob_matches:
        try:
            val = float(ob_val)
            if 1.0 <= val <= 500.0:
                entities.append({
                    "page_no": page_no,
                    "entity_type": "metric",
                    "entity_name": "Overburden Removal",
                    "normalized_value": f"{val:.2f} MCu.M",
                    "metric_value": val,
                    "unit": "MCu.M",
                    "confidence": 0.95
                })
        except ValueError:
            pass

    # Metric: Coal Dispatch (e.g. 25.50 MT, 10.20 MT dispatch)
    disp_matches = re.findall(r"(?:dispatch|dispatched)[^\d\n\r]{0,30}?(\d+\.?\d*)\s*(?:mt|million\s+tonnes)", text, re.IGNORECASE)
    for d_val in disp_matches:
        try:
            val = float(d_val)
            if 0.5 <= val <= 200.0:
                entities.append({
                    "page_no": page_no,
                    "entity_type": "metric",
                    "entity_name": "Coal Dispatch",
                    "normalized_value": f"{val:.2f} MT",
                    "metric_value": val,
                    "unit": "MT",
                    "confidence": 0.95
                })
        except ValueError:
            pass

    # Metric: Safety Incidents / Slips
    safety_matches = re.findall(r"(\d+)\s*(?:minor\s+slope\s+slump|safety\s+incidents|incidents|violations)", text, re.IGNORECASE)
    for s_val in safety_matches:
        try:
            val = float(s_val)
            entities.append({
                "page_no": page_no,
                "entity_type": "metric",
                "entity_name": "Safety Incidents",
                "normalized_value": f"{int(val)} incidents",
                "metric_value": val,
                "unit": "incidents",
                "confidence": 0.90
            })
        except ValueError:
            pass

    # Metric: Gross Calorific Value (GCV in kcal/kg)
    gcv_matches = re.findall(r"(\d{3,5})\s*(?:kcal/kg|gcv)", text, re.IGNORECASE)
    for g_val in gcv_matches:
        try:
            val = float(g_val)
            if 2000 <= val <= 8000:
                entities.append({
                    "page_no": page_no,
                    "entity_type": "metric",
                    "entity_name": "Gross Calorific Value",
                    "normalized_value": f"{int(val)} kcal/kg",
                    "metric_value": val,
                    "unit": "kcal/kg",
                    "confidence": 0.95
                })
        except ValueError:
            pass

    # Metric: CSR Outlay (Rs. Crore)
    csr_matches = re.findall(r"(?:rs\.?|inr|करोड़)\s*(\d+\.?\d*)\s*(?:crore|cr|करोड़)", text, re.IGNORECASE)
    for c_val in csr_matches:
        try:
            val = float(c_val)
            if 1.0 <= val <= 1000.0:
                entities.append({
                    "page_no": page_no,
                    "entity_type": "metric",
                    "entity_name": "CSR Expenditure",
                    "normalized_value": f"Rs. {val:.2f} Crore",
                    "metric_value": val,
                    "unit": "Rs. Crore",
                    "confidence": 0.95
                })
        except ValueError:
            pass

    return entities
