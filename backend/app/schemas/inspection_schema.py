from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ImageQualityOut(BaseModel):
    score: int
    status: str
    issues: list[str]


class InspectionOut(BaseModel):
    id: str
    inspectionId: str
    assetId: str
    userId: str
    imageUrl: str
    inspectionDate: datetime
    status: str
    imageQuality: Optional[ImageQualityOut] = None