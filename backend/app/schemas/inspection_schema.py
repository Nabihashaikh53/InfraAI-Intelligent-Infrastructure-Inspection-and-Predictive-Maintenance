from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class InspectionOut(BaseModel):
    id: str
    inspectionId: str
    assetId: str
    userId: str
    imageUrl: str
    inspectionDate: datetime
    status: str