import React, { useState, useEffect } from "react";
import { UploadCloud, FileText, Sparkles, Camera, ChevronDown } from "lucide-react";
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

  return (
    <div className="glass-card" style={styles.card}>
      <h2 style={styles.title}>Upload Indian Identity Document</h2>
      <p style={styles.subtitle}>
        Supports standard PAN Card, Driving Licence, Aadhaar preview, & PDFs.
      </p>

      {/* Target Document Selector */}
      <div style={styles.typeSelectorGroup}>
        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748B" }}>
          Target Document Type:
        </span>
        <div style={styles.typeButtons}>
          {[
            { id: "AUTO", label: "✨ Auto-Detect" },
            { id: "PAN", label: "💳 PAN Card" },
            { id: "DRIVING_LICENSE", label: "🪪 Driving Licence" }
          ].map((type) => (
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
              <div style={{ fontWeight: 600, color: "#0F172A" }}>{selectedFile.name}</div>
              <div style={{ fontSize: "0.78rem", color: "#64748B" }}>
                {(selectedFile.size / 1024).toFixed(1)} KB
              </div>
            </div>
          </div>
        ) : (
          <label htmlFor="doc-upload-input" style={styles.dropZoneLabel}>
            <div style={styles.uploadIconCircle}>
              <UploadCloud size={30} color="#2563EB" />
            </div>
            <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#0F172A" }}>
              Drag & drop document image here, or{" "}
              <span style={{ color: "#2563EB", textDecoration: "underline" }}>browse</span>
            </div>
            <div style={{ fontSize: "0.8rem", color: "#64748B", marginTop: "4px" }}>
              JPG, PNG, WEBP, or PDF (Max 10MB)
            </div>
          </label>
        )}
      </div>

      {/* Optional Manual Document Number Override */}
      <div style={{ marginTop: "16px" }}>
        <div style={{ fontSize: "0.82rem", color: "#64748B", marginBottom: "6px" }}>
          💡 Optional — Confirm / Enter PAN or DL Number (if OCR image has glare/blur):
        </div>
        <input
          type="text"
          placeholder="Enter document number (e.g. ABCDE1234F or DL1420110012345)"
          value={manualNumber}
          onChange={(e) => setManualNumber(e.target.value)}
          className="code-font input-field"
        />
      </div>

      {/* Ghost button styled camera scanner action */}
      <div style={{ marginTop: "16px" }}>
        <button
          className="btn-ghost"
          style={{
            width: "100%",
            justifyContent: "center",
            padding: "11px",
            fontWeight: 600
          }}
          onClick={() => setShowCamera(true)}
        >
          <Camera size={18} color="#2563EB" />
          <span>Open Live Camera Scanner (Auto-Capture When Clear)</span>
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
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
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
            <Sparkles size={16} color="#2563EB" />
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#2563EB" }}>
              Fast Test — Try Synthetic Demo Samples:
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
                <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#0F172A", marginTop: "4px" }}>
                  {sample.title}
                </div>
                <div style={{ fontSize: "0.78rem", color: "#64748B", marginTop: "2px" }}>
                  Click to verify sample instantly
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
  card: {
    padding: "28px"
  },
  title: {
    fontSize: "1.35rem",
    marginBottom: "6px",
    color: "#0F172A"
  },
  subtitle: {
    fontSize: "0.88rem",
    color: "#64748B",
    marginBottom: "20px"
  },
  typeSelectorGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "16px"
  },
  typeButtons: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap"
  },
  typeBtn: {
    background: "#F1F5F9",
    border: "1px solid #E2E8F0",
    color: "#64748B",
    fontSize: "0.85rem",
    fontWeight: 600,
    padding: "8px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease"
  },
  typeBtnActive: {
    background: "#EFF6FF",
    border: "1px solid #DBEAFE",
    color: "#2563EB"
  },
  dropZone: {
    border: "2px dashed #E2E8F0",
    borderRadius: "14px",
    padding: "36px 20px",
    textAlign: "center",
    cursor: "pointer",
    background: "#F8FAFC",
    transition: "all 0.2s ease"
  },
  dropZoneActive: {
    borderColor: "#2563EB",
    background: "#EFF6FF"
  },
  dropZoneSelected: {
    borderColor: "#16A34A",
    background: "#ECFDF5"
  },
  dropZoneLabel: {
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  uploadIconCircle: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "#EFF6FF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "12px"
  },
  previewContainer: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    justifyContent: "center"
  },
  previewImage: {
    maxHeight: "100px",
    maxWidth: "180px",
    borderRadius: "8px",
    border: "1px solid #E2E8F0",
    objectFit: "contain"
  },
  fileDetails: {
    textAlign: "left"
  },
  sampleSection: {
    marginTop: "24px",
    paddingTop: "20px",
    borderTop: "1px solid #E2E8F0"
  },
  sampleHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "12px"
  },
  sampleGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px"
  },
  sampleCard: {
    background: "#F8FAFC",
    border: "1px solid #E2E8F0",
    borderRadius: "10px",
    padding: "12px 16px",
    cursor: "pointer",
    transition: "all 0.2s ease"
  },
  sampleBadge: {
    background: "#EFF6FF",
    color: "#2563EB",
    fontSize: "0.72rem",
    fontWeight: 700,
    padding: "2px 8px",
    borderRadius: "4px",
    display: "inline-block"
  }
};
