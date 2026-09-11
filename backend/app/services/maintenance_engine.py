"""
Maintenance priority engine per spec Section 18.
P1 Emergency / P2 High / P3 Medium / P4 Low.
"""


def calculate_priority(risk_score: int, deterioration_status: str, defect_count: int) -> dict:
    if risk_score >= 80 or deterioration_status == "rapid":
        priority = "P1"
        label = "Emergency"
    elif risk_score >= 55 or deterioration_status == "significant":
        priority = "P2"
        label = "High"
    elif risk_score >= 30 or defect_count >= 3:
        priority = "P3"
        label = "Medium"
    else:
        priority = "P4"
        label = "Low"

    reason_parts = [f"Risk score {risk_score}/100"]
    if deterioration_status in ("significant", "rapid"):
        reason_parts.append(f"{deterioration_status} deterioration detected")
    if defect_count >= 3:
        reason_parts.append(f"{defect_count} defects present")

    return {
        "priority": priority,
        "label": label,
        "reason": " + ".join(reason_parts),
    }
