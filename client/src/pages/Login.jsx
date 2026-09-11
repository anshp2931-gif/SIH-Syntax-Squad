import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Mail,
  Zap,
  Landmark,
  CheckCircle2,
  AlertCircle,
  KeyRound
} from "lucide-react";
import "./Login.css";
import { useClerk, useSignIn, useSignUp, useUser } from "@clerk/react";

export default function Login({ onLoginSuccess, onNavigateHome }) {
  const clerk = useClerk();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const { isLoaded: isUserLoaded, isSignedIn, user } = useUser();

  // If user is already authenticated, redirect to home immediately
  useEffect(() => {
    if (isUserLoaded && isSignedIn) {
      if (onLoginSuccess) onLoginSuccess();
      else if (onNavigateHome) onNavigateHome();
    }
  }, [isUserLoaded, isSignedIn]);

  const [authMode, setAuthMode] = useState("signin"); // "signin", "signup"
  const [showPassword, setShowPassword] = useState(false);
  
  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // Verification & Reset States
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [resetPasswordStep, setResetPasswordStep] = useState(false);
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // UI States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Extract clean error message from Clerk or standard error
  const getErrorMessage = (err) => {
    if (err?.errors && err.errors.length > 0) {
      return err.errors[0].longMessage || err.errors[0].message || "Authentication error.";
    }
    return err?.message || "An unexpected error occurred. Please try again.";
  };

  // OAuth Sign In (Google & Apple)
  const handleOAuth = async (strategy) => {
    console.log("[DocAuth] handleOAuth triggered:", strategy);
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      // 1. Try clerk.client.signIn.authenticateWithRedirect
      if (clerk?.client?.signIn?.authenticateWithRedirect) {
        console.log("[DocAuth] Using clerk.client.signIn.authenticateWithRedirect");
        await clerk.client.signIn.authenticateWithRedirect({
          strategy,
          redirectUrl: "/sso-callback",
          redirectUrlComplete: "/"
        });
        return;
      }

      // 2. Try signIn.sso
      if (signIn?.sso) {
        console.log("[DocAuth] Using signIn.sso");
        const { error } = await signIn.sso({
          strategy,
          redirectUrl: "/",
          redirectCallbackUrl: "/sso-callback"
        });
        if (error) throw error;
        return;
      }

      // 3. Try signIn.authenticateWithRedirect
      if (signIn?.authenticateWithRedirect) {
        console.log("[DocAuth] Using signIn.authenticateWithRedirect");
        await signIn.authenticateWithRedirect({
          strategy,
          redirectUrl: "/sso-callback",
          redirectUrlComplete: "/"
        });
        return;
      }

      // 4. Try clerk.redirectToSignIn
      if (clerk?.redirectToSignIn) {
        console.log("[DocAuth] Fallback clerk.redirectToSignIn");
        await clerk.redirectToSignIn();
        return;
      }

      throw new Error("Clerk authentication is initializing. Please wait a moment and try again.");
    } catch (err) {
      console.error("[DocAuth] OAuth error:", err);
      setLoading(false);
      setErrorMsg(getErrorMessage(err));
    }
  };

  // Email/Password Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("[DocAuth] handleSubmit triggered mode:", authMode);
    setErrorMsg("");
    setSuccessMsg("");

    // 1. SIGN IN FLOW
    if (authMode === "signin") {
      if (!email.trim()) {
        setErrorMsg("Please enter your email address.");
        return;
      }
      if (!password) {
        setErrorMsg("Please enter your password.");
        return;
      }

      setLoading(true);
      try {
        const signInHandler = clerk?.client?.signIn || signIn;
        if (typeof signInHandler?.create === "function") {
          console.log("[DocAuth] Signing in via signIn.create");
          const result = await signInHandler.create({
            identifier: email.trim(),
            password: password
          });

          if (result.status === "complete") {
            if (clerk?.setActive) {
              await clerk.setActive({ session: result.createdSessionId });
            }
            setLoading(false);
            setSuccessMsg("Authentication successful! Redirecting...");
            if (onLoginSuccess) onLoginSuccess();
            else if (onNavigateHome) onNavigateHome();
          } else {
            setLoading(false);
            setErrorMsg("Additional verification required. Please check your email.");
          }
        } else if (typeof signIn?.password === "function") {
          console.log("[DocAuth] Signing in via signIn.password");
          const { error } = await signIn.password({
            identifier: email.trim(),
            password: password
          });
          if (error) throw error;
          if (typeof signIn.finalize === "function") {
            await signIn.finalize({
              navigate: async () => {
                if (onLoginSuccess) onLoginSuccess();
                else if (onNavigateHome) onNavigateHome();
              }
            });
          }
        } else {
          throw new Error("Sign-in service is initializing. Please try again.");
        }
      } catch (err) {
        console.error("[DocAuth] Sign-in error:", err);
        const rawMsg = (err?.errors?.[0]?.message || err?.message || "").toLowerCase();
        const code = err?.errors?.[0]?.code || "";
        const isAlreadySignedIn = 
          rawMsg.includes("already signed in") ||
          code === "session_exists";

        if (isAlreadySignedIn) {
          setLoading(false);
          setSuccessMsg("You're already signed in! Redirecting to dashboard...");
          setTimeout(() => {
            if (onLoginSuccess) onLoginSuccess();
            else if (onNavigateHome) onNavigateHome();
          }, 400);
          return;
        }

        setLoading(false);
        setErrorMsg(getErrorMessage(err));
      }
    }

    // 2. SIGN UP FLOW
    else if (authMode === "signup") {
      if (!fullName.trim()) {
        setErrorMsg("Please enter your full name.");
        return;
      }
      if (!email.trim()) {
        setErrorMsg("Please enter your email address.");
        return;
      }
      if (!password || password.length < 8) {
        setErrorMsg("Password should be at least 8 characters.");
        return;
      }

      setLoading(true);
      try {
        const signUpHandler = clerk?.client?.signUp || signUp;
        const nameParts = fullName.trim().split(" ");
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(" ") || "";

        if (typeof signUpHandler?.create === "function") {
          console.log("[DocAuth] Signing up via signUp.create");
          await signUpHandler.create({
            emailAddress: email.trim(),
            password: password,
            firstName,
            lastName
          });

          // Send email verification code
          await signUpHandler.prepareEmailAddressVerification({ strategy: "email_code" });
          setPendingVerification(true);
          setLoading(false);
          setSuccessMsg(`Verification code sent to ${email.trim()}. Please enter it below to activate your account.`);
        } else if (typeof signUp?.password === "function") {
          console.log("[DocAuth] Signing up via signUp.password");
          const { error } = await signUp.password({
            emailAddress: email.trim(),
            password: password,
            firstName,
            lastName
          });
          if (error) throw error;
          if (signUp.verifications?.sendEmailCode) {
            await signUp.verifications.sendEmailCode();
          }
          setPendingVerification(true);
          setLoading(false);
          setSuccessMsg(`Verification code sent to ${email.trim()}. Please enter it below to activate your account.`);
        } else {
          throw new Error("Sign-up service is initializing. Please try again.");
        }
      } catch (err) {
        console.error("[DocAuth] Sign-up error:", err);
        setLoading(false);
        setErrorMsg(getErrorMessage(err));
      }
    }
  };

  // Complete Email Verification on Sign Up
  const handleVerifySignUp = async (e) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      setErrorMsg("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    try {
      const signUpHandler = clerk?.client?.signUp || signUp;
      if (typeof signUpHandler?.attemptEmailAddressVerification === "function") {
        const completeSignUp = await signUpHandler.attemptEmailAddressVerification({
          code: verificationCode.trim()
        });

        if (completeSignUp.status === "complete") {
          if (clerk?.setActive) {
            await clerk.setActive({ session: completeSignUp.createdSessionId });
          }
          setLoading(false);
          setSuccessMsg("Account activated successfully! Redirecting...");
          if (onLoginSuccess) onLoginSuccess();
          else if (onNavigateHome) onNavigateHome();
        } else {
          setLoading(false);
          setErrorMsg("Verification incomplete. Please check the code and try again.");
        }
      } else if (signUp?.verifications?.verifyEmailCode) {
        const { error } = await signUp.verifications.verifyEmailCode({
          code: verificationCode.trim()
        });
        if (error) throw error;
        if (typeof signUp.finalize === "function") {
          await signUp.finalize({
            navigate: async () => {
              if (onLoginSuccess) onLoginSuccess();
              else if (onNavigateHome) onNavigateHome();
            }
          });
        }
      }
    } catch (err) {
      console.error("[DocAuth] Verification error:", err);
      setLoading(false);
      setErrorMsg(getErrorMessage(err));
    }
  };

  // Forgot Password Trigger
  const handleForgotPassword = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMsg("Please enter your email address in the field above to reset your password.");
      return;
    }

    setLoading(true);
    try {
      const signInHandler = clerk?.client?.signIn || signIn;
      if (typeof signInHandler?.create === "function") {
        await signInHandler.create({
          strategy: "reset_password_email_code",
          identifier: trimmedEmail
        });
        setResetPasswordStep(true);
        setLoading(false);
        setSuccessMsg(`Password reset code sent to ${trimmedEmail}! Enter it below with your new password.`);
      } else {
        throw new Error("Reset password service is initializing. Please try again.");
      }
    } catch (err) {
      console.error("[DocAuth] Forgot password error:", err);
      setLoading(false);
      setErrorMsg(getErrorMessage(err));
    }
  };

  // Complete Password Reset
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!resetCode.trim()) {
      setErrorMsg("Please enter the reset code sent to your email.");
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setErrorMsg("New password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    try {
      const signInHandler = clerk?.client?.signIn || signIn;
      if (typeof signInHandler?.attemptFirstFactor === "function") {
        const result = await signInHandler.attemptFirstFactor({
          strategy: "reset_password_email_code",
          code: resetCode.trim(),
          password: newPassword
        });

        if (result.status === "complete") {
          if (clerk?.setActive) {
            await clerk.setActive({ session: result.createdSessionId });
          }
          setLoading(false);
          setSuccessMsg("Password reset successfully! Redirecting...");
          if (onLoginSuccess) onLoginSuccess();
          else if (onNavigateHome) onNavigateHome();
        } else {
          setLoading(false);
          setErrorMsg("Could not complete password reset. Please try again.");
        }
      } else {
        throw new Error("Password reset service is unavailable.");
      }
    } catch (err) {
      console.error("[DocAuth] Password reset error:", err);
      setLoading(false);
      setErrorMsg(getErrorMessage(err));
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
                  {resetPasswordStep 
                    ? "Reset Password" 
                    : pendingVerification 
                    ? "Verify Email" 
                    : authMode === "signup" 
                    ? "Create Account" 
                    : "Welcome Back"}
                </h2>
                <p className="login-card-subtitle">
                  {resetPasswordStep
                    ? "Enter the code sent to your email and your new password"
                    : pendingVerification
                    ? "Enter the 6-digit activation code sent to your email"
                    : authMode === "signup"
                    ? "Register for instant identity document verification"
                    : "Your secure access to DocAuth India"}
                </p>
              </div>

              {/* Notifications */}
              {errorMsg && (
                <div style={{
                  background: "#FEE2E2",
                  border: "1px solid #FECACA",
                  color: "#DC2626",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  marginBottom: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <AlertCircle size={18} color="#DC2626" style={{ flexShrink: 0 }} />
                    <span>{errorMsg}</span>
                  </div>
                  {errorMsg.toLowerCase().includes("already signed in") && (
                    <div style={{ display: "flex", gap: "10px", marginTop: "4px", paddingLeft: "26px" }}>
                      <button
                        type="button"
                        onClick={() => {
                          if (onLoginSuccess) onLoginSuccess();
                          else if (onNavigateHome) onNavigateHome();
                        }}
                        style={{
                          padding: "6px 12px",
                          background: "#2563EB",
                          color: "#FFFFFF",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          cursor: "pointer"
                        }}
                      >
                        Go to Dashboard
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await clerk.signOut();
                          } catch (err) {
                            console.error("Sign out error:", err);
                          }
                          setErrorMsg("");
                          setSuccessMsg("Signed out successfully. You can now sign in.");
                        }}
                        style={{
                          padding: "6px 12px",
                          background: "#FFFFFF",
                          color: "#DC2626",
                          border: "1px solid #FCA5A5",
                          borderRadius: "6px",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          cursor: "pointer"
                        }}
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
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

              {/* STEP: Reset Password Form */}
              {resetPasswordStep ? (
                <form onSubmit={handleResetPasswordSubmit} className="login-form-stack">
                  <div className="login-input-group">
                    <label className="login-label-style">Verification Code</label>
                    <div className="login-input-wrapper">
                      <KeyRound size={18} color="#94A3B8" className="login-input-icon-prefix" />
                      <input
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value)}
                        className="login-text-input"
                        required
                        disabled={loading}
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="login-input-group">
                    <label className="login-label-style">New Password</label>
                    <div className="login-input-wrapper">
                      <Lock size={18} color="#94A3B8" className="login-input-icon-prefix" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password (min 8 chars)"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="login-text-input"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="login-primary-btn"
                    style={{ opacity: loading ? 0.75 : 1, cursor: loading ? "wait" : "pointer" }}
                  >
                    {loading ? <span>Updating...</span> : <><span>Set New Password</span><ArrowRight size={18} color="#FFFFFF" /></>}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setResetPasswordStep(false); setErrorMsg(""); setSuccessMsg(""); }}
                    style={{ background: "transparent", border: "none", color: "#64748B", fontSize: "0.85rem", cursor: "pointer", marginTop: "12px", textAlign: "center" }}
                  >
                    Back to Sign In
                  </button>
                </form>
              ) : pendingVerification ? (
                /* STEP: Verify Sign Up Email Code Form */
                <form onSubmit={handleVerifySignUp} className="login-form-stack">
                  <div className="login-input-group">
                    <label className="login-label-style">6-Digit Activation Code</label>
                    <div className="login-input-wrapper">
                      <KeyRound size={18} color="#94A3B8" className="login-input-icon-prefix" />
                      <input
                        type="text"
                        placeholder="Enter code from email"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="login-text-input"
                        style={{ letterSpacing: "4px", fontWeight: 700 }}
                        required
                        disabled={loading}
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="login-primary-btn"
                    style={{ opacity: loading ? 0.75 : 1, cursor: loading ? "wait" : "pointer" }}
                  >
                    {loading ? <span>Verifying...</span> : <><span>Verify & Continue</span><ArrowRight size={18} color="#FFFFFF" /></>}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setPendingVerification(false); setErrorMsg(""); setSuccessMsg(""); }}
                    style={{ background: "transparent", border: "none", color: "#64748B", fontSize: "0.85rem", cursor: "pointer", marginTop: "12px", textAlign: "center" }}
                  >
                    Cancel and return
                  </button>
                </form>
              ) : (
                /* STANDARD SIGN IN / SIGN UP VIEW */
                <>
                  {/* Google & Apple Custom OAuth Buttons */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                    {/* Google Button */}
                    <button
                      type="button"
                      disabled={loading}
                      className="login-google-btn"
                      onClick={() => handleOAuth("oauth_google")}
                      style={{
                        width: "100%",
                        background: "#FFFFFF",
                        border: "1px solid #CBD5E1",
                        color: "#0F172A",
                        fontWeight: 600,
                        fontSize: "0.92rem",
                        padding: "12px",
                        borderRadius: "12px",
                        cursor: loading ? "wait" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px",
                        transition: "all 0.2s ease",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                        opacity: loading ? 0.75 : 1
                      }}
                    >
                      <GoogleIcon />
                      <span>Continue with Google</span>
                    </button>

                    {/* Apple Button */}
                    <button
                      type="button"
                      disabled={loading}
                      className="login-apple-btn"
                      onClick={() => handleOAuth("oauth_apple")}
                      style={{
                        width: "100%",
                        background: "#000000",
                        border: "1px solid #000000",
                        color: "#FFFFFF",
                        fontWeight: 600,
                        fontSize: "0.92rem",
                        padding: "12px",
                        borderRadius: "12px",
                        cursor: loading ? "wait" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px",
                        transition: "all 0.2s ease",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                        opacity: loading ? 0.75 : 1
                      }}
                    >
                      <AppleIcon />
                      <span>Continue with Apple</span>
                    </button>
                  </div>

                  {/* OR Divider */}
                  <div className="login-divider-box">
                    <div className="login-divider-line" />
                    <span className="login-divider-text">OR WITH EMAIL</span>
                    <div className="login-divider-line" />
                  </div>

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
                            disabled={loading}
                          />
                        </div>
                      </div>
                    )}

                    {/* Email Address Field */}
                    <div className="login-input-group">
                      <label className="login-label-style">Email Address</label>
                      <div className="login-input-wrapper">
                        <Mail size={18} color="#94A3B8" className="login-input-icon-prefix" />
                        <input
                          type="email"
                          placeholder="Enter your email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="login-text-input"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Password Field */}
                    <div className="login-input-group">
                      <label className="login-label-style">Password</label>
                      <div className="login-input-wrapper">
                        <Lock size={18} color="#94A3B8" className="login-input-icon-prefix" />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder={authMode === "signup" ? "Create a password (min 8 chars)" : "Enter your password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="login-text-input"
                          required
                          disabled={loading}
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

                    {/* Remember Me & Forgot Password */}
                    {authMode === "signin" && (
                      <div className="login-options-row">
                        <label className="login-checkbox-label">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="login-checkbox-input"
                            disabled={loading}
                          />
                          <span>Remember me</span>
                        </label>

                        <button
                          type="button"
                          className="login-forgot-btn"
                          onClick={handleForgotPassword}
                          disabled={loading}
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
                            {authMode === "signup" ? "Create Account" : "Sign In"}
                          </span>
                          <ArrowRight size={18} color="#FFFFFF" />
                        </>
                      )}
                    </button>
                  </form>

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
                </>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Google 'G' Icon Component
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

// Apple Icon Component
function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFFFFF" style={{ flexShrink: 0 }}>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.87c.61-.75 1.04-1.8 1.01-2.87-.96.04-2.14.65-2.73 1.34-.53.61-.99 1.68-.86 2.72 1.07.08 2.16-.54 2.58-1.19z" />
    </svg>
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
