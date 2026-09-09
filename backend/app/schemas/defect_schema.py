from datetime import datetime
from pydantic import BaseModel


class BoundingBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float


class DefectOut(BaseModel):
    id: str
    inspectionId: str
    defectType: str
    confidence: float
    boundingBox: BoundingBox
    severity: str | None = None
    detectedAt: datetime


class AnalysisOut(BaseModel):
    inspectionId: str
    totalDefects: int
    defects: list[DefectOut]