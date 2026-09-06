import uuid
from datetime import datetime, timezone
from bson import ObjectId
from bson.errors import InvalidId

from app.database.connection import db

inspections_collection = db.inspections


async def create_inspection(inspection_data: dict) -> dict:
    now = datetime.now(timezone.utc)

    inspection_data["inspectionId"] = f"INS-{uuid.uuid4().hex[:8]}"
    inspection_data["createdAt"] = now
    inspection_data["updatedAt"] = now

    result = await inspections_collection.insert_one(inspection_data)

    return await inspections_collection.find_one(
        {"_id": result.inserted_id}
    )


async def get_inspection_by_id(inspection_id: str) -> dict | None:
    try:
        object_id = ObjectId(inspection_id)
    except InvalidId:
        return None

    return await inspections_collection.find_one(
        {"_id": object_id}
    )


async def get_inspections_by_asset(asset_id: str) -> list[dict]:
    cursor = inspections_collection.find(
        {"assetId": asset_id}
    ).sort("inspectionDate", -1)

    return [doc async for doc in cursor]

async def update_inspection(inspection_id: str, update_data: dict) -> dict | None:
    try:
        object_id = ObjectId(inspection_id)
    except InvalidId:
        return None

    update_data["updatedAt"] = datetime.now(timezone.utc)

    result = await inspections_collection.update_one(
        {"_id": object_id},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        return None

    return await inspections_collection.find_one({"_id": object_id})