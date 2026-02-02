from pydantic import BaseModel, Field

class LoanRequest(BaseModel):
    Gender: str = Field(..., example="Male")
    Age_Group: str = Field(..., example="26-35")
    Region: str = Field(..., example="Urban")
    Loan_Purpose: str = Field(..., example="Education")

    Monthly_Income: float = Field(..., gt=0, example=45000)
    Loan_Amount: float = Field(..., gt=0, example=300000)
    Interest_Rate: float = Field(..., gt=0, example=12.5)

    Avg_Transaction_Freq: float = Field(..., ge=0, example=40)
    Avg_Transaction_Amount: float = Field(..., ge=0, example=1200)

    Payment_Irregularity: float = Field(..., ge=0, le=1, example=0.2)
    Behavioral_Anomaly_Index: float = Field(..., ge=0, le=1, example=0.1)
    Transaction_Inconsistency: float = Field(..., ge=0, le=1, example=0.15)

    Default_Risk_Score: float = Field(..., ge=0, le=1, example=0.3)
