from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel


class ImageQualityOut(BaseModel):
    score: int
    status: str
    issues: list[str]


class SeverityOut(BaseModel):
    score: int
    level: str
    explanation: Optional[str] = None


class RiskBreakdownOut(BaseModel):
    severityContribution: int
    recurrenceContribution: int
    deteriorationContribution: int


class RiskOut(BaseModel):
    score: int
    category: str
    breakdown: RiskBreakdownOut
    explanation: Optional[str] = None


class InspectionOut(BaseModel):
    id: str
    inspectionId: str
    assetId: str
    userId: str
    imageUrl: str
    inspectionDate: datetime
    status: str
    imageQuality: Optional[ImageQualityOut] = None

    analysisStatus: Optional[str] = None
    severity: Optional[SeverityOut] = None
    risk: Optional[RiskOut] = None
    modelVersion: Optional[str] = None
    analyzedAt: Optional[datetime] = None