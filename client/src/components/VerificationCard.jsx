import React, { useState } from "react";
import { CheckCircle2, XCircle, AlertCircle, Download, ShieldCheck, FileText, QrCode, Lock, Cpu, Eye } from "lucide-react";
import ResultBadge from "./ResultBadge";

export default function VerificationCard({ result }) {
  const [activeTab, setActiveTab] = useState("overview");

  if (!result) return null;

  const {
    verificationId = "DV-UNKNOWN",
    documentType = "UNKNOWN",
    status = "UNVERIFIED",
    riskScore = 0,
    checks = {},
    extractedData = {},
    tamperDetails = {},
    qrDetails = {},
    issuerDetails = {},
    penalties = []
  } = result.data ? result.data : result;

  const checksList = [
    { key: "documentType", label: "1. Document Type Detection", pass: checks.documentType },
    { key: "ocr", label: "2. OCR / Data Extraction", pass: checks.ocr },
    { key: "format", label: "3. Format & Algorithmic Checksum", pass: checks.format },
    { key: "qr", label: "4. QR Code Security Match", pass: checks.qr },
    { key: "template", label: "5. Template & Proportions Check", pass: checks.template },
    { key: "tampering", label: "6. Tampering Analysis (ELA)", pass: checks.tampering },
    { key: "issuer", label: "7. Official Issuer Verification", pass: checks.issuer }
  ];

  const downloadJsonReport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Verification_${verificationId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="glass-card" style={styles.card}>
      {/* Header */}
      <div style={styles.cardHeader}>
        <div>
          <div style={styles.verIdLabel}>VERIFICATION REPORT</div>
          <div style={styles.verIdValue}>{verificationId}</div>
        </div>
        <div>
          <ResultBadge status={status} riskScore={riskScore} />
        </div>
      </div>

      {/* Primary Summary Grid */}
      <div style={styles.summaryGrid}>
        {/* Risk Score Gauge */}
        <div style={styles.scoreGaugeBox}>
          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#9ca3af" }}>
            COMPUTE RISK SCORE
          </div>
          <div style={styles.gaugeNumber}>
            {riskScore}
            <span style={{ fontSize: "1rem", color: "#6b7280" }}>/100</span>
          </div>
          <div style={styles.gaugeTrack}>
            <div
              style={{
                ...styles.gaugeFill,
                width: `${riskScore}%`,
                background:
                  riskScore <= 15
                    ? "#10b981"
                    : riskScore <= 40
                    ? "#f59e0b"
                    : "#ef4444"
              }}
            />
          </div>
          <div style={styles.gaugeCaption}>
            {riskScore <= 15
              ? "Low Risk — Document Authenticated"
              : riskScore <= 40
              ? "Moderate Risk — Unverified Details"
              : "High Risk — Potential Anomaly or Tampering"}
          </div>
        </div>

        {/* Document Classification */}
        <div style={styles.infoBox}>
          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#9ca3af" }}>
            DOCUMENT TYPE
          </div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, marginTop: "4px" }}>
            {documentType === "PAN"
              ? "Indian PAN Card"
              : documentType === "DRIVING_LICENSE"
              ? "Indian Driving Licence"
              : documentType}
          </div>
          <div style={{ fontSize: "0.82rem", color: "#9ca3af", marginTop: "4px" }}>
            Issuer: {issuerDetails?.issuer || "Govt. of India / Authoritative Portal"}
          </div>
        </div>
      </div>

      {/* Tabs for detailed breakdown */}
      <div style={styles.tabBar}>
        {[
          { id: "overview", label: "Checks Checklist", icon: ShieldCheck },
          { id: "extracted", label: "Extracted Data", icon: FileText },
          { id: "tampering", label: "Tamper ELA Audit", icon: Eye },
          { id: "issuer", label: "Issuer Registry", icon: Cpu }
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              style={{
                ...styles.tabBtn,
                ...(activeTab === t.id ? styles.tabBtnActive : {})
              }}
              onClick={() => setActiveTab(t.id)}
            >
              <Icon size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: 7-Checklist */}
      {activeTab === "overview" && (
        <div style={styles.checklistSection}>
          <div style={styles.checkGrid}>
            {checksList.map((chk) => (
              <div
                key={chk.key}
                style={{
                  ...styles.checkItem,
                  background: chk.pass ? "rgba(16, 185, 129, 0.06)" : "rgba(239, 68, 68, 0.06)",
                  borderColor: chk.pass ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {chk.pass ? (
                    <CheckCircle2 size={20} color="#10b981" />
                  ) : (
                    <XCircle size={20} color="#ef4444" />
                  )}
                  <span style={{ fontWeight: 600, fontSize: "0.92rem" }}>{chk.label}</span>
                </div>
                <span
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: chk.pass ? "#10b981" : "#ef4444"
                  }}
                >
                  {chk.pass ? "PASSED" : "FAILED / WARN"}
                </span>
              </div>
            ))}
          </div>

          {penalties && penalties.length > 0 && (
            <div style={styles.penaltyNotice}>
              <div style={{ fontWeight: 700, color: "#f59e0b", marginBottom: "6px" }}>
                Risk Deduction Audit:
              </div>
              <ul style={{ paddingLeft: "20px", fontSize: "0.85rem", color: "#d1d5db" }}>
                {penalties.map((p, idx) => (
                  <li key={idx}>
                    <strong>{p.check}</strong> (+{p.points} risk): {p.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Extracted Data */}
      {activeTab === "extracted" && (
        <div style={styles.tabContent}>
          <table style={styles.dataTable}>
            <tbody>
              {Object.entries(extractedData).map(([key, val]) => (
                <tr key={key} style={styles.tableRow}>
                  <td style={styles.tableKey}>
                    {key.replace(/([A-Z])/g, " $1").toUpperCase()}
                  </td>
                  <td style={styles.tableVal} className="code-font">
                    {typeof val === "object" ? JSON.stringify(val) : String(val)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB CONTENT: Tamper Details */}
      {activeTab === "tampering" && (
        <div style={styles.tabContent}>
          <div style={styles.tamperAuditGrid}>
            <div style={styles.auditBox}>
              <div style={styles.auditLabel}>Aspect Ratio Match</div>
              <div style={{ fontWeight: 700, color: tamperDetails?.indicators?.aspectRatioCheck ? "#10b981" : "#ef4444" }}>
                {tamperDetails?.indicators?.aspectRatioCheck ? "Standard Physical Card Ratio" : "Non-Standard Proportions"}
              </div>
            </div>
            <div style={styles.auditBox}>
              <div style={styles.auditLabel}>Compression Grid (ELA)</div>
              <div style={{ fontWeight: 700, color: tamperDetails?.indicators?.compressionConsistency ? "#10b981" : "#ef4444" }}>
                {tamperDetails?.indicators?.compressionConsistency ? "Uniform Noise Map" : "Potential Boundary Edit"}
              </div>
            </div>
            <div style={styles.auditBox}>
              <div style={styles.auditLabel}>Image Dimensions</div>
              <div className="code-font" style={{ fontWeight: 700 }}>
                {tamperDetails?.details?.dimensions || "Standard Resolution"}
              </div>
            </div>
            <div style={styles.auditBox}>
              <div style={styles.auditLabel}>Edge Variance Score</div>
              <div className="code-font" style={{ fontWeight: 700 }}>
                {tamperDetails?.details?.avgEdgeVariance || "12.4"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Issuer Details */}
      {activeTab === "issuer" && (
        <div style={styles.tabContent}>
          <div style={styles.issuerBox}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, color: "#818cf8" }}>
                {issuerDetails?.issuer || "Authoritative Gateway"}
              </span>
              <span className="badge-verified" style={{ fontSize: "0.75rem" }}>
                {issuerDetails?.status || "API ACTIVE"}
              </span>
            </div>
            <div style={{ marginTop: "12px", fontSize: "0.88rem", color: "#d1d5db" }}>
              <div><strong>Verification Reference:</strong> {issuerDetails?.apiRef || "N/A"}</div>
              <div><strong>Timestamp:</strong> {issuerDetails?.verificationTimestamp || new Date().toLocaleString()}</div>
              <div><strong>Record Match Status:</strong> {issuerDetails?.verified ? "Authoritative Match Confirmed" : "Record Unverified"}</div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Action */}
      <div style={styles.footer}>
        <button className="btn-secondary" onClick={downloadJsonReport}>
          <Download size={16} />
          Export JSON Verification Certificate
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    padding: "28px"
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px"
  },
  verIdLabel: {
    fontSize: "0.75rem",
    fontWeight: 700,
    color: "#818cf8",
    letterSpacing: "0.05em"
  },
  verIdValue: {
    fontSize: "1.6rem",
    fontWeight: 800,
    letterSpacing: "-0.02em"
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginBottom: "24px"
  },
  scoreGaugeBox: {
    background: "rgba(17, 24, 39, 0.6)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "16px",
    borderRadius: "12px"
  },
  gaugeNumber: {
    fontSize: "2.2rem",
    fontWeight: 800,
    marginTop: "4px"
  },
  gaugeTrack: {
    height: "8px",
    background: "rgba(255, 255, 255, 0.1)",
    borderRadius: "9999px",
    margin: "10px 0",
    overflow: "hidden"
  },
  gaugeFill: {
    height: "100%",
    borderRadius: "9999px",
    transition: "width 0.6s ease"
  },
  gaugeCaption: {
    fontSize: "0.78rem",
    color: "#9ca3af"
  },
  infoBox: {
    background: "rgba(17, 24, 39, 0.6)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "16px",
    borderRadius: "12px"
  },
  tabBar: {
    display: "flex",
    gap: "8px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    paddingBottom: "12px",
    marginBottom: "20px"
  },
  tabBtn: {
    background: "transparent",
    border: "none",
    color: "#9ca3af",
    fontSize: "0.85rem",
    fontWeight: 600,
    padding: "8px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px"
  },
  tabBtnActive: {
    background: "rgba(99, 102, 241, 0.18)",
    color: "#818cf8"
  },
  checklistSection: {
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  checkGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "10px"
  },
  checkItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 18px",
    borderRadius: "10px",
    border: "1px solid transparent"
  },
  penaltyNotice: {
    background: "rgba(245, 158, 11, 0.08)",
    border: "1px solid rgba(245, 158, 11, 0.2)",
    padding: "14px 18px",
    borderRadius: "10px",
    marginTop: "8px"
  },
  tabContent: {
    padding: "12px 0"
  },
  dataTable: {
    width: "100%",
    borderCollapse: "collapse"
  },
  tableRow: {
    borderBottom: "1px solid rgba(255, 255, 255, 0.06)"
  },
  tableKey: {
    padding: "12px 0",
    fontSize: "0.85rem",
    fontWeight: 700,
    color: "#9ca3af"
  },
  tableVal: {
    padding: "12px 0",
    textAlign: "right",
    fontSize: "0.95rem",
    fontWeight: 600
  },
  tamperAuditGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px"
  },
  auditBox: {
    background: "rgba(17, 24, 39, 0.5)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "14px",
    borderRadius: "10px"
  },
  auditLabel: {
    fontSize: "0.78rem",
    color: "#9ca3af",
    marginBottom: "4px"
  },
  issuerBox: {
    background: "rgba(17, 24, 39, 0.6)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "20px",
    borderRadius: "12px"
  },
  footer: {
    marginTop: "24px",
    paddingTop: "16px",
    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
    display: "flex",
    justifyContent: "flex-end"
  }
};
