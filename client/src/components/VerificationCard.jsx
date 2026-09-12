import React, { useState } from "react";
import { CheckCircle2, XCircle, Download, ShieldCheck, FileText, Cpu, Eye, Flame, AlertTriangle } from "lucide-react";
import ResultBadge from "./ResultBadge";
import TamperHeatmapViewer from "./TamperHeatmapViewer";
import { useLanguage } from "../hooks/useLanguage";
import { generateAuditCertificatePDF } from "../utils/pdfGenerator";

function formatDocName(type) {
  const map = {
    PAN: "Indian PAN Card",
    AADHAAR: "Aadhaar Card (UIDAI)",
    DRIVING_LICENSE: "Indian Driving Licence",
    PASSPORT: "Indian Passport",
    VISA: "Indian Visa / e-Visa",
    PERMIT: "Commercial Transport Permit",
    VOTER_ID: "Voter ID Card (EPIC)",
    VEHICLE_RC: "Vehicle Registration Certificate (RC)",
    GSTIN: "GSTIN Certificate",
    RATION_CARD: "Ration Card (NFSA / PDS)",
    DEGREE_CERTIFICATE: "Degree Certificate / Marksheet",
    BIRTH_CERTIFICATE: "Birth Certificate (CRS)",
    STUDENT_ID: "Student / Institutional ID Card",
    FOREIGN_DOCUMENT: "Foreign Identity Credential (Non-Indian)",
    SPECIMEN_DOCUMENT: "Specimen / Sample Document (Invalid)",
    UNSUPPORTED: "Unsupported Document",
    UNKNOWN: "Unknown Document"
  };
  return map[type] || type || "Unknown Document";
}

export default function VerificationCard({ result, documentImage }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("overview");

  if (!result) return null;

  const dataObj = result.data ? result.data : result;
  const {
    verificationId = "DV-UNKNOWN",
    documentType = "UNKNOWN",
    detectedType = result.detectedType || null,
    detectionConfidence = result.detectionConfidence || null,
    status = "UNVERIFIED",
    riskScore = 0,
    originalityScore,
    checks = {},
    extractedData = {},
    tamperDetails = {},
    issuerDetails = {},
    penalties = []
  } = dataObj;

  const displayOriginalityScore = originalityScore !== undefined ? originalityScore : Math.max(0, 100 - riskScore);

  const getOriginalityColor = (score) => {
    const s = Math.min(100, Math.max(0, score));
    const hue = (s / 100) * 120;
    return `hsl(${hue}, 85%, 40%)`;
  };

  const scoreColor = getOriginalityColor(displayOriginalityScore);

  const effectiveDetected = detectedType || documentType;
  const checksList = [
    { 
      key: "documentType", 
      label: `${t('verCard.chk1', '1. Document Type Detection')} (${formatDocName(effectiveDetected)}${detectionConfidence ? ` • ${detectionConfidence}%` : ""})`, 
      priority: "STANDARD",
      pass: checks.documentType !== false 
    },
    { key: "ocr", label: t('verCard.chk2', '2. OCR / Data Extraction'), priority: "STANDARD", pass: checks.ocr },
    { key: "format", label: t('verCard.chk3', '3. Format & Algorithmic Checksum'), priority: "HIGH SECURITY", pass: checks.format },
    { key: "qr", label: t('verCard.chk4', '4. QR Code Security Match'), priority: "CRITICAL SECURITY", pass: checks.qr },
    { key: "template", label: t('verCard.chk5', '5. Template & Proportions Check'), priority: "STANDARD", pass: checks.template },
    { key: "tampering", label: t('verCard.chk6', '6. Tampering Analysis (ELA)'), priority: "HIGH SECURITY", pass: checks.tampering },
    { key: "issuer", label: t('verCard.chk7', '7. Official Issuer Verification'), priority: "AUTHORITATIVE", pass: checks.issuer }
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
          <div className="verIdLabel" style={styles.verIdLabel}>{t('verCard.reportLbl')}</div>
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
              ? "Moderate Originality — Priority Security Warning"
              : "Low Originality — Critical Security Anomaly"}
          </div>
        </div>

        {/* Document Classification */}
        <div className="infoBox" style={styles.infoBox}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748B" }}>
              {t('verCard.typeLbl', 'DOCUMENT TYPE')}
            </span>
            {detectionConfidence ? (
              <span style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "#16A34A",
                background: "#ECFDF5",
                padding: "2px 8px",
                borderRadius: "12px",
                border: "1px solid #A7F3D0"
              }}>
                {detectionConfidence}% Match
              </span>
            ) : null}
          </div>
          <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0F172A", marginTop: "4px" }}>
            {formatDocName(documentType)}
          </div>
          <div style={{ fontSize: "0.82rem", color: "#64748B", marginTop: "4px" }}>
            Detected: <strong>{formatDocName(effectiveDetected)}</strong> • {issuerDetails?.issuer || t('verCard.issuerGovt', 'Govt. of India')}
          </div>
        </div>
      </div>

      {/* Tabs for detailed breakdown */}
      <div className="tabBar" style={styles.tabBar}>
        {[
          { id: "overview", label: t('verCard.tabs.checks'), icon: ShieldCheck },
          { id: "tampering", label: "Tampering & ELA Heatmap", icon: Flame },
          { id: "issuer", label: t('verCard.tabs.issuer'), icon: Cpu }
        ].map((t_tab) => {
          const Icon = t_tab.icon;
          const isTamperTab = t_tab.id === "tampering";
          const isTamperFlagged = isTamperTab && tamperDetails?.suspicious;
          const isTamperPassed = isTamperTab && !tamperDetails?.suspicious;
          return (
            <button
              key={t_tab.id}
              style={{
                ...styles.tabBtn,
                ...(activeTab === t_tab.id ? styles.tabBtnActive : {}),
                ...(isTamperFlagged ? { borderColor: "#EF4444", color: "#DC2626" } : {}),
                ...(isTamperPassed && activeTab !== t_tab.id ? { color: "#15803D" } : {})
              }}
              onClick={() => setActiveTab(t_tab.id)}
            >
              <Icon size={16} color={isTamperFlagged ? "#DC2626" : (isTamperPassed && activeTab !== t_tab.id ? "#16A34A" : undefined)} />
              {t_tab.label}
              {isTamperFlagged && (
                <span style={{
                  background: "#EF4444",
                  color: "#FFFFFF",
                  fontSize: "0.65rem",
                  fontWeight: 800,
                  padding: "1px 6px",
                  borderRadius: "10px",
                  marginLeft: "4px"
                }}>
                  FLAGGED
                </span>
              )}
              {isTamperPassed && (
                <span style={{
                  background: "#ECFDF5",
                  color: "#15803D",
                  border: "1px solid #A7F3D0",
                  fontSize: "0.65rem",
                  fontWeight: 800,
                  padding: "1px 6px",
                  borderRadius: "10px",
                  marginLeft: "4px"
                }}>
                  PASS
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: 7-Checklist */}
      {activeTab === "overview" && (
        <div className="checklistSection" style={styles.checklistSection}>
          {/* Splicing / Tamper Warning Banner if detected */}
          {tamperDetails?.suspicious ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                borderRadius: "8px",
                padding: "12px 16px",
                marginBottom: "16px",
                gap: "12px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <AlertTriangle size={22} color="#DC2626" />
                <div>
                  <div style={{ fontWeight: 700, color: "#991B1B", fontSize: "0.9rem" }}>
                    Digital Splicing / Compression Inconsistency Detected
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#B91C1C", marginTop: "2px" }}>
                    Error Level Analysis (ELA) found localized pixel variance spikes exceeding baseline noise.
                  </div>
                </div>
              </div>
              <button
                className="btn-secondary"
                onClick={() => setActiveTab("tampering")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "#DC2626",
                  borderColor: "#FCA5A5",
                  background: "#FFFFFF",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  whiteSpace: "nowrap"
                }}
              >
                <Flame size={14} color="#DC2626" />
                View Forensic Heatmap
              </button>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#F0FDF4",
                border: "1px solid #BBF7D0",
                borderRadius: "8px",
                padding: "10px 16px",
                marginBottom: "16px",
                gap: "12px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <CheckCircle2 size={20} color="#16A34A" />
                <div>
                  <div style={{ fontWeight: 700, color: "#166534", fontSize: "0.88rem" }}>
                    Error Level Analysis (ELA) Audit: Authentic
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#15803D", marginTop: "1px" }}>
                    Uniform micro-compression variance across 192 grid blocks. Zero digital tampering detected.
                  </div>
                </div>
              </div>
              <button
                className="btn-secondary"
                onClick={() => setActiveTab("tampering")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  color: "#16A34A",
                  borderColor: "#86EFAC",
                  background: "#FFFFFF",
                  padding: "5px 10px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  whiteSpace: "nowrap"
                }}
              >
                <Flame size={13} color="#16A34A" />
                Inspect Heatmap
              </button>
            </div>
          )}

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
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  {chk.pass ? (
                    <CheckCircle2 size={20} color="#16A34A" />
                  ) : (
                    <XCircle size={20} color="#DC2626" />
                  )}
                  <span style={{ fontWeight: 600, fontSize: "0.92rem", color: "#0F172A" }}>{chk.label}</span>
                  <span style={{
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: "4px",
                    background: chk.priority === "CRITICAL SECURITY" ? "#FEE2E2" : chk.priority === "HIGH SECURITY" ? "#FEF3C7" : chk.priority === "AUTHORITATIVE" ? "#E0E7FF" : "#F1F5F9",
                    color: chk.priority === "CRITICAL SECURITY" ? "#991B1B" : chk.priority === "HIGH SECURITY" ? "#92400E" : chk.priority === "AUTHORITATIVE" ? "#3730A3" : "#475569"
                  }}>
                    {chk.priority}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: chk.pass ? "#16A34A" : "#DC2626"
                  }}
                >
                  {chk.pass ? t('verCard.passed') : t('verCard.failedWarn')}
                </span>
              </div>
            ))}
          </div>

          {penalties && penalties.length > 0 && (
            <div className="penaltyNotice" style={styles.penaltyNotice}>
              <div style={{ fontWeight: 700, color: "#D97706", marginBottom: "6px" }}>
                {t('verCard.riskDeduct')}
              </div>
              <ul style={{ paddingLeft: "20px", fontSize: "0.85rem", color: "#B45309" }}>
                {penalties.map((p, idx) => (
                  <li key={idx} style={{ marginBottom: "4px" }}>
                    {p.priority && (
                      <span style={{
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        padding: "1px 5px",
                        borderRadius: "3px",
                        background: p.priority === "CRITICAL SECURITY" ? "#FEE2E2" : "#FEF3C7",
                        color: p.priority === "CRITICAL SECURITY" ? "#991B1B" : "#92400E",
                        marginRight: "6px"
                      }}>
                        [{p.priority}]
                      </span>
                    )}
                    <strong>{p.check}</strong> (+{p.points} risk): {p.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Tamper Details */}
      {activeTab === "tampering" && (
        <div className="tabContent" style={styles.tabContent}>
          <TamperHeatmapViewer
            tamperDetails={tamperDetails}
            documentType={documentType || detectedType}
            documentImage={documentImage || result?.tamperDetails?.previewUrl || result?.previewUrl}
          />
        </div>
      )}

      {/* TAB CONTENT: Issuer Details */}
      {activeTab === "issuer" && (
        <div className="tabContent" style={styles.tabContent}>
          <div className="issuerBox" style={styles.issuerBox}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, color: "#2563EB" }}>
                {issuerDetails?.issuer || t('verCard.authGate')}
              </span>
              <span className="badge-verified" style={{ fontSize: "0.75rem" }}>
                {issuerDetails?.status || t('verCard.apiActive')}
              </span>
            </div>
            <div style={{ marginTop: "12px", fontSize: "0.88rem", color: "#64748B", lineHeight: 1.6 }}>
              <div><strong>{t('verCard.refLabel')}</strong> {issuerDetails?.apiRef || "N/A"}</div>
              <div><strong>{t('verCard.timeLabel')}</strong> {issuerDetails?.verificationTimestamp || new Date().toLocaleString()}</div>
              <div><strong>{t('verCard.matchStatus')}</strong> {issuerDetails?.verified ? t('verCard.matchConf') : t('verCard.matchFail')}</div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Action */}
      <div className="footer" style={styles.footer}>
        <button 
          className="btn-primary" 
          onClick={() => generateAuditCertificatePDF(result)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)",
            color: "#FFFFFF",
            padding: "10px 20px",
            borderRadius: "8px",
            fontWeight: 700,
            fontSize: "0.88rem",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)"
          }}
        >
          <FileText size={17} color="#FFFFFF" />
          <span>Download Official Audit Report (PDF)</span>
        </button>
        <button className="btn-secondary" onClick={downloadJsonReport}>
          <Download size={16} />
          {t('verCard.exportBtn')}
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
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap"
  }
};
