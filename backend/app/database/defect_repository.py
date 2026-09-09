from datetime import datetime, timezone
from app.database.connection import db

defects_collection = db.defects
model_versions_collection = db.modelVersions


async def create_defect(defect_data: dict) -> dict:
    defect_data["createdAt"] = datetime.now(timezone.utc)
    result = await defects_collection.insert_one(defect_data)
    return await defects_collection.find_one({"_id": result.inserted_id})


async def get_defects_by_inspection(inspection_id: str) -> list[dict]:
    cursor = defects_collection.find({"inspectionId": inspection_id})
    return [doc async for doc in cursor]


async def create_model_version(version_data: dict) -> dict:
    version_data["trainedAt"] = version_data.get("trainedAt", datetime.now(timezone.utc))
    result = await model_versions_collection.insert_one(version_data)
    return await model_versions_collection.find_one({"_id": result.inserted_id})