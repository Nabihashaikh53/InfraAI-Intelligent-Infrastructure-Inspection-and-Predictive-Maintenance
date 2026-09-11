from app.services.risk_engine import calculate_risk


def test_no_defects_is_zero_risk():
    result = calculate_risk([])
    assert result["score"] == 0
    assert result["category"] == "LOW"


def test_single_critical_defect_is_high_risk():
    defects = [{"severity": "critical"}]
    result = calculate_risk(defects)
    assert result["score"] >= 55


def test_multiple_defects_add_recurrence_bonus():
    defects = [{"severity": "minor"}] * 5
    result = calculate_risk(defects)
    assert result["breakdown"]["recurrenceContribution"] > 0


def test_rapid_deterioration_increases_score():
    defects = [{"severity": "moderate"}]
    without = calculate_risk(defects, deterioration_status=None)
    with_rapid = calculate_risk(defects, deterioration_status="rapid")
    assert with_rapid["score"] > without["score"]