from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form

from app.schemas.inspection_schema import InspectionOut
from app.api.auth_routes import get_current_user
from app.services.file_storage import save_uploaded_image
from app.database.asset_repository import get_asset_by_id
from app.database.inspection_repository import (
    create_inspection,
    get_inspection_by_id,
    get_inspections_by_asset,
)

router = APIRouter(tags=["inspections"])


def _to_inspection_out(doc: dict) -> InspectionOut:
    return InspectionOut(
        id=str(doc["_id"]),
        inspectionId=doc.get("inspectionId", ""),
        assetId=doc.get("assetId", ""),
        userId=doc.get("userId", ""),
        imageUrl=doc.get("imageUrl", ""),
        inspectionDate=doc.get("inspectionDate"),
        status=doc.get("status", "uploaded"),
    )


@router.post("/api/inspections/upload", response_model=InspectionOut, status_code=201)
async def upload_inspection_image(
    asset_id: str = Form(...),
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    asset = await get_asset_by_id(asset_id)
    if asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")

    image_url = await save_uploaded_image(file, asset_id)

    inspection_data = {
        "assetId": asset_id,
        "userId": str(current_user["_id"]),
        "imageUrl": image_url,
        "inspectionDate": datetime.now(timezone.utc),
        "status": "uploaded",
    }
    created = await create_inspection(inspection_data)
    return _to_inspection_out(created)


@router.get("/api/inspections/{inspection_id}", response_model=InspectionOut)
async def get_inspection_route(
    inspection_id: str, current_user: dict = Depends(get_current_user)
):
    inspection = await get_inspection_by_id(inspection_id)
    if inspection is None:
        raise HTTPException(status_code=404, detail="Inspection not found")
    return _to_inspection_out(inspection)


@router.get("/api/assets/{asset_id}/inspections", response_model=list[InspectionOut])
async def list_inspections_for_asset_route(
    asset_id: str, current_user: dict = Depends(get_current_user)
):
    inspections = await get_inspections_by_asset(asset_id)
    return [_to_inspection_out(i) for i in inspections]