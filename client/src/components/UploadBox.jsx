import React, { useState, useEffect } from "react";
import { UploadCloud, FileText, Image as ImageIcon, Sparkles, CheckCircle, Camera } from "lucide-react";
import { fetchSampleDocumentsApi } from "../services/api";
import CameraScanner from "./CameraScanner";

export default function UploadBox({ onUpload, onSelectSample, loading }) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [forcedType, setForcedType] = useState("AUTO");
  const [samples, setSamples] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [manualNumber, setManualNumber] = useState("");

  useEffect(() => {
    fetchSampleDocumentsApi()
      .then((res) => {
        if (res?.samples) setSamples(res.samples);
      })
      .catch((err) => console.warn("Could not load demo samples:", err));
  }, []);

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleTriggerUpload = () => {
    if (!selectedFile) return;
    onUpload(selectedFile, forcedType === "AUTO" ? null : forcedType, manualNumber);
  };

  const handleCameraCapture = (capturedFile) => {
    setSelectedFile(capturedFile);
    setPreviewUrl(URL.createObjectURL(capturedFile));
    setShowCamera(false);
    onUpload(capturedFile, forcedType === "AUTO" ? null : forcedType, manualNumber);
  };

  const docTypesList = [
    { id: "AUTO", label: "✨ Auto-Detect" },
    { id: "PAN", label: "💳 PAN Card" },
    { id: "DRIVING_LICENSE", label: "🪪 Driving Licence" },
    { id: "AADHAAR", label: "🆔 Aadhaar Card" },
    { id: "VOTER_ID", label: "🗳️ Voter ID (EPIC)" },
    { id: "PASSPORT", label: "🛂 Passport" },
    { id: "VEHICLE_RC", label: "🚗 Vehicle RC" },
    { id: "GSTIN", label: "🏢 GSTIN Cert" }
  ];

  return (
    <div className="glass-card" style={styles.card}>
      <h2 style={styles.title}>Upload Indian Identity / Registration Document</h2>
      <p style={styles.subtitle}>
        Supports PAN, Driving Licence, Aadhaar, Voter ID, Passport, Vehicle RC, GSTIN & PDFs.
      </p>

      {/* Target Document Selector */}
      <div style={styles.typeSelectorGroup}>
        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#9ca3af" }}>
          Target Document Type (7 Supported):
        </span>
        <div style={styles.typeButtons}>
          {docTypesList.map((type) => (
            <button
              key={type.id}
              style={{
                ...styles.typeBtn,
                ...(forcedType === type.id ? styles.typeBtnActive : {})
              }}
              onClick={() => setForcedType(type.id)}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Drop Zone */}
      <div
        style={{
          ...styles.dropZone,
          ...(dragOver ? styles.dropZoneActive : {}),
          ...(selectedFile ? styles.dropZoneSelected : {})
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleFileDrop}
      >
        <input
          type="file"
          accept="image/*,.pdf"
          id="doc-upload-input"
          style={{ display: "none" }}
          onChange={handleFileSelect}
        />

        {previewUrl ? (
          <div style={styles.previewContainer}>
            <img src={previewUrl} alt="Document Preview" style={styles.previewImage} />
            <div style={styles.fileDetails}>
              <div style={{ fontWeight: 600 }}>{selectedFile.name}</div>
              <div style={{ fontSize: "0.78rem", color: "#9ca3af" }}>
                {(selectedFile.size / 1024).toFixed(1)} KB
              </div>
            </div>
          </div>
        ) : (
          <label htmlFor="doc-upload-input" style={styles.dropZoneLabel}>
            <div style={styles.uploadIconCircle}>
              <UploadCloud size={32} color="#818cf8" />
            </div>
            <div style={{ fontSize: "1rem", fontWeight: 600 }}>
              Drag & drop document image here, or{" "}
              <span style={{ color: "#818cf8", textDecoration: "underline" }}>browse</span>
            </div>
            <div style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "4px" }}>
              JPG, PNG, WEBP, or PDF (Max 10MB)
            </div>
          </label>
        )}
      </div>

      {/* Optional Manual Document Number Override */}
      <div style={{ marginTop: "16px" }}>
        <div style={{ fontSize: "0.8rem", color: "#9ca3af", marginBottom: "4px" }}>
          💡 Optional — Confirm / Enter ID Number (if OCR image has glare/blur):
        </div>
        <input
          type="text"
          placeholder="e.g. ABCDE1234F, DL1420110012345, 999988887777, Z1234567, 27ABCDE1234F1Z5"
          value={manualNumber}
          onChange={(e) => setManualNumber(e.target.value)}
          className="code-font"
          style={{
            width: "100%",
            background: "rgba(17, 24, 39, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "8px",
            padding: "10px 14px",
            color: "#fff",
            fontSize: "0.9rem",
            outline: "none"
          }}
        />
      </div>

      {/* Live Camera Scanner Button */}
      <div style={{ marginTop: "16px" }}>
        <button
          className="btn-secondary"
          style={{
            width: "100%",
            justifyContent: "center",
            padding: "12px",
            background: "rgba(99, 102, 241, 0.12)",
            borderColor: "rgba(99, 102, 241, 0.3)",
            color: "#a5b4fc",
            fontWeight: 600
          }}
          onClick={() => setShowCamera(true)}
        >
          <Camera size={18} />
          📷 Open Live Camera Scanner (Auto-Capture When Clear)
        </button>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <CameraScanner
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      {/* Verify Button */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
        <button
          className="btn-primary"
          onClick={handleTriggerUpload}
          disabled={!selectedFile || loading}
          style={{
            opacity: !selectedFile || loading ? 0.5 : 1,
            cursor: !selectedFile || loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Analyzing Pipeline..." : "Run Multi-Layer Verification"}
        </button>
      </div>

      {/* Synthetic Demo Samples */}
      {samples.length > 0 && (
        <div style={styles.sampleSection}>
          <div style={styles.sampleHeader}>
            <Sparkles size={16} color="#06b6d4" />
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#38bdf8" }}>
              Fast Test — 7 Demo Samples (1-Click Verification):
            </span>
          </div>

          <div style={styles.sampleGrid}>
            {samples.map((sample) => (
              <div
                key={sample.id}
                style={styles.sampleCard}
                onClick={() => onSelectSample(sample)}
              >
                <div style={styles.sampleBadge}>{sample.documentType}</div>
                <div style={{ fontWeight: 600, fontSize: "0.88rem", marginTop: "4px" }}>
                  {sample.title}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "2px" }}>
                  Click to verify sample
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  card: { padding: "28px" },
  title: { fontSize: "1.35rem", marginBottom: "6px" },
  subtitle: { fontSize: "0.88rem", color: "#9ca3af", marginBottom: "20px" },
  typeSelectorGroup: { display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" },
  typeButtons: { display: "flex", gap: "6px", flexWrap: "wrap" },
  typeBtn: {
    background: "rgba(255, 255, 255, 0.04)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "#9ca3af",
    fontSize: "0.82rem",
    fontWeight: 600,
    padding: "6px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease"
  },
  typeBtnActive: {
    background: "rgba(99, 102, 241, 0.2)",
    border: "1px solid rgba(99, 102, 241, 0.5)",
    color: "#a5b4fc"
  },
  dropZone: {
    border: "2px dashed rgba(255, 255, 255, 0.15)",
    borderRadius: "14px",
    padding: "32px 20px",
    textAlign: "center",
    cursor: "pointer",
    background: "rgba(17, 24, 39, 0.4)",
    transition: "all 0.2s ease"
  },
  dropZoneActive: { borderColor: "#818cf8", background: "rgba(99, 102, 241, 0.1)" },
  dropZoneSelected: { borderColor: "rgba(16, 185, 129, 0.4)", background: "rgba(16, 185, 129, 0.04)" },
  dropZoneLabel: { cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center" },
  uploadIconCircle: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "rgba(99, 102, 241, 0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "10px"
  },
  previewContainer: { display: "flex", alignItems: "center", gap: "16px", justifyContent: "center" },
  previewImage: { maxHeight: "100px", maxWidth: "180px", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.15)", objectFit: "contain" },
  fileDetails: { textAlign: "left" },
  sampleSection: { marginTop: "24px", paddingTop: "20px", borderTop: "1px solid rgba(255, 255, 255, 0.08)" },
  sampleHeader: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" },
  sampleGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "10px" },
  sampleCard: {
    background: "rgba(30, 41, 59, 0.6)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "10px",
    padding: "10px 14px",
    cursor: "pointer",
    transition: "all 0.2s ease"
  },
  sampleBadge: {
    background: "rgba(56, 189, 248, 0.15)",
    color: "#38bdf8",
    fontSize: "0.7rem",
    fontWeight: 700,
    padding: "2px 6px",
    borderRadius: "4px",
    display: "inline-block"
  }
};
