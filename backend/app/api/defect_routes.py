from fastapi import APIRouter, Depends, HTTPException

from app.api.auth_routes import get_current_user

from app.database.inspection_repository import (
    get_inspection_by_id,
)

from app.database.defect_repository import (
    get_defects_by_inspection,
)

from app.schemas.defect_schema import (
    BoundingBox,
    DefectOut,
)


router = APIRouter(tags=["defects"])


def _to_defect_out(doc: dict) -> DefectOut:
    return DefectOut(
        id=str(doc["_id"]),
        inspectionId=str(doc["inspectionId"]),
        defectType=doc["defectType"],
        confidence=float(doc["confidence"]),
        boundingBox=BoundingBox(
            **doc["boundingBox"]
        ),
        severity=doc.get("severity"),
        detectedAt=doc.get(
            "detectedAt",
            doc.get("createdAt"),
        ),
    )


@router.get(
    "/api/inspections/{inspection_id}/defects",
    response_model=list[DefectOut],
)
async def get_inspection_defects(
    inspection_id: str,
    current_user: dict = Depends(get_current_user),
):
    inspection = await get_inspection_by_id(
        inspection_id
    )

    if inspection is None:
        raise HTTPException(
            status_code=404,
            detail="Inspection not found",
        )

    # Only allow the owner to access inspection defects.
    if str(inspection.get("userId", "")) != str(
        current_user["_id"]
    ):
        raise HTTPException(
            status_code=404,
            detail="Inspection not found",
        )

    try:
        defects = await get_defects_by_inspection(
            inspection_id
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    return [
        _to_defect_out(defect)
        for defect in defects
    ]