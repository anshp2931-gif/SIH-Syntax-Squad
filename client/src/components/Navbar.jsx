import React, { useEffect, useState } from "react";
import "./Navbar.css";
import { 
  ShieldCheck, 
  Home as HomeIcon, 
  FileText, 
  History as HistoryIcon, 
  LayoutGrid, 
  ChevronDown,
  Menu,
  X
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { checkHealthApi } from "../services/api";

export default function Navbar({ currentUser, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [health, setHealth] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkHealthApi().then(setHealth);
    const interval = setInterval(() => {
      checkHealthApi().then(setHealth);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => setMobileMenuOpen(false), [location.pathname]);

  if (location.pathname === "/login") {
    return null; // Login page renders its own custom brand header bar
  }

  const isHome = location.pathname === "/";
  const isVerify = location.pathname === "/verify";
  const isHistory = location.pathname === "/history";

  return (
    <header className="header">
      <div className="nav-container">
        <div className="brand" onClick={() => navigate("/")}>
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
            className={`navBtn ${isHome ? "navBtnActive" : ""}`}
            onClick={() => navigate("/")}
          >
            <HomeIcon size={17} color={isHome ? "#2563EB" : "#64748B"} />
            <span>Home</span>
            {isHome && <div className="activeIndicator" />}
          </button>

          <button
            className={`navBtn ${isVerify ? "navBtnActive" : ""}`}
            onClick={() => navigate("/verify")}
          >
            <FileText size={17} color={isVerify ? "#2563EB" : "#64748B"} />
            <span>Verify Document</span>
            {isVerify && <div className="activeIndicator" />}
          </button>

          <button
            className={`navBtn ${isHistory ? "navBtnActive" : ""}`}
            onClick={() => navigate("/history")}
          >
            <HistoryIcon size={17} color={isHistory ? "#2563EB" : "#64748B"} />
            <span>Audit Log</span>
            {isHistory && <div className="activeIndicator" />}
          </button>

          <button
            className={`navBtn ${isHome ? "navBtnActive" : ""}`}
            onClick={() => navigate("/")}
          >
            <LayoutGrid size={17} color={isHome ? "#2563EB" : "#64748B"} />
            <span>Overview</span>
            {isHome && <div className="activeIndicator" />}
          </button>
        </nav>

        <div className="rightSection">
          <div className="statusBadge">
            <span className="statusDot" />
            <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#16A34A" }} className="statusText">
              Online
            </span>
          </div>
          <div className="userProfile">
            <div className="userAvatar">VP</div>
            <ChevronDown size={15} color="#64748B" className="chevron-down-icon"/>
          </div>
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
