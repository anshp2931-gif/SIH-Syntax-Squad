import React, { useEffect, useState } from "react";
import { 
  ShieldCheck, 
  Home as HomeIcon, 
  FileText, 
  History as HistoryIcon, 
  LayoutGrid, 
  ChevronDown 
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { checkHealthApi } from "../services/api";

export default function Navbar({ currentUser, onLogout }) {
  const [health, setHealth] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    checkHealthApi().then(setHealth);
    const interval = setInterval(() => {
      checkHealthApi().then(setHealth);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const getActiveTab = () => {
    if (location.pathname === "/verify") return "verify";
    if (location.pathname === "/history") return "history";
    if (location.pathname === "/login") return "login";
    return "home";
  };

  const activeTab = getActiveTab();
  const isOnline = health?.status === "HEALTHY" || health !== null;

  if (location.pathname === "/login") {
    return null; // Login page renders its own custom brand header bar
  }

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        {/* Brand */}
        <div style={styles.brand} onClick={() => navigate("/")}>
          <div style={styles.logoWrapper}>
            <div style={styles.logoShield}>
              <ShieldCheck size={26} color="#FFFFFF" strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <div style={styles.brandName}>
              DocAuth <span style={{ color: "#2563EB" }}>India</span>
            </div>
            <div style={styles.brandSub}>Secure Documents. Trusted India.</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={styles.nav}>
          <button
            style={{
              ...styles.navBtn,
              ...(activeTab === "home" ? styles.navBtnActive : {})
            }}
            onClick={() => navigate("/")}
          >
            <HomeIcon size={17} color={activeTab === "home" ? "#2563EB" : "#64748B"} />
            <span>Home</span>
            {activeTab === "home" && <div style={styles.activeIndicator} />}
          </button>

          <button
            style={{
              ...styles.navBtn,
              ...(activeTab === "verify" ? styles.navBtnActive : {})
            }}
            onClick={() => navigate("/verify")}
          >
            <FileText size={17} color={activeTab === "verify" ? "#2563EB" : "#64748B"} />
            <span>Verify Document</span>
            {activeTab === "verify" && <div style={styles.activeIndicator} />}
          </button>

          <button
            style={{
              ...styles.navBtn,
              ...(activeTab === "history" ? styles.navBtnActive : {})
            }}
            onClick={() => navigate("/history")}
          >
            <HistoryIcon size={17} color={activeTab === "history" ? "#2563EB" : "#64748B"} />
            <span>Audit Log</span>
            {activeTab === "history" && <div style={styles.activeIndicator} />}
          </button>

          <button
            style={{
              ...styles.navBtn,
              ...(activeTab === "overview" ? styles.navBtnActive : {})
            }}
            onClick={() => navigate("/")}
          >
            <LayoutGrid size={17} color={activeTab === "overview" ? "#2563EB" : "#64748B"} />
            <span>Overview</span>
            {activeTab === "overview" && <div style={styles.activeIndicator} />}
          </button>
        </nav>

        {/* Right Section: Status Badge & User Auth Profile */}
        <div style={styles.rightSection}>
          <div style={styles.statusBadge}>
            <span style={styles.statusDot} />
            <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#16A34A" }}>
              System Online
            </span>
          </div>

          {currentUser ? (
            <div style={styles.userProfileWrapper}>
              <div 
                style={styles.userProfile}
                onClick={() => setShowUserDropdown(!showUserDropdown)}
              >
                <div style={styles.userAvatar}>
                  {currentUser.name ? currentUser.name.substring(0, 2).toUpperCase() : "VP"}
                </div>
                <ChevronDown size={15} color="#64748B" />
              </div>

              {showUserDropdown && (
                <div style={styles.userDropdownMenu}>
                  <div style={styles.dropdownHeader}>
                    <div style={{ fontWeight: 700, color: "#0F172A", fontSize: "0.9rem" }}>
                      {currentUser.name || "Vishwa Patel"}
                    </div>
                    <div style={{ color: "#64748B", fontSize: "0.78rem" }}>
                      {currentUser.email || "vishwa@example.com"}
                    </div>
                  </div>
                  <div style={styles.dropdownDivider} />
                  <button
                    style={styles.dropdownItem}
                    onClick={() => {
                      setShowUserDropdown(false);
                      if (onLogout) onLogout();
                    }}
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              style={styles.signInHeaderBtn}
              onClick={() => navigate("/login")}
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderBottom: "1px solid #E2E8F0",
    position: "sticky",
    top: 0,
    zIndex: 100
  },
  container: {
    maxWidth: "1320px",
    margin: "0 auto",
    padding: "12px 28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
    userSelect: "none"
  },
  logoWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  logoShield: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: "#2563EB",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 10px rgba(37, 99, 235, 0.2)"
  },
  brandName: {
    fontSize: "1.25rem",
    fontWeight: 800,
    color: "#0F172A",
    letterSpacing: "-0.03em",
    lineHeight: 1.1
  },
  brandSub: {
    fontSize: "0.74rem",
    color: "#64748B",
    fontWeight: 500,
    marginTop: "2px"
  },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  navBtn: {
    background: "transparent",
    border: "none",
    color: "#64748B",
    fontSize: "0.92rem",
    fontWeight: 600,
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    position: "relative",
    transition: "all 0.15s ease"
  },
  navBtnActive: {
    color: "#2563EB"
  },
  activeIndicator: {
    position: "absolute",
    bottom: "-12px",
    left: "16px",
    right: "16px",
    height: "3px",
    borderRadius: "3px 3px 0 0",
    background: "#2563EB"
  },
  rightSection: {
    display: "flex",
    alignItems: "center",
    gap: "16px"
  },
  statusBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "#ECFDF5",
    border: "1px solid #A7F3D0",
    padding: "5px 12px",
    borderRadius: "9999px"
  },
  statusDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#16A34A",
    boxShadow: "0 0 0 2px rgba(22, 163, 74, 0.2)"
  },
  userProfile: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    cursor: "pointer",
    padding: "2px",
    borderRadius: "9999px"
  },
  userAvatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "#2563EB",
    color: "#FFFFFF",
    fontWeight: 700,
    fontSize: "0.85rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 6px rgba(37, 99, 235, 0.2)"
  },
  userProfileWrapper: {
    position: "relative"
  },
  userDropdownMenu: {
    position: "absolute",
    right: 0,
    top: "48px",
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: "12px",
    padding: "12px",
    width: "200px",
    boxShadow: "0 10px 25px rgba(15, 23, 42, 0.1)",
    zIndex: 100
  },
  dropdownHeader: {
    paddingBottom: "8px"
  },
  dropdownDivider: {
    height: "1px",
    background: "#E2E8F0",
    margin: "6px 0"
  },
  dropdownItem: {
    width: "100%",
    textAlign: "left",
    background: "transparent",
    border: "none",
    color: "#DC2626",
    fontWeight: 600,
    fontSize: "0.88rem",
    padding: "8px 6px",
    borderRadius: "6px",
    cursor: "pointer"
  },
  signInHeaderBtn: {
    background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
    color: "#FFFFFF",
    fontWeight: 700,
    fontSize: "0.88rem",
    padding: "8px 18px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)"
  }
};
