import React, { useState, useEffect } from "react";
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
  const [activeCard, setActiveCard] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % 4);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // Positions for smooth 4-card horizontal swapping carousel:
  // Slot 0: Center front active card (focal point, straight, top z-index)
  // Slot 1: Right card (tilted right, visible in right wing)
  // Slot 2: Hidden back card (behind center, preparing to transition)
  // Slot 3: Left card (tilted left, visible in left wing)
  const cardSlotStyles = [
    {
      left: "50%",
      transform: "translateX(-50%) translateY(0px) scale(1) rotate(0deg)",
      zIndex: 5,
      opacity: 1,
      boxShadow: "0 22px 45px -10px rgba(15, 23, 42, 0.18), 0 8px 18px rgba(15, 23, 42, 0.06)",
    },
    {
      left: "78%",
      transform: "translateX(-50%) translateY(14px) scale(0.9) rotate(10deg)",
      zIndex: 3,
      opacity: 0.85,
      boxShadow: "0 10px 25px -5px rgba(37, 99, 235, 0.12)",
    },
    {
      left: "50%",
      transform: "translateX(-50%) translateY(-25px) scale(0.8) rotate(0deg)",
      zIndex: 1,
      opacity: 0,
      boxShadow: "none",
    },
    {
      left: "22%",
      transform: "translateX(-50%) translateY(14px) scale(0.9) rotate(-10deg)",
      zIndex: 3,
      opacity: 0.85,
      boxShadow: "0 10px 25px -5px rgba(37, 99, 235, 0.12)",
    },
  ];

  const getCardStyle = (cardIndex, baseStyle) => {
    // Relative slot 0, 1, 2, or 3 based on activeCard rotation
    const slot = (cardIndex - activeCard + 4) % 4;
    const slotStyle = cardSlotStyles[slot];
    return {
      ...baseStyle,
      position: "absolute",
      top: "10px",
      width: "205px",
      height: "235px",
      transition: "all 0.85s cubic-bezier(0.34, 1.25, 0.64, 1)",
      cursor: "pointer",
      ...slotStyle,
    };
  };

  return (
    <div className="container" style={styles.container}>
      {/* ================= HERO SECTION ================= */}
      <section className="heroSection" style={styles.heroSection}>
        {/* Left Column: Headline & CTA */}
        <div className="heroLeft" style={styles.heroLeft}>
          {/* Government Initiative Badge */}


          <h1 className="heroTitle" style={styles.heroTitle}>
            Indian Document Authenticity &<br />
            <span style={{ color: "#2563EB" }}>Verification Platform</span>
          </h1>

          <p className="heroSub" style={styles.heroSub}>
            An enterprise-grade, AI-powered platform for verifying the authenticity
            of Indian identity documents like PAN Card, Driving Licence, Aadhaar and more.
            Fast, secure and tamper-proof.
          </p>

          <div className="heroCtaGroup" style={styles.heroCtaGroup}>
            <button className="btn-primary btnVerify" onClick={onNavigateVerify} style={styles.btnVerify}>
              <span>Verify a Document</span>
              <ArrowRight size={18} />
            </button>

            <button
              className="btn-secondary btnDemo"
              onClick={() => setShowDemoModal(true)}
              style={styles.btnDemo}
            >
              <PlayCircle size={20} color="#2563EB" />
              <span>Watch Demo</span>
            </button>
          </div>
        </div>

        {/* Right Column: 3D Stacked Graphic */}
        <div className="heroRight" style={styles.heroRight}>
          <div className="heroVisualBackdrop" style={styles.heroVisualBackdrop}>
            {/* Soft ambient background glow */}
            <div className="glowCircle" style={styles.glowCircle} />

            {/* Floating sparkle dots */}
            <div style={{ ...styles.sparkleDot, top: "14%", left: "10%" }} />
            <div style={{ ...styles.sparkleDot, top: "72%", left: "6%" }} />
            <div style={{ ...styles.sparkleDot, top: "18%", right: "10%" }} />
            <div style={{ ...styles.sparkleDot, top: "76%", right: "8%" }} />

            {/* Visual Container for Cards */}
            <div className="cardsContainer float-animation" style={styles.cardsContainer}>
              {/* Card 1: PAN Card */}
              <div
                style={getCardStyle(0, styles.cardPan)}
                onClick={() => setActiveCard(0)}
                title="PAN Card"
              >
                <div className="panHeader" style={styles.panHeader}>
                  <span className="panTitle" style={styles.panTitle}>PAN CARD</span>
                </div>
                <div className="panBody" style={styles.panBody}>
                  <div className="panAvatar" style={styles.panAvatar}>
                    <User size={20} color="#60A5FA" />
                  </div>
                  <div className="panLines" style={styles.panLines}>
                    <div style={{ ...styles.cardLine, width: "85%" }} />
                    <div style={{ ...styles.cardLine, width: "65%" }} />
                    <div style={{ ...styles.cardLine, width: "75%" }} />
                  </div>
                </div>
                <div className="panFooterLines" style={styles.panFooterLines}>
                  <div style={{ ...styles.cardLine, width: "40%" }} />
                  <div style={{ ...styles.cardLine, width: "55%" }} />
                </div>
              </div>

              {/* Card 2: Aadhaar Card */}
              <div
                style={getCardStyle(1, styles.cardAadhaar)}
                onClick={() => setActiveCard(1)}
                title="Aadhaar Card"
              >
                <div className="aadhaarHeader" style={styles.aadhaarHeader}>
                  <span className="aadhaarTitle" style={styles.aadhaarTitle}>आधार</span>
                  <span className="aadhaarSubtitle" style={styles.aadhaarSubtitle}>AADHAAR CARD</span>
                </div>

                {/* Aadhaar main blue accent bar like Satyameva Jayate */}
                <div className="aadhaarMainBar" style={styles.aadhaarMainBar} />

                <div className="aadhaarBody" style={styles.aadhaarBody}>
                  <div className="aadhaarAvatar" style={styles.aadhaarAvatar}>
                    <User size={22} color="#2563EB" />
                  </div>

                  <div className="aadhaarLines" style={styles.aadhaarLines}>
                    <div style={{ ...styles.docLine, width: "95%" }} />
                    <div style={{ ...styles.docLine, width: "75%" }} />
                    <div style={{ ...styles.docLine, width: "85%" }} />
                  </div>
                </div>

                <div className="aadhaarFooter" style={styles.aadhaarFooter}>
                  <div style={{ ...styles.docLine, width: "65%" }} />
                  <div style={{ ...styles.docLine, width: "50%" }} />
                </div>
              </div>

              {/* Card 3: Satyameva Jayate Official Document */}
              <div
                style={getCardStyle(2, styles.cardCenter)}
                onClick={() => setActiveCard(2)}
                title="Satyameva Jayate Document"
              >
                {/* Emblem Seal */}
                <div className="emblemWrapper" style={styles.emblemWrapper}>
                  <div className="ashokaEmblem" style={styles.ashokaEmblem}>
                    <div className="emblemCrown" style={styles.emblemCrown}>🏛️</div>
                    <div className="emblemBase" style={styles.emblemBase}>सत्यमेव जयते</div>
                  </div>
                </div>

                {/* Document header bar */}
                <div className="docMainBar" style={styles.docMainBar} />

                {/* Document text lines */}
                <div className="docLinesGroup" style={styles.docLinesGroup}>
                  <div style={{ ...styles.docLine, width: "95%" }} />
                  <div style={{ ...styles.docLine, width: "85%" }} />
                  <div style={{ ...styles.docLine, width: "90%" }} />
                  <div style={{ ...styles.docLine, width: "70%" }} />
                  <div style={{ ...styles.docLine, width: "80%" }} />
                </div>

                {/* Overlapping Verified Green Check Badge (#16A34A) */}
                <div className="verifiedBadge" style={styles.verifiedBadge}>
                  <CheckCircle2 size={40} color="#16A34A" fill="#16A34A" stroke="#FFFFFF" strokeWidth={2.5} />
                </div>
              </div>

              {/* Card 4: Driving Licence */}
              <div
                style={getCardStyle(3, styles.cardDl)}
                onClick={() => setActiveCard(3)}
                title="Driving Licence"
              >
                <div className="dlHeader" style={styles.dlHeader}>
                  <span className="dlTitle" style={styles.dlTitle}>DRIVING LICENCE</span>
                  <Car size={16} color="#2563EB" />
                </div>
                <div className="panBody" style={styles.panBody}>
                  <div className="panAvatar" style={styles.panAvatar}>
                    <User size={20} color="#60A5FA" />
                  </div>
                  <div className="panLines" style={styles.panLines}>
                    <div style={{ ...styles.cardLine, width: "85%" }} />
                    <div style={{ ...styles.cardLine, width: "65%" }} />
                    <div style={{ ...styles.cardLine, width: "75%" }} />
                  </div>
                </div>
                <div className="dlBody" style={styles.dlBody}>
                  <div style={{ ...styles.cardLine, width: "90%", background: "#b6c4d6" }} />
                  <div style={{ ...styles.cardLine, width: "75%", background: "#b6c4d6" }} />
                  <div style={{ ...styles.cardLine, width: "80%", background: "#b6c4d6" }} />
                  <div style={{ ...styles.cardLine, width: "60%", background: "#b6c4d6" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 4-FEATURE PILL BANNER ================= */}
      <section className="featuresBanner glass-card" style={styles.featuresBanner}>
        <div className="featureItem" style={styles.featureItem}>
          <div className="featureIconBox" style={styles.featureIconBox}>
            <Shield size={20} color="#2563EB" />
          </div>
          <div>
            <div className="featureTitle" style={styles.featureTitle}>AI-Powered Verification</div>
            <div className="featureSub" style={styles.featureSub}>Advanced OCR & ML models</div>
          </div>
        </div>

        <div className="featureItem" style={styles.featureItem}>
          <div className="featureIconBox" style={styles.featureIconBox}>
            <Zap size={20} color="#2563EB" />
          </div>
          <div>
            <div className="featureTitle" style={styles.featureTitle}>Fast & Reliable</div>
            <div className="featureSub" style={styles.featureSub}>Results in seconds</div>
          </div>
        </div>

        <div className="featureItem" style={styles.featureItem}>
          <div className="featureIconBox" style={styles.featureIconBox}>
            <Lock size={20} color="#2563EB" />
          </div>
          <div>
            <div className="featureTitle" style={styles.featureTitle}>Tamper Detection</div>
            <div className="featureSub" style={styles.featureSub}>Detects forged & altered docs</div>
          </div>
        </div>

        <div className="featureItem" style={styles.featureItem}>
          <div className="featureIconBox" style={styles.featureIconBox}>
            <Cloud size={20} color="#2563EB" />
          </div>
          <div>
            <div className="featureTitle" style={styles.featureTitle}>Secure & Compliant</div>
            <div className="featureSub" style={styles.featureSub}>Govt. standards & data privacy</div>
          </div>
        </div>
      </section>

      {/* ================= SUPPORTED DOCUMENT TYPES ================= */}
      <section className="supportedSection" style={styles.supportedSection}>
        <div className="sectionHeader" style={styles.sectionHeader}>
          <div>
            <h2 className="sectionHeading" style={styles.sectionHeading}>Supported Document Types</h2>
            <p className="sectionSub" style={styles.sectionSub}>Verify a wide range of Indian government documents</p>
          </div>
          <button className="viewAllBtn" style={styles.viewAllBtn} onClick={onNavigateVerify}>
            <span>View All</span>
            <ArrowRight size={15} />
          </button>
        </div>

        <div className="supportedGrid" style={styles.supportedGrid}>
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
              <div className="docTypeTitle" style={styles.docTypeTitle}>Aadhaar Card</div>
              <div className="docTypeSub" style={styles.docTypeSub}>Identity Verification</div>
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
              <div className="docTypeTitle" style={styles.docTypeTitle}>PAN Card</div>
              <div className="docTypeSub" style={styles.docTypeSub}>Financial Identity</div>
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
              <div className="docTypeTitle" style={styles.docTypeTitle}>Driving Licence</div>
              <div className="docTypeSub" style={styles.docTypeSub}>Transport Identity</div>
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
              <div className="docTypeTitle" style={styles.docTypeTitle}>Voter ID</div>
              <div className="docTypeSub" style={styles.docTypeSub}>Electoral Identity</div>
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
              <div className="docTypeTitle" style={styles.docTypeTitle}>Passport</div>
              <div className="docTypeSub" style={styles.docTypeSub}>International Travel</div>
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
              <div className="docTypeTitle" style={styles.docTypeTitle}>Degree Certificate</div>
              <div className="docTypeSub" style={styles.docTypeSub}>Educational Verification</div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= STATS & TRUST BAR ================= */}
      <section className="statsBar glass-card" style={styles.statsBar}>
        <div className="statItem" style={styles.statItem}>
          <div className="statCircleIcon" style={styles.statCircleIcon}>
            <FileText size={18} color="#2563EB" />
          </div>
          <div>
            <div className="statNumber" style={styles.statNumber}>1M+</div>
            <div className="statLabel" style={styles.statLabel}>Documents Verified</div>
          </div>
        </div>

        <div className="statDivider" style={styles.statDivider} />

        <div className="statItem" style={styles.statItem}>
          <div className="statCircleIcon" style={styles.statCircleIcon}>
            <ShieldCheck size={18} color="#2563EB" />
          </div>
          <div>
            <div className="statNumber" style={styles.statNumber}>99.8%</div>
            <div className="statLabel" style={styles.statLabel}>Accuracy Rate</div>
          </div>
        </div>

        <div className="statDivider" style={styles.statDivider} />

        <div className="statItem" style={styles.statItem}>
          <div className="statCircleIcon" style={styles.statCircleIcon}>
            <Zap size={18} color="#2563EB" />
          </div>
          <div>
            <div className="statNumber" style={styles.statNumber}>2.4s</div>
            <div className="statLabel" style={styles.statLabel}>Avg. Verification Time</div>
          </div>
        </div>

        <div className="statDivider" style={styles.statDivider} />

        <div className="statItem" style={styles.statItem}>
          <div style={{ ...styles.statCircleIcon, background: "#ECFDF5" }}>
            <ShieldCheck size={18} color="#16A34A" />
          </div>
          <div>
            <div className="statNumber" style={styles.statNumber}>100%</div>
            <div className="statLabel" style={styles.statLabel}>Data Secure</div>
          </div>
        </div>

        <div className="statDivider" style={styles.statDivider} />

        {/* Indian Flag Ribbon Graphic */}
        <div className="trustRight" style={styles.trustRight}>
          <div className="tricolorWave" style={styles.tricolorWave}>
            <div style={{ height: "4px", background: "#FF9933", borderRadius: "2px 2px 0 0" }} />
            <div style={{ height: "4px", background: "#FFFFFF" }} />
            <div style={{ height: "4px", background: "#138808", borderRadius: "0 0 2px 2px" }} />
          </div>
          <div className="trustText" style={styles.trustText}>
            Building a Safer Digital India
          </div>
        </div>
      </section>

      {/* ================= DEMO MODAL ================= */}
      {showDemoModal && (
        <div className="modalOverlay" style={styles.modalOverlay} onClick={() => setShowDemoModal(false)}>
          <div className="modalContent" style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader" style={styles.modalHeader}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0F172A" }}>
                DocAuth India Demo Walkthrough
              </h3>
              <button className="closeBtn" style={styles.closeBtn} onClick={() => setShowDemoModal(false)}>
                <X size={20} color="#64748B" />
              </button>
            </div>
            <div className="modalBody" style={styles.modalBody}>
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

  /* Aadhaar Card Container (Matching Satyameva Jayate Theme) */
  cardAadhaar: {
    borderRadius: "14px",
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    boxShadow: "0 16px 36px -8px rgba(15, 23, 42, 0.12), 0 4px 12px rgba(15, 23, 42, 0.04)",
    padding: "16px 14px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },

  /* Aadhaar Card Styles */
  aadhaarHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: "8px",
    borderBottom: "1px solid #E2E8F0",
  },
  aadhaarTitle: {
    fontSize: "13px",
    fontWeight: "800",
    color: "#1E3A8A",
    letterSpacing: "0.05em",
  },
  aadhaarSubtitle: {
    fontSize: "9px",
    fontWeight: "700",
    color: "#2563EB",
    letterSpacing: "0.05em",
  },
  aadhaarMainBar: {
    width: "100%",
    height: "5px",
    borderRadius: "3px",
    background: "#93C5FD",
    marginTop: "8px",
    marginBottom: "4px",
  },
  aadhaarBody: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "8px 0",
  },
  aadhaarAvatar: {
    width: "42px",
    height: "46px",
    borderRadius: "6px",
    background: "#EFF6FF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1.5px solid #DBEAFE",
  },
  aadhaarLines: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  aadhaarFooter: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    paddingTop: "6px",
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
    lineHeight: 1.3,
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
