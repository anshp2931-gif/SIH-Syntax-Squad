/**
 * Multi-layer Risk Engine for Indian Document Authenticity
 * Aggregates results from all 7 pipeline checks into a unified Risk Score (0 - 100)
 */

export function calculateRisk(checks = {}) {
  let score = 0;
  const penalties = [];

  const authenticDocumentPassed = checks.format && checks.issuer;

  if (!checks.documentType) {
    score += 30;
    penalties.push({ check: "Document Type Detection", points: 30, reason: "Unrecognized or unsupported document layout" });
  }

  if (!checks.ocr) {
    score += 20;
    penalties.push({ check: "OCR Data Extraction", points: 20, reason: "OCR text extraction failed or text unreadable" });
  }

  if (!checks.format) {
    score += 25;
    penalties.push({ check: "Format Validation", points: 25, reason: "Document ID failed checksum or standard regex pattern" });
  }

  if (!checks.qr) {
    // If format & authoritative issuer check pass on physical card photo, QR scanning failure is minor
    const points = authenticDocumentPassed ? 5 : 15;
    score += points;
    penalties.push({ check: "QR Verification", points, reason: "QR code missing, unreadable, or unverified payload" });
  }

  if (!checks.template) {
    const points = authenticDocumentPassed ? 5 : 15;
    score += points;
    penalties.push({ check: "Template Validation", points, reason: "Card structural proportions or keywords inconsistent" });
  }

  if (!checks.tampering) {
    score += 30;
    penalties.push({ check: "Tampering Analysis", points: 30, reason: "Potential image manipulation, ELA anomaly, or edge distortion detected" });
  }

  if (!checks.issuer) {
    score += 40;
    penalties.push({ check: "Issuer Verification", points: 40, reason: "Authoritative issuer database lookup returned unverified or record missing" });
  }

  // Cap score between 0 and 100
  const finalScore = Math.min(100, Math.max(0, score));
  const originalityScore = Math.max(0, 100 - finalScore);

  return {
    riskScore: finalScore,
    originalityScore,
    penalties
  };
}

/**
 * Returns overall document status based on calculated risk score
 * Score <= 15 => VERIFIED
 * Score 16 - 40 => UNVERIFIED
 * Score > 40 => SUSPICIOUS
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
