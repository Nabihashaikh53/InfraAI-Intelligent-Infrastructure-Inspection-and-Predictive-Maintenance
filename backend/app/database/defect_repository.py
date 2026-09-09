from datetime import datetime, timezone
from typing import Any
from bson import ObjectId

from app.database.connection import db

async def replace_analysis_for_inspection(
    inspection_id: str,
    defects: list[dict[str, Any]],
    severity: dict[str, Any],
    risk: dict[str, Any],
    model_version: str,
) -> datetime:
    # Replace `db` with the database object already used by this repository.
    now = datetime.now(timezone.utc)
    object_id = ObjectId(inspection_id)
    await db.defects.delete_many({"inspectionId": object_id})

    if defects:
        for defect in defects:
            defect["inspectionId"] = object_id
            defect["createdAt"] = now
        await db.defects.insert_many(defects)

    result = await db.inspections.update_one(
        {"_id": object_id},
        {"$set": {
            "analysisStatus": "completed",
            "severity": severity,
            "risk": risk,
            "modelVersion": model_version,
            "analyzedAt": now,
        }},
    )
    if result.matched_count != 1:
        raise LookupError("Inspection was not found.")
    return now