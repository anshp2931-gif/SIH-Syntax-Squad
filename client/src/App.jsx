import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Verify from "./pages/Verify";
import History from "./pages/History";

export default function App() {
  const [activeTab, setActiveTab] = useState("verify");

  return (
    <div className="app-container">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main style={{ flex: 1 }}>
        {activeTab === "home" && <Home onNavigateVerify={() => setActiveTab("verify")} />}
        {activeTab === "verify" && <Verify />}
        {activeTab === "history" && <History />}
      </main>

      <footer style={styles.footer}>
        <div style={styles.footerContainer}>
          <div>
            <strong>DocAuth India</strong> — Multi-Layer Document Authenticity Platform
          </div>
          <div style={{ color: "#6b7280", fontSize: "0.8rem", marginTop: "4px" }}>
            PAN Card + Driving Licence • Extensible for Aadhaar, Voter ID, DigiLocker & Authorized Issuer APIs
          </div>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  footer: {
    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
    background: "rgba(11, 15, 25, 0.9)",
    padding: "24px",
    marginTop: "auto"
  },
  footerContainer: {
    maxWidth: "1280px",
    margin: "0 auto",
    textAlign: "center",
    fontSize: "0.88rem"
  }
};
