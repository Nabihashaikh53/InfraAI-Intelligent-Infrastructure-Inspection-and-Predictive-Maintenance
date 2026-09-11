from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class BoundingBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float


class DefectOut(BaseModel):
    id: Optional[str] = None
    inspectionId: str
    defectType: str
    confidence: float
    boundingBox: BoundingBox
    severity: Optional[str] = None
    detectedAt: Optional[datetime] = None


class SeverityResult(BaseModel):
    score: int
    level: str
    explanation: Optional[str] = None


class RiskBreakdown(BaseModel):
    severityContribution: int
    recurrenceContribution: int
    deteriorationContribution: int


class RiskResult(BaseModel):
    score: int
    category: str
    breakdown: RiskBreakdown
    explanation: Optional[str] = None


class AnalysisOut(BaseModel):
    inspectionId: str
    analysisStatus: str
    defects: list[dict]
    severity: SeverityResult
    risk: RiskResult
    modelVersion: str
    analyzedAt: datetime
