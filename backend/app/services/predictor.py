import os
import joblib
import pandas as pd
import numpy as np

# ---------------------------
# Paths
# ---------------------------
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "loan_model.pkl")
FEATURES_PATH = os.path.join(BASE_DIR, "models", "feature_names.pkl")

# ---------------------------
# Load model + features ONCE
# ---------------------------
model = joblib.load(MODEL_PATH)
feature_names = joblib.load(FEATURES_PATH)

# ---------------------------
# Preprocessing function
# ---------------------------
def preprocess_input(data: dict) -> pd.DataFrame:
    """
    data: dict from API request
    returns: DataFrame with correct feature order
    """

    df = pd.DataFrame([data])

    # Feature engineering (MUST match training)
    df["Income_Loan_Ratio"] = df["Monthly_Income"] / (df["Loan_Amount"] + 1)

    df["Behavior_Risk_Mean"] = (
        df["Payment_Irregularity"]
        + df["Behavioral_Anomaly_Index"]
        + df["Transaction_Inconsistency"]
    ) / 3

    df["Transaction_Intensity"] = (
        df["Avg_Transaction_Freq"] * df["Avg_Transaction_Amount"]
    )

    df["Risk_to_Income"] = df["Default_Risk_Score"] / (df["Monthly_Income"] + 1)

    # Encode categoricals (MUST match training)
    categorical_cols = ["Gender", "Age_Group", "Region", "Loan_Purpose"]
    for col in categorical_cols:
        if col in df.columns:
            df[col] = df[col].astype("category").cat.codes

    # Keep only trained features
    df = df.reindex(columns=feature_names, fill_value=0)

    return df

def policy_reject(data):
    income_loan_ratio = data["Monthly_Income"] / (data["Loan_Amount"] + 1)

    if data["Default_Risk_Score"] >= 0.65:
        return "High default risk"

    if data["Payment_Irregularity"] >= 0.6:
        return "Poor payment history"

    if data["Behavioral_Anomaly_Index"] >= 0.7:
        return "Unusual financial behavior"

    if income_loan_ratio < 0.15:
        return "Income insufficient for loan amount"

    if data["Transaction_Inconsistency"] >= 0.6:
        return "Unstable transaction pattern"

    if (
        data["Default_Risk_Score"] >= 0.5
        and data["Payment_Irregularity"] >= 0.4
    ):
        return "Combined credit and payment risk"

    return None


# ---------------------------
# Prediction function
def predict_loan(data: dict, threshold: float = 0.6):
    X = preprocess_input(data)

    prob = model.predict_proba(X)[0][1]
    decision = "Approved" if prob >= threshold else "Rejected"

    return prob, decision, X