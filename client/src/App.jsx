import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Verify from "./pages/Verify";
import History from "./pages/History";
import Login from "./pages/Login";

export default function App() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState({
    name: "Vishwa Patel",
    email: "vishwa@docauth.in",
    role: "Enterprise Admin"
  });

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    navigate("/");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    navigate("/login");
  };

  return (
    <div className="app-container">
      <Navbar 
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home onNavigateVerify={() => navigate("/verify")} />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/history" element={<History />} />
          <Route 
            path="/login" 
            element={
              <Login 
                onLoginSuccess={handleLoginSuccess}
                onNavigateHome={() => navigate("/")}
              />
            } 
          />
        </Routes>
      </main>

      <footer style={styles.footer}>
        <div style={styles.footerContainer}>
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
