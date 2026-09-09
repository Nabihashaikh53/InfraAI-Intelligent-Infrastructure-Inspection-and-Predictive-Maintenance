"""
Risk assessment engine — hybrid rule-based scoring per spec Section 13/38.
Score is 0-100, broken into explainable components. Weights are configurable
constants below, not hardcoded magic numbers scattered through logic.
"""

SEVERITY_WEIGHT = {"minor": 10, "moderate": 30, "serious": 60, "critical": 90}

RECURRENCE_WEIGHT_PER_DEFECT = 3
RECURRENCE_CAP = 15

DETERIORATION_BONUS = {
    "significant": 15,
    "rapid": 20,
}

RISK_THRESHOLDS = {
    "CRITICAL": 80,
    "HIGH": 55,
    "MODERATE": 30,
}


def calculate_risk(defects: list[dict], deterioration_status: str | None = None) -> dict:
    if not defects:
        return {
            "score": 0,
            "category": "LOW",
            "breakdown": {
                "severityContribution": 0,
                "recurrenceContribution": 0,
                "deteriorationContribution": 0,
            },
        }

    severity_scores = [SEVERITY_WEIGHT.get(d.get("severity", "minor"), 10) for d in defects]
    avg_severity = sum(severity_scores) / len(severity_scores)

    recurrence_bonus = min(len(defects) * RECURRENCE_WEIGHT_PER_DEFECT, RECURRENCE_CAP)
    deterioration_bonus = DETERIORATION_BONUS.get(deterioration_status, 0)

    score = min(100, round(avg_severity + recurrence_bonus + deterioration_bonus))

    if score >= RISK_THRESHOLDS["CRITICAL"]:
        category = "CRITICAL"
    elif score >= RISK_THRESHOLDS["HIGH"]:
        category = "HIGH"
    elif score >= RISK_THRESHOLDS["MODERATE"]:
        category = "MODERATE"
    else:
        category = "LOW"

    return {
        "score": score,
        "category": category,
        "breakdown": {
            "severityContribution": round(avg_severity),
            "recurrenceContribution": recurrence_bonus,
            "deteriorationContribution": deterioration_bonus,
        },
    }


def risk_explanation(risk_result: dict, defect_count: int) -> str:
    """Human-readable explanation per spec Section 14."""
    return (
        f"Classified as {risk_result['category']} risk (score {risk_result['score']}/100), "
        f"based on {defect_count} detected defect(s) with an average severity contribution of "
        f"{risk_result['breakdown']['severityContribution']} points."
    )