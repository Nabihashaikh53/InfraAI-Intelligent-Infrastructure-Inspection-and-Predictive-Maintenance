from datetime import datetime, timezone
from typing import Any

from bson import ObjectId
from bson.errors import InvalidId

from app.database.connection import db


async def replace_analysis_for_inspection(
    inspection_id: str,
    defects: list[dict[str, Any]],
    severity: dict[str, Any],
    risk: dict[str, Any],
    model_version: str,
) -> datetime:
    now = datetime.now(timezone.utc)

    try:
        object_id = ObjectId(inspection_id)
    except InvalidId as exc:
        raise ValueError("Invalid inspection ID.") from exc

    await db.defects.delete_many({"inspectionId": object_id})

    if defects:
        documents = []

        for defect in defects:
            document = {
                **defect,
                "inspectionId": object_id,
                "detectedAt": defect.get("detectedAt", now),
                "createdAt": now,
            }
            documents.append(document)

        await db.defects.insert_many(documents)

    result = await db.inspections.update_one(
        {"_id": object_id},
        {
            "$set": {
                "analysisStatus": "completed",
                "severity": severity,
                "risk": risk,
                "modelVersion": model_version,
                "analyzedAt": now,
                "updatedAt": now,
            }
        },
    )

    if result.matched_count != 1:
        raise LookupError("Inspection was not found.")

    return now


async def get_defects_by_inspection(
    inspection_id: str,
) -> list[dict]:
    try:
        object_id = ObjectId(inspection_id)
    except InvalidId as exc:
        raise ValueError("Invalid inspection ID.") from exc

    cursor = db.defects.find(
        {"inspectionId": object_id}
    ).sort("detectedAt", -1)

    return [doc async for doc in cursor]


async def delete_defects_by_inspection(
    inspection_id: str,
) -> None:
    try:
        object_id = ObjectId(inspection_id)
    except InvalidId as exc:
        raise ValueError("Invalid inspection ID.") from exc

    await db.defects.delete_many(
        {"inspectionId": object_id}
    )
