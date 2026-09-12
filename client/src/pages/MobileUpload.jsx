import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Camera, UploadCloud, CheckCircle2, ShieldCheck, RefreshCw, AlertCircle } from "lucide-react";
import { uploadMobileDocumentApi } from "../services/api";

export default function MobileUpload() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrorMsg(null);
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile || !sessionId) return;
    setUploading(true);
    setErrorMsg(null);
    try {
      await uploadMobileDocumentApi(sessionId, selectedFile);
      setCompleted(true);
    } catch (err) {
      setErrorMsg(err.message || "Failed to upload document image");
    } finally {
      setUploading(false);
    }
  };

  if (!sessionId) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <AlertCircle size={48} color="#DC2626" style={{ margin: "0 auto 12px" }} />
          <h2 style={{ color: "#0F172A", fontSize: "1.2rem", fontWeight: 700 }}>Invalid Upload Session</h2>
          <p style={{ color: "#64748B", fontSize: "0.88rem", marginTop: "8px" }}>
            No active session ID found. Please re-scan the QR code from your main screen.
          </p>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <CheckCircle2 size={54} color="#16A34A" style={{ margin: "0 auto 12px" }} />
          <h2 style={{ color: "#0F172A", fontSize: "1.3rem", fontWeight: 800 }}>Document Submitted!</h2>
          <p style={{ color: "#475569", fontSize: "0.92rem", marginTop: "8px", lineHeight: 1.5 }}>
            Your document has been sent to your primary device. Verification is starting automatically on your main screen.
          </p>
          <div style={{ marginTop: "20px", padding: "10px", background: "#F0FDF4", borderRadius: "8px", color: "#166534", fontSize: "0.82rem", fontWeight: 600 }}>
            You can now close this tab on your phone.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "16px" }}>
          <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldCheck size={20} color="#FFFFFF" />
          </div>
          <span style={{ fontWeight: 800, color: "#0F172A", fontSize: "1.1rem" }}>PramaanSetu Mobile Scanner</span>
        </div>

        <p style={{ color: "#64748B", fontSize: "0.88rem", marginBottom: "20px" }}>
          Capture or upload an identity document image using your phone's camera.
        </p>

        {errorMsg && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: "8px", padding: "10px", color: "#DC2626", fontSize: "0.85rem", marginBottom: "16px" }}>
            {errorMsg}
          </div>
        )}

        <div style={{ marginBottom: "20px" }}>
          {previewUrl ? (
            <div style={{ position: "relative", borderRadius: "10px", overflow: "hidden", border: "2px solid #2563EB" }}>
              <img src={previewUrl} alt="Preview" style={{ width: "100%", maxHeight: "280px", objectFit: "contain", background: "#0F172A" }} />
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(0,0,0,0.6)", border: "none", color: "#FFFFFF", padding: "6px 12px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}
              >
                Retake
              </button>
            </div>
          ) : (
            <label htmlFor="mobile-camera-input" style={styles.captureBox}>
              <Camera size={42} color="#2563EB" />
              <span style={{ fontWeight: 700, color: "#0F172A", fontSize: "0.95rem", marginTop: "10px" }}>
                Tap to Open Mobile Camera
              </span>
              <span style={{ color: "#64748B", fontSize: "0.78rem", marginTop: "4px" }}>
                Take a clear photo of your PAN, Aadhaar, DL, or Marksheet
              </span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                id="mobile-camera-input"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </label>
          )}
        </div>

        {selectedFile && (
          <button
            onClick={handleUploadSubmit}
            disabled={uploading}
            style={{
              width: "100%",
              padding: "14px",
              background: "#2563EB",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "1rem",
              cursor: uploading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)"
            }}
          >
            {uploading ? (
              <>
                <RefreshCw size={18} className="spinner" />
                <span>Uploading to Desktop...</span>
              </>
            ) : (
              <>
                <UploadCloud size={20} />
                <span>Submit & Start Verification</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#F8FAFC",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px"
  },
  card: {
    background: "#FFFFFF",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
    padding: "24px",
    width: "100%",
    maxWidth: "420px",
    textAlign: "center",
    border: "1px solid #E2E8F0"
  },
  captureBox: {
    border: "2px dashed #CBD5E1",
    borderRadius: "12px",
    padding: "32px 16px",
    background: "#F8FAFC",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    cursor: "pointer"
  }
};
