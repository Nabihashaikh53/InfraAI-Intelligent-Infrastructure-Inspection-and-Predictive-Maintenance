from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone

from app.api.auth_routes import get_current_user
from app.database.inspection_repository import get_inspection_by_id
from app.database.defect_repository import get_defects_by_inspection
from app.database.asset_repository import get_asset_by_id
from app.services.explanation_engine import generate_summary, generate_recommendations

router = APIRouter(tags=["reports"])


@router.get("/api/reports/{inspection_id}")
async def get_report(inspection_id: str, current_user: dict = Depends(get_current_user)):
    inspection = await get_inspection_by_id(inspection_id)
    if inspection is None:
        raise HTTPException(status_code=404, detail="Inspection not found")

    asset = await get_asset_by_id(inspection["assetId"])
    defects = await get_defects_by_inspection(inspection_id)

    return {
        "header": {
            "inspectionId": inspection.get("inspectionId"),
            "generatedAt": datetime.now(timezone.utc).isoformat(),
        },
        "asset": {
            "assetId": asset.get("assetId") if asset else None,
            "name": asset.get("name") if asset else None,
            "type": asset.get("type") if asset else None,
        },
        "inspection": {
            "date": inspection.get("inspectionDate"),
            "imageQuality": inspection.get("imageQuality"),
        },
        "defects": [
            {
                "type": d["type"],
                "confidence": d["confidence"],
                "severity": d.get("severity"),
                "boundingBox": d["boundingBox"],
            }
            for d in defects
        ],
        "overallAssessment": {
            "riskScore": inspection.get("overallRiskScore"),
            "riskLevel": inspection.get("riskLevel"),
            "deteriorationStatus": inspection.get("deteriorationStatus"),
        },
        "maintenancePriority": {
            "priority": inspection.get("maintenancePriority"),
            "label": inspection.get("maintenancePriorityLabel"),
            "reason": inspection.get("maintenancePriorityReason"),
        },
        "aiSummary": generate_summary(inspection, defects),
        "recommendations": generate_recommendations(defects),
    }