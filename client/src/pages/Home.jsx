import React from "react";
import { ShieldCheck, Cpu, Eye, FileCheck, ArrowRight, Layers, Lock, Database, QrCode } from "lucide-react";

export default function Home({ onNavigateVerify }) {
  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroBadge}>
          <ShieldCheck size={16} color="#818cf8" />
          <span>Multi-Layer Authenticity Architecture</span>
        </div>
        <h1 style={styles.heroTitle}>
          Indian Document Authenticity & <br />
          <span className="gradient-text">Verification Platform</span>
        </h1>
        <p style={styles.heroSub}>
          An enterprise multi-stage verification engine for Indian identity documents (PAN Card, Driving Licence, & Aadhaar preview). Combines Tesseract OCR, QR payload validation, Error Level Analysis (ELA), layout structure checks, and authoritative issuer API lookup.
        </p>
        <div style={styles.heroCta}>
          <button className="btn-primary" onClick={onNavigateVerify}>
            Run Verification Demo
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Architecture Flow */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Pipeline Architecture & Verification Layers</h2>
        <div style={styles.flowContainer} className="glass-card">
          <div style={styles.flowGrid}>
            {[
              { step: "01", title: "Document Upload", desc: "Multipart Image/PDF ingest & Multer validation", icon: FileCheck },
              { step: "02", title: "OCR Extraction", desc: "Tesseract.js engine & noise filter preprocessing", icon: Cpu },
              { step: "03", title: "QR Payload Scan", desc: "jsQR matrix decoding & domain validation", icon: QrCode },
              { step: "04", title: "Format & Checksum", desc: "PAN regex entity & DL state code validation", icon: Layers },
              { step: "05", title: "Tamper ELA Audit", desc: "Pixel compression & edge boundary inspection", icon: Eye },
              { step: "06", title: "Authoritative Lookup", desc: "DigiLocker / NSDL / Parivahan API integration", icon: Lock },
              { step: "07", title: "Weighted Risk Engine", desc: "Risk score (0-100) & MongoDB audit log", icon: Database }
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} style={styles.flowCard}>
                  <div style={styles.stepBadge}>{f.step}</div>
                  <Icon size={24} color="#818cf8" style={{ marginBottom: "8px" }} />
                  <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{f.title}</div>
                  <div style={{ fontSize: "0.78rem", color: "#9ca3af", marginTop: "4px" }}>{f.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Supported Documents */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Supported Identity Documents</h2>
        <div style={styles.docGrid}>
          <div className="glass-card glass-card-interactive" style={styles.docCard}>
            <div style={styles.docHeader}>
              <span style={styles.docTag}>Active Support</span>
              <h3 style={{ fontSize: "1.2rem", marginTop: "6px" }}>Income Tax PAN Card</h3>
            </div>
            <p style={styles.docDesc}>
              Validates 10-char PAN regex <code>[A-Z]&#123;5&#125;[0-9]&#123;4&#125;[A-Z]</code>, evaluates 4th character entity type (P, C, F, H, etc.), verifies name initials match, and cross-references Income Tax Department NSDL lookup.
            </p>
          </div>

          <div className="glass-card glass-card-interactive" style={styles.docCard}>
            <div style={styles.docHeader}>
              <span style={styles.docTag}>Active Support</span>
              <h3 style={{ fontSize: "1.2rem", marginTop: "6px" }}>Driving Licence (DL)</h3>
            </div>
            <p style={styles.docDesc}>
              Validates 15-digit RTO state structure (e.g. DL, MH, KA, TN), issue year constraints, Parivahan QR payload verification, and Sarathi Portal registry API matching.
            </p>
          </div>

          <div className="glass-card glass-card-interactive" style={styles.docCard}>
            <div style={styles.docHeader}>
              <span style={{ ...styles.docTag, background: "rgba(99, 102, 241, 0.12)", color: "#a5b4fc" }}>
                Architecture Extensible
              </span>
              <h3 style={{ fontSize: "1.2rem", marginTop: "6px" }}>Aadhaar & DigiLocker</h3>
            </div>
            <p style={styles.docDesc}>
              Extensible strategy ready for UIDAI 12-digit Verhoeff algorithm validation, DigiLocker OAuth consent flow, and Voter ID (EPIC) validation.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "40px 24px"
  },
  hero: {
    textAlign: "center",
    maxWidth: "840px",
    margin: "0 auto 60px auto"
  },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(99, 102, 241, 0.12)",
    border: "1px solid rgba(99, 102, 241, 0.3)",
    padding: "6px 16px",
    borderRadius: "9999px",
    color: "#a5b4fc",
    fontSize: "0.85rem",
    fontWeight: 600,
    marginBottom: "20px"
  },
  heroTitle: {
    fontSize: "2.8rem",
    fontWeight: 800,
    lineHeight: 1.15,
    marginBottom: "20px"
  },
  heroSub: {
    fontSize: "1.08rem",
    color: "#9ca3af",
    lineHeight: 1.6,
    marginBottom: "32px"
  },
  heroCta: {
    display: "flex",
    justifyContent: "center",
    gap: "16px"
  },
  section: {
    marginBottom: "60px"
  },
  sectionTitle: {
    fontSize: "1.5rem",
    marginBottom: "24px",
    textAlign: "center"
  },
  flowContainer: {
    padding: "32px"
  },
  flowGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "16px"
  },
  flowCard: {
    background: "rgba(17, 24, 39, 0.6)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "16px",
    borderRadius: "12px",
    textAlign: "center",
    position: "relative"
  },
  stepBadge: {
    fontSize: "0.7rem",
    fontWeight: 800,
    color: "#6366f1",
    background: "rgba(99, 102, 241, 0.15)",
    padding: "2px 6px",
    borderRadius: "4px",
    display: "inline-block",
    marginBottom: "8px"
  },
  docGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "24px"
  },
  docCard: {
    padding: "28px"
  },
  docHeader: {
    marginBottom: "12px"
  },
  docTag: {
    background: "rgba(16, 185, 129, 0.15)",
    color: "#10b981",
    fontSize: "0.75rem",
    fontWeight: 700,
    padding: "4px 10px",
    borderRadius: "9999px"
  },
  docDesc: {
    fontSize: "0.9rem",
    color: "#9ca3af",
    lineHeight: 1.6
  }
};
