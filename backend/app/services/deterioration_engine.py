"""
 feature/llm-pdf-email
Deterioration engine — compares the current inspection's risk/severity

Deterioration engine ΓÇö compares the current inspection's risk/severity
main
against the asset's most recent prior inspection.
Per spec Section 60: with fewer than 2 inspections, explicitly report
insufficient historical data rather than claiming a trend.
"""

DETERIORATION_STATES = ["insufficient_data", "stable", "improving",
                          "slight", "moderate", "significant", "rapid"]


def calculate_deterioration(current_risk: int, previous_risk: int | None) -> dict:
    if previous_risk is None:
        return {
            "status": "insufficient_data",
            "riskChange": None,
            "explanation": "Not enough historical inspections exist for this asset to assess deterioration.",
        }

    change = current_risk - previous_risk

    if change <= -10:
        status = "improving"
    elif change <= 5:
        status = "stable"
    elif change <= 15:
        status = "slight"
    elif change <= 30:
        status = "moderate"
    elif change <= 50:
        status = "significant"
    else:
        status = "rapid"

    return {
        "status": status,
        "riskChange": change,
        "explanation": f"Risk score changed by {change:+d} points since the previous inspection "
 feature/llm-pdf-email
                        f"({previous_risk} → {current_risk}).",
    }

                        f"({previous_risk} ΓåÆ {current_risk}).",
    }
 main
