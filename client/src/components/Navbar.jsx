import React, { useEffect, useState } from "react";
import { ShieldCheck, FileCheck, History, Info, Activity } from "lucide-react";
import { checkHealthApi } from "../services/api";

export default function Navbar({ activeTab, setActiveTab }) {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    checkHealthApi().then(setHealth);
    const interval = setInterval(() => {
      checkHealthApi().then(setHealth);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const isOnline = health?.status === "HEALTHY";

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        {/* Brand */}
        <div style={styles.brand} onClick={() => setActiveTab("home")}>
          <div style={styles.logoIcon}>
            <ShieldCheck size={28} color="#6366f1" />
          </div>
          <div>
            <div style={styles.brandName}>
              DocAuth <span className="gradient-text">India</span>
            </div>
            <div style={styles.brandSub}>Indian Identity Verification System</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={styles.nav}>
          <button
            style={{
              ...styles.navBtn,
              ...(activeTab === "verify" ? styles.navBtnActive : {})
            }}
            onClick={() => setActiveTab("verify")}
          >
            <FileCheck size={18} />
            Verify Document
          </button>

          <button
            style={{
              ...styles.navBtn,
              ...(activeTab === "history" ? styles.navBtnActive : {})
            }}
            onClick={() => setActiveTab("history")}
          >
            <History size={18} />
            Audit Log
          </button>

          <button
            style={{
              ...styles.navBtn,
              ...(activeTab === "home" ? styles.navBtnActive : {})
            }}
            onClick={() => setActiveTab("home")}
          >
            <Info size={18} />
            Overview
          </button>
        </nav>

        {/* API Health Status */}
        <div style={styles.statusBadge}>
          <Activity size={15} color={isOnline ? "#10b981" : "#ef4444"} />
          <span style={{ fontSize: "0.8rem", fontWeight: 600, color: isOnline ? "#10b981" : "#ef4444" }}>
            {isOnline ? "API Online" : "Connecting..."}
          </span>
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    background: "rgba(11, 15, 25, 0.85)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    position: "sticky",
    top: 0,
    zIndex: 100
  },
  container: {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "14px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer"
  },
  logoIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    background: "rgba(99, 102, 241, 0.12)",
    border: "1px solid rgba(99, 102, 241, 0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  brandName: {
    fontSize: "1.25rem",
    fontWeight: 800,
    letterSpacing: "-0.03em"
  },
  brandSub: {
    fontSize: "0.75rem",
    color: "#9ca3af",
    fontWeight: 500
  },
  nav: {
    display: "flex",
    gap: "8px",
    background: "rgba(17, 24, 39, 0.6)",
    padding: "4px",
    borderRadius: "10px",
    border: "1px solid rgba(255, 255, 255, 0.06)"
  },
  navBtn: {
    background: "transparent",
    border: "none",
    color: "#9ca3af",
    fontSize: "0.88rem",
    fontWeight: 600,
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.2s ease"
  },
  navBtnActive: {
    background: "rgba(99, 102, 241, 0.2)",
    color: "#818cf8",
    border: "1px solid rgba(99, 102, 241, 0.3)"
  },
  statusBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "rgba(17, 24, 39, 0.8)",
    padding: "6px 12px",
    borderRadius: "9999px",
    border: "1px solid rgba(255, 255, 255, 0.08)"
  }
};
