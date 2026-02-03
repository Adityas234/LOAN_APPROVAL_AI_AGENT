import { useState } from "react";
import axios from "axios";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

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
    setLoading(false);
  };

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section style={{ padding: "60px", textAlign: "center" }}>
        <h1>Explainable Loan Approval AI</h1>
        <p>
          A machine learning system that predicts loan approval decisions
          with transparent explanations using SHAP.
        </p>
      </section>

      {/* Form */}
      <section style={{
        background: "white",
        maxWidth: "900px",
        margin: "auto",
        padding: "40px",
        borderRadius: "8px"
      }}>
        <h2>Check Loan Eligibility</h2>

        <form onSubmit={handleSubmit}>
          {Object.keys(formData).map((key) => (
            <div key={key}>
              <label>{key}</label>
              <input
                name={key}
                value={formData[key]}
                onChange={handleChange}
                required
              />
            </div>
          ))}

          <button type="submit">
            {loading ? "Evaluating..." : "Evaluate Loan"}
          </button>
        </form>
      </section>

      {/* Result */}
      {result && (
  <section
    style={{
      maxWidth: "900px",
      margin: "40px auto",
      padding: "30px",
      borderRadius: "8px",
      background:
        result.decision === "Approved" ? "#ecfdf5" : "#fef2f2",
      border:
        result.decision === "Approved"
          ? "1px solid #22c55e"
          : "1px solid #ef4444"
    }}
  >
    <h2>Decision Result</h2>

    <p>
      <strong>Decision:</strong>{" "}
      <span
        style={{
          color: result.decision === "Approved" ? "green" : "red",
          fontWeight: "bold"
        }}
      >
        {result.decision}
      </span>
    </p>

    <p>
      <strong>Approval Probability:</strong>{" "}
      {result.approval_probability}
    </p>

    {result.decision === "Rejected" && result.rejection_type === "policy" && (
      <p style={{ color: "#b91c1c", fontWeight: "bold" }}>
        ⚠ Rejected due to strict credit policy rules
      </p>
    )}

    {result.decision === "Rejected" && result.rejection_type === "model" && (
      <p style={{ color: "#92400e", fontWeight: "bold" }}>
        ℹ Rejected based on machine learning risk assessment
      </p>
    )}

    <h3>Reasons</h3>
    <ul>
      {result.reasons.map((r, i) => (
        <li key={i}>{r}</li>
      ))}
    </ul>
  </section>
)}


      {/* About */}
      <section style={{ padding: "60px", textAlign: "center" }}>
        <h2>About This Project</h2>
        <p>
          This system uses LightGBM for prediction and SHAP for explainable AI,
          ensuring transparency and trust in loan approval decisions.
        </p>
      </section>

      <Footer />
    </>
  );
}

export default App;
