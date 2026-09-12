import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate, useLocation } from "react-router-dom";
import { useUser, useClerk, AuthenticateWithRedirectCallback } from "@clerk/react";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Verify from "./pages/Verify";
import History from "./pages/History";
import Login from "./pages/Login";

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const [currentUser, setCurrentUser] = useState(null);

  // Sync session with Clerk Auth state
  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn && user) {
        setCurrentUser({
          uid: user.id,
          name: user.fullName || user.firstName || user.primaryEmailAddress?.emailAddress?.split("@")[0] || "Enterprise User",
          email: user.primaryEmailAddress?.emailAddress || "",
          photoURL: user.imageUrl || null,
          role: "Enterprise Admin"
        });
      } else {
        setCurrentUser(null);
      }
    }
  }, [isLoaded, isSignedIn, user]);

  const handleLoginSuccess = (userData) => {
    if (userData) setCurrentUser(userData);
    const destination = location.state?.from?.pathname || "/";
    navigate(destination, { replace: true });
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error("Clerk signOut error:", err);
    }
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
          <Route 
            path="/verify" 
            element={
              <ProtectedRoute>
                <Verify />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/history" 
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/login" 
            element={
              isLoaded && isSignedIn ? (
                <Navigate to={location.state?.from?.pathname || "/"} replace />
              ) : (
                <Login 
                  onLoginSuccess={handleLoginSuccess}
                  onNavigateHome={() => navigate("/")}
                />
              )
            } 
          />
          {/* Clerk SSO Callback handler for Google & Apple redirect flows */}
          <Route 
            path="/sso-callback" 
            element={<AuthenticateWithRedirectCallback />} 
          />
        </Routes>
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
