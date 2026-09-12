import React, { useState, useEffect, useRef } from "react";
import { 
  UploadCloud, 
  FileText, 
  Sparkles, 
  Camera, 
  ChevronDown, 
  X, 
  RefreshCw,
  CreditCard,
  Car,
  Fingerprint,
  UserCheck,
  Globe,
  Building,
  Wheat,
  GraduationCap,
  FileBadge,
  Lightbulb,
  Truck
} from "lucide-react";

import CameraScanner from "./CameraScanner";
import { useLanguage } from "../hooks/useLanguage";
import ScannerOptionModal from "./ScannerOptionModal";

export default function UploadBox({
  onUpload,
  onSelectSample,
  loading,
  selectedCategory,
  onCategoryChange,
  onFileSelect,
  resetSignal
}) {
  const { t } = useLanguage();
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [forcedType, setForcedType] = useState(selectedCategory || "AUTO");

  const [previewUrl, setPreviewUrl] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showOptionModal, setShowOptionModal] = useState(false);
  const [manualNumber, setManualNumber] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const documentTypes = [
    { id: "AUTO", label: "Auto-Detect Document Type", icon: Sparkles },
    { id: "PAN", label: "Indian Income Tax PAN Card", icon: CreditCard },
    { id: "DRIVING_LICENSE", label: "Indian Driving Licence (DL)", icon: Car },
    { id: "AADHAAR", label: "Aadhaar Card (UIDAI)", icon: Fingerprint },
    { id: "VOTER_ID", label: "Voter ID Card (EPIC)", icon: UserCheck },
    { id: "PASSPORT", label: "Indian Passport", icon: Globe },
    { id: "VEHICLE_RC", label: "Vehicle Registration Certificate (RC)", icon: Car },
    { id: "GSTIN", label: "GSTIN Certificate", icon: Building },
    { id: "RATION_CARD", label: "Ration Card (NFSA / PDS)", icon: Wheat },
    { id: "DEGREE_CERTIFICATE", label: "Degree Certificate (UGC / NAD)", icon: GraduationCap },
    { id: "BIRTH_CERTIFICATE", label: "Birth Certificate (CRS)", icon: FileBadge },
    { id: "STUDENT_ID", label: "Student / Institutional ID Card", icon: CreditCard }
  ];

  // Sync forcedType with parent state if provided
  useEffect(() => {
    if (selectedCategory !== undefined && selectedCategory !== forcedType) {
      setForcedType(selectedCategory);
    }
  }, [selectedCategory]);

  // Handle external reset signal
  useEffect(() => {
    if (resetSignal) {
      handleClearFile();
    }
  }, [resetSignal]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);



  const handleClearFile = (e) => {
    if (e) e.stopPropagation();
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setManualNumber("");
    const fileInput = document.getElementById("doc-upload-input");
    if (fileInput) fileInput.value = "";
    if (onFileSelect) onFileSelect(null);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      if (onFileSelect) onFileSelect(file);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      if (onFileSelect) onFileSelect(file);
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
    if (onFileSelect) onFileSelect(capturedFile);
    onUpload(capturedFile, forcedType === "AUTO" ? null : forcedType, manualNumber);
  };

  const activeDocObj = documentTypes.find(t => t.id === forcedType) || documentTypes[0];
  const ActiveIcon = activeDocObj.icon;

  return (
    <div className="glass-card" style={styles.card}>
      <h2 className="title" style={styles.title}>{t('uploadBox.title')}</h2>
      <p className="subtitle" style={styles.subtitle}>
        Supports PAN Card, Driving Licence, Aadhaar, Voter ID, Passport, RC, GSTIN, Ration Card, Degree & Birth Certs.
      </p>

      {/* Target Document Selector Custom Dropdown */}
      <div className="typeSelectorGroup" style={styles.typeSelectorGroup}>
        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748B" }}>
          {t('uploadBox.docType')}
        </span>
        <div 
          ref={dropdownRef}
          className="customDropdownContainer"
          style={{ position: "relative", marginTop: "4px" }}
        >
          <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              width: "100%",
              padding: "12px 16px",
              background: "#F8FAFC",
              border: `1px solid ${isDropdownOpen ? '#2563EB' : '#E2E8F0'}`,
              boxShadow: isDropdownOpen ? "0 0 0 3px rgba(37,99,235,0.15)" : "none",
              borderRadius: "8px",
              color: "#0F172A",
              fontSize: "0.95rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              transition: "all 0.2s ease"
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "8px", pointerEvents: "none" }}>
              <ActiveIcon size={16} color="#2563EB" />
              <span>{activeDocObj.label}</span>
            </span>
            <ChevronDown 
              size={20} 
              color="#64748B" 
              style={{ transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}
            />
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              marginTop: "6px",
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "8px",
              boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.1)",
              zIndex: 50,
              overflow: "hidden",
              maxHeight: "280px",
              overflowY: "auto"
            }}>
              {documentTypes.map((t) => {
                const Icon = t.icon;
                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      setForcedType(t.id);
                      if (onCategoryChange) onCategoryChange(t.id);
                      setIsDropdownOpen(false);
                    }}
                    onMouseEnter={(e) => {
                      if (forcedType !== t.id) e.currentTarget.style.background = "#F1F5F9";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = forcedType === t.id ? "#EFF6FF" : "transparent";
                    }}
                    style={{
                      padding: "12px 16px",
                      fontSize: "0.92rem",
                      fontWeight: 500,
                      color: forcedType === t.id ? "#2563EB" : "#334155",
                      background: forcedType === t.id ? "#EFF6FF" : "transparent",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      borderLeft: forcedType === t.id ? "3px solid #2563EB" : "3px solid transparent"
                    }}
                  >
                    <Icon size={16} color={forcedType === t.id ? "#2563EB" : "#64748B"} />
                    <span>{t.label}</span>
                  </div>
                );
              })}
            </div>
          )}
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
          <div className="previewContainer" style={styles.previewContainer}>
            <img src={previewUrl} alt="Document Preview" className="previewImage" style={styles.previewImage} />
            <div className="fileDetails" style={styles.fileDetails}>
              <div style={{ fontWeight: 600, color: "#0F172A" }}>{selectedFile.name}</div>
              <div style={{ fontSize: "0.78rem", color: "#64748B" }}>
                {(selectedFile.size / 1024).toFixed(1)} KB
              </div>

              {/* Action buttons: Replace and Remove */}
              <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                <label
                  htmlFor="doc-upload-input"
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#2563EB",
                    background: "#EFF6FF",
                    border: "1px solid #DBEAFE",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  <RefreshCw size={12} />
                  Replace
                </label>
                <button
                  type="button"
                  onClick={handleClearFile}
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#DC2626",
                    background: "#FEE2E2",
                    border: "1px solid #FECACA",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  <X size={12} />
                  Remove File
                </button>
              </div>
            </div>
          </div>
        ) : (
          <label htmlFor="doc-upload-input" className="dropZoneLabel" style={styles.dropZoneLabel}>
            <div className="uploadIconCircle" style={styles.uploadIconCircle}>
              <UploadCloud size={30} color="#2563EB" />
            </div>
            <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#0F172A" }}>
              {t('uploadBox.dropLabel')} {" "}
              <span style={{ color: "#2563EB", textDecoration: "underline" }}>{t('uploadBox.browse')}</span>
            </div>
            <div style={{ fontSize: "0.8rem", color: "#64748B", marginTop: "4px" }}>
              {t('uploadBox.dropHint')}
            </div>
          </label>
        )}
      </div>

      {/* Optional Manual Document Number Override */}
      <div style={{ marginTop: "16px" }}>
        <div style={{ fontSize: "0.82rem", color: "#64748B", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
          <Lightbulb size={15} color="#EAB308" />
          <span>Optional — Confirm / Enter Document Number (if OCR image has glare/blur):</span>
        </div>
        <input
          type="text"
          placeholder={t('uploadBox.manualPlaceholder')}
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
          onClick={() => setShowOptionModal(true)}
        >
          <Camera size={18} color="#2563EB" />
          <span>{t('uploadBox.cameraBtn')}</span>
        </button>
      </div>

      {/* Scanner Option Modal (QR scan on mobile or current device camera) */}
      {showOptionModal && (
        <ScannerOptionModal
          onClose={() => setShowOptionModal(false)}
          onSelectDeviceCamera={() => {
            setShowOptionModal(false);
            setShowCamera(true);
          }}
          onMobileCaptured={(capturedFile) => {
            setShowOptionModal(false);
            handleCameraCapture(capturedFile);
          }}
        />
      )}

      {/* Camera Modal */}
      {showCamera && (
        <CameraScanner
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      {/* Verify Button */}
      <div className="verifyBtnWrapper" style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
        <button
          className="btn-primary"
          onClick={handleTriggerUpload}
          disabled={!selectedFile || loading}
          style={{
            opacity: !selectedFile || loading ? 0.5 : 1,
            cursor: !selectedFile || loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? t('uploadBox.analyzing') : t('uploadBox.verifyBtn')}
        </button>
      </div>
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
  }
};
