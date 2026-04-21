from fastapi import APIRouter
from app.schemas.request import LoanRequest
from app.schemas.response import LoanResponse
from app.services.predictor import predict_loan, model
# from app.services.explainer import LoanExplainer

router = APIRouter()

# Initialize SHAP explainer once
# explainer = LoanExplainer(model)

@router.post("/predict-loan", response_model=LoanResponse)
def predict(data: LoanRequest):
    probability, decision, X = predict_loan(data.dict())

    reasons = ["Model prediction based on financial and behavioral data"]

    return LoanResponse(
        decision=decision,
        approval_probability=round(probability, 3),
        reasons=reasons
    )
