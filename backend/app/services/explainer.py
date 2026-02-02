import os
import joblib
import shap
import pandas as pd

FEATURE_EXPLANATIONS = {
    "Payment_Irregularity": "Frequent late or missed payments",
    "Income_Loan_Ratio": "Income is low compared to the requested loan amount",
    "Credit_Score": "Credit score",
    "Default_Risk_Score": "Higher historical default risk",
    "Transaction_Inconsistency": "Unstable transaction behavior",
    "Behavioral_Anomaly_Index": "Unusual financial behavior",
    "Transaction_Intensity": "High transaction activity",
    "Risk_to_Income": "Risk level is high relative to income",
    "Interest_Rate": "High interest rate",
    "Loan_Amount": "Large loan amount",
    "Monthly_Income": "Monthly income level"
}


BASE_DIR = os.path.dirname(os.path.dirname(__file__))
BACKGROUND_PATH = os.path.join(BASE_DIR, "models", "shap_background.pkl")

class LoanExplainer:
    def __init__(self, model):
        background = joblib.load(BACKGROUND_PATH)

        self.explainer = shap.TreeExplainer(
            model,
            data=background
        )

    def explain(self, X_row: pd.DataFrame, top_k: int = 5):
        shap_values = self.explainer.shap_values(
        X_row,
        check_additivity=False 
        )

        if isinstance(shap_values, list):
            shap_values = shap_values[1]

        shap_row = shap_values[0]

        impact = pd.DataFrame({
            "feature": X_row.columns,
            "shap_value": shap_row
        })

        impact["abs"] = impact["shap_value"].abs()
        impact = impact.sort_values("abs", ascending=False).head(top_k)

        reasons = []
        for _, row in impact.iterrows():
            feature = row["feature"]
            readable = FEATURE_EXPLANATIONS.get(feature, feature)

            if row["shap_value"] > 0:
                reasons.append(
                    f"{readable} increased the chances of loan approval"
                )
            else:
                reasons.append(
                    f"{readable} increased the likelihood of loan rejection"
                )

        return reasons


def get_shap_explanation(X_row, shap_row, top_k=5):
    impact = pd.DataFrame({
        "feature": X_row.index,
        "shap_value": shap_row
    })

    impact["abs_shap"] = impact["shap_value"].abs()
    impact = impact.sort_values("abs_shap", ascending=False).head(top_k)

    reasons = []
    for _, row in impact.iterrows():
        if row["shap_value"] > 0:
            reasons.append(f"{row['feature']} increased approval chances")
        else:
            reasons.append(f"{row['feature']} increased rejection risk")

    return reasons
