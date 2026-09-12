import React, { useState } from "react";
import UploadBox from "../components/UploadBox";
import VerificationCard from "../components/VerificationCard";
import { verifyDocumentApi, verifySampleApi } from "../services/api";
import { Cpu, CheckCircle2, AlertCircle } from "lucide-react";
import { useLanguage } from "../hooks/useLanguage";

export default function Verify() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const runPipelineWithSteps = async (taskFn) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      setCurrentStep(t('verify.stages.1'));
      await new Promise((r) => setTimeout(r, 400));

      setCurrentStep(t('verify.stages.2'));
      await new Promise((r) => setTimeout(r, 500));

      setCurrentStep(t('verify.stages.3'));
      await new Promise((r) => setTimeout(r, 500));

      setCurrentStep(t('verify.stages.4'));
      await new Promise((r) => setTimeout(r, 400));

      setCurrentStep(t('verify.stages.5'));
      const res = await taskFn();

      setResult(res);
    } catch (err) {
      console.error("Verification error:", err);
      setError(err.message || t('verify.error.default'));
    } finally {
      setLoading(false);
      setCurrentStep("");
    }
  };

  const handleFileUpload = (file, forcedType, manualNumber) => {
    runPipelineWithSteps(() => verifyDocumentApi(file, forcedType, manualNumber));
  };

  const handleSampleSelect = (sample) => {
    runPipelineWithSteps(() =>
      verifySampleApi(sample.samplePath, sample.documentType, sample.simulatedData)
    );
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
          />
        </div>

        {/* Right Column: Processing Pipeline Tracker or Result Card */}
        <div>
          {loading && (
            <div className="glass-card" style={styles.loadingBox}>
              <div className="spinnerWrapper" style={styles.spinnerWrapper}>
                <Cpu size={44} color="#2563eb" className="pulse-animation" />
              </div>
              <h3 style={{ fontSize: "1.2rem", marginTop: "16px", color: "#0f172a" }}>
                {t('verify.loading')}
              </h3>
              <p style={{ color: "#2563eb", fontWeight: 600, marginTop: "8px", fontSize: "0.92rem" }}>
                {currentStep}
              </p>
              <div className="progressBar" style={styles.progressBar}>
                <div className="pulse-animation" style={styles.progressFill} />
              </div>
            </div>
          )}

          {error && (
            <div className="glass-card" style={styles.errorBox}>
              <AlertCircle size={28} color="#dc2626" />
              <div>
                <h4 style={{ color: "#dc2626" }}>{t('verify.error.title')}</h4>
                <p style={{ fontSize: "0.88rem", color: "#64748b", marginTop: "4px" }}>{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && !result && (
            <div className="glass-card" style={styles.emptyState}>
              <div className="emptyIconCircle" style={styles.emptyIconCircle}>
                <Cpu size={36} color="#2563eb" />
              </div>
              <h3 style={{ marginTop: "16px", color: "#1e293b" }}>{t('verify.empty.title')}</h3>
              <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "6px", maxWidth: "340px", lineHeight: 1.5 }}>
                {t('verify.empty.desc')}
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
  }
};
