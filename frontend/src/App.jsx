import { useState, useEffect } from "react";
import "./App.css";

const FIELDS = [
  { key: "Gender",                    label: "Gender",                     type: "select", options: ["Male", "Female", "Other"] },
  { key: "Age_Group",                 label: "Age Group",                  type: "select", options: ["18-25", "26-35", "36-45", "46-55", "55+"] },
  { key: "Region",                    label: "Region",                     type: "select", options: ["Urban", "Suburban", "Rural"] },
  { key: "Loan_Purpose",              label: "Loan Purpose",               type: "select", options: ["Home", "Education", "Business", "Personal", "Medical", "Vehicle"] },
  { key: "Monthly_Income",            label: "Monthly Income ($)",         type: "number", placeholder: "e.g. 5000" },
  { key: "Loan_Amount",               label: "Loan Amount ($)",            type: "number", placeholder: "e.g. 25000" },
  { key: "Interest_Rate",             label: "Interest Rate (%)",          type: "number", placeholder: "e.g. 7.5" },
  { key: "Avg_Transaction_Freq",      label: "Avg Transaction Frequency",  type: "number", placeholder: "e.g. 12" },
  { key: "Avg_Transaction_Amount",    label: "Avg Transaction Amount ($)", type: "number", placeholder: "e.g. 450" },
  { key: "Payment_Irregularity",      label: "Payment Irregularity Score", type: "number", placeholder: "0–10" },
  { key: "Behavioral_Anomaly_Index",  label: "Behavioral Anomaly Index",   type: "number", placeholder: "0–1" },
  { key: "Transaction_Inconsistency", label: "Transaction Inconsistency",  type: "number", placeholder: "0–1" },
  { key: "Default_Risk_Score",        label: "Default Risk Score",         type: "number", placeholder: "0–1" },
];

const STATS = [
  { label: "Model Type",     value: "LightGBM" },
  { label: "Explainability", value: "SHAP" },
  { label: "Policy Rules",   value: "Strict <span>+</span> ML" },
];

const initialForm = Object.fromEntries(FIELDS.map((f) => [f.key, ""]));

export default function App() {
  const [formData,      setFormData]      = useState(initialForm);
  const [result,        setResult]        = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [activeSection, setActiveSection] = useState("form");
  const [errors,        setErrors]        = useState({});

  // ── THEME ──
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem("loanai-theme") || "light"; }
    catch { return "light"; }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("loanai-theme", theme); } catch {}
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  // ── FORM HANDLERS ──
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  const validate = () => {
    const newErrors = {};
    FIELDS.forEach((f) => {
      if (formData[f.key] === "" || formData[f.key] == null)
        newErrors[f.key] = "Required";
    });
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/predict-loan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          Monthly_Income:            Number(formData.Monthly_Income),
          Loan_Amount:               Number(formData.Loan_Amount),
          Interest_Rate:             Number(formData.Interest_Rate),
          Avg_Transaction_Freq:      Number(formData.Avg_Transaction_Freq),
          Avg_Transaction_Amount:    Number(formData.Avg_Transaction_Amount),
          Payment_Irregularity:      Number(formData.Payment_Irregularity),
          Behavioral_Anomaly_Index:  Number(formData.Behavioral_Anomaly_Index),
          Transaction_Inconsistency: Number(formData.Transaction_Inconsistency),
          Default_Risk_Score:        Number(formData.Default_Risk_Score),
        }),
      });
      const data = await response.json();
      setResult(data);
      setActiveSection("result");
    } catch {
      alert("Connection error. Is the backend running on port 8000?");
    }
    setLoading(false);
  };

  const reset = () => {
    setResult(null);
    setFormData(initialForm);
    setErrors({});
    setActiveSection("form");
  };

  const approved    = result?.decision === "Approved";
  const filledCount = Object.values(formData).filter((v) => v !== "").length;

  return (
    <>
      {/* NAV */}
      <nav>
        <div className="nav-logo">
          <span className="nav-logo-dot" />
          LoanAI
        </div>
        <div className="nav-right">
          <div className="nav-tags">
            <span className="nav-tag">LightGBM + SHAP</span>
            <span className="nav-tag">v1.0</span>
          </div>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            aria-label="Toggle theme"
          >
            {theme === "light" ? "☽" : "○"}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-left">
          <p className="hero-eyebrow">Explainable AI · Credit Assessment</p>
          <h1 className="hero-title">
            Loan decisions<br />
            you can <span>trust.</span>
          </h1>
          <p className="hero-desc">
            Machine learning–powered approval engine with full SHAP explainability.
            Every decision is transparent, auditable, and fair.
          </p>
        </div>
        <div className="hero-right">
          {STATS.map((s) => (
            <div className="stat-item" key={s.label}>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" dangerouslySetInnerHTML={{ __html: s.value }} />
            </div>
          ))}
        </div>
      </section>

      {/* MAIN */}
      <div className="main">

        {/* SIDEBAR */}
        <aside className="sidebar">
          <p className="sidebar-title">Navigation</p>
          <div className="sidebar-section">
            {[
              { id: "form",   label: "Loan Assessment" },
              { id: "result", label: "Decision Result"  },
            ].map((s) => (
              <div
                key={s.id}
                className={`sidebar-item ${activeSection === s.id ? "active" : ""}`}
                onClick={() =>
                  s.id === "result" && result
                    ? setActiveSection("result")
                    : setActiveSection("form")
                }
              >
                <span className="dot" />
                {s.label}
              </div>
            ))}
          </div>
          <div className="sidebar-note">
            All 13 features feed the ML model. SHAP values explain each
            factor's contribution to the final decision.
          </div>
        </aside>

        {/* FORM SECTION */}
        {activeSection === "form" && (
          <div className="form-area fade-in">
            <div className="section-header">
              <h2 className="section-title">Applicant Details</h2>
              <span className="section-count">{filledCount} / {FIELDS.length} fields</span>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-grid">
                {FIELDS.map((field) => (
                  <div className="field-group" key={field.key}>
                    <label
                      className={`field-label ${errors[field.key] ? "error-label" : ""}`}
                      htmlFor={field.key}
                    >
                      {field.label}
                      {errors[field.key] && (
                        <span className="field-error">· {errors[field.key]}</span>
                      )}
                    </label>

                    {field.type === "select" ? (
                      <div className="select-wrapper">
                        <select
                          id={field.key}
                          name={field.key}
                          value={formData[field.key]}
                          onChange={handleChange}
                          className={`field-select ${errors[field.key] ? "error" : ""}`}
                        >
                          <option value="">Select…</option>
                          {field.options.map((o) => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <input
                        id={field.key}
                        name={field.key}
                        type="number"
                        step="any"
                        value={formData[field.key]}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        className={`field-input ${errors[field.key] ? "error" : ""}`}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="submit-row">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? (
                    <><div className="spinner" /> Evaluating…</>
                  ) : (
                    <>Evaluate Loan →</>
                  )}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => { setFormData(initialForm); setErrors({}); }}
                >
                  Clear form
                </button>
              </div>
            </form>
          </div>
        )}

        {/* RESULT SECTION */}
        {activeSection === "result" && result && (
          <div className="result-area fade-in">
            <div className="section-header">
              <h2 className="section-title">Decision Result</h2>
              <span className="section-count">Assessment complete</span>
            </div>

            <div className={`result-verdict ${approved ? "approved" : "rejected"}`}>
              <div>
                <p className="verdict-label">Final Decision</p>
                <p className={`verdict-text ${approved ? "approved" : "rejected"}`}>
                  {result.decision}
                </p>
                {result.decision === "Rejected" && result.rejection_type === "policy" && (
                  <div className="result-badge policy">⚠ Rejected by credit policy</div>
                )}
                {result.decision === "Rejected" && result.rejection_type === "model" && (
                  <div className="result-badge model">◆ Rejected by ML risk model</div>
                )}
              </div>

              <div className="verdict-probability">
                <div className={`probability-circle ${approved ? "approved" : "rejected"}`}>
                  <span className={`probability-num ${approved ? "approved" : "rejected"}`}>
                    {typeof result.approval_probability === "number"
                      ? `${(result.approval_probability * 100).toFixed(0)}%`
                      : result.approval_probability}
                  </span>
                </div>
                <p className="probability-label">Approval<br />Probability</p>
              </div>
            </div>

            <div className="reasons-card fade-in-delay">
              <div className="reasons-header">
                <span>◈</span>
                SHAP Explanations · {result.reasons?.length ?? 0} factors
              </div>
              <div className="reasons-list">
                {result.reasons?.map((r, i) => (
                  <div className="reason-item" key={i}>
                    <span className="reason-num">0{i + 1}</span>
                    <span className="reason-text">{r}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="result-actions fade-in-delay2">
              <button className="btn-outline" onClick={reset}>New Assessment</button>
              <button className="btn-secondary" onClick={() => setActiveSection("form")}>
                ← Edit Application
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer>
        <p className="footer-left">© 2025 LoanAI · Explainable Credit Assessment</p>
        <div className="footer-right">
          <span className="footer-tag">LightGBM</span>
          <span className="footer-tag">SHAP XAI</span>
          <span className="footer-tag">Fair Lending</span>
        </div>
      </footer>
    </>
  );
}