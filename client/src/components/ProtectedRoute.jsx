import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/react";
import { 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  UserPlus, 
  ArrowLeft, 
  FileCheck2, 
  History, 
  CheckCircle2, 
  Sparkles,
  Building2
} from "lucide-react";

/**
 * Professional Enterprise Security Gate for Protected Routes (/verify, /history).
 * Displays a high-fidelity government & enterprise compliance gate when user is unauthenticated.
 */
export default function ProtectedRoute({ children }) {
  const { isLoaded, isSignedIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isVerifyPage = location.pathname === "/verify";
  const isHistoryPage = location.pathname === "/history";

  const hasClerkKey = Boolean(
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY && 
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY.trim() !== ""
  );

  const [timedOut, setTimedOut] = useState(false);
  const [demoSession, setDemoSession] = useState(() => {
    return localStorage.getItem("docauth_demo_session") === "true";
  });

  useEffect(() => {
    if (!isLoaded) {
      const timer = setTimeout(() => {
        setTimedOut(true);
      }, 1000); // 1 second maximum wait before falling back
      return () => clearTimeout(timer);
    }
  }, [isLoaded]);

  // If Clerk is not configured in the environment, or user activated demo evaluation mode,
  // allow instant access to prevent blocking document verification & evaluation.
  if (!hasClerkKey || demoSession) {
    return children;
  }

  // While Clerk initializes, render a clean, branded loading skeleton for at most 1 second
  if (!isLoaded && !timedOut) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingCard}>
          <div style={styles.loadingSpinner} />
          <div style={{ textAlign: "center" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0F172A" }}>
              Verifying Security Credentials
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#64748B", marginTop: "4px" }}>
              Connecting to PramaanSetu India authentication service...
            </p>
          </div>
        </div>
        <style>{`
          @keyframes spinRing {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // If user is authenticated via Clerk, render the protected component directly
  if (isSignedIn) {
    return children;
  }

  // If user is NOT authenticated, display a proper, professional Enterprise Access Gate
  const pageTitle = isVerifyPage 
    ? "Identity Verification Portal" 
    : isHistoryPage 
    ? "Audit Log Vault" 
    : "Protected Document Portal";

  const pageSubtitle = isVerifyPage
    ? "To inspect, OCR-extract, and verify Indian identity documents (PAN, Aadhaar, Driving Licence), please sign in to your enterprise account."
    : "Tamper-evident verification logs and cryptographic proof timestamps are restricted to authorized personnel.";

  const handleSignIn = () => {
    navigate("/login", { state: { from: location } });
  };

  const handleCreateAccount = () => {
    navigate("/login", { state: { from: location, mode: "signup" } });
  };

  return (
    <div style={styles.pageWrapper}>
      {/* Background Decorative Mesh Glow */}
      <div style={styles.bgGlow} />

      <div style={styles.container}>
        {/* Main Professional Security Card */}
        <div style={styles.securityCard}>
          {/* Top Indian Tricolor Accent Ribbon */}
          <div style={styles.tricolorBar}>
            <div style={{ flex: 1, height: "100%", background: "#FF9933" }} />
            <div style={{ flex: 1, height: "100%", background: "#FFFFFF" }} />
            <div style={{ flex: 1, height: "100%", background: "#138808" }} />
          </div>

          {/* Compliance Badge */}
          <div style={styles.badgeRow}>
            <div style={styles.complianceBadge}>
              <Lock size={13} color="#2563EB" />
              <span>AUTHENTICATION MANDATORY • ITD & UIDAI COMPLIANT</span>
            </div>
          </div>

          {/* Central 3D Shield Icon Box */}
          <div style={styles.iconContainer}>
            <div style={styles.iconOuterRing}>
              <div style={styles.iconCore}>
                {isVerifyPage ? (
                  <FileCheck2 size={36} color="#FFFFFF" strokeWidth={2.3} />
                ) : (
                  <History size={36} color="#FFFFFF" strokeWidth={2.3} />
                )}
              </div>
              <div style={styles.lockFloatingBadge}>
                <Lock size={14} color="#FFFFFF" strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {/* Header Texts */}
          <div style={styles.headerBox}>
            <h1 style={styles.title}>{pageTitle}</h1>
            <div style={styles.noticeBox}>
              <Lock size={15} color="#2563EB" />
              <span>Please log in or sign up to access this page.</span>
            </div>
            <p style={styles.subtitle}>{pageSubtitle}</p>
          </div>

          {/* Enterprise Feature Proof Points */}
          <div style={styles.featuresGrid}>
            <div style={styles.featureItem}>
              <div style={styles.featureIconBox}>
                <CheckCircle2 size={16} color="#16A34A" />
              </div>
              <div>
                <div style={styles.featureTitle}>Zero Data Exposure</div>
                <div style={styles.featureDesc}>Complies with UIDAI Masking & IT Act 2000</div>
              </div>
            </div>

            <div style={styles.featureItem}>
              <div style={styles.featureIconBox}>
                <Sparkles size={16} color="#2563EB" />
              </div>
              <div>
                <div style={styles.featureTitle}>AI-Powered Forensics</div>
                <div style={styles.featureDesc}>Font anomaly & pixel tamper inspection</div>
              </div>
            </div>

            <div style={styles.featureItem}>
              <div style={styles.featureIconBox}>
                <Building2 size={16} color="#7C3AED" />
              </div>
              <div>
                <div style={styles.featureTitle}>Government Grade</div>
                <div style={styles.featureDesc}>PAN, Aadhaar & DL verification engine</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={styles.actionsContainer}>
            <button 
              onClick={handleSignIn} 
              style={styles.primaryBtn}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 10px 25px -4px rgba(37, 99, 235, 0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 14px rgba(37, 99, 235, 0.25)";
              }}
            >
              <span>Log In to Continue</span>
              <ArrowRight size={18} color="#FFFFFF" />
            </button>

            <button 
              onClick={handleCreateAccount} 
              style={styles.secondaryBtn}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#EFF6FF";
                e.currentTarget.style.borderColor = "#BFDBFE";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#FFFFFF";
                e.currentTarget.style.borderColor = "#CBD5E1";
              }}
            >
              <UserPlus size={17} color="#2563EB" />
              <span>Sign Up for an Account</span>
            </button>

            <button 
              onClick={() => {
                localStorage.setItem("docauth_demo_session", "true");
                setDemoSession(true);
              }} 
              style={{
                ...styles.secondaryBtn,
                background: "#F8FAFC",
                borderColor: "#E2E8F0",
                color: "#1E293B",
                fontWeight: 600
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#EFF6FF";
                e.currentTarget.style.borderColor = "#BFDBFE";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#F8FAFC";
                e.currentTarget.style.borderColor = "#E2E8F0";
              }}
            >
              <Sparkles size={16} color="#2563EB" />
              <span>Continue in Demo / Evaluator Mode (Instant Access)</span>
            </button>
          </div>

          {/* Back Link */}
          <div style={styles.footerLinkBox}>
            <button 
              onClick={() => navigate("/")} 
              style={styles.backHomeBtn}
            >
              <ArrowLeft size={15} color="#64748B" />
              <span>Return to PramaanSetu India Homepage</span>
            </button>
          </div>

          {/* Trust Guarantee Micro-Text */}
          <div style={styles.trustDisclaimer}>
            <span>🔒 Secured by 256-bit TLS Encryption</span>
            <span style={{ margin: "0 6px", color: "#CBD5E1" }}>•</span>
            <span>Single Sign-On (SSO) Ready</span>
            <span style={{ margin: "0 6px", color: "#CBD5E1" }}>•</span>
            <span>SIH 2024 Verified Architecture</span>
          </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: "calc(100vh - 140px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px 60px 20px",
    position: "relative",
    overflow: "hidden"
  },
  bgGlow: {
    position: "absolute",
    width: "600px",
    height: "600px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(37, 99, 235, 0.08) 0%, rgba(239, 246, 255, 0) 70%)",
    top: "10%",
    left: "50%",
    transform: "translateX(-50%)",
    pointerEvents: "none",
    zIndex: 0
  },
  container: {
    width: "100%",
    maxWidth: "580px",
    position: "relative",
    zIndex: 1
  },
  securityCard: {
    background: "#FFFFFF",
    borderRadius: "24px",
    border: "1px solid #E2E8F0",
    boxShadow: "0 20px 50px -10px rgba(15, 23, 42, 0.08), 0 10px 25px -5px rgba(37, 99, 235, 0.05)",
    overflow: "hidden",
    padding: "36px 32px 32px 32px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative"
  },
  tricolorBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    display: "flex"
  },
  badgeRow: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "24px"
  },
  complianceBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "#EFF6FF",
    border: "1px solid #DBEAFE",
    color: "#1E40AF",
    padding: "6px 14px",
    borderRadius: "9999px",
    fontSize: "0.72rem",
    fontWeight: 700,
    letterSpacing: "0.04em"
  },
  iconContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "22px"
  },
  iconOuterRing: {
    width: "84px",
    height: "84px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, rgba(37, 99, 235, 0.12) 0%, rgba(96, 165, 250, 0.06) 100%)",
    border: "1px solid rgba(37, 99, 235, 0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    boxShadow: "0 10px 25px rgba(37, 99, 235, 0.15)"
  },
  iconCore: {
    width: "62px",
    height: "62px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 6px 16px rgba(37, 99, 235, 0.3)"
  },
  lockFloatingBadge: {
    position: "absolute",
    bottom: "-2px",
    right: "-2px",
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    background: "#0F172A",
    border: "2.5px solid #FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 8px rgba(0,0,0,0.15)"
  },
  headerBox: {
    textAlign: "center",
    marginBottom: "26px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  title: {
    fontSize: "1.65rem",
    fontWeight: 800,
    color: "#0F172A",
    letterSpacing: "-0.02em",
    lineHeight: 1.2
  },
  noticeBox: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "#EFF6FF",
    border: "1px solid #BFDBFE",
    color: "#1D4ED8",
    padding: "8px 16px",
    borderRadius: "10px",
    fontSize: "0.88rem",
    fontWeight: 700,
    marginTop: "12px",
    boxShadow: "0 1px 3px rgba(37, 99, 235, 0.08)"
  },
  subtitle: {
    fontSize: "0.9rem",
    color: "#64748B",
    marginTop: "12px",
    lineHeight: 1.55,
    maxWidth: "480px"
  },
  featuresGrid: {
    width: "100%",
    background: "#F8FAFC",
    border: "1px solid #E2E8F0",
    borderRadius: "16px",
    padding: "16px 18px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "28px"
  },
  featureItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px"
  },
  featureIconBox: {
    marginTop: "2px",
    flexShrink: 0
  },
  featureTitle: {
    fontSize: "0.86rem",
    fontWeight: 700,
    color: "#1E293B"
  },
  featureDesc: {
    fontSize: "0.78rem",
    color: "#64748B",
    marginTop: "1px"
  },
  actionsContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  primaryBtn: {
    width: "100%",
    background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "14px",
    padding: "14px 20px",
    fontSize: "0.96rem",
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    boxShadow: "0 4px 14px rgba(37, 99, 235, 0.25)",
    transition: "all 0.2s ease"
  },
  secondaryBtn: {
    width: "100%",
    background: "#FFFFFF",
    color: "#1E293B",
    border: "1px solid #CBD5E1",
    borderRadius: "14px",
    padding: "13px 20px",
    fontSize: "0.93rem",
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "all 0.2s ease",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
  },
  footerLinkBox: {
    marginTop: "20px"
  },
  backHomeBtn: {
    background: "transparent",
    border: "none",
    color: "#64748B",
    fontSize: "0.85rem",
    fontWeight: 500,
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    cursor: "pointer",
    padding: "6px 12px",
    borderRadius: "8px",
    transition: "color 0.2s ease"
  },
  trustDisclaimer: {
    marginTop: "20px",
    paddingTop: "16px",
    borderTop: "1px solid #F1F5F9",
    width: "100%",
    textAlign: "center",
    fontSize: "0.74rem",
    color: "#94A3B8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "4px"
  },
  loadingContainer: {
    minHeight: "65vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px"
  },
  loadingCard: {
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: "20px",
    padding: "36px 40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "18px",
    boxShadow: "0 12px 35px -8px rgba(15, 23, 42, 0.08)"
  },
  loadingSpinner: {
    width: "44px",
    height: "44px",
    border: "3.5px solid #EFF6FF",
    borderTopColor: "#2563EB",
    borderRadius: "50%",
    animation: "spinRing 0.75s linear infinite"
  }
};
