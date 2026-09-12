/**
 * Priority-Weighted Risk Engine for Indian Document Authenticity & Verification
 * Evaluates 7 pipeline checks using weighted security priority levels:
 * - CRITICAL SECURITY (Weight: 25% - 35%): QR Code Cryptographic & Digital Signature Match
 * - HIGH SECURITY (Weight: 25% - 35%): Tampering Analysis (ELA) & Algorithmic Format Checksum
 * - AUTHORITATIVE (Weight: 20% - 35%): Official Issuer Database Verification
 * - STANDARD (Weight: 10% - 20%): Document Type, OCR Data Extraction & Template Proportions
 */

export function calculateRisk(checks = {}) {
  let score = 0;
  const penalties = [];

  // Check 1: Document Type Detection (Standard Priority - Max Penalty: 15)
  if (!checks.documentType) {
    score += 15;
    penalties.push({
      check: "Document Type Detection",
      priority: "STANDARD",
      points: 15,
      reason: "Unrecognized or unsupported document layout"
    });
  }

  // Check 2: OCR Data Extraction (Standard Priority - Max Penalty: 20)
  if (!checks.ocr) {
    score += 20;
    penalties.push({
      check: "OCR Data Extraction",
      priority: "STANDARD",
      points: 20,
      reason: "OCR text extraction failed or text unreadable due to blur/glare"
    });
  }

  // Check 3: Format & Algorithmic Checksum (High Security Priority - Max Penalty: 25)
  if (!checks.format) {
    score += 25;
    penalties.push({
      check: "Format & Algorithmic Checksum",
      priority: "HIGH SECURITY",
      points: 25,
      reason: "Document ID failed mathematical checksum or standard regex pattern"
    });
  }

  // Check 4: QR Code Security Match (Critical Security Priority - Max Penalty: 25)
  if (!checks.qr) {
    // If QR code is missing, blurry, or payload unverified, apply Critical Security Penalty of 25 points.
    // This ensures score cannot exceed 75/100, marking the document as UNVERIFIED (WARN) instead of 95/100.
    const points = 25;
    score += points;
    penalties.push({
      check: "QR Code Security Match",
      priority: "CRITICAL SECURITY",
      points,
      reason: "CRITICAL SECURITY WARN: QR code missing, unreadable/blurry, or digital signature payload unverified"
    });
  }

  // Check 5: Template & Proportions Check (Standard Priority - Max Penalty: 15)
  if (!checks.template) {
    score += 15;
    penalties.push({
      check: "Template & Proportions Check",
      priority: "STANDARD",
      points: 15,
      reason: "Card structural proportions or boundary features non-conforming"
    });
  }

  // Check 6: Tampering Analysis (ELA) (High Security Priority - Max Penalty: 30)
  if (!checks.tampering) {
    score += 30;
    penalties.push({
      check: "Tampering Analysis (ELA)",
      priority: "HIGH SECURITY",
      points: 30,
      reason: "HIGH SECURITY ALERT: Image manipulation, ELA pixel variance anomaly, or edge distortion detected"
    });
  }

  // Check 7: Official Issuer Verification (Authoritative Priority - Max Penalty: 35)
  if (!checks.issuer) {
    score += 35;
    penalties.push({
      check: "Official Issuer Verification",
      priority: "AUTHORITATIVE",
      points: 35,
      reason: "Authoritative issuer database lookup returned unverified or record missing"
    });
  }

  // Cap risk score between 0 and 100
  const finalRiskScore = Math.min(100, Math.max(0, score));
  const originalityScore = Math.max(0, 100 - finalRiskScore);

  return {
    riskScore: finalRiskScore,
    originalityScore,
    penalties
  };
}

/**
 * Returns overall document status based on calculated risk score
 * Originality >= 85 (Risk Score <= 15) => VERIFIED
 * Originality 60 - 84 (Risk Score 16 - 40) => UNVERIFIED
 * Originality < 60 (Risk Score > 40) => SUSPICIOUS
 */
export function getStatus(score) {
  if (score <= 15) {
    return "VERIFIED";
  }
  if (score <= 40) {
    return "UNVERIFIED";
  }
  return "SUSPICIOUS";
}
