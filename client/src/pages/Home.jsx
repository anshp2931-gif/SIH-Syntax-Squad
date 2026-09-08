import React, { useState } from "react";
import {
  Shield,
  Zap,
  Lock,
  Cloud,
  ArrowRight,
  PlayCircle,
  Fingerprint,
  CreditCard,
  Car,
  User,
  Globe,
  FileCheck2,
  FileText,
  ShieldCheck,
  CheckCircle2,
  UploadCloud,
  X
} from "lucide-react";

export default function Home({ onNavigateVerify }) {
  const [showDemoModal, setShowDemoModal] = useState(false);

  return (
    <div style={styles.container}>
      {/* ================= HERO SECTION ================= */}
      <section style={styles.heroSection}>
        {/* Left Column: Headline & CTA */}
        <div style={styles.heroLeft}>
          {/* Government Initiative Badge */}
          <div style={styles.govBadge}>
            <span style={styles.flagIcon}>
              <span style={{ color: "#FF9933" }}>●</span>
              <span style={{ color: "#FFFFFF", textShadow: "0 0 1px #999" }}>●</span>
              <span style={{ color: "#138808" }}>●</span>
            </span>
            <span style={styles.govBadgeText}>Government of India Initiative</span>
          </div>

          <h1 style={styles.heroTitle}>
            Indian Document Authenticity &<br />
            <span style={{ color: "#2563EB" }}>Verification Platform</span>
          </h1>

          <p style={styles.heroSub}>
            An enterprise-grade, AI-powered platform for verifying the authenticity
            of Indian identity documents like PAN Card, Driving Licence, Aadhaar and more.
            Fast, secure and tamper-proof.
          </p>

          <div style={styles.heroCtaGroup}>
            <button className="btn-primary" onClick={onNavigateVerify} style={styles.btnVerify}>
              <span>Verify a Document</span>
              <ArrowRight size={18} />
            </button>

            <button
              className="btn-secondary"
              onClick={() => setShowDemoModal(true)}
              style={styles.btnDemo}
            >
              <PlayCircle size={20} color="#2563EB" />
              <span>Watch Demo</span>
            </button>
          </div>
        </div>

        {/* Right Column: 3D Stacked Graphic */}
        <div style={styles.heroRight}>
          <div style={styles.heroVisualBackdrop}>
            {/* Soft ambient background glow */}
            <div style={styles.glowCircle} />

            {/* Floating sparkle dots */}
            <div style={{ ...styles.sparkleDot, top: "14%", left: "10%" }} />
            <div style={{ ...styles.sparkleDot, top: "72%", left: "6%" }} />
            <div style={{ ...styles.sparkleDot, top: "18%", right: "10%" }} />
            <div style={{ ...styles.sparkleDot, top: "76%", right: "8%" }} />

            {/* Visual Container for Cards */}
            <div style={styles.cardsContainer} className="float-animation">
              {/* Card 1: Left Background Card (PAN) */}
              <div style={styles.cardPan}>
                <div style={styles.panHeader}>
                  <span style={styles.panTitle}>PAN</span>
                </div>
                <div style={styles.panBody}>
                  <div style={styles.panAvatar}>
                    <User size={20} color="#60A5FA" />
                  </div>
                  <div style={styles.panLines}>
                    <div style={{ ...styles.cardLine, width: "85%" }} />
                    <div style={{ ...styles.cardLine, width: "65%" }} />
                    <div style={{ ...styles.cardLine, width: "75%" }} />
                  </div>
                </div>
                <div style={styles.panFooterLines}>
                  <div style={{ ...styles.cardLine, width: "40%" }} />
                  <div style={{ ...styles.cardLine, width: "55%" }} />
                </div>
              </div>

              {/* Card 2: Right Background Card (DRIVING LICENCE) */}
              <div style={styles.cardDl}>
                <div style={styles.dlHeader}>
                  <span style={styles.dlTitle}>DRIVING LICENCE</span>
                  <Car size={16} color="#2563EB" />
                </div>
                <div style={styles.dlBody}>
                  <div style={{ ...styles.cardLine, width: "90%", background: "#DBEAFE" }} />
                  <div style={{ ...styles.cardLine, width: "75%", background: "#DBEAFE" }} />
                  <div style={{ ...styles.cardLine, width: "80%", background: "#DBEAFE" }} />
                  <div style={{ ...styles.cardLine, width: "60%", background: "#DBEAFE" }} />
                </div>
              </div>

              {/* Card 3: Center Foreground Official Document */}
              <div style={styles.cardCenter}>
                {/* Emblem Seal */}
                <div style={styles.emblemWrapper}>
                  <div style={styles.ashokaEmblem}>
                    <div style={styles.emblemCrown}>🏛️</div>
                    <div style={styles.emblemBase}>सत्यमेव जयते</div>
                  </div>
                </div>

                {/* Document header bar */}
                <div style={styles.docMainBar} />

                {/* Document text lines */}
                <div style={styles.docLinesGroup}>
                  <div style={{ ...styles.docLine, width: "95%" }} />
                  <div style={{ ...styles.docLine, width: "85%" }} />
                  <div style={{ ...styles.docLine, width: "90%" }} />
                  <div style={{ ...styles.docLine, width: "70%" }} />
                  <div style={{ ...styles.docLine, width: "80%" }} />
                </div>

                {/* Overlapping Verified Green Check Badge (#16A34A) */}
                <div style={styles.verifiedBadge}>
                  <CheckCircle2 size={40} color="#16A34A" fill="#16A34A" stroke="#FFFFFF" strokeWidth={2.5} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 4-FEATURE PILL BANNER ================= */}
      <section style={styles.featuresBanner} className="glass-card">
        <div style={styles.featureItem}>
          <div style={styles.featureIconBox}>
            <Shield size={20} color="#2563EB" />
          </div>
          <div>
            <div style={styles.featureTitle}>AI-Powered Verification</div>
            <div style={styles.featureSub}>Advanced OCR & ML models</div>
          </div>
        </div>

        <div style={styles.featureItem}>
          <div style={styles.featureIconBox}>
            <Zap size={20} color="#2563EB" />
          </div>
          <div>
            <div style={styles.featureTitle}>Fast & Reliable</div>
            <div style={styles.featureSub}>Results in seconds</div>
          </div>
        </div>

        <div style={styles.featureItem}>
          <div style={styles.featureIconBox}>
            <Lock size={20} color="#2563EB" />
          </div>
          <div>
            <div style={styles.featureTitle}>Tamper Detection</div>
            <div style={styles.featureSub}>Detects forged & altered docs</div>
          </div>
        </div>

        <div style={styles.featureItem}>
          <div style={styles.featureIconBox}>
            <Cloud size={20} color="#2563EB" />
          </div>
          <div>
            <div style={styles.featureTitle}>Secure & Compliant</div>
            <div style={styles.featureSub}>Govt. standards & data privacy</div>
          </div>
        </div>
      </section>

      {/* ================= SUPPORTED DOCUMENT TYPES ================= */}
      <section style={styles.supportedSection}>
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionHeading}>Supported Document Types</h2>
            <p style={styles.sectionSub}>Verify a wide range of Indian government documents</p>
          </div>
          <button style={styles.viewAllBtn} onClick={onNavigateVerify}>
            <span>View All</span>
            <ArrowRight size={15} />
          </button>
        </div>

        <div style={styles.supportedGrid}>
          {/* Aadhaar Card */}
          <div
            className="glass-card glass-card-interactive"
            style={styles.docTypeCard}
            onClick={onNavigateVerify}
          >
            <div style={{ ...styles.docIconSquare, background: "#FEE2E2" }}>
              <Fingerprint size={24} color="#DC2626" />
            </div>
            <div>
              <div style={styles.docTypeTitle}>Aadhaar Card</div>
              <div style={styles.docTypeSub}>Identity Verification</div>
            </div>
          </div>

          {/* PAN Card */}
          <div
            className="glass-card glass-card-interactive"
            style={styles.docTypeCard}
            onClick={onNavigateVerify}
          >
            <div style={{ ...styles.docIconSquare, background: "#F3E8FF" }}>
              <CreditCard size={24} color="#8B5CF6" />
            </div>
            <div>
              <div style={styles.docTypeTitle}>PAN Card</div>
              <div style={styles.docTypeSub}>Financial Identity</div>
            </div>
          </div>

          {/* Driving Licence */}
          <div
            className="glass-card glass-card-interactive"
            style={styles.docTypeCard}
            onClick={onNavigateVerify}
          >
            <div style={{ ...styles.docIconSquare, background: "#EFF6FF" }}>
              <Car size={24} color="#2563EB" />
            </div>
            <div>
              <div style={styles.docTypeTitle}>Driving Licence</div>
              <div style={styles.docTypeSub}>Transport Identity</div>
            </div>
          </div>

          {/* Voter ID */}
          <div
            className="glass-card glass-card-interactive"
            style={styles.docTypeCard}
            onClick={onNavigateVerify}
          >
            <div style={{ ...styles.docIconSquare, background: "#FAE8FF" }}>
              <User size={24} color="#A855F7" />
            </div>
            <div>
              <div style={styles.docTypeTitle}>Voter ID</div>
              <div style={styles.docTypeSub}>Electoral Identity</div>
            </div>
          </div>

          {/* Passport */}
          <div
            className="glass-card glass-card-interactive"
            style={styles.docTypeCard}
            onClick={onNavigateVerify}
          >
            <div style={{ ...styles.docIconSquare, background: "#FFEDD5" }}>
              <Globe size={24} color="#F97316" />
            </div>
            <div>
              <div style={styles.docTypeTitle}>Passport</div>
              <div style={styles.docTypeSub}>International Travel</div>
            </div>
          </div>

          {/* Degree Certificate */}
          <div
            className="glass-card glass-card-interactive"
            style={styles.docTypeCard}
            onClick={onNavigateVerify}
          >
            <div style={{ ...styles.docIconSquare, background: "#DCFCE7" }}>
              <FileCheck2 size={24} color="#16A34A" />
            </div>
            <div>
              <div style={styles.docTypeTitle}>Degree Certificate</div>
              <div style={styles.docTypeSub}>Educational Verification</div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= STATS & TRUST BAR ================= */}
      <section style={styles.statsBar} className="glass-card">
        <div style={styles.statItem}>
          <div style={styles.statCircleIcon}>
            <FileText size={18} color="#2563EB" />
          </div>
          <div>
            <div style={styles.statNumber}>1M+</div>
            <div style={styles.statLabel}>Documents Verified</div>
          </div>
        </div>

        <div style={styles.statDivider} />

        <div style={styles.statItem}>
          <div style={styles.statCircleIcon}>
            <ShieldCheck size={18} color="#2563EB" />
          </div>
          <div>
            <div style={styles.statNumber}>99.8%</div>
            <div style={styles.statLabel}>Accuracy Rate</div>
          </div>
        </div>

        <div style={styles.statDivider} />

        <div style={styles.statItem}>
          <div style={styles.statCircleIcon}>
            <Zap size={18} color="#2563EB" />
          </div>
          <div>
            <div style={styles.statNumber}>2.4s</div>
            <div style={styles.statLabel}>Avg. Verification Time</div>
          </div>
        </div>

        <div style={styles.statDivider} />

        <div style={styles.statItem}>
          <div style={{ ...styles.statCircleIcon, background: "#ECFDF5" }}>
            <ShieldCheck size={18} color="#16A34A" />
          </div>
          <div>
            <div style={styles.statNumber}>100%</div>
            <div style={styles.statLabel}>Data Secure</div>
          </div>
        </div>

        <div style={styles.statDivider} />

        {/* Indian Flag Ribbon Graphic */}
        <div style={styles.trustRight}>
          <div style={styles.tricolorWave}>
            <div style={{ height: "4px", background: "#FF9933", borderRadius: "2px 2px 0 0" }} />
            <div style={{ height: "4px", background: "#FFFFFF" }} />
            <div style={{ height: "4px", background: "#138808", borderRadius: "0 0 2px 2px" }} />
          </div>
          <div style={styles.trustText}>
            Building a Safer<br />Digital India
          </div>
        </div>
      </section>

      {/* ================= DEMO MODAL ================= */}
      {showDemoModal && (
        <div style={styles.modalOverlay} onClick={() => setShowDemoModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0F172A" }}>
                DocAuth India Demo Walkthrough
              </h3>
              <button style={styles.closeBtn} onClick={() => setShowDemoModal(false)}>
                <X size={20} color="#64748B" />
              </button>
            </div>
            <div style={styles.modalBody}>
              <p style={{ color: "#64748B", lineHeight: 1.6, marginBottom: "16px" }}>
                DocAuth India executes a 7-stage automated pipeline:
              </p>
              <ol style={{ paddingLeft: "20px", color: "#0F172A", lineHeight: 1.8, fontSize: "0.95rem" }}>
                <li><strong>Document Ingestion:</strong> Multiformat image/PDF support with preprocessing.</li>
                <li><strong>Tesseract OCR:</strong> Optical extraction of PAN, DL, DOB, and Names.</li>
                <li><strong>Format & Checksum:</strong> Algorithmic validation (PAN regex, DL State codes).</li>
                <li><strong>QR Matrix Code Match:</strong> Extracts embedded signed payload and compares with visual OCR.</li>
                <li><strong>Error Level Analysis (ELA):</strong> Scans pixel compression anomalies to detect alterations.</li>
                <li><strong>Authoritative Registry:</strong> Simulates lookup against DigiLocker, NSDL & Parivahan API.</li>
                <li><strong>Risk Score Engine:</strong> Computes 0-100 authenticity score with penalty breakdown.</li>
              </ol>
              <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
                <button
                  className="btn-primary"
                  onClick={() => {
                    setShowDemoModal(false);
                    onNavigateVerify();
                  }}
                >
                  <span>Launch Live Verification</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1320px",
    margin: "0 auto",
    padding: "36px 28px 60px 28px"
  },

  /* HERO */
  heroSection: {
    display: "grid",
    gridTemplateColumns: "1.1fr 1fr",
    alignItems: "center",
    gap: "48px",
    marginBottom: "48px"
  },
  heroLeft: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start"
  },
  govBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    padding: "6px 14px",
    borderRadius: "9999px",
    boxShadow: "0 2px 6px rgba(15, 23, 42, 0.03)",
    marginBottom: "24px"
  },
  flagIcon: {
    display: "inline-flex",
    alignItems: "center",
    gap: "2px",
    fontSize: "0.68rem"
  },
  govBadgeText: {
    fontSize: "0.82rem",
    fontWeight: 600,
    color: "#64748B"
  },
  heroTitle: {
    fontSize: "2.85rem",
    fontWeight: 800,
    lineHeight: 1.15,
    color: "#0F172A",
    letterSpacing: "-0.03em",
    marginBottom: "18px"
  },
  heroSub: {
    fontSize: "1.02rem",
    color: "#64748B",
    lineHeight: 1.62,
    marginBottom: "32px",
    maxWidth: "540px"
  },
  heroCtaGroup: {
    display: "flex",
    alignItems: "center",
    gap: "16px"
  },
  btnVerify: {
    padding: "12px 24px",
    fontSize: "0.95rem"
  },
  btnDemo: {
    padding: "12px 22px",
    fontSize: "0.95rem"
  },

  /* HERO RIGHT (3D Visual) */
  heroRight: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  heroVisualBackdrop: {
    position: "relative",
    width: "100%",
    maxWidth: "480px",
    height: "360px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  glowCircle: {
    position: "absolute",
    width: "360px",
    height: "360px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(219, 234, 254, 0.6) 0%, rgba(239, 246, 255, 0.3) 50%, transparent 70%)",
    filter: "blur(20px)",
    zIndex: 0
  },
  sparkleDot: {
    position: "absolute",
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#60A5FA",
    boxShadow: "0 0 8px #60A5FA",
    zIndex: 1
  },
  cardsContainer: {
    position: "relative",
    width: "340px",
    height: "260px",
    zIndex: 2
  },

  /* Card 1: PAN (Left) */
  cardPan: {
    position: "absolute",
    left: "-20px",
    top: "20px",
    width: "200px",
    height: "135px",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
    border: "1px solid rgba(255, 255, 255, 0.9)",
    boxShadow: "0 10px 25px -5px rgba(37, 99, 235, 0.12)",
    transform: "rotate(-10deg)",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    zIndex: 1
  },
  panHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  panTitle: {
    fontSize: "0.75rem",
    fontWeight: 800,
    color: "#2563EB",
    letterSpacing: "0.05em"
  },
  panBody: {
    display: "flex",
    gap: "10px",
    alignItems: "center"
  },
  panAvatar: {
    width: "32px",
    height: "32px",
    borderRadius: "6px",
    background: "#DBEAFE",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  panLines: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },
  panFooterLines: {
    display: "flex",
    gap: "8px"
  },
  cardLine: {
    height: "4px",
    borderRadius: "2px",
    background: "#93C5FD"
  },

  /* Card 2: DL (Right) */
  cardDl: {
    position: "absolute",
    right: "-20px",
    top: "20px",
    width: "200px",
    height: "135px",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
    border: "1px solid rgba(255, 255, 255, 0.9)",
    boxShadow: "0 10px 25px -5px rgba(37, 99, 235, 0.12)",
    transform: "rotate(10deg)",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    zIndex: 1
  },
  dlHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  dlTitle: {
    fontSize: "0.68rem",
    fontWeight: 800,
    color: "#2563EB",
    letterSpacing: "0.05em"
  },
  dlBody: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginTop: "8px"
  },

  /* Card 3: Center Official Document */
  cardCenter: {
    position: "absolute",
    left: "50%",
    top: "0px",
    transform: "translateX(-50%)",
    width: "190px",
    height: "240px",
    borderRadius: "14px",
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    boxShadow: "0 16px 36px -8px rgba(15, 23, 42, 0.12), 0 4px 12px rgba(15, 23, 42, 0.04)",
    padding: "16px 14px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    zIndex: 3
  },
  emblemWrapper: {
    marginBottom: "12px",
    textAlign: "center"
  },
  ashokaEmblem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  emblemCrown: {
    fontSize: "1.4rem",
    lineHeight: 1
  },
  emblemBase: {
    fontSize: "0.45rem",
    fontWeight: 700,
    color: "#1E3A8A",
    marginTop: "2px",
    letterSpacing: "0.05em"
  },
  docMainBar: {
    width: "100%",
    height: "5px",
    borderRadius: "3px",
    background: "#93C5FD",
    marginBottom: "12px"
  },
  docLinesGroup: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },
  docLine: {
    height: "5px",
    borderRadius: "3px",
    background: "#E2E8F0"
  },
  verifiedBadge: {
    position: "absolute",
    bottom: "-12px",
    right: "-12px",
    background: "#FFFFFF",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 6px 16px rgba(22, 163, 74, 0.3)"
  },

  /* 4-FEATURE PILL BANNER */
  featuresBanner: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    padding: "20px 28px",
    gap: "24px",
    marginBottom: "52px",
    background: "#FFFFFF",
    borderColor: "#E2E8F0"
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "14px"
  },
  featureIconBox: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    background: "#EFF6FF",
    border: "1px solid #DBEAFE",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },
  featureTitle: {
    fontSize: "0.92rem",
    fontWeight: 700,
    color: "#0F172A"
  },
  featureSub: {
    fontSize: "0.78rem",
    color: "#64748B",
    marginTop: "2px"
  },

  /* SUPPORTED SECTION */
  supportedSection: {
    marginBottom: "48px"
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "24px"
  },
  sectionHeading: {
    fontSize: "1.45rem",
    fontWeight: 800,
    color: "#0F172A",
    letterSpacing: "-0.02em"
  },
  sectionSub: {
    fontSize: "0.9rem",
    color: "#64748B",
    marginTop: "4px"
  },
  viewAllBtn: {
    background: "transparent",
    border: "none",
    color: "#2563EB",
    fontSize: "0.9rem",
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 10px",
    borderRadius: "6px"
  },
  supportedGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(6, 1fr)",
    gap: "16px"
  },
  docTypeCard: {
    padding: "20px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    alignItems: "flex-start",
    background: "#FFFFFF",
    borderColor: "#E2E8F0"
  },
  docIconSquare: {
    width: "44px",
    height: "44px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  docTypeTitle: {
    fontSize: "0.94rem",
    fontWeight: 700,
    color: "#0F172A"
  },
  docTypeSub: {
    fontSize: "0.76rem",
    color: "#64748B",
    marginTop: "2px"
  },

  /* STATS BAR */
  statsBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px 32px",
    borderRadius: "9999px",
    background: "#FFFFFF",
    borderColor: "#E2E8F0"
  },
  statItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  statCircleIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    background: "#EFF6FF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  statNumber: {
    fontSize: "1.15rem",
    fontWeight: 800,
    color: "#0F172A",
    lineHeight: 1.1
  },
  statLabel: {
    fontSize: "0.74rem",
    color: "#64748B",
    fontWeight: 500,
    marginTop: "2px"
  },
  statDivider: {
    width: "1px",
    height: "32px",
    background: "#E2E8F0"
  },
  trustRight: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  tricolorWave: {
    width: "32px",
    boxShadow: "0 2px 4px rgba(15, 23, 42, 0.08)"
  },
  trustText: {
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "#0F172A",
    lineHeight: 1.3
  },

  /* MODAL */
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(15, 23, 42, 0.4)",
    backdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px"
  },
  modalContent: {
    background: "#FFFFFF",
    borderRadius: "16px",
    maxWidth: "560px",
    width: "100%",
    boxShadow: "0 20px 40px -10px rgba(15, 23, 42, 0.15)",
    overflow: "hidden",
    border: "1px solid #E2E8F0"
  },
  modalHeader: {
    padding: "18px 24px",
    borderBottom: "1px solid #E2E8F0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer"
  },
  modalBody: {
    padding: "24px"
  }
};
