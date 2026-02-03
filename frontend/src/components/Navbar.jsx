export default function Navbar() {
  return (
    <div style={{
      background: "#0f172a",
      color: "white",
      padding: "15px 40px",
      display: "flex",
      justifyContent: "space-between"
    }}>
      <strong>Loan Approval AI</strong>
      <div>
        <a style={{ color: "white", marginRight: "20px" }}>Home</a>
        <a style={{ color: "white", marginRight: "20px" }}>Try Model</a>
        <a style={{ color: "white" }}>About</a>
      </div>
    </div>
  );``
}
