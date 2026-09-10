from app.services.maintenance_engine import calculate_priority


def test_high_risk_is_p1():
    result = calculate_priority(risk_score=85, deterioration_status="stable", defect_count=1)
    assert result["priority"] == "P1"


def test_low_risk_few_defects_is_p4():
    result = calculate_priority(risk_score=10, deterioration_status="stable", defect_count=1)
    assert result["priority"] == "P4"


def test_rapid_deterioration_forces_p1_even_with_low_score():
    result = calculate_priority(risk_score=25, deterioration_status="rapid", defect_count=1)
    assert result["priority"] == "P1"