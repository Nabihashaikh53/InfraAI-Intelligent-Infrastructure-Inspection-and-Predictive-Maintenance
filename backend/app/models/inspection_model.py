from datetime import datetime, timezone
from pydantic import BaseModel
from typing import Optional

class ImageQualityModel(BaseModel):
    score: int
    status: str
    issues: list[str] = []


class InspectionModel(BaseModel):
    assetId: str
    userId: str
    imageUrl: str
    inspectionDate: datetime = datetime.now(timezone.utc)
    status: str = "uploaded"
    imageQuality: Optional[ImageQualityModel] = None
    createdAt: datetime = datetime.now(timezone.utc)
    updatedAt: datetime = datetime.now(timezone.utc)
    # Fields added in later phases:
    # processedImageUrl, imageQuality, overallRiskScore, riskLevel,
    # conditionScore, deteriorationStatus, maintenancePriority,
    # inspectorComments

