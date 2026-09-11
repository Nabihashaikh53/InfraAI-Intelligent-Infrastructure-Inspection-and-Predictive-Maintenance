"""
Generates human-readable explanations from structured inspection data.
 feature/llm-pdf-email
Template-based fallback per spec Section 42 — functions correctly with

Template-based fallback per spec Section 42 ΓÇö functions correctly with
 main
zero external API dependency. A real LLM call can be added later behind
the same function signature without changing callers.
"""

RECOMMENDATIONS = {
    "concrete-crack": [
        "Conduct a detailed structural inspection of the affected area.",
        "Monitor crack progression at the next scheduled inspection.",
        "Schedule repair based on assessed severity.",
    ],
}


def generate_summary(inspection: dict, defects: list[dict]) -> str:
    if not defects:
        return "No supported visible defects were detected in this inspection. Manual review is recommended if damage is suspected."

    defect_types = ", ".join(sorted(set(d["type"] for d in defects)))
    return (
        f"This inspection identified {len(defects)} defect(s) ({defect_types}) with an overall risk "
        f"level of {inspection.get('riskLevel', 'unknown')} "
        f"({inspection.get('overallRiskScore', 0)}/100). "
        f"{inspection.get('deteriorationExplanation', '')} "
        f"Maintenance priority: {inspection.get('maintenancePriorityLabel', 'unassessed')} "
 feature/llm-pdf-email
        f"— {inspection.get('maintenancePriorityReason', '')}."

        f"ΓÇö {inspection.get('maintenancePriorityReason', '')}."
 main
    )


def generate_recommendations(defects: list[dict]) -> list[str]:
    seen_types = set(d["type"] for d in defects)
    recs = []
    for t in seen_types:
        recs.extend(RECOMMENDATIONS.get(t, [f"Inspect and assess the {t} defect further."]))
feature/llm-pdf-email
    return recs

    return recs
 main
