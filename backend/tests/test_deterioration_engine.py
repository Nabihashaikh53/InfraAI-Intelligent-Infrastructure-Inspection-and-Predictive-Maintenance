from app.services.deterioration_engine import calculate_deterioration


def test_no_previous_inspection_is_insufficient_data():
    result = calculate_deterioration(current_risk=50, previous_risk=None)
    assert result["status"] == "insufficient_data"


def test_stable_when_small_change():
    result = calculate_deterioration(current_risk=52, previous_risk=50)
    assert result["status"] == "stable"


def test_rapid_when_large_increase():
    result = calculate_deterioration(current_risk=90, previous_risk=20)
    assert result["status"] == "rapid"


def test_improving_when_risk_drops():
    result = calculate_deterioration(current_risk=20, previous_risk=50)
    assert result["status"] == "improving"