import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Verify from "./pages/Verify";
import History from "./pages/History";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="app-container">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main style={{ flex: 1 }}>
        {activeTab === "home" && <Home onNavigateVerify={() => setActiveTab("verify")} />}
        {activeTab === "verify" && <Verify />}
        {activeTab === "history" && <History />}
        {activeTab === "overview" && <Home onNavigateVerify={() => setActiveTab("verify")} />}
      </main>

      <footer className="footer" style={styles.footer}>
        <div className="footerContainer" style={styles.footerContainer}>
          <div style={{ color: "#334155", fontWeight: 600 }}>
            <strong>DocAuth India</strong> — Enterprise Indian Document Authenticity Platform
          </div>
          <div style={{ color: "#64748b", fontSize: "0.82rem", marginTop: "6px" }}>
            PAN Card • Driving Licence • Aadhaar Verification Architecture • DigiLocker Integration Ready
          </div>
          <div style={{ color: "#94a3b8", fontSize: "0.75rem", marginTop: "4px" }}>
            Compliant with UIDAI, ITD-NSDL, and MoRTH-Parivahan security guidelines.
          </div>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  footer: {
    borderTop: "1px solid #edf2f7",
    background: "#ffffff",
    padding: "24px 20px",
    marginTop: "auto"
  },
  footerContainer: {
    maxWidth: "1320px",
    margin: "0 auto",
    textAlign: "center",
    fontSize: "0.88rem"
  }
};
