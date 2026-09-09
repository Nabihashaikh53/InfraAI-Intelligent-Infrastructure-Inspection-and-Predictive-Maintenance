from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel


class BoundingBoxModel(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float


class DefectModel(BaseModel):
    inspectionId: str
    assetId: str
    type: str
    confidence: float
    confidenceTier: str
    boundingBox: BoundingBoxModel
    modelVersion: str
    inspectorConfirmed: Optional[bool] = None
    inspectorCorrection: Optional[str] = None
    createdAt: datetime = datetime.now(timezone.utc)


class ModelVersionModel(BaseModel):
    name: str
    version: str
    accuracy: Optional[float] = None
    precision: Optional[float] = None
    recall: Optional[float] = None
    mAP: Optional[float] = None
    trainedAt: datetime = datetime.now(timezone.utc)