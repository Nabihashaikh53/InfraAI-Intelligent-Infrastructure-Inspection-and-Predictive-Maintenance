from fastapi import APIRouter, Depends
from app.api.auth_routes import get_current_user
from app.database.asset_repository import get_all_assets
from app.database.inspection_repository import get_inspections_by_asset

router = APIRouter(tags=["dashboard"])


@router.get("/api/dashboard/statistics")
async def dashboard_statistics(current_user: dict = Depends(get_current_user)):
    all_assets = await get_all_assets()
    total_inspections = 0
    high_risk_count = 0
    total_defects = 0

    for asset in all_assets:
        inspections = await get_inspections_by_asset(asset["assetId"])
        total_inspections += len(inspections)
        for inspection in inspections:
            if inspection.get("riskLevel") in ("HIGH", "CRITICAL"):
                high_risk_count += 1

    return {
        "totalAssets": len(all_assets),
        "totalInspections": total_inspections,
        "highRiskAssets": high_risk_count,
    }
from app.database.inspection_repository import get_inspections_by_asset


@router.get("/api/maintenance/priorities")
async def maintenance_priorities(current_user: dict = Depends(get_current_user)):
    all_assets = await get_all_assets()
    queue = []
    for asset in all_assets:
        inspections = await get_inspections_by_asset(asset["assetId"])
        analyzed = [i for i in inspections if i.get("maintenancePriority")]
        if analyzed:
            latest = analyzed[0]
            queue.append({
                "assetId": asset["assetId"],
                "assetName": asset["name"],
                "priority": latest["maintenancePriority"],
                "priorityLabel": latest.get("maintenancePriorityLabel"),
                "reason": latest.get("maintenancePriorityReason"),
            })

    priority_order = {"P1": 0, "P2": 1, "P3": 2, "P4": 3}
    queue.sort(key=lambda x: priority_order.get(x["priority"], 4))
    return queue