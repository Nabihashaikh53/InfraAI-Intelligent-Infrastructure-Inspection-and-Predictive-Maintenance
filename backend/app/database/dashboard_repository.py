from typing import Any

from bson import ObjectId

# IMPORTANT:
# Change this import ONLY if your project stores the MongoDB
# database object somewhere else.
from app.database.database import db


async def get_dashboard_statistics(
    user_id: str,
) -> dict[str, Any]:

    # ---------------------------------------------------------
    # 1. Find assets owned by this user
    # ---------------------------------------------------------

    user_object_id = ObjectId(user_id)

    assets_cursor = db.assets.find(
        {
            "userId": user_object_id
        },
        {
            "_id": 1
        },
    )

    asset_ids = []

    async for asset in assets_cursor:
        asset_ids.append(asset["_id"])

    # ---------------------------------------------------------
    # 2. Count completed inspections by risk level
    # ---------------------------------------------------------

    pipeline = [
        {
            "$match": {
                "assetId": {
                    "$in": asset_ids
                },
                "analysisStatus": "completed",
            }
        },
        {
            "$group": {
                "_id": "$risk.level",
                "count": {
                    "$sum": 1
                },
            }
        },
    ]

    groups = {}

    async for row in db.inspections.aggregate(pipeline):
        groups[row["_id"]] = row["count"]

    # ---------------------------------------------------------
    # 3. Get five most recent completed inspections
    # ---------------------------------------------------------

    recent_cursor = (
        db.inspections
        .find(
            {
                "assetId": {
                    "$in": asset_ids
                },
                "analysisStatus": "completed",
            }
        )
        .sort(
            "analyzedAt",
            -1,
        )
        .limit(5)
    )

    recent_inspections = []

    async for inspection in recent_cursor:

        recent_inspections.append(
            {
                "inspectionId": str(
                    inspection.get("_id")
                ),
                "assetId": str(
                    inspection.get("assetId")
                ),
                "severity": inspection.get(
                    "severity"
                ),
                "risk": inspection.get(
                    "risk"
                ),
                "modelVersion": inspection.get(
                    "modelVersion"
                ),
                "analyzedAt": inspection.get(
                    "analyzedAt"
                ),
            }
        )

    # ---------------------------------------------------------
    # 4. Return dashboard statistics
    # ---------------------------------------------------------

    return {
        "assetCount": len(asset_ids),

        "inspectionCount": sum(
            groups.values()
        ),

        "riskCounts": {
            "low": groups.get(
                "low",
                0,
            ),
            "moderate": groups.get(
                "moderate",
                0,
            ),
            "high": groups.get(
                "high",
                0,
            ),
            "critical": groups.get(
                "critical",
                0,
            ),
        },

        "recentInspections": recent_inspections,
    }