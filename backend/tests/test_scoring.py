from app.services.severity_engine import calculate_severity
from app.services.risk_engine import calculate_risk


def defect(
    defect_type="crack",
    confidence=0.9,
    x1=0,
    y1=0,
    x2=100,
    y2=100,
):
    return {
        "defectType": defect_type,
        "confidence": confidence,
        "boundingBox": {
            "x1": x1,
            "y1": y1,
            "x2": x2,
            "y2": y2,
        },
    }


def test_no_detections_is_low_severity():
    result = calculate_risk([])

    assert result["score"] == 0
    assert result["category"] == "LOW"


def test_many_large_detections_raise_severity():
    defects = [
        {
            **defect(
                confidence=0.9,
                x2=250,
                y2=250,
            ),
            "severity": "critical",
        }
        for _ in range(5)
    ]

    result = calculate_risk(defects)

    assert result["category"] in {"HIGH", "CRITICAL"}
    assert 0 <= result["score"] <= 100


def test_missing_criticality_has_explicit_default():
    defects = [
        {
            "defectType": "crack",
            "confidence": 0.8,
            "boundingBox": {
                "x1": 0,
                "y1": 0,
                "x2": 100,
                "y2": 100,
            },
        }
    ]

    result = calculate_risk(defects)

    assert result["breakdown"]["severityContribution"] == 10
    assert 0 <= result["score"] <= 100


def test_small_low_confidence_is_minor():
    result = calculate_severity(
        "crack",
        0.5,
        {
            "x1": 0,
            "y1": 0,
            "x2": 50,
            "y2": 50,
        },
    )

    assert result == "minor"


def test_large_high_confidence_is_critical():
    result = calculate_severity(
        "crack",
        0.9,
        {
            "x1": 0,
            "y1": 0,
            "x2": 250,
            "y2": 250,
        },
    )

    assert result == "critical"


def test_moderate_size_is_moderate():
    result = calculate_severity(
        "crack",
        0.5,
        {
            "x1": 0,
            "y1": 0,
            "x2": 80,
            "y2": 80,
        },
    )

    assert result == "moderate"