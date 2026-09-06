from datetime import datetime, timezone
from bson import ObjectId
from bson.errors import InvalidId

from app.database.connection import db

assets_collection = db.assets


async def _generate_asset_id() -> str:
    """Generates a simple sequential asset code like AST-0001."""
    count = await assets_collection.count_documents({})
    return f"AST-{count + 1:04d}"


async def create_asset(asset_data: dict) -> dict:
    now = datetime.now(timezone.utc)
    asset_data["assetId"] = await _generate_asset_id()
    asset_data.setdefault("status", "active")
    asset_data.setdefault("currentRisk", None)
    asset_data.setdefault("currentCondition", "unknown")
    asset_data["createdAt"] = now
    asset_data["updatedAt"] = now

    result = await assets_collection.insert_one(asset_data)
    return await assets_collection.find_one({"_id": result.inserted_id})


async def get_asset_by_id(asset_id: str) -> dict | None:
    try:
        object_id = ObjectId(asset_id)
    except InvalidId:
        return None
    return await assets_collection.find_one({"_id": object_id})


async def get_all_assets(filters: dict | None = None) -> list[dict]:
    query = filters or {}
    query.setdefault("status", {"$ne": "archived"})  # hide archived by default
    cursor = assets_collection.find(query)
    return [doc async for doc in cursor]


async def update_asset(asset_id: str, update_data: dict) -> dict | None:
    try:
        object_id = ObjectId(asset_id)
    except InvalidId:
        return None

    update_data["updatedAt"] = datetime.now(timezone.utc)
    result = await assets_collection.update_one(
        {"_id": object_id}, {"$set": update_data}
    )
    if result.matched_count == 0:
        return None
    return await assets_collection.find_one({"_id": object_id})


async def delete_asset(asset_id: str) -> bool:
    """Soft delete: marks the asset as archived instead of removing it,
    so historical inspections tied to this asset remain valid."""
    try:
        object_id = ObjectId(asset_id)
    except InvalidId:
        return False

    result = await assets_collection.update_one(
        {"_id": object_id}, {"$set": {"status": "archived", "updatedAt": datetime.now(timezone.utc)}}
    )
    return result.matched_count > 0