import React, { useState } from "react";
import UploadBox from "../components/UploadBox";
import VerificationCard from "../components/VerificationCard";
import { verifyDocumentApi, verifySampleApi } from "../services/api";
import { 
  Cpu, 
  AlertCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  UploadCloud, 
  ArrowRight, 
  FileCheck
} from "lucide-react";

export default function Verify() {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Smart Detection specialized states
  const [mismatchState, setMismatchState] = useState(null);
  const [unsupportedState, setUnsupportedState] = useState(null);
  const [lowConfidenceState, setLowConfidenceState] = useState(null);

  // Active files & parameters to enable one-click switch
  const [currentFile, setCurrentFile] = useState(null);
  const [currentSample, setCurrentSample] = useState(null);
  const [manualNumber, setManualNumber] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("AUTO");
  const [resetSignal, setResetSignal] = useState(0);

  const clearDetectionStates = () => {
    setMismatchState(null);
    setUnsupportedState(null);
    setLowConfidenceState(null);
  };

  const runPipelineWithSteps = async (taskFn) => {
    setLoading(true);
    setError(null);
    setResult(null);
    clearDetectionStates();

    try {
      setCurrentStep("Stage 1/5: Ingesting file & running Smart Document-Type Detection...");
      await new Promise((r) => setTimeout(r, 350));

      setCurrentStep("Stage 2/5: Extracting OCR text tokens & validating layout signature...");
      await new Promise((r) => setTimeout(r, 450));

      // Trigger server execution
      const res = await taskFn();

      // Check if Smart Detection halted the category-specific pipeline
      if (res.status === "MISMATCH" && res.mismatch) {
        setMismatchState(res);
        return;
      }

      if (res.status === "UNSUPPORTED") {
        setUnsupportedState(res);
        return;
      }

      if (res.status === "LOW_CONFIDENCE") {
        setLowConfidenceState(res);
        return;
      }

      setCurrentStep("Stage 3/5: Scanning QR matrix code & running Tamper ELA Analysis...");
      await new Promise((r) => setTimeout(r, 400));

      setCurrentStep("Stage 4/5: Cross-referencing Authoritative Issuer Registry...");
      await new Promise((r) => setTimeout(r, 400));

      setCurrentStep("Stage 5/5: Computing Weighted Risk Score & saving Audit Record...");
      await new Promise((r) => setTimeout(r, 300));

      setResult(res);
    } catch (err) {
      console.error("Verification error:", err);
      setError(err.message || "Document verification pipeline failed.");
    } finally {
      setLoading(false);
      setCurrentStep("");
    }
  };

  const handleFileUpload = (file, forcedType, manualNum) => {
    setCurrentFile(file);
    setCurrentSample(null);
    setManualNumber(manualNum || "");
    runPipelineWithSteps(() => verifyDocumentApi(file, forcedType, manualNum));
  };

  const handleSampleSelect = (sample) => {
    setCurrentFile(null);
    setCurrentSample(sample);
    setSelectedCategory(sample.documentType);
    runPipelineWithSteps(() =>
      verifySampleApi(sample.samplePath, sample.documentType, sample.simulatedData)
    );
  };

  // Switch to Detected Document Type with one click & automatically re-run pipeline
  const handleSwitchToDetected = () => {
    if (!mismatchState) return;
    const detectedType = mismatchState.detectedType;
    setSelectedCategory(detectedType);
    clearDetectionStates();

    if (currentFile) {
      runPipelineWithSteps(() => verifyDocumentApi(currentFile, detectedType, manualNumber));
    } else if (currentSample) {
      runPipelineWithSteps(() =>
        verifySampleApi(currentSample.samplePath, detectedType, currentSample.simulatedData)
      );
    }
  };

  // Upload Another Document handler
  const handleUploadAnother = () => {
    clearDetectionStates();
    setResult(null);
    setError(null);
    setCurrentFile(null);
    setCurrentSample(null);
    setResetSignal((prev) => prev + 1);
  };

  // Choose Supported Document handler
  const handleChooseSupported = () => {
    setUnsupportedState(null);
    setSelectedCategory("AUTO");
  };

  // Manual Category Selection on Low Confidence
  const handleManualCategorySelect = (chosenType) => {
    setSelectedCategory(chosenType);
    clearDetectionStates();
    if (currentFile) {
      runPipelineWithSteps(() => verifyDocumentApi(currentFile, chosenType, manualNumber));
    } else if (currentSample) {
      runPipelineWithSteps(() =>
        verifySampleApi(currentSample.samplePath, chosenType, currentSample.simulatedData)
      );
    }
  };

  return (
    <div className="container" style={styles.container}>
      <div className="grid" style={styles.grid}>
        {/* Left Column: Upload Form */}
        <div>
          <UploadBox
            onUpload={handleFileUpload}
            onSelectSample={handleSampleSelect}
            loading={loading}
            selectedCategory={selectedCategory}
            onCategoryChange={(cat) => setSelectedCategory(cat)}
            onFileSelect={(f) => setCurrentFile(f)}
            resetSignal={resetSignal}
          />
        </div>

        {/* Right Column: Processing Pipeline Tracker, Mismatch Banner, or Result Card */}
        <div>
          {loading && (
            <div className="glass-card" style={styles.loadingBox}>
              <div className="spinnerWrapper" style={styles.spinnerWrapper}>
                <Cpu size={44} color="#2563eb" className="pulse-animation" />
              </div>
              <h3 style={{ fontSize: "1.2rem", marginTop: "16px", color: "#0f172a" }}>
                Document Verification Pipeline In Progress
              </h3>
              <p style={{ color: "#2563eb", fontWeight: 600, marginTop: "8px", fontSize: "0.92rem" }}>
                {currentStep}
              </p>
              <div className="progressBar" style={styles.progressBar}>
                <div className="pulse-animation" style={styles.progressFill} />
              </div>
            </div>
          )}

          {/* 1. DOCUMENT TYPE MISMATCH WARNING CARD */}
          {!loading && mismatchState && (
            <div className="glass-card" style={styles.mismatchCard}>
              <div style={styles.mismatchHeader}>
                <div style={styles.warningIconCircle}>
                  <AlertTriangle size={32} color="#D97706" />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.28rem", fontWeight: 800, color: "#92400E", margin: 0 }}>
                    ⚠ Document Type Mismatch
                  </h3>
                  <p style={{ fontSize: "0.85rem", color: "#B45309", marginTop: "4px" }}>
                    The uploaded document format does not match the category you selected.
                  </p>
                </div>
              </div>

              {/* Selected vs Detected Comparison Grid */}
              <div style={styles.mismatchGrid}>
                <div style={styles.mismatchPillBox}>
                  <div style={{ fontSize: "0.74rem", fontWeight: 700, color: "#64748B" }}>
                    SELECTED CATEGORY
                  </div>
                  <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#DC2626", marginTop: "4px" }}>
                    {mismatchState.selectedName || mismatchState.selectedType}
                  </div>
                </div>

                <div style={styles.mismatchArrowBox}>
                  <ArrowRight size={20} color="#94A3B8" />
                </div>

                <div style={styles.mismatchPillBoxDetected}>
                  <div style={{ fontSize: "0.74rem", fontWeight: 700, color: "#1E40AF" }}>
                    DETECTED DOCUMENT
                  </div>
                  <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#2563EB", marginTop: "4px" }}>
                    {mismatchState.detectedName || mismatchState.detectedType}
                  </div>
                </div>
              </div>

              {/* Confidence Indicator */}
              <div style={styles.confidenceBox}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 700 }}>
                  <span style={{ color: "#475569" }}>Detection Confidence:</span>
                  <span style={{ color: "#16A34A" }}>{mismatchState.confidence}% Match</span>
                </div>
                <div style={styles.confidenceTrack}>
                  <div style={{ ...styles.confidenceFill, width: `${mismatchState.confidence}%` }} />
                </div>
              </div>

              {/* Prompt Message */}
              <div style={styles.mismatchMessage}>
                "{mismatchState.message || `This document appears to be an ${mismatchState.detectedName}. Please switch to the correct document type.`}"
              </div>

              {/* Action Buttons */}
              <div style={styles.mismatchActions}>
                <button
                  className="btn-primary"
                  onClick={handleSwitchToDetected}
                  style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 22px" }}
                >
                  <RefreshCw size={16} />
                  Switch to {mismatchState.detectedName || "Detected Type"}
                </button>
                <button
                  className="btn-secondary"
                  onClick={handleUploadAnother}
                  style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 20px" }}
                >
                  <UploadCloud size={16} />
                  Upload Another Document
                </button>
              </div>
            </div>
          )}

          {/* 2. UNSUPPORTED DOCUMENT WARNING CARD */}
          {!loading && unsupportedState && (
            <div className="glass-card" style={styles.unsupportedCard}>
              <div style={styles.unsupportedHeader}>
                <div style={styles.dangerIconCircle}>
                  <XCircle size={32} color="#DC2626" />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.28rem", fontWeight: 800, color: "#991B1B", margin: 0 }}>
                    Unsupported Document Type
                  </h3>
                  <p style={{ fontSize: "0.86rem", color: "#64748B", marginTop: "4px" }}>
                    {unsupportedState.message || "This document is currently not supported by DocAuth India."}
                  </p>
                </div>
              </div>

              <div style={styles.supportedNoticeBox}>
                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1E293B", marginBottom: "8px" }}>
                  Supported Indian Identity & Official Documents:
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {[
                    "PAN Card",
                    "Aadhaar Card",
                    "Driving Licence",
                    "Passport",
                    "Indian Visa",
                    "Commercial Permit",
                    "Voter ID",
                    "Vehicle RC",
                    "GSTIN",
                    "Ration Card",
                    "Degree Certificate",
                    "Birth Certificate"
                  ].map((d) => (
                    <span key={d} style={styles.supportedTag}>{d}</span>
                  ))}
                </div>
              </div>

              <div style={styles.mismatchActions}>
                <button
                  className="btn-primary"
                  onClick={handleChooseSupported}
                  style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
                >
                  <FileCheck size={16} />
                  Choose Supported Document
                </button>
                <button
                  className="btn-secondary"
                  onClick={handleUploadAnother}
                  style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
                >
                  <UploadCloud size={16} />
                  Upload Another
                </button>
              </div>
            </div>
          )}

          {/* 3. LOW CONFIDENCE DETECTION WARNING CARD */}
          {!loading && lowConfidenceState && (
            <div className="glass-card" style={styles.lowConfCard}>
              <div style={styles.lowConfHeader}>
                <div style={styles.infoIconCircle}>
                  <AlertCircle size={32} color="#2563EB" />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.24rem", fontWeight: 800, color: "#1E3A8A", margin: 0 }}>
                    Confidence Check
                  </h3>
                  <p style={{ fontSize: "0.88rem", color: "#475569", marginTop: "4px" }}>
                    {lowConfidenceState.message || "Document type could not be identified confidently."}
                  </p>
                </div>
              </div>

              <div style={{ margin: "18px 0" }}>
                <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "#334155", marginBottom: "10px" }}>
                  Please manually select the correct category below:
                </div>
                <div style={styles.manualCategoryGrid}>
                  {[
                    { id: "PAN", label: "PAN Card" },
                    { id: "AADHAAR", label: "Aadhaar Card" },
                    { id: "DRIVING_LICENSE", label: "Driving Licence" },
                    { id: "PASSPORT", label: "Passport" },
                    { id: "VISA", label: "Indian Visa" },
                    { id: "PERMIT", label: "Permit" },
                    { id: "VOTER_ID", label: "Voter ID" },
                    { id: "VEHICLE_RC", label: "Vehicle RC" },
                    { id: "GSTIN", label: "GSTIN" },
                    { id: "RATION_CARD", label: "Ration Card" },
                    { id: "DEGREE_CERTIFICATE", label: "Degree Cert" },
                    { id: "BIRTH_CERTIFICATE", label: "Birth Cert" }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleManualCategorySelect(cat.id)}
                      style={styles.manualCatBtn}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
                <button
                  className="btn-secondary"
                  onClick={handleUploadAnother}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.85rem" }}
                >
                  <UploadCloud size={14} />
                  Upload Another Document
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="glass-card" style={styles.errorBox}>
              <AlertCircle size={28} color="#dc2626" />
              <div>
                <h4 style={{ color: "#dc2626" }}>Verification Error</h4>
                <p style={{ fontSize: "0.88rem", color: "#64748b", marginTop: "4px" }}>{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && !result && !mismatchState && !unsupportedState && !lowConfidenceState && (
            <div className="glass-card" style={styles.emptyState}>
              <div className="emptyIconCircle" style={styles.emptyIconCircle}>
                <Cpu size={36} color="#2563eb" />
              </div>
              <h3 style={{ marginTop: "16px", color: "#1e293b" }}>No Active Verification</h3>
              <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "6px", maxWidth: "340px", lineHeight: 1.5 }}>
                Upload any Indian document (PAN, DL, Aadhaar, Voter ID, Passport, Visa, Permit, RC, GSTIN, Ration Card, Degree, Birth Cert) on the left, or select a synthetic demo sample to view real-time verification analysis.
              </p>
            </div>
          )}

          {!loading && result && <VerificationCard result={result} />}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1320px",
    margin: "0 auto",
    padding: "36px 28px 60px 28px"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1.1fr",
    gap: "32px"
  },
  loadingBox: {
    padding: "48px 32px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  },
  spinnerWrapper: {
    width: "76px",
    height: "76px",
    borderRadius: "50%",
    background: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  progressBar: {
    width: "100%",
    height: "6px",
    background: "#e2e8f0",
    borderRadius: "9999px",
    marginTop: "24px",
    overflow: "hidden"
  },
  progressFill: {
    height: "100%",
    width: "100%",
    background: "linear-gradient(90deg, #2563eb, #0284c7)"
  },
  errorBox: {
    padding: "24px",
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
    background: "#fef2f2",
    borderColor: "#fecaca"
  },
  emptyState: {
    padding: "60px 32px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "420px"
  },
  emptyIconCircle: {
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    background: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },

  // Mismatch UI Styles
  mismatchCard: {
    padding: "28px",
    background: "#FFFBEB",
    border: "2px solid #F59E0B",
    boxShadow: "0 10px 30px -10px rgba(245, 158, 11, 0.25)",
    borderRadius: "16px"
  },
  mismatchHeader: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "20px"
  },
  warningIconCircle: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "#FEF3C7",
    border: "2px solid #FDE68A",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },
  mismatchGrid: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "#FFFFFF",
    padding: "16px",
    borderRadius: "12px",
    border: "1px solid #FDE68A"
  },
  mismatchPillBox: {
    flex: 1,
    padding: "12px 14px",
    background: "#FEF2F2",
    border: "1px solid #FECACA",
    borderRadius: "8px"
  },
  mismatchArrowBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "4px"
  },
  mismatchPillBoxDetected: {
    flex: 1,
    padding: "12px 14px",
    background: "#EFF6FF",
    border: "1.5px solid #93C5FD",
    borderRadius: "8px"
  },
  confidenceBox: {
    marginTop: "16px",
    background: "#FFFFFF",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid #FDE68A"
  },
  confidenceTrack: {
    width: "100%",
    height: "8px",
    background: "#E2E8F0",
    borderRadius: "9999px",
    marginTop: "8px",
    overflow: "hidden"
  },
  confidenceFill: {
    height: "100%",
    background: "linear-gradient(90deg, #10B981, #059669)",
    borderRadius: "9999px",
    transition: "width 0.4s ease"
  },
  mismatchMessage: {
    marginTop: "16px",
    fontSize: "0.98rem",
    fontWeight: 600,
    color: "#78350F",
    fontStyle: "italic",
    textAlign: "center",
    padding: "8px 12px"
  },
  mismatchActions: {
    marginTop: "20px",
    display: "flex",
    gap: "12px",
    flexWrap: "wrap"
  },

  // Unsupported Document Styles
  unsupportedCard: {
    padding: "28px",
    background: "#FEF2F2",
    border: "2px solid #EF4444",
    boxShadow: "0 10px 30px -10px rgba(239, 68, 68, 0.25)",
    borderRadius: "16px"
  },
  unsupportedHeader: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "18px"
  },
  dangerIconCircle: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "#FEE2E2",
    border: "2px solid #FECACA",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },
  supportedNoticeBox: {
    background: "#FFFFFF",
    padding: "16px",
    borderRadius: "12px",
    border: "1px solid #FECACA"
  },
  supportedTag: {
    background: "#F1F5F9",
    color: "#334155",
    fontSize: "0.78rem",
    fontWeight: 600,
    padding: "4px 10px",
    borderRadius: "6px",
    border: "1px solid #E2E8F0"
  },

  // Low Confidence Styles
  lowConfCard: {
    padding: "28px",
    background: "#EFF6FF",
    border: "2px solid #3B82F6",
    boxShadow: "0 10px 30px -10px rgba(59, 130, 246, 0.25)",
    borderRadius: "16px"
  },
  lowConfHeader: {
    display: "flex",
    alignItems: "center",
    gap: "16px"
  },
  infoIconCircle: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "#DBEAFE",
    border: "2px solid #BFDBFE",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },
  manualCategoryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
    gap: "8px"
  },
  manualCatBtn: {
    background: "#FFFFFF",
    border: "1px solid #BFDBFE",
    color: "#1D4ED8",
    fontSize: "0.82rem",
    fontWeight: 600,
    padding: "9px 10px",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.15s ease",
    textAlign: "center"
  }
};
