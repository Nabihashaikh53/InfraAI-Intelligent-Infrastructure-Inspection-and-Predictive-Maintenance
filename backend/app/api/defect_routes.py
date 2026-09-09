from fastapi import APIRouter, Depends, HTTPException

from app.api.auth_routes import get_current_user

from app.ai.defect_detection import detect_defects

from app.database.inspection_repository import (
    get_inspection_by_id,
    update_inspection,
)

from app.database.defect_repository import (
    create_defects,
    get_defects_by_inspection,
    delete_defects_by_inspection,
)

from app.services.severity_engine import calculate_severity
from app.services.risk_engine import calculate_risk, risk_explanation

from app.schemas.defect_schema import (
    BoundingBox,
    DefectOut,
    AnalysisOut,
)

router = APIRouter(tags=["defects"])


def _to_defect_out(doc: dict) -> DefectOut:
    return DefectOut(
        id=str(doc["_id"]),
        inspectionId=doc["inspectionId"],
        defectType=doc["defectType"],
        confidence=doc["confidence"],
        boundingBox=BoundingBox(**doc["boundingBox"]),
        severity=doc.get("severity"),
        detectedAt=doc["detectedAt"],
    )


@router.post(
    "/api/inspections/{inspection_id}/analyze",
    response_model=AnalysisOut,
)
async def analyze_inspection(
    inspection_id: str,
    current_user: dict = Depends(get_current_user),
):
    inspection = await get_inspection_by_id(inspection_id)

    if inspection is None:
        raise HTTPException(
            status_code=404,
            detail="Inspection not found",
        )

    try:
        detections = detect_defects(
            inspection["imageUrl"]
        )

    except FileNotFoundError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Defect detection failed",
        )

    # Remove previous analysis results before
    # storing fresh detection results.
    await delete_defects_by_inspection(inspection_id)

    defects_to_store = []

    for detection in detections:

        defect_type = detection["defectType"]

        # Convert the long Roboflow class name
        # into a cleaner application value.
        if "crack" in defect_type.lower():
            defect_type = "crack"

        defect_data = {
            "inspectionId": inspection_id,
            "defectType": defect_type,
            "confidence": detection["confidence"],
            "boundingBox": detection["boundingBox"],
        }

        defect_data["severity"] = calculate_severity(
            detection["type"],
            detection["confidence"],
            detection["boundingBox"],
        )

        defects_to_store.append(defect_data)

    created_defects = await create_defects(
        defects_to_store
    )

    risk_result = calculate_risk(created_defects)

    await update_inspection(
        inspection_id,
        {
            "overallRiskScore": risk_result["score"],
            "riskLevel": risk_result["category"],
            "riskBreakdown": risk_result["breakdown"],
            "riskExplanation": risk_explanation(
                risk_result,
                len(created_defects),
            ),
        },
    )

    return AnalysisOut(
        inspectionId=inspection_id,
        totalDefects=len(created_defects),
        defects=[
            _to_defect_out(defect)
            for defect in created_defects
        ],
    )


@router.get(
    "/api/inspections/{inspection_id}/defects",
    response_model=list[DefectOut],
)
async def get_inspection_defects(
    inspection_id: str,
    current_user: dict = Depends(get_current_user),
):
    inspection = await get_inspection_by_id(inspection_id)

    if inspection is None:
        raise HTTPException(
            status_code=404,
            detail="Inspection not found",
        )

    defects = await get_defects_by_inspection(
        inspection_id
    )

    return [
        _to_defect_out(defect)
        for defect in defects
    ]