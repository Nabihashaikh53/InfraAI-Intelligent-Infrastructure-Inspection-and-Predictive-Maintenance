from datetime import datetime, timezone
import logging
import os

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import Response

from app.api.auth_routes import get_current_user
from app.database.asset_repository import create_asset, get_asset_by_id
from app.database.connection import db
from app.database.defect_repository import replace_analysis_for_inspection
from app.database.inspection_repository import (
    create_inspection,
    get_inspection_by_id,
    get_inspections_by_asset,
    update_inspection,
)
from app.schemas.inspection_schema import InspectionOut
from app.schemas.defect_schema import AnalysisOut
from app.services.image_quality import assess_image_quality
from app.services.mongo_image_storage import (
    store_image,
    get_image,
    create_temp_image_file,
)
from app.services.severity_engine import calculate_severity
from app.services.risk_engine import calculate_risk, risk_explanation
from app.ai.defect_detection import detect_defects


logger = logging.getLogger(__name__)

router = APIRouter(tags=["inspections"])


SEVERITY_ORDER = {
    "minor": 1,
    "moderate": 2,
    "serious": 3,
    "critical": 4,
}


def _to_inspection_out(doc: dict) -> InspectionOut:
    return InspectionOut(
        id=str(doc["_id"]),
        inspectionId=doc.get("inspectionId", ""),
        assetId=doc.get("assetId", ""),
        userId=doc.get("userId", ""),
        imageUrl=doc.get("imageUrl", ""),
        inspectionDate=doc.get(
            "inspectionDate",
            datetime.now(timezone.utc),
        ),
        status=doc.get("status", "uploaded"),
        imageQuality=doc.get("imageQuality"),
        analysisStatus=doc.get("analysisStatus"),
        severity=doc.get("severity"),
        risk=doc.get("risk"),
        modelVersion=doc.get("modelVersion"),
        analyzedAt=doc.get("analyzedAt"),
    )


# ============================================================
# STEP 1 — UPLOAD IMAGE
# ============================================================

@router.post(
    "/api/inspections/upload",
    status_code=201,
)
async def upload_inspection_image(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    """
    Step 1 of the inspection workflow.

    The user uploads an image before an asset exists.
    The image is stored in MongoDB and receives a temporary upload ID.
    """

    image_id = await store_image(file)

    await db.inspectionImages.update_one(
        {"imageId": image_id},
        {
            "$set": {
                "userId": str(current_user["_id"]),
                "status": "pending",
            }
        },
    )

    image = await get_image(image_id)

    return {
        "uploadId": image_id,
        "filename": (
            image.get("filename")
            if image
            else file.filename
        ),
        "contentType": (
            image.get("contentType")
            if image
            else file.content_type
        ),
        "size": (
            image.get("size")
            if image
            else None
        ),
        "status": "uploaded",
    }


# ============================================================
# STEP 2 — CREATE ASSET + INSPECTION FROM UPLOADED IMAGE
# ============================================================

@router.post(
    "/api/inspections/create",
    response_model=InspectionOut,
    status_code=201,
)
async def create_inspection_from_upload(
    upload_id: str,
    name: str,
    type: str,
    location: str,
    description: str | None = None,
    inspection_date: datetime | None = None,
    deterioration_status: str | None = None,
    current_user: dict = Depends(get_current_user),
):
    """
    Step 2 of the inspection workflow.

    The uploaded image is attached to the newly-created asset
    and inspection.

    The Asset ID is generated only after the user supplies
    the asset details.
    """

    image = await get_image(upload_id)

    if image is None:
        raise HTTPException(
            status_code=404,
            detail="Uploaded image not found.",
        )

    if str(image.get("userId", "")) != str(current_user["_id"]):
        raise HTTPException(
            status_code=404,
            detail="Uploaded image not found.",
        )

    if image.get("status") != "pending":
        raise HTTPException(
            status_code=400,
            detail="This uploaded image has already been used.",
        )

    # --------------------------------------------------------
    # Generate Asset ID only now, after asset details exist.
    # --------------------------------------------------------

    asset_data = {
        "name": name,
        "type": type,
        "description": description,
        "location": location,
    }

    asset = await create_asset(asset_data)
    asset_id = asset["assetId"]

    inspection_date = (
        inspection_date
        or datetime.now(timezone.utc)
    )

    inspection_data = {
        "assetId": asset_id,
        "userId": str(current_user["_id"]),
        "imageId": upload_id,
        "imageUrl": f"/api/inspections/image/{upload_id}",
        "inspectionDate": inspection_date,
        "status": "uploaded",
        "analysisStatus": "pending",
    }

    if deterioration_status:
        inspection_data["deteriorationStatus"] = (
            deterioration_status
        )

    created = await create_inspection(
        inspection_data
    )

    await db.inspectionImages.update_one(
        {"imageId": upload_id},
        {
            "$set": {
                "status": "attached",
                "assetId": asset_id,
                "inspectionId": created["inspectionId"],
            }
        },
    )

    return _to_inspection_out(created)


# ============================================================
# GET STORED INSPECTION IMAGE
# ============================================================

@router.get(
    "/api/inspections/image/{image_id}"
)
async def get_inspection_image(
    image_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Return an image stored in MongoDB.

    The endpoint is authenticated so inspection images
    are not public.
    """

    image = await get_image(image_id)

    if image is None:
        raise HTTPException(
            status_code=404,
            detail="Image not found.",
        )

    if str(image.get("userId", "")) != str(current_user["_id"]):
        raise HTTPException(
            status_code=404,
            detail="Image not found.",
        )

    return Response(
        content=image["data"],
        media_type=image.get(
            "contentType",
            "application/octet-stream",
        ),
    )


# ============================================================
# GET SINGLE INSPECTION
# ============================================================

@router.get(
    "/api/inspections/{inspection_id}",
    response_model=InspectionOut,
)
async def get_inspection(
    inspection_id: str,
    current_user: dict = Depends(get_current_user),
):
    inspection = await get_inspection_by_id(
        inspection_id
    )

    if inspection is None:
        raise HTTPException(
            status_code=404,
            detail="Inspection not found.",
        )

    if str(inspection.get("userId", "")) != str(current_user["_id"]):
        raise HTTPException(
            status_code=404,
            detail="Inspection not found.",
        )

    return _to_inspection_out(inspection)


# ============================================================
# GET INSPECTIONS FOR ASSET
# ============================================================

@router.get(
    "/api/assets/{asset_id}/inspections",
    response_model=list[InspectionOut],
)
async def get_asset_inspections(
    asset_id: str,
    current_user: dict = Depends(get_current_user),
):
    inspections = await get_inspections_by_asset(
        asset_id
    )

    return [
        _to_inspection_out(inspection)
        for inspection in inspections
        if str(inspection.get("userId", ""))
        == str(current_user["_id"])
    ]


# ============================================================
# UPDATE INSPECTION STATUS
# ============================================================

@router.patch(
    "/api/inspections/{inspection_id}",
    response_model=InspectionOut,
)
async def update_inspection_route(
    inspection_id: str,
    status: str | None = None,
    current_user: dict = Depends(get_current_user),
):
    inspection = await get_inspection_by_id(
        inspection_id
    )

    if inspection is None:
        raise HTTPException(
            status_code=404,
            detail="Inspection not found.",
        )

    if str(inspection.get("userId", "")) != str(current_user["_id"]):
        raise HTTPException(
            status_code=404,
            detail="Inspection not found.",
        )

    update_data = {}

    if status is not None:
        update_data["status"] = status

    if not update_data:
        return _to_inspection_out(inspection)

    updated = await update_inspection(
        inspection_id,
        update_data,
    )

    if updated is None:
        raise HTTPException(
            status_code=404,
            detail="Inspection not found.",
        )

    return _to_inspection_out(updated)


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
            detail="Inspection not found.",
        )

    if str(inspection.get("userId", "")) != str(current_user["_id"]):
        raise HTTPException(
            status_code=404,
            detail="Inspection not found.",
        )

    image_id = inspection.get("imageId")

    if not image_id:
        raise HTTPException(
            status_code=400,
            detail="Inspection has no stored image.",
        )

    temp_path = None

    try:
        temp_path = await create_temp_image_file(
            image_id
        )

        quality_result = assess_image_quality(
            temp_path
        )

        updated = await update_inspection(
            inspection_id,
            {
                "imageQuality": quality_result,
                "updatedAt": datetime.now(timezone.utc),
            },
        )

        if updated is None:
            raise HTTPException(
                status_code=404,
                detail="Inspection not found.",
            )

        return _to_inspection_out(updated)

    finally:
        if temp_path and os.path.exists(temp_path):
            os.unlink(temp_path)


# ============================================================
# RUN REAL YOLO + SEVERITY + RISK ANALYSIS
# ============================================================

@router.post(
    "/api/inspections/{inspection_id}/analyze",
    response_model=AnalysisOut,
)
async def analyze_inspection(
    inspection_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Run the real:

        image quality
        -> YOLO defect detection
        -> per-defect severity
        -> overall severity
        -> risk
        -> persistence

    pipeline.
    """

    inspection = await get_inspection_by_id(
        inspection_id
    )

    if inspection is None:
        raise HTTPException(
            status_code=404,
            detail="Inspection not found.",
        )

    if str(inspection.get("userId", "")) != str(current_user["_id"]):
        raise HTTPException(
            status_code=404,
            detail="Inspection not found.",
        )

    image_id = inspection.get("imageId")

    if not image_id:
        raise HTTPException(
            status_code=400,
            detail="Inspection has no stored image.",
        )

    temp_path = None

    try:
        # ----------------------------------------------------
        # 1. Create temporary local file from MongoDB image
        # ----------------------------------------------------

        temp_path = await create_temp_image_file(
            image_id
        )

        # ----------------------------------------------------
        # 2. IMAGE QUALITY
        # ----------------------------------------------------

        quality = assess_image_quality(
            temp_path
        )

        await update_inspection(
            inspection_id,
            {
                "imageQuality": quality,
                "analysisStatus": "processing",
                "updatedAt": datetime.now(timezone.utc),
            },
        )

        # ----------------------------------------------------
        # 3. REAL YOLO DETECTION
        # ----------------------------------------------------

        detections = detect_defects(
            temp_path
        )

        defects = []

        # ----------------------------------------------------
        # 4. SEVERITY FOR EACH DEFECT
        # ----------------------------------------------------

        for detection in detections:

            defect_type = detection.get(
                "defectType",
                detection.get(
                    "class",
                    "unknown",
                ),
            )

            confidence = float(
                detection.get(
                    "confidence",
                    0,
                )
            )

            bounding_box = detection.get(
                "boundingBox",
                detection.get(
                    "bbox"
                ),
            )

            if not bounding_box:
                continue

            defect_severity = calculate_severity(
                defect_type=defect_type,
                confidence=confidence,
                bounding_box=bounding_box,
            )

            defects.append(
                {
                    "inspectionId": inspection_id,
                    "defectType": defect_type,
                    "confidence": confidence,
                    "boundingBox": bounding_box,
                    "severity": defect_severity,
                    "detectedAt": datetime.now(
                        timezone.utc
                    ),
                }
            )

        # ----------------------------------------------------
        # 5. OVERALL SEVERITY
        # ----------------------------------------------------

        if defects:
            overall_level = max(
                (
                    defect["severity"]
                    for defect in defects
                ),
                key=lambda level: SEVERITY_ORDER.get(
                    level,
                    0,
                ),
            )
        else:
            overall_level = "minor"

        severity = {
            "score": (
                0
                if not defects
                else SEVERITY_ORDER[
                    overall_level
                ] * 25
            ),
            "level": overall_level,
            "explanation": (
                f"Overall severity is "
                f"{overall_level} based on "
                f"{len(defects)} detected "
                f"defect(s)."
            ),
        }

        # ----------------------------------------------------
        # 6. RISK
        # ----------------------------------------------------

        risk = calculate_risk(
            defects=defects,
            deterioration_status=inspection.get(
                "deteriorationStatus"
            ),
        )

        risk["explanation"] = risk_explanation(
            risk,
            len(defects),
        )

        # ----------------------------------------------------
        # 7. PERSIST COMPLETE ANALYSIS
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

        # ----------------------------------------------------
        # 8. RETURN COMPLETE ANALYSIS
        # ----------------------------------------------------

        return {
            "inspectionId": inspection_id,
            "analysisStatus": "completed",
            "defects": defects,
            "severity": severity,
            "risk": risk,
            "modelVersion": model_version,
            "analyzedAt": analyzed_at,
        }

    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        ) from exc

    except HTTPException:
        raise

    except Exception as exc:
        logger.exception(
            "Inspection analysis failed for %s",
            inspection_id,
        )

        await update_inspection(
            inspection_id,
            {
                "analysisStatus": "failed",
                "updatedAt": datetime.now(timezone.utc),
            },
        )

        raise HTTPException(
            status_code=500,
            detail=f"Inspection analysis failed: {exc}",
        ) from exc

    finally:
        if temp_path and os.path.exists(temp_path):
            os.unlink(temp_path)