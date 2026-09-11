from fastapi import APIRouter, Depends, HTTPException, status

from app.schemas.asset_schema import AssetCreate, AssetUpdate, AssetOut
from app.api.auth_routes import get_current_user
from app.database.asset_repository import (
    create_asset,
    get_asset_by_id,
    get_all_assets,
    update_asset,
    delete_asset,
)
from app.database.connection import db
from app.services.deterioration_engine import calculate_deterioration

router = APIRouter(tags=["assets"])


def _to_asset_out(doc: dict) -> AssetOut:
    return AssetOut(
        id=str(doc["_id"]),
        assetId=doc.get("assetId", ""),
        name=doc.get("name", ""),
        type=doc.get("type", ""),
        description=doc.get("description"),
        location=doc.get("location"),
        status=doc.get("status", "active"),
        currentRisk=doc.get("currentRisk"),
        currentCondition=doc.get("currentCondition"),
    )


@router.post("/api/assets", response_model=AssetOut, status_code=201)
async def create_asset_route(
    payload: AssetCreate, current_user: dict = Depends(get_current_user)
):
    asset_doc = payload.model_dump()
    created = await create_asset(asset_doc)
    return _to_asset_out(created)


@router.get("/api/assets", response_model=list[AssetOut])
async def list_assets_route(current_user: dict = Depends(get_current_user)):
    assets = await get_all_assets()
    return [_to_asset_out(a) for a in assets]


@router.get("/api/assets/{asset_id}", response_model=AssetOut)
async def get_asset_route(
    asset_id: str, current_user: dict = Depends(get_current_user)
):
    asset = await get_asset_by_id(asset_id)
    if asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")
    return _to_asset_out(asset)


@router.put("/api/assets/{asset_id}", response_model=AssetOut)
async def update_asset_route(
    asset_id: str,
    payload: AssetUpdate,
    current_user: dict = Depends(get_current_user),
):
    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    updated = await update_asset(asset_id, update_data)
    if updated is None:
        raise HTTPException(status_code=404, detail="Asset not found")
    return _to_asset_out(updated)


@router.delete("/api/assets/{asset_id}", status_code=204)
async def delete_asset_route(
    asset_id: str, current_user: dict = Depends(get_current_user)
):
    deleted = await delete_asset(asset_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Asset not found")


@router.get("/api/assets/{asset_id}/deterioration")
async def get_asset_deterioration(
    asset_id: str,
    current_user: dict = Depends(get_current_user),
):
    asset = await get_asset_by_id(asset_id)

    if asset is None:
        raise HTTPException(
            status_code=404,
            detail="Asset not found",
        )

    cursor = (
        db.inspections
        .find({"assetId": asset_id})
        .sort("inspectionDate", 1)
    )

    inspections = [inspection async for inspection in cursor]

    timeline = []

    for inspection in inspections:
        risk = inspection.get("risk") or {}
        risk_score = risk.get("score")

        if risk_score is None:
            continue

        inspection_date = (
            inspection.get("inspectionDate")
            or inspection.get("createdAt")
        )

        if inspection_date is None:
            continue

        timeline.append(
            {
                "date": inspection_date.isoformat()
                if hasattr(inspection_date, "isoformat")
                else str(inspection_date),
                "riskScore": int(risk_score),
            }
        )

    deterioration = calculate_deterioration(
        timeline[-1]["riskScore"] if timeline else 0,
        timeline[-2]["riskScore"] if len(timeline) >= 2 else None,
    )

    return {
        "assetId": asset_id,
        "status": deterioration["status"],
        "riskChange": deterioration["riskChange"],
        "explanation": deterioration["explanation"],
        "timeline": timeline,
    }