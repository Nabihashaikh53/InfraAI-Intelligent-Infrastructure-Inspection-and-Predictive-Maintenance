"""
Severity assessment engine.
Per spec, severity should not depend on confidence alone — it factors in
estimated defect size (via bounding box area) and detection confidence together.
Thresholds are documented here and intended to be tuned as real inspection
data accumulates; they are not claimed to be empirically validated.
"""

SEVERITY_LEVELS = ["minor", "moderate", "serious", "critical"]

# Bounding box area thresholds (in pixels^2) — tune based on typical image resolution.
AREA_MODERATE = 5000
AREA_SERIOUS = 20000
AREA_CRITICAL = 40000

CONFIDENCE_HIGH = 0.85


def calculate_severity(defect_type: str, confidence: float, bounding_box: dict) -> str:
    box_area = abs(bounding_box["x2"] - bounding_box["x1"]) * abs(bounding_box["y2"] - bounding_box["y1"])

    if box_area >= AREA_CRITICAL and confidence >= CONFIDENCE_HIGH:
        return "critical"
    elif box_area >= AREA_SERIOUS or confidence >= CONFIDENCE_HIGH:
        return "serious"
    elif box_area >= AREA_MODERATE:
        return "moderate"
    return "minor"


def severity_reason(severity: str, confidence: float, box_area: float) -> str:
    """Human-readable justification, used in API responses and later in reports."""
    return (
        f"Classified as {severity} based on an estimated defect area of "
        f"{int(box_area)}px² and a detection confidence of {confidence:.0%}."
    )