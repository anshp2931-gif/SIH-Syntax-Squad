import React, { useEffect, useState, useRef } from "react";
import "./Navbar.css";
import { 
  ShieldCheck, 
  Home as HomeIcon, 
  FileText, 
  History as HistoryIcon, 
  LayoutGrid, 
  ChevronDown,
  Menu,
  X,
  LogOut,
  User as UserIcon
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { checkHealthApi } from "../services/api";

export default function Navbar({ currentUser, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [health, setHealth] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Derive activeTab from current route pathname
  const getActiveTab = () => {
    if (location.pathname === "/") return "home";
    if (location.pathname.startsWith("/verify")) return "verify";
    if (location.pathname.startsWith("/history")) return "history";
    return "";
  };
  const activeTab = getActiveTab();

  const handleNav = (tab) => {
    setMobileMenuOpen(false);
    if (tab === "home") navigate("/");
    else if (tab === "verify") navigate("/verify");
    else if (tab === "history") navigate("/history");
    else if (tab === "overview") {
      navigate("/");
      setTimeout(() => {
        window.scrollTo({ top: 600, behavior: "smooth" });
      }, 100);
    }
  };

  useEffect(() => {
    checkHealthApi().then(setHealth);
    const interval = setInterval(() => {
      checkHealthApi().then(setHealth);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  // Click outside to close profile dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (location.pathname === "/login") {
    return null; // Login page renders its own custom brand header bar
  }

  const userInitials = currentUser?.name
    ? currentUser.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "VP";

  return (
    <header className="header">
      <div className="nav-container">
        <div className="brand" onClick={() => handleNav("home")}>
          <div className="logoWrapper">
            <div className="logoShield">
              <ShieldCheck size={26} color="#FFFFFF" strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <div className="brandName">
              DocAuth <span style={{ color: "#2563EB" }}>India</span>
            </div>
            <div className="brandSub">Secure Documents. Trusted India.</div>
          </div>
        </div>

        <nav className={`nav ${mobileMenuOpen ? "mobile-nav-open" : "mobile-nav-closed"}`}>
          <div className="mobile-nav-header">
             <div className="brandName" style={{ fontSize: "1.1rem" }}>Menu</div>
             <button className="mobile-nav-close" onClick={() => setMobileMenuOpen(false)}>
               <X size={24} color="#64748B" />
             </button>
          </div>
          
          <button
            className={`navBtn ${activeTab === "home" ? "navBtnActive" : ""}`}
            onClick={() => handleNav("home")}
          >
            <HomeIcon size={17} color={activeTab === "home" ? "#2563EB" : "#64748B"} />
            <span>Home</span>
            {activeTab === "home" && <div className="activeIndicator" />}
          </button>

          <button
            className={`navBtn ${activeTab === "verify" ? "navBtnActive" : ""}`}
            onClick={() => handleNav("verify")}
          >
            <FileText size={17} color={activeTab === "verify" ? "#2563EB" : "#64748B"} />
            <span>Verify Document</span>
            {activeTab === "verify" && <div className="activeIndicator" />}
          </button>

          <button
            className={`navBtn ${activeTab === "history" ? "navBtnActive" : ""}`}
            onClick={() => handleNav("history")}
          >
            <HistoryIcon size={17} color={activeTab === "history" ? "#2563EB" : "#64748B"} />
            <span>Audit Log</span>
            {activeTab === "history" && <div className="activeIndicator" />}
          </button>

          <button
            className={`navBtn ${activeTab === "overview" ? "navBtnActive" : ""}`}
            onClick={() => handleNav("overview")}
          >
            <LayoutGrid size={17} color={activeTab === "overview" ? "#2563EB" : "#64748B"} />
            <span>Overview</span>
            {activeTab === "overview" && <div className="activeIndicator" />}
          </button>

          <div className="mobile-auth-section" style={{ width: "100%", marginTop: "12px", paddingTop: "16px", borderTop: "1px solid #E2E8F0" }}>
            {currentUser ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div className="userAvatar">{userInitials}</div>
                  <div>
                    <div style={{ fontWeight: 600, color: "#0F172A", fontSize: "0.9rem" }}>{currentUser.name}</div>
                    <div style={{ fontSize: "0.78rem", color: "#64748B" }}>{currentUser.role || "Enterprise Admin"}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout && onLogout();
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #FCA5A5",
                    background: "#FEF2F2",
                    color: "#DC2626",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/login");
                }}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "none", background: "#2563EB", color: "#FFFFFF", fontWeight: 600, cursor: "pointer" }}
              >
                Sign In
              </button>
            )}
          </div>
        </nav>

        <div className="rightSection">
          <div className="statusBadge">
            <span className="statusDot" />
            <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#16A34A" }} className="statusText">
              Online
            </span>
          </div>

          {currentUser ? (
            <div className="profileWrapper" ref={dropdownRef} style={{ position: "relative" }}>
              <div 
                className="userProfile" 
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                style={{ cursor: "pointer" }}
              >
                <div className="userAvatar">{userInitials}</div>
                <ChevronDown size={15} color="#64748B" className="chevron-down-icon" />
              </div>

              {profileDropdownOpen && (
                <div 
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "calc(100% + 8px)",
                    background: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: "10px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                    width: "220px",
                    padding: "12px",
                    zIndex: 1000
                  }}
                >
                  <div style={{ paddingBottom: "10px", borderBottom: "1px solid #F1F5F9" }}>
                    <div style={{ fontWeight: 600, color: "#0F172A", fontSize: "0.88rem" }}>{currentUser.name}</div>
                    <div style={{ color: "#64748B", fontSize: "0.78rem", marginTop: "2px" }}>{currentUser.email}</div>
                    <div style={{ display: "inline-block", background: "#EFF6FF", color: "#2563EB", fontSize: "0.72rem", padding: "2px 8px", borderRadius: "4px", marginTop: "6px", fontWeight: 600 }}>
                      {currentUser.role || "Enterprise Admin"}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onLogout && onLogout();
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      width: "100%",
                      padding: "8px 10px",
                      marginTop: "8px",
                      background: "transparent",
                      border: "none",
                      borderRadius: "6px",
                      color: "#DC2626",
                      fontSize: "0.85rem",
                      fontWeight: 500,
                      cursor: "pointer",
                      textAlign: "left"
                    }}
                  >
                    <LogOut size={15} color="#DC2626" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              style={{
                background: "#2563EB",
                border: "none",
                color: "#FFFFFF",
                padding: "7px 16px",
                borderRadius: "8px",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(37, 99, 235, 0.2)"
              }}
            >
              Sign In
            </button>
          )}

          <button className="hamburger-btn" onClick={() => setMobileMenuOpen(true)}>
             <Menu size={24} color="#0F172A" />
          </button>
        </div>
        
        {mobileMenuOpen && (
          <div className="mobile-nav-backdrop" onClick={() => setMobileMenuOpen(false)}></div>
        )}
      </div>
    </header>
  );
}
