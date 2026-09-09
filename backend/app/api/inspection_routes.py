from datetime import datetime, timezone
import logging

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form

from app.schemas.inspection_schema import InspectionOut
from app.schemas.defect_schema import AnalysisOut

from app.api.auth_routes import get_current_user

from app.services.file_storage import save_uploaded_image
from app.services.image_quality import assess_image_quality

from app.services.severity_engine import calculate_severity
from app.services.risk_engine import calculate_risk, risk_explanation

from app.database.inspection_repository import (
    create_inspection,
    get_inspection_by_id,
    get_inspections_by_asset,
    update_inspection,
)

from app.database.asset_repository import get_asset_by_id

from app.database.defect_repository import (
    replace_analysis_for_inspection,
)

# CHANGE THIS IMPORT TO YOUR ACTUAL YOLO SERVICE
# from app.services.yolo_service import run_defect_detection


logger = logging.getLogger(__name__)

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
        imageQuality=doc.get("imageQuality"),
    )


# ============================================================
# UPLOAD INSPECTION IMAGE
# ============================================================

@router.post(
    "/api/inspections/upload",
    response_model=InspectionOut,
    status_code=201,
)
async def upload_inspection_image(
    asset_id: str = Form(...),
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    asset = await get_asset_by_id(asset_id)

    if asset is None:
        raise HTTPException(
            status_code=404,
            detail="Asset not found",
        )

    image_url = await save_uploaded_image(
        file,
        asset_id,
    )

    inspection_data = {
        "assetId": asset_id,
        "userId": str(current_user["_id"]),
        "imageUrl": image_url,
        "inspectionDate": datetime.now(timezone.utc),
        "status": "uploaded",
    }

    created = await create_inspection(
        inspection_data
    )

    return _to_inspection_out(created)


# ============================================================
# GET SINGLE INSPECTION
# ============================================================

@router.get(
    "/api/inspections/{inspection_id}",
    response_model=InspectionOut,
)
async def get_inspection_route(
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

    return _to_inspection_out(inspection)


# ============================================================
# GET INSPECTIONS FOR ASSET
# ============================================================

@router.get(
    "/api/assets/{asset_id}/inspections",
    response_model=list[InspectionOut],
)
async def list_inspections_for_asset_route(
    asset_id: str,
    current_user: dict = Depends(get_current_user),
):
    inspections = await get_inspections_by_asset(
        asset_id
    )

    return [
        _to_inspection_out(i)
        for i in inspections
    ]


# ============================================================
# IMAGE QUALITY CHECK
# ============================================================

@router.post(
    "/api/inspections/{inspection_id}/quality-check",
    response_model=InspectionOut,
)
async def quality_check_route(
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

    quality_result = assess_image_quality(
        inspection["imageUrl"]
    )

    updated = await update_inspection(
        inspection_id,
        {
            "imageQuality": quality_result
        },
    )

    if updated is None:
        raise HTTPException(
            status_code=404,
            detail="Inspection not found",
        )

    return _to_inspection_out(updated)


# ============================================================
# RUN DEFECT ANALYSIS
# ============================================================

@router.post(
    "/api/inspections/{inspection_id}/analyze",
    response_model=AnalysisOut,
)
async def analyze_inspection(
    inspection_id: str,
    current_user: dict = Depends(get_current_user),
):
    # --------------------------------------------------------
    # 1. Get inspection
    # --------------------------------------------------------

    inspection = await get_inspection_by_id(
        inspection_id
    )

    if inspection is None:
        raise HTTPException(
            status_code=404,
            detail="Inspection not found.",
        )

    # --------------------------------------------------------
    # 2. OWNERSHIP CHECK
    # --------------------------------------------------------

    inspection_user_id = str(
        inspection.get("userId", "")
    )

    current_user_id = str(
        current_user["_id"]
    )

    if inspection_user_id != current_user_id:
        raise HTTPException(
            status_code=404,
            detail="Inspection not found.",
        )

    # --------------------------------------------------------
    # 3. Check uploaded image
    # --------------------------------------------------------

    if not inspection.get("imageUrl"):
        raise HTTPException(
            status_code=400,
            detail="Inspection has no uploaded image.",
        )

    try:

        # ----------------------------------------------------
        # 4. Run existing YOLO detection
        #
        # CHANGE run_defect_detection() to the function
        # already present in your Phase 6 YOLO service.
        #
        # It must return:
        #
        # defects
        # image_width
        # image_height
        # ----------------------------------------------------

        defects, image_width, image_height = (
            await run_defect_detection(
                inspection["imageUrl"]
            )
        )

        # ----------------------------------------------------
        # 5. Get image quality score
        # ----------------------------------------------------

        quality_score = (
            inspection.get("imageQuality") or {}
        ).get("score")

        # ----------------------------------------------------
        # 6. Calculate severity
        # ----------------------------------------------------

        severity = calculate_severity(
            defects,
            image_width,
            image_height,
            quality_score,
        ).as_dict()

        # ----------------------------------------------------
        # 7. Get asset
        # ----------------------------------------------------

        asset = await get_asset_by_id(
            inspection["assetId"]
        )

        # ----------------------------------------------------
        # 8. Calculate risk
        # ----------------------------------------------------

        risk = calculate_risk(
            severity_score=severity["score"],
            defect_count=len(defects),
            asset_criticality=(
                asset or {}
            ).get("criticality"),
            quality_score=quality_score,
        ).as_dict()

        # ----------------------------------------------------
        # 9. Persist analysis
        #
        # Old defects for ONLY this inspection are deleted
        # before the new results are inserted.
        # ----------------------------------------------------

        model_version = (
            "yolov8n-concrete-crack-v1"
        )

        analyzed_at = (
            await replace_analysis_for_inspection(
                inspection_id=inspection_id,
                defects=defects,
                severity=severity,
                risk=risk,
                model_version=model_version,
            )
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=422,
            detail=str(exc),
        ) from exc

    except Exception as exc:

        logger.exception(
            "Analysis failed for inspection %s",
            inspection_id,
        )

        raise HTTPException(
            status_code=500,
            detail="Image analysis failed. Please retry.",
        ) from exc

    # --------------------------------------------------------
    # 10. Return analysis response
    # --------------------------------------------------------

    return {
        "inspectionId": inspection_id,
        "analysisStatus": "completed",
        "defects": defects,
        "severity": severity,
        "risk": risk,
        "modelVersion": model_version,
        "analyzedAt": analyzed_at,
    }