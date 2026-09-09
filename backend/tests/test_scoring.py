from app.ai.severity_engine import calculate_severity
from app.ai.risk_engine import calculate_risk


def defect(confidence=0.9, width=100, height=100):
    return {"confidence": confidence, "bbox": {"width": width, "height": height}}


def test_no_detections_is_low_severity():
    result = calculate_severity([], 1000, 1000, 90)
    assert result.score == 0
    assert result.level == "low"


def test_many_large_detections_raise_severity():
    result = calculate_severity([defect(width=250, height=250) for _ in range(5)], 1000, 1000, 90)
    assert result.level in {"high", "critical"}


def test_missing_criticality_has_explicit_default():
    result = calculate_risk(50, 2, None, 80)
    assert "missing" in " ".join(result.reasons).lower()
    assert 0 <= result.score <= 100