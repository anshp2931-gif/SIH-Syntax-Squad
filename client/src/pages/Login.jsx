import React, { useState } from "react";
import {
  ShieldCheck,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Smartphone,
  Zap,
  Landmark,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import "./Login.css";

export default function Login({ onLoginSuccess, onNavigateHome }) {
  const [authMode, setAuthMode] = useState("signin"); // "signin", "otp", "signup"
  const [showPassword, setShowPassword] = useState(false);
  
  // Form States
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (authMode === "signin") {
      if (!emailOrPhone.trim()) {
        setErrorMsg("Please enter your email or mobile number.");
        return;
      }
      if (!password) {
        setErrorMsg("Please enter your password.");
        return;
      }

      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        const userData = {
          name: emailOrPhone.includes("@") 
            ? emailOrPhone.split("@")[0].toUpperCase() 
            : "Enterprise User",
          email: emailOrPhone,
          role: "Enterprise Admin",
          verified: true
        };
        setSuccessMsg("Authentication successful! Redirecting...");
        setTimeout(() => {
          if (onLoginSuccess) onLoginSuccess(userData);
          else if (onNavigateHome) onNavigateHome();
        }, 800);
      }, 1000);
    } 
    else if (authMode === "otp") {
      if (!emailOrPhone.trim()) {
        setErrorMsg("Please enter your registered mobile number.");
        return;
      }
      if (!otpSent) {
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
          setOtpSent(true);
          setSuccessMsg("OTP sent to " + emailOrPhone + ". Enter '123456' to verify.");
        }, 800);
      } else {
        if (otpCode.trim() !== "123456" && otpCode.trim().length !== 6) {
          setErrorMsg("Invalid OTP code. Try entering 123456 for demo.");
          return;
        }
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
          const userData = {
            name: "Verified User",
            email: emailOrPhone,
            role: "Government Analyst",
            verified: true
          };
          setSuccessMsg("OTP Verified! Redirecting...");
          setTimeout(() => {
            if (onLoginSuccess) onLoginSuccess(userData);
            else if (onNavigateHome) onNavigateHome();
          }, 800);
        }, 900);
      }
    }
    else if (authMode === "signup") {
      if (!fullName.trim() || !emailOrPhone.trim() || !password) {
        setErrorMsg("Please fill in all required fields.");
        return;
      }
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        const userData = {
          name: fullName.trim(),
          email: emailOrPhone.trim(),
          role: "Enterprise User",
          verified: true
        };
        setSuccessMsg("Account created successfully! Logging you in...");
        setTimeout(() => {
          if (onLoginSuccess) onLoginSuccess(userData);
          else if (onNavigateHome) onNavigateHome();
        }, 800);
      }, 1100);
    }
  };

  return (
    <div className="login-page-wrapper">
      {/* Top Header Navbar */}
      <header className="login-header-bar">
        <div className="login-header-container">
          <div className="login-logo-group" onClick={onNavigateHome}>
            <div className="login-logo-icon-box">
              <ShieldCheck size={24} color="#FFFFFF" strokeWidth={2.5} />
            </div>
            <div>
              <div className="login-brand-title">
                DocAuth <span style={{ color: "#2563EB" }}>India</span>
              </div>
              <div className="login-brand-subtitle">Secure Documents. Trusted India.</div>
            </div>
          </div>

          <button 
            className="login-back-btn"
            onClick={onNavigateHome}
          >
            <ArrowLeft size={16} color="#2563EB" />
            <span>Back to Home</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="login-main-container">
        <div className="login-grid-split">

          {/* LEFT COLUMN: Hero & Features */}
          <div className="login-left-col">
            
            {/* Badges */}
            <div className="login-badge-row">
              <div className="login-green-badge">
                <span className="login-green-dot" />
                <span>Government Compliant</span>
              </div>
              <div className="login-india-badge">
                <span style={{ fontSize: "1rem" }}>🇮🇳</span>
                <span>Made for a Digital India</span>
              </div>
            </div>

            {/* Headline */}
            <h1 className="login-hero-headline">
              Real Documents. <br />
              <span className="login-gradient-text">Verified</span> Identities.
            </h1>

            {/* Description */}
            <p className="login-hero-subtext">
              DocAuth India helps you verify Indian identity documents like PAN Card, 
              Driving Licence, Aadhaar and more — quickly, securely and with AI-powered accuracy.
            </p>

            {/* 4 Feature Icons Grid */}
            <div className="login-features-grid">
              <div className="login-feature-card">
                <div className="login-feature-icon-bg">
                  <ShieldCheck size={20} color="#2563EB" />
                </div>
                <div>
                  <div className="login-feature-title">AI-Powered Verification</div>
                  <div className="login-feature-desc">Advanced OCR & ML models</div>
                </div>
              </div>

              <div className="login-feature-card">
                <div className="login-feature-icon-bg">
                  <Zap size={20} color="#2563EB" />
                </div>
                <div>
                  <div className="login-feature-title">Fast & Reliable</div>
                  <div className="login-feature-desc">Results in seconds</div>
                </div>
              </div>

              <div className="login-feature-card">
                <div className="login-feature-icon-bg">
                  <Lock size={20} color="#2563EB" />
                </div>
                <div>
                  <div className="login-feature-title">Tamper-Proof</div>
                  <div className="login-feature-desc">Secure & compliant</div>
                </div>
              </div>

              <div className="login-feature-card">
                <div className="login-feature-icon-bg">
                  <Landmark size={20} color="#2563EB" />
                </div>
                <div>
                  <div className="login-feature-title">Government Standards</div>
                  <div className="login-feature-desc">Built for India</div>
                </div>
              </div>
            </div>

            {/* 3D Document Illustration & Pedestal */}
            <div className="login-illustration-area">
              {/* Soft background landmark silhouette glow */}
              <div className="login-landmark-backdrop">
                <svg viewBox="0 0 500 150" fill="none" style={{ width: "100%", height: "100%", opacity: 0.15 }}>
                  <path d="M50 150V90H70V150M90 150V70H110V150M150 150V50H180V30H200L220 50H250V150M300 150V80H330V150M370 150V60H400V150" stroke="#2563EB" strokeWidth="2" />
                </svg>
              </div>

              {/* Tilted Cards */}
              <div className="login-card-pedestal-wrapper">
                
                {/* Card 1: PAN Card (Saffron #FF9933 - Blended dark navy text) */}
                <div className="login-doc-card-3d login-pan-card">
                  <div className="login-card-header">
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div style={{ fontSize: "0.8rem" }}>🇮🇳</div>
                      <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#1E293B" }}>INCOME TAX DEPARTMENT</div>
                    </div>
                  </div>
                  <div className="login-card-body">
                    <div className="login-photo-box">
                      <User size={22} color="#1E293B" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="login-card-title-text" style={{ color: "#1E293B" }}>PAN CARD</div>
                      <div className="login-card-sub-text" style={{ color: "rgba(30, 41, 59, 0.8)" }}>GOVT. OF INDIA</div>
                      <div className="login-simulated-line" />
                      <div className="login-simulated-line" style={{ width: "60%" }} />
                    </div>
                  </div>
                  <div className="login-chip-graphic" />
                </div>

                {/* Card 2: Aadhaar (Pure White #FFFFFF - Written in Navy Blue #1E3A8A) */}
                <div className="login-doc-card-3d login-aadhaar-card">
                  <div className="login-card-header">
                    <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#1E3A8A" }}>AADHAAR</div>
                    <div style={{ fontSize: "0.75rem" }}>🔵</div>
                  </div>
                  <div className="login-card-body">
                    <div className="login-photo-box" style={{ borderColor: "#BFDBFE" }}>
                      <FingerprintIcon color="#1E3A8A" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="login-card-title-text" style={{ color: "#1E3A8A" }}>IDENTITY CARD</div>
                      <div className="login-simulated-line" />
                      <div className="login-simulated-line" style={{ width: "70%" }} />
                      <div className="login-aadhaar-num-text" style={{ color: "#1E3A8A" }}>xxxx xxxx 4892</div>
                    </div>
                  </div>
                  <div className="login-qr-graphic" />
                </div>

                {/* Card 3: Driving Licence (Indian Green #138808 - Blended white text) */}
                <div className="login-doc-card-3d login-dl-card">
                  <div className="login-card-header">
                    <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#FFFFFF" }}>DRIVING LICENCE</div>
                    <div style={{ fontSize: "0.75rem" }}>🚗</div>
                  </div>
                  <div className="login-card-body">
                    <div className="login-photo-box">
                      <User size={22} color="#FFFFFF" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="login-card-sub-text" style={{ color: "#FFFFFF" }}>UNION OF INDIA</div>
                      <div className="login-simulated-line" />
                      <div className="login-simulated-line" style={{ width: "80%" }} />
                    </div>
                  </div>
                </div>

                {/* Glowing Circular Pedestal */}
                <div className="login-pedestal-platform">
                  <div className="login-pedestal-glow" />
                  {/* Indian Flag Ribbon Wave Accent */}
                  <div className="login-tricolor-ribbon" />
                </div>
              </div>
            </div>

            {/* Left Footer */}
            <div className="login-left-footer">
              <span>Trusted by enterprises across India</span>
              <span style={{ margin: "0 4px", opacity: 0.4 }}>|</span>
              <span>Secure</span>
              <span style={{ margin: "0 4px", color: "#94A3B8" }}>•</span>
              <span>Compliant</span>
              <span style={{ margin: "0 4px", color: "#94A3B8" }}>•</span>
              <span>Scalable</span>
            </div>

          </div>


          {/* RIGHT COLUMN: Login Floating Card */}
          <div className="login-right-col">
            <div className="login-card">

              {/* Card Header Shield Icon */}
              <div className="login-card-badge-box">
                <div className="login-shield-badge-inner">
                  <ShieldCheck size={32} color="#2563EB" strokeWidth={2.2} />
                </div>
              </div>

              {/* Title & Subtitle */}
              <div style={{ textAlign: "center", marginBottom: "28px" }}>
                <h2 className="login-card-title">
                  {authMode === "signup" ? "Create Account" : "Welcome Back"}
                </h2>
                <p className="login-card-subtitle">
                  {authMode === "signup"
                    ? "Register for instant identity document verification"
                    : authMode === "otp"
                    ? "Verify mobile number with OTP code"
                    : "Your secure access to DocAuth India"}
                </p>
              </div>

              {/* Notifications */}
              {errorMsg && (
                <div style={{
                  background: "#FEE2E2",
                  border: "1px solid #FECACA",
                  color: "#DC2626",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  marginBottom: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}>
                  <AlertCircle size={18} color="#DC2626" />
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div style={{
                  background: "#ECFDF5",
                  border: "1px solid #A7F3D0",
                  color: "#16A34A",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  marginBottom: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}>
                  <CheckCircle2 size={18} color="#16A34A" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Auth Form */}
              <form onSubmit={handleSubmit} className="login-form-stack">

                {/* Extra field for Sign Up */}
                {authMode === "signup" && (
                  <div className="login-input-group">
                    <label className="login-label-style">Full Name</label>
                    <div className="login-input-wrapper">
                      <User size={18} color="#94A3B8" className="login-input-icon-prefix" />
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="login-text-input"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Email / Mobile Field */}
                <div className="login-input-group">
                  <label className="login-label-style">
                    {authMode === "otp" ? "Mobile Number" : "Email or Mobile Number"}
                  </label>
                  <div className="login-input-wrapper">
                    {authMode === "otp" ? (
                      <Smartphone size={18} color="#94A3B8" className="login-input-icon-prefix" />
                    ) : (
                      <User size={18} color="#94A3B8" className="login-input-icon-prefix" />
                    )}
                    <input
                      type={authMode === "otp" ? "tel" : "text"}
                      placeholder={
                        authMode === "otp"
                          ? "Enter your 10-digit mobile number"
                          : "Enter your email or mobile number"
                      }
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      className="login-text-input"
                      required
                    />
                  </div>
                </div>

                {/* OTP Field if in OTP mode and code sent */}
                {authMode === "otp" && otpSent && (
                  <div className="login-input-group">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <label className="login-label-style">6-Digit OTP Code</label>
                      <span style={{ fontSize: "0.76rem", color: "#2563EB", fontWeight: 600 }}>Demo Code: 123456</span>
                    </div>
                    <div className="login-input-wrapper">
                      <Lock size={18} color="#94A3B8" className="login-input-icon-prefix" />
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="Enter 6-digit OTP"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="login-text-input"
                        style={{ letterSpacing: "4px", fontWeight: 700 }}
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Password Field (only for Password Sign In & Sign Up) */}
                {authMode !== "otp" && (
                  <div className="login-input-group">
                    <label className="login-label-style">Password</label>
                    <div className="login-input-wrapper">
                      <Lock size={18} color="#94A3B8" className="login-input-icon-prefix" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="login-text-input"
                        required
                      />
                      <button
                        type="button"
                        className="login-eye-btn"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff size={18} color="#94A3B8" />
                        ) : (
                          <Eye size={18} color="#94A3B8" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Remember Me & Forgot Password */}
                {authMode === "signin" && (
                  <div className="login-options-row">
                    <label className="login-checkbox-label">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="login-checkbox-input"
                      />
                      <span>Remember me</span>
                    </label>

                    <button
                      type="button"
                      className="login-forgot-btn"
                      onClick={() => alert("Password reset link sent to your registered email.")}
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}

                {/* Primary Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="login-primary-btn"
                  style={{
                    opacity: loading ? 0.75 : 1,
                    cursor: loading ? "wait" : "pointer"
                  }}
                >
                  {loading ? (
                    <span>Processing...</span>
                  ) : (
                    <>
                      <span>
                        {authMode === "signup"
                          ? "Create Account"
                          : authMode === "otp"
                          ? otpSent
                            ? "Verify OTP & Sign In"
                            : "Send OTP Code"
                          : "Sign In"}
                      </span>
                      <ArrowRight size={18} color="#FFFFFF" />
                    </>
                  )}
                </button>
              </form>

              {/* OR Divider */}
              <div className="login-divider-box">
                <div className="login-divider-line" />
                <span className="login-divider-text">OR</span>
                <div className="login-divider-line" />
              </div>

              {/* Switch Auth Mode Button */}
              {authMode === "signin" ? (
                <button
                  type="button"
                  className="login-secondary-btn"
                  onClick={() => {
                    setAuthMode("otp");
                    setErrorMsg("");
                    setSuccessMsg("");
                  }}
                >
                  <Smartphone size={18} color="#1E293B" />
                  <span>Sign in with OTP</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="login-secondary-btn"
                  onClick={() => {
                    setAuthMode("signin");
                    setErrorMsg("");
                    setSuccessMsg("");
                  }}
                >
                  <Lock size={18} color="#1E293B" />
                  <span>Sign in with Password</span>
                </button>
              )}

              {/* Bottom Switch between Sign In / Sign Up */}
              <div className="login-bottom-link-container">
                {authMode === "signup" ? (
                  <span>
                    Already have a DocAuth account?{" "}
                    <button
                      type="button"
                      className="login-bottom-link-btn"
                      onClick={() => {
                        setAuthMode("signin");
                        setErrorMsg("");
                        setSuccessMsg("");
                      }}
                    >
                      Sign In <ArrowRight size={14} style={{ display: "inline" }} />
                    </button>
                  </span>
                ) : (
                  <span>
                    New to DocAuth India?{" "}
                    <button
                      type="button"
                      className="login-bottom-link-btn"
                      onClick={() => {
                        setAuthMode("signup");
                        setErrorMsg("");
                        setSuccessMsg("");
                      }}
                    >
                      Create an account <ArrowRight size={14} style={{ display: "inline" }} />
                    </button>
                  </span>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Fingerprint Icon Component for Aadhaar visual
function FingerprintIcon({ color = "#1E3A8A" }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" />
      <path d="M14 13a4 4 0 0 1-8 0 4 4 0 0 1 8 0z" />
      <path d="M18 11a6 6 0 0 0-12 0c0 4 1 7.5 1 9.5" />
      <path d="M6 10a8 8 0 0 1 16 0c0 5-1.5 8-2.5 11" />
    </svg>
  );
}
