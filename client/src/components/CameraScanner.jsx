import React, { useRef, useEffect, useState } from "react";
import { Camera, RefreshCw, X, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

export default function CameraScanner({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState("environment");
  const [sharpness, setSharpness] = useState(0);
  const [isClear, setIsClear] = useState(false);
  const [autoCaptured, setAutoCaptured] = useState(false);
  const [error, setError] = useState(null);

  // Initialize camera stream
  useEffect(() => {
    let activeStream = null;

    async function startCamera() {
      try {
        setError(null);
        const constraints = {
          video: {
            facingMode: facingMode,
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        };
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        activeStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Camera Access Error:", err);
        setError("Could not access device camera. Please check camera permissions.");
      }
    }

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  // Frame Clarity Analysis Loop
  useEffect(() => {
    if (!stream || autoCaptured) return;

    let clearStreak = 0;
    const interval = setInterval(() => {
      if (!videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video.readyState < 2) return;

      const width = video.videoWidth || 640;
      const height = video.videoHeight || 480;

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, width, height);

      // Compute frame edge sharpness (Laplacian variance approximation)
      const imgData = ctx.getImageData(width * 0.2, height * 0.2, width * 0.6, height * 0.6);
      const data = imgData.data;
      let totalDiff = 0;
      let count = 0;

      for (let i = 0; i < data.length - 8; i += 16) {
        const lum1 = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        const lum2 = 0.299 * data[i + 4] + 0.587 * data[i + 5] + 0.114 * data[i + 6];
        totalDiff += Math.abs(lum1 - lum2);
        count++;
      }

      const score = Math.round(count > 0 ? totalDiff / count : 0);
      setSharpness(score);

      // Threshold: Score >= 16 represents clear, well-focused text frame
      if (score >= 16) {
        clearStreak++;
        setIsClear(true);

        // If high clarity sustained for 2 ticks (~800ms), trigger Auto-Capture!
        if (clearStreak >= 2 && !autoCaptured) {
          setAutoCaptured(true);
          triggerSnapshot(canvas);
        }
      } else {
        clearStreak = 0;
        setIsClear(false);
      }
    }, 400);

    return () => clearInterval(interval);
  }, [stream, autoCaptured]);

  const triggerSnapshot = (canvasElement = null) => {
    const canvas = canvasElement || canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `live-camera-${Date.now()}.png`, { type: "image/png" });
        onCapture(file);
      }
    }, "image/png");
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  return (
    <div className="overlay" style={styles.overlay}>
      <div className="modalCard glass-card" style={styles.modalCard}>
        {/* Header */}
        <div className="modalHeader" style={styles.header}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Camera size={22} color="#2563eb" />
            <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "#0f172a" }}>
              Live Document Camera Scanner
            </span>
          </div>
          <button className="iconBtn" style={styles.iconBtn} onClick={onClose}>
            <X size={20} color="#64748b" />
          </button>
        </div>

        {/* Camera View Area */}
        <div className="cameraBox" style={styles.cameraBox}>
          {error ? (
            <div className="errorBox" style={styles.errorBox}>
              <AlertCircle size={32} color="#dc2626" />
              <div style={{ color: "#dc2626", fontWeight: 600, marginTop: "8px" }}>{error}</div>
            </div>
          ) : (
            <>
              <video ref={videoRef} autoPlay playsInline muted className="video" style={styles.video} />
              <canvas ref={canvasRef} style={{ display: "none" }} />

              {/* ID Card Target Frame Overlay */}
              <div
                style={{
                  ...styles.targetFrame,
                  borderColor: isClear ? "#10b981" : "rgba(255, 255, 255, 0.6)",
                  boxShadow: isClear
                    ? "0 0 30px rgba(16, 185, 129, 0.5)"
                    : "0 0 0 9999px rgba(15, 23, 42, 0.4)"
                }}
              >
                <div className="frameCornerTL" style={styles.frameCornerTL} />
                <div className="frameCornerTR" style={styles.frameCornerTR} />
                <div className="frameCornerBL" style={styles.frameCornerBL} />
                <div className="frameCornerBR" style={styles.frameCornerBR} />

                {/* Clarity Feedback Pill */}
                <div
                  style={{
                    ...styles.clarityPill,
                    background: isClear ? "#059669" : "#d97706"
                  }}
                >
                  {isClear ? (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Perfect Clarity — Auto-Capturing!</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Align PAN/DL Card within Frame & Hold Still</span>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Meter & Controls */}
        <div className="controlBar" style={styles.controlBar}>
          <div className="meterBox" style={styles.meterBox}>
            <span style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 600 }}>
              Clarity Index: {sharpness} / 20
            </span>
            <div className="meterTrack" style={styles.meterTrack}>
              <div
                style={{
                  ...styles.meterFill,
                  width: `${Math.min(100, (sharpness / 20) * 100)}%`,
                  background: isClear ? "#10b981" : "#f59e0b"
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn-secondary" onClick={toggleCamera} title="Switch Camera">
              <RefreshCw size={18} />
              Flip
            </button>
            <button
              className="btn-primary"
              onClick={() => triggerSnapshot()}
              disabled={autoCaptured}
            >
              <Camera size={18} />
              Capture Snapshot
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(15, 23, 42, 0.45)",
    backdropFilter: "blur(8px)",
    zIndex: 2000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px"
  },
  modalCard: {
    maxWidth: "760px",
    width: "100%",
    borderRadius: "20px",
    padding: "24px",
    background: "#ffffff",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
    border: "1px solid #e2e8f0"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px"
  },
  iconBtn: {
    background: "#f1f5f9",
    border: "none",
    borderRadius: "50%",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer"
  },
  cameraBox: {
    position: "relative",
    width: "100%",
    height: "420px",
    background: "#0f172a",
    borderRadius: "14px",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  video: {
    width: "100%",
    height: "100%",
    objectFit: "cover"
  },
  errorBox: {
    textAlign: "center",
    padding: "32px"
  },
  targetFrame: {
    position: "absolute",
    top: "12%",
    left: "10%",
    width: "80%",
    height: "76%",
    border: "3px solid transparent",
    borderRadius: "16px",
    transition: "all 0.3s ease",
    pointerEvents: "none"
  },
  frameCornerTL: {
    position: "absolute",
    top: "-3px",
    left: "-3px",
    width: "24px",
    height: "24px",
    borderTop: "4px solid #2563eb",
    borderLeft: "4px solid #2563eb",
    borderRadius: "4px 0 0 0"
  },
  frameCornerTR: {
    position: "absolute",
    top: "-3px",
    right: "-3px",
    width: "24px",
    height: "24px",
    borderTop: "4px solid #2563eb",
    borderRight: "4px solid #2563eb",
    borderRadius: "0 4px 0 0"
  },
  frameCornerBL: {
    position: "absolute",
    bottom: "-3px",
    left: "-3px",
    width: "24px",
    height: "24px",
    borderBottom: "4px solid #2563eb",
    borderLeft: "4px solid #2563eb",
    borderRadius: "0 0 0 4px"
  },
  frameCornerBR: {
    position: "absolute",
    bottom: "-3px",
    right: "-3px",
    width: "24px",
    height: "24px",
    borderBottom: "4px solid #2563eb",
    borderRight: "4px solid #2563eb",
    borderRadius: "0 0 4px 0"
  },
  clarityPill: {
    position: "absolute",
    bottom: "16px",
    left: "50%",
    transform: "translateX(-50%)",
    padding: "8px 18px",
    borderRadius: "9999px",
    color: "#fff",
    fontSize: "0.85rem",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    whiteSpace: "nowrap",
    boxShadow: "0 4px 14px rgba(0,0,0,0.25)"
  },
  controlBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "20px",
    gap: "16px"
  },
  meterBox: {
    flex: 1,
    maxWidth: "260px"
  },
  meterTrack: {
    height: "6px",
    background: "#e2e8f0",
    borderRadius: "9999px",
    marginTop: "4px",
    overflow: "hidden"
  },
  meterFill: {
    height: "100%",
    borderRadius: "9999px",
    transition: "width 0.2s ease"
  }
};
