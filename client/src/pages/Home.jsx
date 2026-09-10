import React, { useState, useEffect, useRef } from "react";
import {Shield,Zap,Lock,Cloud,ArrowRight,PlayCircle,Fingerprint,CreditCard,Car,User,Globe,FileCheck2,FileText,ShieldCheck,CheckCircle2,UploadCloud,X,ScanLine,Cpu,Award,Sparkles,Check,Landmark,Briefcase,GraduationCap,AlertTriangle,Eye,ShieldAlert,BadgeCheck,FileWarning} from "lucide-react";

function UseCaseRow({
  reverse = false,
  badge,
  badgeBg,
  badgeColor,
  icon: IconComponent,
  iconBg,
  iconColor,
  title,
  subtitle,
  description,
  features = [],
  stat,
  statLabel,
  renderVisual,
}) {
  const [inView, setInView] = useState(false);
  const rowRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.2, rootMargin: "0px 0px -70px 0px" }
    );

    if (rowRef.current) {
      observer.observe(rowRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={rowRef}
      style={{
        ...styles.useCaseRow,
        flexDirection: reverse ? "row-reverse" : "row",
      }}
    >
      {/* Text Column */}
      <div style={styles.useCaseTextCol}>
        <div style={styles.useCaseTopRow}>
          <div style={{ ...styles.useCaseIconBox, background: iconBg, color: iconColor }}>
            <IconComponent size={22} />
          </div>
          <span style={{ ...styles.useCaseBadge, background: badgeBg, color: badgeColor }}>
            {badge}
          </span>
        </div>
        <h3 style={styles.useCaseRowTitle}>{title}</h3>
        {subtitle && <p style={styles.useCaseRowSub}>{subtitle}</p>}
        <p style={styles.useCaseRowDesc}>{description}</p>

        {/* Feature checklist */}
        <div style={styles.useCaseFeaturesList}>
          {features.map((feat, i) => (
            <div key={i} style={styles.useCaseFeatureItem}>
              <div style={styles.useCaseCheckIcon}>
                <Check size={14} color="#16A34A" />
              </div>
              <span style={styles.useCaseFeatureText}>{feat}</span>
            </div>
          ))}
        </div>

        <div style={styles.useCaseMetricStrip}>
          <div>
            <div style={styles.useCaseMetricVal}>{stat}</div>
            <div style={styles.useCaseMetricLabel}>{statLabel}</div>
          </div>
        </div>
      </div>

      {/* Visual Image/Mockup Column with sliding animation */}
      <div
        className={`use-case-visual ${
          inView
            ? "slide-visible"
            : reverse
            ? "slide-hidden-left"
            : "slide-hidden-right"
        }`}
        style={styles.useCaseVisualCol}
      >
        {renderVisual()}
      </div>
    </div>
  );
}

export default function Home({ onNavigateVerify }) {
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [activeCard, setActiveCard] = useState(0);
  const [sliderPos, setSliderPos] = useState(50);
  const [quickCheckSample, setQuickCheckSample] = useState(null);
  const [quickCheckLoading, setQuickCheckLoading] = useState(false);

  const handleQuickCheck = (type) => {
    if (quickCheckSample === type) {
      setQuickCheckSample(null);
      return;
    }
    setQuickCheckLoading(true);
    setQuickCheckSample(null);
    setTimeout(() => {
      setQuickCheckLoading(false);
      setQuickCheckSample(type);
    }, 450);
  };

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

          {/* Section E: Interactive Live Quick-Check Widget (Hero Teaser) */}
          <div style={styles.quickCheckCard}>
            <div style={styles.quickCheckHeader}>
              <div style={styles.quickCheckLabel}>
                <Sparkles size={14} color="#2563EB" />
                <span>TRY A LIVE SAMPLE TEASER</span>
              </div>
              <span style={styles.quickCheckSub}>Instant 1-click preview</span>
            </div>

            <div style={styles.quickCheckBtnRow}>
              <button
                type="button"
                style={{
                  ...styles.quickSampleBtn,
                  ...(quickCheckSample === "clean" ? styles.quickSampleBtnActiveClean : {}),
                }}
                onClick={() => handleQuickCheck("clean")}
              >
                <BadgeCheck size={16} color="#059669" />
                <div style={{ textAlign: "left" }}>
                  <div style={styles.quickBtnTitle}>Clean Document</div>
                  <div style={styles.quickBtnDesc}>Valid PAN • Passed 100%</div>
                </div>
              </button>

              <button
                type="button"
                style={{
                  ...styles.quickSampleBtn,
                  ...(quickCheckSample === "forged" ? styles.quickSampleBtnActiveForged : {}),
                }}
                onClick={() => handleQuickCheck("forged")}
              >
                <ShieldAlert size={16} color="#DC2626" />
                <div style={{ textAlign: "left" }}>
                  <div style={styles.quickBtnTitle}>Forged Document</div>
                  <div style={styles.quickBtnDesc}>Altered Aadhaar • Tampered</div>
                </div>
              </button>
            </div>

            {quickCheckLoading && (
              <div style={styles.quickLoadingBox}>
                <div style={styles.quickSpinner} />
                <span>Running multi-layer verification checks...</span>
              </div>
            )}

            {quickCheckSample === "clean" && !quickCheckLoading && (
              <div style={styles.quickResultClean}>
                <div style={styles.quickResultTop}>
                  <div style={styles.quickResultBadgeClean}>
                    <CheckCircle2 size={15} color="#059669" />
                    <span>AUTHENTIC VERIFIED • 98% SCORE</span>
                  </div>
                  <span style={styles.quickResultDocType}>NSDL / Income Tax Validated</span>
                </div>
                <div style={styles.quickResultSpecs}>
                  <span>✓ Checksum: Matches algorithmic PAN hash</span>
                  <span>✓ ELA Tamper: Clean uniform pixel noise</span>
                  <span>✓ QR Code: Cryptographic signature verified</span>
                </div>
                <button
                  type="button"
                  style={styles.quickTryFullBtn}
                  onClick={onNavigateVerify}
                >
                  <span>Test with your own document</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}

            {quickCheckSample === "forged" && !quickCheckLoading && (
              <div style={styles.quickResultForged}>
                <div style={styles.quickResultTop}>
                  <div style={styles.quickResultBadgeForged}>
                    <AlertTriangle size={15} color="#DC2626" />
                    <span>HIGH RISK FRAUD DETECTED • 24% SCORE</span>
                  </div>
                  <span style={styles.quickResultDocType}>UIDAI Pattern Failure</span>
                </div>
                <div style={styles.quickResultSpecsForged}>
                  <span>✗ Font Alteration: Non-standard typeface in DOB</span>
                  <span>✗ ELA Tamper: Resampling anomaly around photo</span>
                  <span>✗ QR Mismatch: Encrypted payload hash mismatch</span>
                </div>
                <button
                  type="button"
                  style={styles.quickInspectBtn}
                  onClick={onNavigateVerify}
                >
                  <span>Open Full Forensics Suite</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
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

      {/* ================= HOW IT WORKS: 3-STEP PIPELINE ================= */}
      <section style={styles.pipelineSection}>
        <div style={styles.pipelineHeader}>
          <div style={styles.pipelineBadge}>
            <Sparkles size={14} color="#2563EB" />
            <span>Seamless AI Pipeline</span>
          </div>
          <h2 style={styles.pipelineHeading}>How It Works</h2>
          <p style={styles.pipelineSub}>
            Verify any Indian government document in 3 transparent, automated steps powered by neural OCR and forensic tamper detection.
          </p>
        </div>

        <div style={styles.pipelineGrid}>
          {/* STEP 1 */}
          <div style={styles.pipelineCard} className="glass-card">
            <div style={styles.pipelineStepNumber}>01</div>
            
            {/* Step Mockup Illustration */}
            <div style={styles.pipelineMockup}>
              <div style={styles.mockupCardTop}>
                <div style={styles.mockupDotRed} />
                <div style={styles.mockupDotYellow} />
                <div style={styles.mockupDotGreen} />
                <span style={styles.mockupFilename}>document_upload.pdf</span>
              </div>
              <div style={styles.mockupUploadArea}>
                <UploadCloud size={28} color="#2563EB" />
                <span style={styles.mockupUploadText}>Aadhaar / PAN / DL / Passport</span>
                <div style={styles.mockupBadgesRow}>
                  <span style={styles.mockupPill}>Auto-Detect</span>
                  <span style={styles.mockupPill}>Tesseract OCR</span>
                </div>
              </div>
            </div>

            <div style={styles.pipelineContent}>
              <div style={styles.pipelineIconBox}>
                <ScanLine size={20} color="#2563EB" />
              </div>
              <h3 style={styles.pipelineStepTitle}>1. Upload & Extract</h3>
              <p style={styles.pipelineStepDesc}>
                Drag & drop Aadhaar, PAN, DL, or Passport in PDF/JPG format. High-precision Tesseract OCR auto-detects fields, names, DOB, and document numbers.
              </p>
              <div style={styles.pipelineFeaturesList}>
                <div style={styles.pipelineFeaturePoint}>
                  <Check size={14} color="#16A34A" />
                  <span>Optical character auto-extraction</span>
                </div>
                <div style={styles.pipelineFeaturePoint}>
                  <Check size={14} color="#16A34A" />
                  <span>Perspective & angle correction</span>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 2 */}
          <div style={styles.pipelineCard} className="glass-card">
            <div style={styles.pipelineStepNumber}>02</div>

            {/* Step Mockup Illustration */}
            <div style={styles.pipelineMockup}>
              <div style={styles.mockupCardTop}>
                <div style={styles.mockupDotRed} />
                <div style={styles.mockupDotYellow} />
                <div style={styles.mockupDotGreen} />
                <span style={styles.mockupFilename}>neural_analysis.engine</span>
              </div>
              <div style={styles.mockupScanArea}>
                <div style={styles.mockupGridLines}>
                  <div style={styles.mockupScanLaser} />
                  <div style={styles.mockupAnalyzeItem}>
                    <span style={{ color: "#2563EB", fontWeight: 700 }}>QR Payload:</span>
                    <span style={{ color: "#16A34A", fontWeight: 600 }}>Decoded & Matched</span>
                  </div>
                  <div style={styles.mockupAnalyzeItem}>
                    <span style={{ color: "#2563EB", fontWeight: 700 }}>Checksum:</span>
                    <span style={{ color: "#16A34A", fontWeight: 600 }}>Valid State Code</span>
                  </div>
                  <div style={styles.mockupAnalyzeItem}>
                    <span style={{ color: "#2563EB", fontWeight: 700 }}>ELA Heatmap:</span>
                    <span style={{ color: "#16A34A", fontWeight: 600 }}>0 Pixel Tampering</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.pipelineContent}>
              <div style={styles.pipelineIconBox}>
                <Cpu size={20} color="#2563EB" />
              </div>
              <h3 style={styles.pipelineStepTitle}>2. Multi-Layer Analysis</h3>
              <p style={styles.pipelineStepDesc}>
                Cross-matches signed QR matrix payload against visual text, runs checksum algorithms, and applies Error Level Analysis (ELA) to detect image alteration.
              </p>
              <div style={styles.pipelineFeaturesList}>
                <div style={styles.pipelineFeaturePoint}>
                  <Check size={14} color="#16A34A" />
                  <span>QR code cryptographic check</span>
                </div>
                <div style={styles.pipelineFeaturePoint}>
                  <Check size={14} color="#16A34A" />
                  <span>Pixel compression anomaly scan</span>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3 */}
          <div style={styles.pipelineCard} className="glass-card">
            <div style={styles.pipelineStepNumber}>03</div>

            {/* Step Mockup Illustration */}
            <div style={styles.pipelineMockup}>
              <div style={styles.mockupCardTop}>
                <div style={styles.mockupDotRed} />
                <div style={styles.mockupDotYellow} />
                <div style={styles.mockupDotGreen} />
                <span style={styles.mockupFilename}>verdict_report.json</span>
              </div>
              <div style={styles.mockupScoreArea}>
                <div style={styles.mockupScoreCircle}>
                  <span style={styles.mockupScoreVal}>98%</span>
                  <span style={styles.mockupScoreLbl}>TRUST SCORE</span>
                </div>
                <div style={styles.mockupVerdictBadge}>
                  <CheckCircle2 size={16} color="#16A34A" />
                  <span>AUTHENTIC & VERIFIED</span>
                </div>
              </div>
            </div>

            <div style={styles.pipelineContent}>
              <div style={styles.pipelineIconBox}>
                <Award size={20} color="#2563EB" />
              </div>
              <h3 style={styles.pipelineStepTitle}>3. Instant Verdict</h3>
              <p style={styles.pipelineStepDesc}>
                Generates a 0–100% Trust Score in seconds with an itemized risk breakdown, forensic flags, and an authoritative compliance summary.
              </p>
              <div style={styles.pipelineFeaturesList}>
                <div style={styles.pipelineFeaturePoint}>
                  <Check size={14} color="#16A34A" />
                  <span>Clear penalty & confidence metrics</span>
                </div>
                <div style={styles.pipelineFeaturePoint}>
                  <Check size={14} color="#16A34A" />
                  <span>Audit-ready certificate report</span>
                </div>
              </div>
            </div>
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

      {/* ================= SECTION B: BEFORE VS AFTER TAMPER DETECTION ================= */}
      <section style={styles.showcaseSection}>
        <div style={styles.sectionHeader}>
          <div style={styles.sectionPill}>
            <ScanLine size={14} color="#2563EB" />
            <span>AI FORENSIC ENGINE</span>
          </div>
          <h2 style={styles.sectionTitle}>
            Interactive Before vs After: Tamper Detection Showcase
          </h2>
          <p style={styles.sectionSub}>
            Drag the interactive slider below to reveal how DocAuth's neural forensic pipeline detects altered fonts, forged dates of birth, and manipulated pixel compression that bypass standard visual checks.
          </p>
        </div>

        {/* Interactive Comparison Stage */}
        <div style={styles.sliderContainer}>
          <div style={styles.sliderHeaderBar}>
            <div style={styles.sliderTagOriginal}>
              <Eye size={14} color="#64748B" />
              <span>LEFT: Human Eye View (Counterfeit ID)</span>
            </div>
            <div style={styles.sliderTagAi}>
              <Cpu size={14} color="#2563EB" />
              <span>RIGHT: AI Tamper Heatmap Overlay </span>
            </div>
          </div>

          <div style={styles.stageFrame}>
            {/* Base Layer: Counterfeit Document (What human eyes see) */}
            <div style={styles.stageBaseDocument}>
              <div style={styles.mockAadhaarCard}>
                <div style={styles.mockAadhaarTop}>
                  <div style={styles.mockAadhaarEmblem}>🇮🇳</div>
                  <div style={styles.mockAadhaarGov}>
                    <span style={{ fontWeight: 800, color: "#1E3A8A", fontSize: "14px" }}>भारत सरकार</span>
                    <span style={{ fontSize: "11px", color: "#64748B" }}>Government of India</span>
                  </div>
                  <div style={styles.mockDocPill}>COUNTERFEIT SAMPLE</div>
                </div>

                <div style={styles.mockAadhaarContent}>
                  <div style={styles.mockPhotoBox}>
                    <User size={48} color="#94A3B8" />
                    <span style={styles.mockPhotoLabel}>Forged Photo</span>
                  </div>

                  <div style={styles.mockFieldsCol}>
                    <div style={styles.mockFieldRow}>
                      <span style={styles.mockFieldKey}>Name:</span>
                      <span style={styles.mockFieldValue}>RAJESH KUMAR SHARMA</span>
                    </div>
                    <div style={styles.mockFieldRowAltered}>
                      <span style={styles.mockFieldKey}>DOB:</span>
                      <span style={{ ...styles.mockFieldValue, color: "#DC2626", fontWeight: 700 }}>
                        15/08/1988 (Altered from 1998)
                      </span>
                    </div>
                    <div style={styles.mockFieldRow}>
                      <span style={styles.mockFieldKey}>Gender:</span>
                      <span style={styles.mockFieldValue}>MALE / पुरुष</span>
                    </div>
                    <div style={styles.mockAadhaarNoBox}>
                      <span>XXXX XXXX 4829</span>
                    </div>
                  </div>

                  <div style={styles.mockQrBox}>
                    <div style={styles.mockQrPattern} />
                    <span style={{ fontSize: "9px", color: "#64748B", marginTop: "4px" }}>Fake QR Payload</span>
                  </div>
                </div>

                <div style={styles.mockAadhaarBottom}>
                  <span>मेरा आधार, मेरी पहचान</span>
                  <span style={{ fontSize: "10px", color: "#94A3B8" }}>Tampered sample for testing</span>
                </div>
              </div>
            </div>

            {/* Top Layer: AI Forensic Detection Overlay (Revealed by slider) */}
            <div
              style={{
                ...styles.stageAiOverlay,
                clipPath: `inset(0 0 0 ${sliderPos}%)`,
              }}
            >
              <div style={styles.mockAadhaarCardAi}>
                <div style={styles.aiScanGridOverlay} />

                <div style={styles.mockAadhaarTop}>
                  <div style={styles.mockAadhaarEmblem}>🇮🇳</div>
                  <div style={styles.mockAadhaarGov}>
                    <span style={{ fontWeight: 800, color: "#93C5FD", fontSize: "14px" }}>DOCAUTH FORENSICS</span>
                    <span style={{ fontSize: "11px", color: "#94A3B8" }}>Multi-Layer Neural Analysis</span>
                  </div>
                  <div style={styles.mockDocPillAi}>
                    <AlertTriangle size={12} color="#EF4444" />
                    <span>FORGERY CONFIRMED</span>
                  </div>
                </div>

                <div style={styles.mockAadhaarContent}>
                  {/* Tampered Photo with ELA bounding box */}
                  <div style={styles.mockPhotoBoxAi}>
                    <User size={48} color="#EF4444" />
                    <div style={styles.aiBoundingBoxPhoto}>
                      <span>ELA ANOMALY: 87% TAMPERED</span>
                    </div>
                  </div>

                  <div style={styles.mockFieldsCol}>
                    <div style={styles.mockFieldRow}>
                      <span style={{ ...styles.mockFieldKey, color: "#94A3B8" }}>Name:</span>
                      <span style={{ ...styles.mockFieldValue, color: "#E2E8F0" }}>RAJESH KUMAR SHARMA</span>
                    </div>

                    {/* Altered DOB with glowing alert */}
                    <div style={styles.aiBoundingBoxDob}>
                      <div style={styles.aiAlertHeader}>
                        <FileWarning size={12} color="#F87171" />
                        <span>FONT & RESAMPLING MISMATCH</span>
                      </div>
                      <span style={{ color: "#FCA5A5", fontWeight: 700, fontSize: "12px" }}>
                        DOB: 15/08/1988 [OCR Kerning Variance: +4.2px]
                      </span>
                    </div>

                    <div style={styles.mockFieldRow}>
                      <span style={{ ...styles.mockFieldKey, color: "#94A3B8" }}>Gender:</span>
                      <span style={{ ...styles.mockFieldValue, color: "#E2E8F0" }}>MALE</span>
                    </div>

                    <div style={styles.mockAadhaarNoBoxAi}>
                      <span>XXXX XXXX 4829</span>
                      <span style={styles.aiChecksumFail}>[UIDAI Checksum Inconsistent]</span>
                    </div>
                  </div>

                  {/* QR Code Anomaly Box */}
                  <div style={styles.mockQrBoxAi}>
                    <div style={styles.mockQrPatternAi} />
                    <span style={styles.aiQrAlert}>
                      SIGNATURE MISMATCH
                    </span>
                  </div>
                </div>

                <div style={styles.mockAadhaarBottomAi}>
                  <div style={styles.aiStatusBadge}>
                    <ShieldAlert size={14} color="#EF4444" />
                    <span>OVERALL TRUST SCORE: 22/100 (HIGH RISK COUNTERFEIT)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Draggable Vertical Divider Handle */}
            <div
              style={{
                ...styles.sliderDividerLine,
                left: `${sliderPos}%`,
              }}
            >
              <div style={styles.sliderKnob}>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#FFFFFF", userSelect: "none" }}>
                  ◀ ▶
                </span>
              </div>
            </div>

            {/* Invisible full-stage Range Input for smooth touch and drag */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPos}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              style={styles.sliderRangeInput}
              aria-label="Tamper detection before and after comparison slider"
            />
          </div>

          {/* Feature Highlights beneath slider */}
          <div style={styles.sliderFootnotes}>
            <div style={styles.sliderFootItem}>
              <div style={{ ...styles.footDot, background: "#EF4444" }} />
              <div>
                <strong>Font & Kerning Inconsistency:</strong> Detects altered digits spliced in different typography.
              </div>
            </div>
            <div style={styles.sliderFootItem}>
              <div style={{ ...styles.footDot, background: "#F59E0B" }} />
              <div>
                <strong>ELA Pixel Compression:</strong> Spots resampled borders where a new photo was pasted.
              </div>
            </div>
            <div style={styles.sliderFootItem}>
              <div style={{ ...styles.footDot, background: "#3B82F6" }} />
              <div>
                <strong>QR Payload vs OCR Cross-Match:</strong> Verifies visual text against digitally signed payload.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION C: ENTERPRISE & GOV USE CASES GRID ================= */}
      <section style={styles.useCasesSection}>
        <div style={styles.sectionHeader}>
          <div style={styles.sectionPill}>
            <Award size={14} color="#2563EB" />
            <span>INDUSTRY APPLICATIONS</span>
          </div>
          <h2 style={styles.sectionTitle}>
            Enterprise & Government Use Cases
          </h2>
          <p style={styles.sectionSub}>
            Designed for high-scale, zero-trust environments requiring instant verification compliance and defense against synthetic identity fraud.
          </p>
        </div>

        <div style={styles.useCasesRowsContainer}>
          {/* Row 1: Fintech & Banking */}
          <UseCaseRow
            reverse={false}
            badge="FINTECH & BANKING"
            badgeBg="#EFF6FF"
            badgeColor="#1E40AF"
            icon={Landmark}
            iconBg="#EFF6FF"
            iconColor="#2563EB"
            title="Instant KYC Onboarding & Credit Verification"
            subtitle="Automated API verification across NSDL, UIDAI & RBI Compliance"
            description="Streamline savings accounts, credit cards, and digital loan approvals in under 3 seconds. DocAuth eliminates synthetic identity fraud, forged salary slips, and altered PAN cards before onboarding."
            features={[
              "2.4s Average Turnaround Time for instant customer KYC clearance",
              "99.8% Synthetic Identity and Tampered Document Prevention",
              "Direct automated cross-verification against NSDL Tax Databases",
              "Automated CIBIL, AML & PEP fraud risk scoring"
            ]}
            stat="99.8% Speedup"
            statLabel="KYC Drop-off reduced by 40% with zero manual paperwork"
            renderVisual={() => (
              <div style={styles.fintechMockCard}>
                <div style={styles.fintechCardHeader}>
                  <div style={styles.fintechCardChip} />
                  <CreditCard size={22} color="#93C5FD" />
                </div>
                <div style={styles.fintechCardNo}>•••• •••• •••• 8924</div>
                <div style={styles.fintechCardBottom}>
                  <div>
                    <div style={styles.fintechCardHolder}>ROHAN MALHOTRA</div>
                    <div style={styles.fintechCardExpiry}>EXPIRES 08/29</div>
                  </div>
                  <div style={styles.fintechKycBadge}>
                    <CheckCircle2 size={14} color="#10B981" />
                    <span>KYC VERIFIED</span>
                  </div>
                </div>

                {/* Floating HUD chips */}
                <div style={styles.fintechFloatingPill1}>
                  <Zap size={15} color="#F59E0B" />
                  <div>
                    <div style={{ fontWeight: 700 }}>NSDL PAN Matched in 2.4s</div>
                    <div style={{ fontSize: "0.68rem", color: "#64748B" }}>Checksum & Name 100% verified</div>
                  </div>
                </div>
                <div style={styles.fintechFloatingPill2}>
                  <ShieldCheck size={15} color="#10B981" />
                  <div>
                    <div style={{ fontWeight: 700 }}>Low Risk Clearance (99.8%)</div>
                    <div style={{ fontSize: "0.68rem", color: "#64748B" }}>Instant loan approval ready</div>
                  </div>
                </div>
              </div>
            )}
          />

          {/* Row 2: HR & Corporate Onboarding */}
          <UseCaseRow
            reverse={true}
            badge="HR & CORPORATE TECH"
            badgeBg="#DCFCE7"
            badgeColor="#166534"
            icon={Briefcase}
            iconBg="#F0FDF4"
            iconColor="#16A34A"
            title="Workforce Identity & Background Screening"
            subtitle="Eliminate Candidate Impersonation & Moonlighting in Bulk Hiring"
            description="Accelerate enterprise hiring cycles without compromising security. Automatically verify educational degrees, past employer PF records, and Aadhaar/PAN credentials with zero impersonation risks."
            features={[
              "10x Faster Hiring Cycles from job offer to successful joining day",
              "EPFO Dual Employment Scan to spot unauthorized moonlighting",
              "National Academic Depository (NAD) integration for degree checks",
              "Automated candidate dossier generation for HR audits"
            ]}
            stat="Zero Fraud"
            statLabel="100% Pre-employment regulatory and identity compliance verified"
            renderVisual={() => (
              <div style={styles.hrMockCard}>
                <div style={styles.hrCardHeader}>
                  <div style={styles.hrAvatar}>
                    <User size={28} color="#166534" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={styles.hrCandidateName}>Pooja Sharma</div>
                    <div style={styles.hrCandidateRole}>Lead Systems Engineer • Bangalore</div>
                  </div>
                  <span style={styles.hrStatusTag}>HIRE APPROVED</span>
                </div>

                <div style={styles.hrChecksList}>
                  <div style={styles.hrCheckItem}>
                    <CheckCircle2 size={16} color="#16A34A" />
                    <div>
                      <div style={styles.hrCheckTitle}>Aadhaar & PAN Cross-Validation</div>
                      <div style={styles.hrCheckSub}>100% Identity match via UIDAI gateway</div>
                    </div>
                  </div>
                  <div style={styles.hrCheckItem}>
                    <CheckCircle2 size={16} color="#16A34A" />
                    <div>
                      <div style={styles.hrCheckTitle}>Education Credential Verification</div>
                      <div style={styles.hrCheckSub}>B.Tech Degree verified via DigiLocker NAD</div>
                    </div>
                  </div>
                  <div style={styles.hrCheckItem}>
                    <CheckCircle2 size={16} color="#16A34A" />
                    <div>
                      <div style={styles.hrCheckTitle}>Dual Employment / Moonlighting Scan</div>
                      <div style={styles.hrCheckSub}>Single active EPFO Provident Fund record</div>
                    </div>
                  </div>
                </div>

                <div style={styles.hrFooter}>
                  <BadgeCheck size={15} color="#15803D" />
                  <span>Enterprise Background Check Passed (Audit #8942)</span>
                </div>
              </div>
            )}
          />

          {/* Row 3: Law Enforcement & RTOs */}
          <UseCaseRow
            reverse={false}
            badge="GOV & TRANSPORTATION"
            badgeBg="#FEF3C7"
            badgeColor="#92400E"
            icon={Car}
            iconBg="#FEF3C7"
            iconColor="#D97706"
            title="On-The-Spot Driving Licence & RC Validation"
            subtitle="Direct Roadside Parivahan & Sarathi Highway Integration"
            description="Empower traffic police officers, checkpoint squads, and transit authorities to instantly validate driver credentials and vehicle registration certificates using high-precision mobile OCR."
            features={[
              "Sub-Second Parivahan & Sarathi Government Database Query",
              "Instant optical recognition of faded, laminated, or smart DLs",
              "Real-time identification of suspended, fake, or cloned licenses",
              "Instant pending challan and vehicle registration status check"
            ]}
            stat="Real-Time"
            statLabel="Sarathi & Parivahan API integration for instant highway verification"
            renderVisual={() => (
              <div style={styles.rtoMockCard}>
                <div style={styles.rtoCardHeader}>
                  <div style={styles.rtoEmblemBadge}>
                    <Car size={18} color="#B45309" />
                    <span style={styles.rtoHeaderTitle}>PARIVAHAN SMART REGISTRY</span>
                  </div>
                  <span style={styles.rtoLiveTag}>● HIGHWAY RADAR ACTIVE</span>
                </div>

                <div style={styles.rtoCardBody}>
                  <div style={styles.rtoDlGraphic}>
                    <div style={styles.rtoDlTop}>
                      <span style={{ fontWeight: 800, color: "#1E3A8A", fontSize: "11px" }}>INDIAN UNION DRIVING LICENCE</span>
                      <span style={{ fontSize: "10px", color: "#92400E", fontWeight: 700 }}>MAHARASHTRA RTO</span>
                    </div>
                    <div style={styles.rtoDlMiddle}>
                      <div style={styles.rtoPhotoBox}>
                        <User size={30} color="#64748B" />
                      </div>
                      <div style={styles.rtoDlDetails}>
                        <div>DL NO: <strong>MH-14 20210048291</strong></div>
                        <div>VEHICLE: <strong>LMV-NT, MCWG</strong></div>
                        <div>VALID UPTO: <strong>14/06/2039</strong></div>
                      </div>
                    </div>
                  </div>

                  <div style={styles.rtoVerificationStrip}>
                    <div style={styles.rtoVerdictGreen}>
                      <CheckCircle2 size={16} color="#15803D" />
                      <span>SARATHI VERIFIED: AUTHENTIC LICENSE</span>
                    </div>
                    <div style={styles.rtoVerdictSub}>
                      <span>Challan Records: Clear (0 Penalties)</span>
                      <span>• Checkpoint: NH-48 Pune Express</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          />

          {/* Row 4: Universities & Examinations */}
          <UseCaseRow
            reverse={true}
            badge="EDUCATION & EXAMS"
            badgeBg="#F3E8FF"
            badgeColor="#6B21A8"
            icon={GraduationCap}
            iconBg="#F3E8FF"
            iconColor="#9333EA"
            title="Hall Ticket & Examination Impersonation Defense"
            subtitle="Biometric Admit Card & Proxy Candidate Prevention at Gate"
            description="Protect the integrity of national competitive exams like UPSC, JEE, NEET, and GATE. Prevent proxy examinees and fraudulent hall tickets through cryptographic QR validation and real-time facial comparison."
            features={[
              "Offline-capable encrypted QR decryption for centers with low network",
              "Biometric 1:1 face matching between application photo and candidate",
              "Cryptographic anti-tampering seal verification on printed admit cards",
              "Automated attendance audit trail with zero proxy tolerance"
            ]}
            stat="100% Traceable"
            statLabel="Offline QR + Facial cross-match to stop proxy test-takers"
            renderVisual={() => (
              <div style={styles.examMockCard}>
                <div style={styles.examHeader}>
                  <div style={styles.examBadgeTitle}>
                    <GraduationCap size={20} color="#7E22CE" />
                    <div>
                      <div style={styles.examTitleText}>NTA ADMIT CARD GATE VERIFICATION</div>
                      <div style={styles.examSubText}>UPSC / JEE / NEET Examination Center Access</div>
                    </div>
                  </div>
                  <span style={styles.examVerifiedTag}>GATE PASS</span>
                </div>

                <div style={styles.examBody}>
                  <div style={styles.examBiometricGrid}>
                    <div style={styles.examFaceBox}>
                      <User size={32} color="#9333EA" />
                      <span style={styles.examFaceLabel}>Admit Card Photo</span>
                    </div>
                    <div style={styles.examCompareArrow}>
                      <span style={{ fontSize: "12px", fontWeight: 800, color: "#16A34A" }}>99.4%</span>
                      <span style={{ fontSize: "9px", color: "#16A34A", fontWeight: 700 }}>MATCH</span>
                    </div>
                    <div style={styles.examGateFaceBox}>
                      <User size={32} color="#16A34A" />
                      <span style={styles.examGateLabel}>Live Gate Camera</span>
                    </div>
                  </div>

                  <div style={styles.examDataPills}>
                    <div style={styles.examDataRow}>
                      <span>Roll: <strong>2402108849</strong></span>
                      <span>Hall: <strong>B, Desk 42</strong></span>
                    </div>
                    <div style={styles.examPassAlert}>
                      <ShieldCheck size={16} color="#15803D" />
                      <span>ZERO PROXY DEFENSE: Candidate Identity Authenticated</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          />
        </div>
      </section>

      {/* ================= SECTION D: COMPLIANCE & SECURITY CREDENTIALS BANNER ================= */}
      <section style={styles.complianceSection}>
        <div style={styles.complianceInner}>
          <div style={styles.complianceHeader}>
            <div style={styles.complianceTitleGroup}>
              <ShieldCheck size={26} color="#2563EB" />
              <div>
                <h3 style={styles.complianceTitle}>Enterprise Security & Regulatory Compliance</h3>
                <p style={styles.complianceSub}>DocAuth complies with Indian data sovereignty and global cryptographic security baselines.</p>
              </div>
            </div>
          </div>

          <div style={styles.complianceBadgesGrid}>
            <div style={styles.complianceBadgeCard}>
              <div style={styles.complianceBadgeIcon}>
                <Lock size={20} color="#2563EB" />
              </div>
              <div>
                <div style={styles.complianceBadgeName}>ISO 27001 Ready</div>
                <div style={styles.complianceBadgeDesc}>Information Security Management Certified Architecture</div>
              </div>
            </div>

            <div style={styles.complianceBadgeCard}>
              <div style={styles.complianceBadgeIcon}>
                <Shield size={20} color="#059669" />
              </div>
              <div>
                <div style={styles.complianceBadgeName}>AES-256 Bit Encryption</div>
                <div style={styles.complianceBadgeDesc}>Military-Grade Cryptography for Data in Transit & Rest</div>
              </div>
            </div>

            <div style={styles.complianceBadgeCard}>
              <div style={styles.complianceBadgeIcon}>
                <Award size={20} color="#D97706" />
              </div>
              <div>
                <div style={styles.complianceBadgeName}>DPDP Act 2023 Aligned</div>
                <div style={styles.complianceBadgeDesc}>India Digital Personal Data Protection Act Strict Compliance</div>
              </div>
            </div>

            <div style={styles.complianceBadgeCard}>
              <div style={styles.complianceBadgeIcon}>
                <Fingerprint size={20} color="#7C3AED" />
              </div>
              <div>
                <div style={styles.complianceBadgeName}>Zero Permanent Storage</div>
                <div style={styles.complianceBadgeDesc}>Ephemeral memory processing with automated session shredding</div>
              </div>
            </div>
          </div>
        </div>
      </section>
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

  /* 3-STEP PIPELINE SECTION */
  pipelineSection: {
    marginBottom: "58px",
  },
  pipelineHeader: {
    textAlign: "center",
    maxWidth: "640px",
    margin: "0 auto 36px auto",
  },
  pipelineBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "#EFF6FF",
    border: "1px solid #DBEAFE",
    padding: "5px 12px",
    borderRadius: "9999px",
    fontSize: "0.78rem",
    fontWeight: 700,
    color: "#2563EB",
    marginBottom: "12px",
  },
  pipelineHeading: {
    fontSize: "2rem",
    fontWeight: 800,
    color: "#0F172A",
    letterSpacing: "-0.02em",
    marginBottom: "10px",
  },
  pipelineSub: {
    fontSize: "0.95rem",
    color: "#64748B",
    lineHeight: 1.6,
  },
  pipelineGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "24px",
  },
  pipelineCard: {
    position: "relative",
    background: "#FFFFFF",
    borderColor: "#E2E8F0",
    borderRadius: "16px",
    padding: "24px 20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.04), 0 2px 6px -1px rgba(15, 23, 42, 0.02)",
    transition: "all 0.3s ease",
  },
  pipelineStepNumber: {
    position: "absolute",
    top: "14px",
    right: "18px",
    fontSize: "1.8rem",
    fontWeight: 900,
    color: "#E2E8F0",
    fontFamily: "monospace",
  },
  pipelineMockup: {
    background: "#F8FAFC",
    border: "1px solid #E2E8F0",
    borderRadius: "10px",
    padding: "10px",
    marginBottom: "20px",
    overflow: "hidden",
  },
  mockupCardTop: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    marginBottom: "10px",
  },
  mockupDotRed: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#EF4444",
  },
  mockupDotYellow: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#F59E0B",
  },
  mockupDotGreen: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#10B981",
  },
  mockupFilename: {
    fontSize: "0.7rem",
    fontWeight: 600,
    color: "#94A3B8",
    marginLeft: "4px",
  },
  mockupUploadArea: {
    background: "#EFF6FF",
    border: "1.5px dashed #BFDBFE",
    borderRadius: "8px",
    padding: "14px 10px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
  },
  mockupUploadText: {
    fontSize: "0.78rem",
    fontWeight: 700,
    color: "#1E3A8A",
  },
  mockupBadgesRow: {
    display: "flex",
    gap: "6px",
    marginTop: "4px",
  },
  mockupPill: {
    fontSize: "0.68rem",
    fontWeight: 600,
    background: "#DBEAFE",
    color: "#1D4ED8",
    padding: "2px 8px",
    borderRadius: "9999px",
  },
  mockupScanArea: {
    background: "#0F172A",
    borderRadius: "8px",
    padding: "12px 10px",
  },
  mockupGridLines: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    position: "relative",
  },
  mockupScanLaser: {
    height: "2px",
    background: "linear-gradient(90deg, transparent, #60A5FA, #2563EB, transparent)",
    borderRadius: "1px",
    marginBottom: "4px",
  },
  mockupAnalyzeItem: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.72rem",
    fontFamily: "monospace",
  },
  mockupScoreArea: {
    background: "#F0FDF4",
    border: "1px solid #BBF7D0",
    borderRadius: "8px",
    padding: "14px 10px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
  },
  mockupScoreCircle: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  mockupScoreVal: {
    fontSize: "1.5rem",
    fontWeight: 900,
    color: "#16A34A",
    lineHeight: 1.1,
  },
  mockupScoreLbl: {
    fontSize: "0.65rem",
    fontWeight: 800,
    color: "#15803D",
    letterSpacing: "0.05em",
  },
  mockupVerdictBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    background: "#DCFCE7",
    padding: "3px 10px",
    borderRadius: "9999px",
    fontSize: "0.72rem",
    fontWeight: 700,
    color: "#16A34A",
  },
  pipelineContent: {
    display: "flex",
    flexDirection: "column",
  },
  pipelineIconBox: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: "#EFF6FF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "12px",
  },
  pipelineStepTitle: {
    fontSize: "1.08rem",
    fontWeight: 800,
    color: "#0F172A",
    marginBottom: "8px",
  },
  pipelineStepDesc: {
    fontSize: "0.85rem",
    color: "#64748B",
    lineHeight: 1.55,
    marginBottom: "14px",
  },
  pipelineFeaturesList: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    borderTop: "1px solid #F1F5F9",
    paddingTop: "12px",
  },
  pipelineFeaturePoint: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "0.8rem",
    color: "#334155",
    fontWeight: 500,
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

  /* QUICK-CHECK HERO TEASER */
  quickCheckCard: {
    marginTop: "24px",
    background: "#F8FAFC",
    border: "1px solid #E2E8F0",
    borderRadius: "14px",
    padding: "14px 16px",
    maxWidth: "480px"
  },
  quickCheckHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px"
  },
  quickCheckLabel: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "0.72rem",
    fontWeight: 700,
    letterSpacing: "0.06em",
    color: "#2563EB"
  },
  quickCheckSub: {
    fontSize: "0.72rem",
    color: "#64748B",
    fontWeight: 500
  },
  quickCheckBtnRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px"
  },
  quickSampleBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 12px",
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.2s ease"
  },
  quickSampleBtnActiveClean: {
    borderColor: "#10B981",
    background: "#ECFDF5",
    boxShadow: "0 0 0 2px rgba(16, 185, 129, 0.2)"
  },
  quickSampleBtnActiveForged: {
    borderColor: "#EF4444",
    background: "#FEF2F2",
    boxShadow: "0 0 0 2px rgba(239, 68, 68, 0.2)"
  },
  quickBtnTitle: {
    fontSize: "0.82rem",
    fontWeight: 700,
    color: "#0F172A"
  },
  quickBtnDesc: {
    fontSize: "0.68rem",
    color: "#64748B",
    marginTop: "1px"
  },
  quickLoadingBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "12px",
    padding: "10px",
    background: "#EFF6FF",
    borderRadius: "8px",
    color: "#1D4ED8",
    fontSize: "0.78rem",
    fontWeight: 600
  },
  quickSpinner: {
    width: "14px",
    height: "14px",
    border: "2px solid #93C5FD",
    borderTopColor: "#2563EB",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite"
  },
  quickResultClean: {
    marginTop: "12px",
    padding: "12px",
    background: "#ECFDF5",
    border: "1px solid #A7F3D0",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  quickResultForged: {
    marginTop: "12px",
    padding: "12px",
    background: "#FEF2F2",
    border: "1px solid #FECACA",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  quickResultTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "6px"
  },
  quickResultBadgeClean: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "0.76rem",
    fontWeight: 800,
    color: "#065F46"
  },
  quickResultBadgeForged: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "0.76rem",
    fontWeight: 800,
    color: "#991B1B"
  },
  quickResultDocType: {
    fontSize: "0.7rem",
    color: "#64748B",
    fontWeight: 600
  },
  quickResultSpecs: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
    fontSize: "0.72rem",
    color: "#047857",
    fontWeight: 500
  },
  quickResultSpecsForged: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
    fontSize: "0.72rem",
    color: "#B91C1C",
    fontWeight: 500
  },
  quickTryFullBtn: {
    marginTop: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    background: "#059669",
    color: "#FFFFFF",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "0.76rem",
    fontWeight: 600,
    cursor: "pointer"
  },
  quickInspectBtn: {
    marginTop: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    background: "#DC2626",
    color: "#FFFFFF",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "0.76rem",
    fontWeight: 600,
    cursor: "pointer"
  },

  /* SECTION B: SHOWCASE SLIDER */
  showcaseSection: {
    padding: "70px 0 30px"
  },
  sliderContainer: {
    background: "#FFFFFF",
    borderRadius: "20px",
    border: "1px solid #E2E8F0",
    padding: "24px",
    boxShadow: "0 10px 30px -5px rgba(15, 23, 42, 0.05)"
  },
  sliderHeaderBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: "16px",
    borderBottom: "1px solid #E2E8F0",
    marginBottom: "18px",
    flexWrap: "wrap",
    gap: "10px"
  },
  sliderTagOriginal: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "0.82rem",
    fontWeight: 700,
    color: "#475569"
  },
  sliderTagAi: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "0.82rem",
    fontWeight: 800,
    color: "#2563EB"
  },
  stageFrame: {
    position: "relative",
    height: "360px",
    borderRadius: "14px",
    overflow: "hidden",
    background: "#0B1329",
    userSelect: "none"
  },
  stageBaseDocument: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#F1F5F9",
    padding: "20px"
  },
  mockAadhaarCard: {
    width: "100%",
    maxWidth: "520px",
    background: "#FFFFFF",
    borderRadius: "12px",
    border: "1px solid #CBD5E1",
    boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column"
  },
  mockAadhaarTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 16px",
    borderBottom: "1px solid #E2E8F0",
    background: "#F8FAFC"
  },
  mockAadhaarEmblem: {
    fontSize: "18px"
  },
  mockAadhaarGov: {
    display: "flex",
    flexDirection: "column",
    textAlign: "center"
  },
  mockDocPill: {
    background: "#FEF2F2",
    color: "#DC2626",
    border: "1px solid #FECACA",
    fontSize: "0.68rem",
    fontWeight: 700,
    padding: "2px 8px",
    borderRadius: "9999px"
  },
  mockAadhaarContent: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px"
  },
  mockPhotoBox: {
    width: "80px",
    height: "95px",
    background: "#E2E8F0",
    borderRadius: "6px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    border: "1px dashed #94A3B8"
  },
  mockPhotoLabel: {
    fontSize: "0.65rem",
    color: "#64748B",
    marginTop: "4px"
  },
  mockFieldsCol: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },
  mockFieldRow: {
    display: "flex",
    gap: "6px",
    fontSize: "0.82rem"
  },
  mockFieldRowAltered: {
    display: "flex",
    gap: "6px",
    fontSize: "0.82rem",
    background: "#FFF1F2",
    padding: "2px 4px",
    borderRadius: "4px"
  },
  mockFieldKey: {
    fontWeight: 600,
    color: "#64748B"
  },
  mockFieldValue: {
    fontWeight: 700,
    color: "#0F172A"
  },
  mockAadhaarNoBox: {
    marginTop: "6px",
    fontSize: "1rem",
    fontWeight: 800,
    letterSpacing: "0.12em",
    color: "#0F172A"
  },
  mockQrBox: {
    width: "70px",
    height: "85px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  },
  mockQrPattern: {
    width: "55px",
    height: "55px",
    background: "repeating-linear-gradient(45deg, #334155, #334155 3px, #E2E8F0 3px, #E2E8F0 6px)",
    borderRadius: "4px"
  },
  mockAadhaarBottom: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 16px",
    background: "#F8FAFC",
    borderTop: "1px solid #E2E8F0",
    fontSize: "0.78rem",
    fontWeight: 600,
    color: "#64748B"
  },

  /* AI FORENSIC LAYER */
  stageAiOverlay: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#090D1A",
    padding: "20px",
    pointerEvents: "none"
  },
  mockAadhaarCardAi: {
    width: "100%",
    maxWidth: "520px",
    background: "rgba(15, 23, 42, 0.95)",
    borderRadius: "12px",
    border: "1px solid rgba(59, 130, 246, 0.5)",
    boxShadow: "0 0 25px rgba(37, 99, 235, 0.25)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    position: "relative"
  },
  aiScanGridOverlay: {
    position: "absolute",
    inset: 0,
    backgroundImage: "linear-gradient(rgba(37, 99, 235, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(37, 99, 235, 0.08) 1px, transparent 1px)",
    backgroundSize: "16px 16px",
    pointerEvents: "none"
  },
  mockDocPillAi: {
    background: "rgba(239, 68, 68, 0.2)",
    color: "#F87171",
    border: "1px solid #EF4444",
    fontSize: "0.68rem",
    fontWeight: 800,
    padding: "3px 8px",
    borderRadius: "9999px",
    display: "flex",
    alignItems: "center",
    gap: "4px"
  },
  mockPhotoBoxAi: {
    width: "80px",
    height: "95px",
    background: "rgba(239, 68, 68, 0.15)",
    borderRadius: "6px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid #EF4444",
    position: "relative"
  },
  aiBoundingBoxPhoto: {
    position: "absolute",
    bottom: "-2px",
    left: "-2px",
    right: "-2px",
    background: "#EF4444",
    color: "#FFFFFF",
    fontSize: "0.5rem",
    fontWeight: 800,
    textAlign: "center",
    padding: "1px 0"
  },
  aiBoundingBoxDob: {
    border: "1px solid #EF4444",
    background: "rgba(239, 68, 68, 0.18)",
    padding: "3px 6px",
    borderRadius: "4px",
    display: "flex",
    flexDirection: "column",
    gap: "2px"
  },
  aiAlertHeader: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "0.62rem",
    fontWeight: 800,
    color: "#F87171"
  },
  mockAadhaarNoBoxAi: {
    marginTop: "6px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "0.95rem",
    fontWeight: 800,
    letterSpacing: "0.1em",
    color: "#E2E8F0"
  },
  aiChecksumFail: {
    fontSize: "0.64rem",
    color: "#F87171",
    fontWeight: 700,
    letterSpacing: "normal"
  },
  mockQrBoxAi: {
    width: "70px",
    height: "85px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    border: "1px dashed #EF4444",
    borderRadius: "6px",
    background: "rgba(239, 68, 68, 0.08)",
    padding: "4px"
  },
  mockQrPatternAi: {
    width: "50px",
    height: "50px",
    background: "repeating-linear-gradient(45deg, #EF4444, #EF4444 3px, #1E293B 3px, #1E293B 6px)",
    borderRadius: "4px"
  },
  aiQrAlert: {
    fontSize: "0.55rem",
    color: "#F87171",
    fontWeight: 800,
    marginTop: "4px",
    textAlign: "center"
  },
  mockAadhaarBottomAi: {
    padding: "8px 16px",
    background: "rgba(15, 23, 42, 0.8)",
    borderTop: "1px solid rgba(59, 130, 246, 0.2)"
  },
  aiStatusBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "0.74rem",
    fontWeight: 800,
    color: "#F87171"
  },

  /* SLIDER CONTROLS */
  sliderDividerLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: "3px",
    background: "#3B82F6",
    boxShadow: "0 0 12px #3B82F6, 0 0 20px rgba(59, 130, 246, 0.5)",
    transform: "translateX(-50%)",
    pointerEvents: "none",
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  sliderKnob: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "#2563EB",
    border: "3px solid #FFFFFF",
    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  sliderRangeInput: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    opacity: 0,
    cursor: "ew-resize",
    zIndex: 20,
    margin: 0
  },
  sliderFootnotes: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px",
    marginTop: "20px",
    paddingTop: "16px",
    borderTop: "1px solid #F1F5F9"
  },
  sliderFootItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    fontSize: "0.8rem",
    color: "#475569",
    lineHeight: 1.4
  },
  footDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    marginTop: "5px",
    flexShrink: 0
  },

  /* SECTION C: USE CASES ROWS (FULL WIDTH WITH SLIDING VISUAL) */
  useCasesSection: {
    padding: "70px 0 30px"
  },
  useCasesRowsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "50px",
    marginTop: "20px"
  },
  useCaseRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "40px",
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: "24px",
    padding: "36px 40px",
    boxShadow: "0 10px 30px -5px rgba(15, 23, 42, 0.04)",
    overflow: "hidden"
  },
  useCaseTextCol: {
    flex: "1 1 50%",
    display: "flex",
    flexDirection: "column"
  },
  useCaseTopRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "16px"
  },
  useCaseIconBox: {
    width: "42px",
    height: "42px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  useCaseBadge: {
    fontSize: "0.72rem",
    fontWeight: 800,
    letterSpacing: "0.05em",
    padding: "5px 10px",
    borderRadius: "6px"
  },
  useCaseRowTitle: {
    fontSize: "1.55rem",
    fontWeight: 800,
    color: "#0F172A",
    lineHeight: 1.25,
    marginBottom: "6px"
  },
  useCaseRowSub: {
    fontSize: "0.88rem",
    fontWeight: 600,
    color: "#2563EB",
    marginBottom: "12px"
  },
  useCaseRowDesc: {
    fontSize: "0.92rem",
    color: "#64748B",
    lineHeight: 1.6,
    marginBottom: "20px"
  },
  useCaseFeaturesList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "24px"
  },
  useCaseFeatureItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px"
  },
  useCaseCheckIcon: {
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    background: "#DCFCE7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: "2px"
  },
  useCaseFeatureText: {
    fontSize: "0.85rem",
    color: "#334155",
    fontWeight: 500,
    lineHeight: 1.4
  },
  useCaseMetricStrip: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "12px 18px",
    background: "#F8FAFC",
    border: "1px solid #E2E8F0",
    borderRadius: "12px"
  },
  useCaseMetricVal: {
    fontSize: "1.1rem",
    fontWeight: 800,
    color: "#0F172A"
  },
  useCaseMetricLabel: {
    fontSize: "0.76rem",
    color: "#64748B",
    fontWeight: 500
  },
  useCaseVisualCol: {
    flex: "1 1 50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    willChange: "transform, opacity"
  },

  /* MOCKUP 1: FINTECH CARD */
  fintechMockCard: {
    width: "100%",
    maxWidth: "420px",
    background: "linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #0F172A 100%)",
    borderRadius: "20px",
    padding: "26px",
    color: "#FFFFFF",
    position: "relative",
    boxShadow: "0 20px 40px -10px rgba(30, 58, 138, 0.4)",
    border: "1px solid rgba(255, 255, 255, 0.12)"
  },
  fintechCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px"
  },
  fintechCardChip: {
    width: "40px",
    height: "28px",
    background: "linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)",
    borderRadius: "6px",
    border: "1px solid #FCD34D"
  },
  fintechCardNo: {
    fontSize: "1.25rem",
    fontWeight: 700,
    letterSpacing: "0.15em",
    fontFamily: "monospace",
    color: "#F8FAFC",
    marginBottom: "24px"
  },
  fintechCardBottom: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end"
  },
  fintechCardHolder: {
    fontSize: "0.8rem",
    fontWeight: 700,
    letterSpacing: "0.08em",
    color: "#F1F5F9"
  },
  fintechCardExpiry: {
    fontSize: "0.68rem",
    color: "#94A3B8",
    marginTop: "2px"
  },
  fintechKycBadge: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    background: "rgba(16, 185, 129, 0.2)",
    border: "1px solid #10B981",
    color: "#6EE7B7",
    padding: "4px 10px",
    borderRadius: "9999px",
    fontSize: "0.7rem",
    fontWeight: 800
  },
  fintechFloatingPill1: {
    position: "absolute",
    top: "-14px",
    right: "-10px",
    background: "#FFFFFF",
    color: "#0F172A",
    border: "1px solid #E2E8F0",
    borderRadius: "12px",
    padding: "8px 14px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.12)",
    fontSize: "0.78rem"
  },
  fintechFloatingPill2: {
    position: "absolute",
    bottom: "-16px",
    left: "-12px",
    background: "#FFFFFF",
    color: "#0F172A",
    border: "1px solid #E2E8F0",
    borderRadius: "12px",
    padding: "8px 14px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.12)",
    fontSize: "0.78rem"
  },

  /* MOCKUP 2: HR DOSSIER CARD */
  hrMockCard: {
    width: "100%",
    maxWidth: "440px",
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: "20px",
    padding: "24px",
    boxShadow: "0 15px 35px -5px rgba(16, 185, 129, 0.1)"
  },
  hrCardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    paddingBottom: "16px",
    borderBottom: "1px solid #F1F5F9"
  },
  hrAvatar: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    background: "#DCFCE7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },
  hrCandidateName: {
    fontSize: "1rem",
    fontWeight: 700,
    color: "#0F172A"
  },
  hrCandidateRole: {
    fontSize: "0.75rem",
    color: "#64748B",
    marginTop: "2px"
  },
  hrStatusTag: {
    background: "#DCFCE7",
    color: "#166534",
    border: "1px solid #86EFAC",
    padding: "4px 10px",
    borderRadius: "9999px",
    fontSize: "0.68rem",
    fontWeight: 800
  },
  hrChecksList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    padding: "16px 0"
  },
  hrCheckItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    background: "#F8FAFC",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #F1F5F9"
  },
  hrCheckTitle: {
    fontSize: "0.8rem",
    fontWeight: 700,
    color: "#0F172A"
  },
  hrCheckSub: {
    fontSize: "0.7rem",
    color: "#64748B",
    marginTop: "1px"
  },
  hrFooter: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#F0FDF4",
    padding: "8px 12px",
    borderRadius: "8px",
    color: "#15803D",
    fontSize: "0.72rem",
    fontWeight: 700
  },

  /* MOCKUP 3: RTO DRIVING LICENCE SCAN */
  rtoMockCard: {
    width: "100%",
    maxWidth: "440px",
    background: "#FFFFFF",
    border: "1px solid #FEF3C7",
    borderRadius: "20px",
    padding: "24px",
    boxShadow: "0 15px 35px -5px rgba(245, 158, 11, 0.1)"
  },
  rtoCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px"
  },
  rtoEmblemBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  rtoHeaderTitle: {
    fontSize: "0.75rem",
    fontWeight: 800,
    color: "#92400E",
    letterSpacing: "0.04em"
  },
  rtoLiveTag: {
    fontSize: "0.68rem",
    fontWeight: 700,
    color: "#D97706"
  },
  rtoCardBody: {
    display: "flex",
    flexDirection: "column",
    gap: "14px"
  },
  rtoDlGraphic: {
    background: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)",
    border: "1px solid #FDE68A",
    borderRadius: "14px",
    padding: "16px"
  },
  rtoDlTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
    paddingBottom: "8px",
    borderBottom: "1px dashed #FCD34D"
  },
  rtoDlMiddle: {
    display: "flex",
    gap: "14px",
    alignItems: "center"
  },
  rtoPhotoBox: {
    width: "56px",
    height: "64px",
    borderRadius: "8px",
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  rtoDlDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    fontSize: "0.76rem",
    color: "#1E293B"
  },
  rtoVerificationStrip: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    background: "#ECFDF5",
    border: "1px solid #A7F3D0",
    borderRadius: "10px",
    padding: "10px 14px"
  },
  rtoVerdictGreen: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "0.78rem",
    fontWeight: 800,
    color: "#065F46"
  },
  rtoVerdictSub: {
    display: "flex",
    gap: "8px",
    fontSize: "0.7rem",
    color: "#047857",
    paddingLeft: "24px"
  },

  /* MOCKUP 4: EXAM ADMIT CARD TERMINAL */
  examMockCard: {
    width: "100%",
    maxWidth: "440px",
    background: "#FFFFFF",
    border: "1px solid #F3E8FF",
    borderRadius: "20px",
    padding: "24px",
    boxShadow: "0 15px 35px -5px rgba(147, 51, 234, 0.1)"
  },
  examHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    paddingBottom: "14px",
    borderBottom: "1px solid #F3E8FF"
  },
  examBadgeTitle: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },
  examTitleText: {
    fontSize: "0.76rem",
    fontWeight: 800,
    color: "#6B21A8"
  },
  examSubText: {
    fontSize: "0.68rem",
    color: "#64748B"
  },
  examVerifiedTag: {
    background: "#F3E8FF",
    color: "#7E22CE",
    border: "1px solid #D8B4FE",
    padding: "4px 8px",
    borderRadius: "9999px",
    fontSize: "0.65rem",
    fontWeight: 800
  },
  examBody: {
    display: "flex",
    flexDirection: "column",
    gap: "14px"
  },
  examBiometricGrid: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#FAF5FF",
    padding: "14px 18px",
    borderRadius: "14px",
    border: "1px solid #E9D5FF"
  },
  examFaceBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px"
  },
  examFaceLabel: {
    fontSize: "0.68rem",
    color: "#6B21A8",
    fontWeight: 600
  },
  examCompareArrow: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "#DCFCE7",
    padding: "4px 10px",
    borderRadius: "8px",
    border: "1px solid #86EFAC"
  },
  examGateFaceBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px"
  },
  examGateLabel: {
    fontSize: "0.68rem",
    color: "#15803D",
    fontWeight: 600
  },
  examDataPills: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  examDataRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.78rem",
    color: "#334155",
    padding: "4px 6px"
  },
  examPassAlert: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#F0FDF4",
    border: "1px solid #BBF7D0",
    borderRadius: "8px",
    padding: "8px 12px",
    color: "#15803D",
    fontSize: "0.72rem",
    fontWeight: 700
  },

  /* SECTION D: COMPLIANCE BANNER */
  complianceSection: {
    padding: "40px 0 60px"
  },
  complianceInner: {
    background: "linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)",
    border: "1px solid #DBEAFE",
    borderRadius: "20px",
    padding: "32px"
  },
  complianceHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px"
  },
  complianceTitleGroup: {
    display: "flex",
    alignItems: "center",
    gap: "14px"
  },
  complianceTitle: {
    fontSize: "1.25rem",
    fontWeight: 800,
    color: "#0F172A"
  },
  complianceSub: {
    fontSize: "0.84rem",
    color: "#64748B",
    marginTop: "2px"
  },
  complianceBadgesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px"
  },
  complianceBadgeCard: {
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: "12px",
    padding: "16px",
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    boxShadow: "0 2px 6px rgba(15, 23, 42, 0.04)"
  },
  complianceBadgeIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    background: "#F8FAFC",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },
  complianceBadgeName: {
    fontSize: "0.88rem",
    fontWeight: 700,
    color: "#0F172A"
  },
  complianceBadgeDesc: {
    fontSize: "0.74rem",
    color: "#64748B",
    marginTop: "3px",
    lineHeight: 1.35
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
