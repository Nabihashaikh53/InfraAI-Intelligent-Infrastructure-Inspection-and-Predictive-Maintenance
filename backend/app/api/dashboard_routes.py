from fastapi import APIRouter, Depends

from app.api.auth_routes import get_current_user
from app.database.asset_repository import get_all_assets
from app.database.inspection_repository import get_inspections_by_asset
from app.database.connection import db

router = APIRouter(tags=["dashboard"])


@router.get("/api/dashboard/statistics")
async def dashboard_statistics(current_user: dict = Depends(get_current_user)):
    all_assets = await get_all_assets()

    total_inspections = 0
    high_risk_count = 0

    risk_distribution = {
        "LOW": 0,
        "MODERATE": 0,
        "HIGH": 0,
        "CRITICAL": 0,
    }

    defect_distribution = {}

    for asset in all_assets:
        inspections = await get_inspections_by_asset(asset["assetId"])

        total_inspections += len(inspections)

        for inspection in inspections:
            # Phase 8 stores risk as:
            # inspection["risk"]["category"]
            risk = inspection.get("risk") or {}
            risk_category = risk.get("category")

            if risk_category in risk_distribution:
                risk_distribution[risk_category] += 1

            if risk_category in ("HIGH", "CRITICAL"):
                high_risk_count += 1

            # Count defects for this inspection
            inspection_defects = await db.defects.find(
                {"inspectionId": inspection["_id"]}
            ).to_list(length=None)

            for defect in inspection_defects:
                defect_type = defect.get("defectType", "unknown")

                defect_distribution[defect_type] = (
                    defect_distribution.get(defect_type, 0) + 1
                )

    return {
        "totalAssets": len(all_assets),
        "totalInspections": total_inspections,
        "highRiskAssets": high_risk_count,
        "riskDistribution": risk_distribution,
        "defectDistribution": defect_distribution,
    }