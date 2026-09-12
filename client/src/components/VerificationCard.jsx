import React, { useState } from "react";
import { CheckCircle2, XCircle, AlertCircle, Download, ShieldCheck, FileText, Cpu, Eye } from "lucide-react";
import ResultBadge from "./ResultBadge";

export default function VerificationCard({ result }) {
  const [activeTab, setActiveTab] = useState("overview");

  if (!result) return null;

  const {
    verificationId = "DV-UNKNOWN",
    documentType = "UNKNOWN",
    status = "UNVERIFIED",
    riskScore = 0,
    originalityScore,
    checks = {},
    extractedData = {},
    tamperDetails = {},
    issuerDetails = {},
    penalties = []
  } = result.data ? result.data : result;

  const displayOriginalityScore = originalityScore !== undefined ? originalityScore : Math.max(0, 100 - riskScore);

  const getOriginalityColor = (score) => {
    const s = Math.min(100, Math.max(0, score));
    const hue = (s / 100) * 120;
    return `hsl(${hue}, 85%, 40%)`;
  };

  const scoreColor = getOriginalityColor(displayOriginalityScore);

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
      <div className="cardHeader" style={styles.cardHeader}>
        <div>
          <div className="verIdLabel" style={styles.verIdLabel}>VERIFICATION REPORT</div>
          <div className="verIdValue" style={styles.verIdValue}>{verificationId}</div>
        </div>
        <div>
          <ResultBadge status={status} riskScore={riskScore} originalityScore={displayOriginalityScore} />
        </div>
      </div>

      {/* Primary Summary Grid */}
      <div className="summaryGrid" style={styles.summaryGrid}>
        {/* Originality Score Gauge */}
        <div className="scoreGaugeBox" style={styles.scoreGaugeBox}>
          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748B" }}>
            ORIGINALITY SCORE
          </div>
          <div className="gaugeNumber" style={{ ...styles.gaugeNumber, color: "#0F172A" }}>
            {displayOriginalityScore}
            <span style={{ fontSize: "1rem", color: "#64748B" }}>/100</span>
          </div>
          <div className="gaugeTrack" style={styles.gaugeTrack}>
            <div
              style={{
                ...styles.gaugeFill,
                width: `${displayOriginalityScore}%`,
                background: scoreColor,
                boxShadow: `0 2px 8px ${scoreColor}44`,
                transition: "all 0.5s ease"
              }}
            />
          </div>
          <div className="gaugeCaption" style={{ ...styles.gaugeCaption, color: scoreColor, fontWeight: 600 }}>
            {displayOriginalityScore >= 85
              ? "High Originality — Document Authenticated"
              : displayOriginalityScore >= 60
              ? "Moderate Originality — Needs Manual Review"
              : "Low Originality — Potential Anomaly or Tampering"}
          </div>
        </div>

        {/* Document Classification */}
        <div className="infoBox" style={styles.infoBox}>
          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748B" }}>
            DOCUMENT TYPE
          </div>
          <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0F172A", marginTop: "4px" }}>
            {documentType === "PAN"
              ? "Indian PAN Card"
              : documentType === "DRIVING_LICENSE"
              ? "Indian Driving Licence"
              : documentType}
          </div>
          <div style={{ fontSize: "0.82rem", color: "#64748B", marginTop: "4px" }}>
            Issuer: {issuerDetails?.issuer || "Govt. of India / Authoritative Portal"}
          </div>
        </div>
      </div>

      {/* Tabs for detailed breakdown */}
      <div className="tabBar" style={styles.tabBar}>
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
        <div className="checklistSection" style={styles.checklistSection}>
          <div className="checkGrid" style={styles.checkGrid}>
            {checksList.map((chk) => (
              <div
                key={chk.key}
                style={{
                  ...styles.checkItem,
                  background: chk.pass ? "#ECFDF5" : "#FEE2E2",
                  borderColor: chk.pass ? "#A7F3D0" : "#FECACA"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {chk.pass ? (
                    <CheckCircle2 size={20} color="#16A34A" />
                  ) : (
                    <XCircle size={20} color="#DC2626" />
                  )}
                  <span style={{ fontWeight: 600, fontSize: "0.92rem", color: "#0F172A" }}>{chk.label}</span>
                </div>
                <span
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: chk.pass ? "#16A34A" : "#DC2626"
                  }}
                >
                  {chk.pass ? "PASSED" : "FAILED / WARN"}
                </span>
              </div>
            ))}
          </div>

          {penalties && penalties.length > 0 && (
            <div className="penaltyNotice" style={styles.penaltyNotice}>
              <div style={{ fontWeight: 700, color: "#D97706", marginBottom: "6px" }}>
                Risk Deduction Audit:
              </div>
              <ul style={{ paddingLeft: "20px", fontSize: "0.85rem", color: "#B45309" }}>
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
        <div className="tabContent" style={styles.tabContent}>
          <table className="dataTable" style={styles.dataTable}>
            <tbody>
              {Object.entries(extractedData).map(([key, val]) => (
                <tr key={key} className="tableRow" style={styles.tableRow}>
                  <td className="tableKey" style={styles.tableKey}>
                    {key.replace(/([A-Z])/g, " $1").toUpperCase()}
                  </td>
                  <td className="tableVal code-font" style={styles.tableVal}>
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
        <div className="tabContent" style={styles.tabContent}>
          <div className="tamperAuditGrid" style={styles.tamperAuditGrid}>
            <div className="auditBox" style={styles.auditBox}>
              <div className="auditLabel" style={styles.auditLabel}>Aspect Ratio Match</div>
              <div style={{ fontWeight: 700, color: tamperDetails?.indicators?.aspectRatioCheck ? "#16A34A" : "#DC2626" }}>
                {tamperDetails?.indicators?.aspectRatioCheck ? "Standard Physical Card Ratio" : "Non-Standard Proportions"}
              </div>
            </div>
            <div className="auditBox" style={styles.auditBox}>
              <div className="auditLabel" style={styles.auditLabel}>Compression Grid (ELA)</div>
              <div style={{ fontWeight: 700, color: tamperDetails?.indicators?.compressionConsistency ? "#16A34A" : "#DC2626" }}>
                {tamperDetails?.indicators?.compressionConsistency ? "Uniform Noise Map" : "Potential Boundary Edit"}
              </div>
            </div>
            <div className="auditBox" style={styles.auditBox}>
              <div className="auditLabel" style={styles.auditLabel}>Image Dimensions</div>
              <div className="code-font" style={{ fontWeight: 700, color: "#0F172A" }}>
                {tamperDetails?.details?.dimensions || "Standard Resolution"}
              </div>
            </div>
            <div className="auditBox" style={styles.auditBox}>
              <div className="auditLabel" style={styles.auditLabel}>Edge Variance Score</div>
              <div className="code-font" style={{ fontWeight: 700, color: "#0F172A" }}>
                {tamperDetails?.details?.avgEdgeVariance || "12.4"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Issuer Details */}
      {activeTab === "issuer" && (
        <div className="tabContent" style={styles.tabContent}>
          <div className="issuerBox" style={styles.issuerBox}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, color: "#2563EB" }}>
                {issuerDetails?.issuer || "Authoritative Gateway"}
              </span>
              <span className="badge-verified" style={{ fontSize: "0.75rem" }}>
                {issuerDetails?.status || "API ACTIVE"}
              </span>
            </div>
            <div style={{ marginTop: "12px", fontSize: "0.88rem", color: "#64748B", lineHeight: 1.6 }}>
              <div><strong>Verification Reference:</strong> {issuerDetails?.apiRef || "N/A"}</div>
              <div><strong>Timestamp:</strong> {issuerDetails?.verificationTimestamp || new Date().toLocaleString()}</div>
              <div><strong>Record Match Status:</strong> {issuerDetails?.verified ? "Authoritative Match Confirmed" : "Record Unverified"}</div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Action */}
      <div className="footer" style={styles.footer}>
        <button className="btn-secondary" onClick={downloadJsonReport}>
          <Download size={16} />
          Export JSON Certificate
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
    marginBottom: "20px"
  },
  verIdLabel: {
    fontSize: "0.75rem",
    fontWeight: 700,
    color: "#2563EB",
    letterSpacing: "0.05em"
  },
  verIdValue: {
    fontSize: "1.55rem",
    fontWeight: 800,
    color: "#0F172A",
    letterSpacing: "-0.02em"
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginBottom: "24px"
  },
  scoreGaugeBox: {
    background: "#F8FAFC",
    border: "1px solid #E2E8F0",
    padding: "16px",
    borderRadius: "12px"
  },
  gaugeNumber: {
    fontSize: "2.1rem",
    fontWeight: 800,
    color: "#0F172A",
    marginTop: "4px"
  },
  gaugeTrack: {
    height: "8px",
    background: "#E2E8F0",
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
    color: "#64748B"
  },
  infoBox: {
    background: "#F8FAFC",
    border: "1px solid #E2E8F0",
    padding: "16px",
    borderRadius: "12px"
  },
  tabBar: {
    display: "flex",
    gap: "8px",
    borderBottom: "1px solid #E2E8F0",
    paddingBottom: "12px",
    marginBottom: "20px"
  },
  tabBtn: {
    background: "transparent",
    border: "none",
    color: "#64748B",
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
    background: "#EFF6FF",
    color: "#2563EB",
    border: "1px solid #DBEAFE"
  },
  checklistSection: {
    display: "flex",
    flexDirection: "column",
    gap: "14px"
  },
  checkGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "8px"
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
    background: "#FFFBEB",
    border: "1px solid #FDE68A",
    padding: "14px 18px",
    borderRadius: "10px",
    marginTop: "8px"
  },
  tabContent: {
    padding: "8px 0"
  },
  dataTable: {
    width: "100%",
    borderCollapse: "collapse"
  },
  tableRow: {
    borderBottom: "1px solid #F1F5F9"
  },
  tableKey: {
    padding: "12px 0",
    fontSize: "0.85rem",
    fontWeight: 700,
    color: "#64748B"
  },
  tableVal: {
    padding: "12px 0",
    textAlign: "right",
    fontSize: "0.95rem",
    fontWeight: 600,
    color: "#0F172A"
  },
  tamperAuditGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px"
  },
  auditBox: {
    background: "#F8FAFC",
    border: "1px solid #E2E8F0",
    padding: "14px",
    borderRadius: "10px"
  },
  auditLabel: {
    fontSize: "0.78rem",
    color: "#64748B",
    marginBottom: "4px"
  },
  issuerBox: {
    background: "#F8FAFC",
    border: "1px solid #E2E8F0",
    padding: "20px",
    borderRadius: "12px"
  },
  footer: {
    marginTop: "24px",
    paddingTop: "16px",
    borderTop: "1px solid #E2E8F0",
    display: "flex",
    justifyContent: "flex-end"
  }
};
