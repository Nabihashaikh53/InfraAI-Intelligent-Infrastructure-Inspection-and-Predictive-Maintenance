from app.services.severity_engine import calculate_severity


def test_small_low_confidence_is_minor():
    box = {"x1": 0, "y1": 0, "x2": 20, "y2": 20}  # area 400
    result = calculate_severity("concrete-crack", 0.65, box)
    assert result == "minor"


def test_large_high_confidence_is_critical():
    box = {"x1": 0, "y1": 0, "x2": 300, "y2": 300}  # area 90000
    result = calculate_severity("concrete-crack", 0.95, box)
    assert result == "critical"


def test_moderate_size_is_moderate():
    box = {"x1": 0, "y1": 0, "x2": 90, "y2": 90}  # area 8100
    result = calculate_severity("concrete-crack", 0.65, box)
    assert result == "moderate"