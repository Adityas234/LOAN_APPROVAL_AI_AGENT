from pydantic import BaseModel
from typing import List

class LoanResponse(BaseModel):
    decision: str
    approval_probability: float
    reasons: List[str]
