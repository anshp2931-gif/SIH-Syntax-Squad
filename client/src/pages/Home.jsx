import React from "react";
import { ShieldCheck, Cpu, Eye, FileCheck, ArrowRight, Layers, Lock, Database, QrCode } from "lucide-react";

export default function Home({ onNavigateVerify }) {
  const supportedDocs = [
    { title: "💳 Income Tax PAN Card", desc: "10-char regex, 4th char entity type (P, C, F, H), surname match, Income Tax NSDL lookup." },
    { title: "🪪 Driving Licence (DL)", desc: "15-digit RTO state structure, 36 Indian State/UT code check, Parivahan Sarathi lookup." },
    { title: "🆔 Aadhaar Card", desc: "12-digit Verhoeff Checksum Algorithm, 8-digit masking check (XXXX XXXX 1234), UIDAI / DigiLocker lookup." },
    { title: "🗳️ Voter ID (EPIC)", desc: "10-char EPIC format (ABC1234567), Election Commission ECI NVSP electoral roll lookup." },
    { title: "🛂 Indian Passport", desc: "ICAO Doc 9303 MRZ 2-line checksum parser, Passport Seva / MEA registry lookup." },
    { title: "🚗 Vehicle RC", desc: "Registration & 17-digit Chassis VIN validation, Parivahan Vahan 4.0 registry lookup." },
    { title: "🏢 GSTIN Certificate", desc: "15-char GSTIN structure, embedded PAN validation, GST Common Portal lookup." }
  ];

  return (
    <div style={styles.container}>
      <section style={styles.hero}>
        <div style={styles.heroBadge}>
          <ShieldCheck size={16} color="#818cf8" />
          <span>7-Document Authenticity Architecture</span>
        </div>
        <h1 style={styles.heroTitle}>
          Indian Document Authenticity & <br />
          <span className="gradient-text">Verification Platform</span>
        </h1>
        <p style={styles.heroSub}>
          An enterprise multi-stage verification engine for Indian identity & registration documents (PAN, Driving Licence, Aadhaar, Voter ID, Passport, Vehicle RC, and GSTIN). Combines Tesseract OCR, Verhoeff checksums, ICAO MRZ parsing, QR matrix validation, Error Level Analysis (ELA), and authoritative issuer API lookups.
        </p>
        <div style={styles.heroCta}>
          <button className="btn-primary" onClick={onNavigateVerify}>
            Run 7-Document Verification Demo
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Supported Document Verification Suite (7 Document Types)</h2>
        <div style={styles.docGrid}>
          {supportedDocs.map((doc, idx) => (
            <div key={idx} className="glass-card glass-card-interactive" style={styles.docCard}>
              <div style={styles.docHeader}>
                <span style={styles.docTag}>Active Verification</span>
                <h3 style={{ fontSize: "1.1rem", marginTop: "8px" }}>{doc.title}</h3>
              </div>
              <p style={styles.docDesc}>{doc.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: { maxWidth: "1280px", margin: "0 auto", padding: "40px 24px" },
  hero: { textAlign: "center", maxWidth: "840px", margin: "0 auto 60px auto" },
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
  heroTitle: { fontSize: "2.8rem", fontWeight: 800, lineHeight: 1.15, marginBottom: "20px" },
  heroSub: { fontSize: "1.08rem", color: "#9ca3af", lineHeight: 1.6, marginBottom: "32px" },
  heroCta: { display: "flex", justifyContent: "center", gap: "16px" },
  section: { marginBottom: "60px" },
  sectionTitle: { fontSize: "1.5rem", marginBottom: "24px", textAlign: "center" },
  docGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" },
  docCard: { padding: "24px" },
  docHeader: { marginBottom: "10px" },
  docTag: { background: "rgba(16, 185, 129, 0.15)", color: "#10b981", fontSize: "0.72rem", fontWeight: 700, padding: "4px 10px", borderRadius: "9999px" },
  docDesc: { fontSize: "0.88rem", color: "#9ca3af", lineHeight: 1.5 }
};
