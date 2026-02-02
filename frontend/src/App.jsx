import { useState } from "react";
import axios from "axios";

function App() {
  const [formData, setFormData] = useState({
    Gender: "",
    Age_Group: "",
    Region: "",
    Loan_Purpose: "",
    Monthly_Income: "",
    Loan_Amount: "",
    Interest_Rate: "",
    Avg_Transaction_Freq: "",
    Avg_Transaction_Amount: "",
    Payment_Irregularity: "",
    Behavioral_Anomaly_Index: "",
    Transaction_Inconsistency: "",
    Default_Risk_Score: ""
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/predict-loan",
        {
          ...formData,
          Monthly_Income: Number(formData.Monthly_Income),
          Loan_Amount: Number(formData.Loan_Amount),
          Interest_Rate: Number(formData.Interest_Rate),
          Avg_Transaction_Freq: Number(formData.Avg_Transaction_Freq),
          Avg_Transaction_Amount: Number(formData.Avg_Transaction_Amount),
          Payment_Irregularity: Number(formData.Payment_Irregularity),
          Behavioral_Anomaly_Index: Number(formData.Behavioral_Anomaly_Index),
          Transaction_Inconsistency: Number(formData.Transaction_Inconsistency),
          Default_Risk_Score: Number(formData.Default_Risk_Score)
        }
      );

      setResult(response.data);
    } catch (err) {
      setError("Failed to get prediction. Check backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "40px auto", fontFamily: "Arial" }}>
      <h2>Loan Approval AI Agent</h2>

      <form onSubmit={handleSubmit}>
        {Object.keys(formData).map((key) => (
          <div key={key} style={{ marginBottom: "10px" }}>
            <label>{key}</label>
            <input
              type="text"
              name={key}
              value={formData[key]}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "6px" }}
            />
          </div>
        ))}

        <button type="submit" disabled={loading}>
          {loading ? "Predicting..." : "Check Loan Approval"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <div style={{ marginTop: "30px" }}>
          <h3>Result</h3>
          <p>
            <strong>Decision:</strong>{" "}
            <span
              style={{
                color: result.decision === "Approved" ? "green" : "red"
              }}
            >
              {result.decision}
            </span>
          </p>
          <p>
            <strong>Approval Probability:</strong>{" "}
            {result.approval_probability}
          </p>

          <h4>Reasons</h4>
          <ul>
            {result.reasons.map((reason, index) => (
              <li key={index}>{reason}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
