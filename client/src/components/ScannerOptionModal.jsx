import React, { useState, useEffect } from "react";
import { X, Camera, QrCode, Smartphone, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { createMobileSessionApi, getMobileSessionStatusApi } from "../services/api";

export default function ScannerOptionModal({ onSelectDeviceCamera, onMobileCaptured, onClose }) {
  const [sessionId, setSessionId] = useState(null);
  const [mobileUrl, setMobileUrl] = useState("");
  const [loadingSession, setLoadingSession] = useState(true);
  const [sessionStatus, setSessionStatus] = useState("PENDING");
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    let intervalId = null;

    const initSession = async () => {
      try {
        setLoadingSession(true);
        const res = await createMobileSessionApi();
        if (res?.sessionId) {
          setSessionId(res.sessionId);
          const port = window.location.port ? `:${window.location.port}` : "";
          const host = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && res.localIp
            ? res.localIp
            : window.location.hostname;
          const url = `${window.location.protocol}//${host}${port}/mobile-upload?sessionId=${res.sessionId}`;
          setMobileUrl(url);

          // Start polling every 2 seconds
          intervalId = setInterval(async () => {
            try {
              const statusRes = await getMobileSessionStatusApi(res.sessionId);
              if (statusRes?.status === "COMPLETED" && statusRes?.file) {
                clearInterval(intervalId);
                setSessionStatus("COMPLETED");

                // Download uploaded file and pass to parent
                const imgRes = await fetch(statusRes.file.fileUrl);
                const blob = await imgRes.blob();
                const capturedFile = new File([blob], statusRes.file.originalname || "mobile_capture.jpg", {
                  type: blob.type || "image/jpeg"
                });

                onMobileCaptured(capturedFile);
              }
            } catch (pollErr) {
              // Ignore transient polling error
            }
          }, 2000);
        }
      } catch (err) {
        setErrorMsg("Could not initialize mobile upload session");
      } finally {
        setLoadingSession(false);
      }
    };

    initSession();

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return (
    <div style={styles.backdrop}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.modalHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={styles.iconCircle}>
              <Camera size={20} color="#2563EB" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#0F172A" }}>
                Document Scanner Options
              </h3>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748B" }}>
                Scan via Mobile Phone QR Code or Use Current Device Camera
              </p>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={18} color="#64748B" />
          </button>
        </div>

        {/* Modal Body */}
        <div style={styles.modalBody}>
          {/* Option 1: Scan via Mobile Phone (QR Code) */}
          <div style={styles.optionBox}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <Smartphone size={18} color="#2563EB" />
              <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0F172A" }}>
                Option 1: Scan with Mobile Phone Camera
              </span>
            </div>

            <p style={{ fontSize: "0.82rem", color: "#64748B", marginBottom: "16px", lineHeight: 1.4 }}>
              Scan the QR code below using your mobile phone. Take a photo of your document on your phone, submit it, and verification will start automatically here!
            </p>

            <div style={styles.qrContainer}>
              {loadingSession ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#64748B" }}>
                  <RefreshCw size={24} className="spinner" style={{ margin: "0 auto 8px" }} />
                  <div style={{ fontSize: "0.82rem" }}>Generating QR Code...</div>
                </div>
              ) : errorMsg ? (
                <div style={{ color: "#DC2626", fontSize: "0.82rem" }}>
                  <AlertCircle size={20} style={{ margin: "0 auto 4px" }} />
                  {errorMsg}
                </div>
              ) : (
                <>
                  <div style={styles.qrFrame}>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(mobileUrl)}`}
                      alt="Scan to Upload on Mobile"
                      style={{ width: "180px", height: "180px", borderRadius: "8px" }}
                    />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "12px", fontSize: "0.8rem", color: sessionStatus === "COMPLETED" ? "#16A34A" : "#2563EB", fontWeight: 600 }}>
                    {sessionStatus === "COMPLETED" ? (
                      <>
                        <CheckCircle2 size={16} color="#16A34A" />
                        <span>Document Received! Starting Verification...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw size={14} className="spinner" />
                        <span>Waiting for mobile capture submission...</span>
                      </>
                    )}
                  </div>
                  <div style={{ marginTop: "8px", fontSize: "0.74rem", color: "#64748B", background: "#F1F5F9", padding: "6px 8px", borderRadius: "6px", wordBreak: "break-all" }}>
                    Direct Link: <strong>{mobileUrl}</strong>
                    <div style={{ marginTop: "4px", fontSize: "0.7rem", color: "#475569" }}>
                      * Phone must be connected to the same Wi-Fi network
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div style={styles.divider}>
            <span style={styles.dividerText}>OR</span>
          </div>

          {/* Option 2: Use Camera on This Device */}
          <div style={{ textAlign: "center" }}>
            <button
              onClick={() => {
                onSelectDeviceCamera();
              }}
              style={styles.deviceCameraBtn}
            >
              <Camera size={20} />
              <span>Use Camera on This Device</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(15, 23, 42, 0.6)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "16px"
  },
  modal: {
    background: "#FFFFFF",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "480px",
    boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
    overflow: "hidden",
    border: "1px solid #E2E8F0"
  },
  modalHeader: {
    padding: "18px 24px",
    borderBottom: "1px solid #E2E8F0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#F8FAFC"
  },
  iconCircle: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    background: "#EFF6FF",
    border: "1px solid #DBEAFE",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "6px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  modalBody: {
    padding: "24px"
  },
  optionBox: {
    background: "#F8FAFC",
    border: "1px solid #E2E8F0",
    borderRadius: "12px",
    padding: "18px"
  },
  qrContainer: {
    textAlign: "center",
    marginTop: "8px"
  },
  qrFrame: {
    display: "inline-block",
    padding: "10px",
    background: "#FFFFFF",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    border: "1px solid #E2E8F0"
  },
  divider: {
    position: "relative",
    textAlign: "center",
    margin: "20px 0",
    borderBottom: "1px solid #E2E8F0"
  },
  dividerText: {
    position: "absolute",
    top: "-10px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#FFFFFF",
    padding: "0 12px",
    fontSize: "0.75rem",
    fontWeight: 700,
    color: "#94A3B8"
  },
  deviceCameraBtn: {
    width: "100%",
    padding: "14px",
    background: "#2563EB",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "10px",
    fontWeight: 700,
    fontSize: "0.95rem",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)",
    transition: "all 0.2s ease"
  }
};
