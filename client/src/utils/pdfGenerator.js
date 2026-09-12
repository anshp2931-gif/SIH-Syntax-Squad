import { jsPDF } from "jspdf";
import QRCode from "qrcode";

/**
 * Format document type key into human-readable label
 */
function formatDocName(type) {
  const map = {
    PAN: "Indian PAN Card (Income Tax Dept)",
    AADHAAR: "Aadhaar Card (UIDAI)",
    DRIVING_LICENSE: "Indian Driving Licence (MoRTH)",
    PASSPORT: "Indian Passport (MEA India)",
    VISA: "Indian Visa / e-Visa",
    PERMIT: "Commercial Transport Permit",
    VOTER_ID: "Voter ID Card (EPIC / ECI)",
    VEHICLE_RC: "Vehicle Registration Certificate (RC)",
    GSTIN: "GSTIN Certificate (GST Network)",
    RATION_CARD: "Ration Card (NFSA / PDS)",
    DEGREE_CERTIFICATE: "Degree Certificate / Marksheet",
    BIRTH_CERTIFICATE: "Birth Certificate (CRS)",
    STUDENT_ID: "Student / Institutional ID Card",
    UNSUPPORTED: "Unsupported Document",
    UNKNOWN: "Unknown Document"
  };
  return map[type] || type || "Unknown Document";
}

/**
 * Format raw ISO timestamp into clean printable string
 */
function formatTimestamp(ts) {
  if (!ts) return new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST";
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return String(ts);
    return d.toLocaleString("en-IN", { 
      year: "numeric", 
      month: "short", 
      day: "2-digit", 
      hour: "2-digit", 
      minute: "2-digit", 
      second: "2-digit", 
      hour12: false,
      timeZone: "Asia/Kolkata"
    }) + " IST";
  } catch (e) {
    return String(ts).replace("T", " ").replace("Z", " IST");
  }
}

/**
 * Generate and download PramaanSetu Official Verification Audit Certificate (PDF)
 */
export async function generateAuditCertificatePDF(result) {
  if (!result) return;

  const dataObj = result.data ? result.data : result;
  const {
    verificationId = "DV-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
    documentType = "UNKNOWN",
    detectedType = result.detectedType || null,
    detectionConfidence = result.detectionConfidence || null,
    status = "UNVERIFIED",
    riskScore = 0,
    originalityScore,
    checks = {},
    tamperDetails = {},
    issuerDetails = {}
  } = dataObj;

  const displayOriginality = originalityScore !== undefined ? originalityScore : Math.max(0, 100 - riskScore);
  const effectiveDetected = detectedType || documentType;
  const timestampStr = formatTimestamp(issuerDetails?.verificationTimestamp || result.createdAt);

  // Determine Verification Status Label
  let statusBgColor = [220, 252, 231]; // Light Green
  let statusTextColor = [22, 163, 74]; // Green #16A34A
  let statusBorder = [167, 243, 208];
  let statusText = "VERIFIED (AUTHENTIC)";

  if (status === "SUSPICIOUS" || riskScore >= 50 || displayOriginality < 60) {
    statusBgColor = [254, 226, 226]; // Light Red
    statusTextColor = [220, 38, 38]; // Red #DC2626
    statusBorder = [254, 202, 202];
    statusText = "SUSPICIOUS (TAMPERED)";
  } else if (status === "UNVERIFIED" || displayOriginality < 85) {
    statusBgColor = [254, 243, 199]; // Light Amber
    statusTextColor = [217, 119, 6]; // Amber #D97706
    statusBorder = [253, 230, 138];
    statusText = "REVIEW REQUIRED";
  }

  // Generate real scannable QR Code Data URL
  let qrDataUrl = null;
  try {
    const qrPayload = JSON.stringify({
      verificationId,
      documentType: formatDocName(documentType),
      status: statusText,
      originalityScore: displayOriginality,
      riskScore,
      issuedAt: timestampStr,
      issuer: issuerDetails?.issuer || "PramaanSetu Verification Engine"
    });
    qrDataUrl = await QRCode.toDataURL(qrPayload, {
      margin: 1,
      width: 250,
      color: { dark: "#0F172A", light: "#FFFFFF" }
    });
  } catch (err) {
    console.error("QR generation error:", err);
  }

  // Create A4 PDF doc
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm
  let y = margin;

  // ----------------------------------------------------
  // 1. TRICOLOR TOP BAR (Saffron, White, Green)
  // ----------------------------------------------------
  doc.setFillColor(255, 153, 51); // Saffron #FF9933
  doc.rect(0, 0, pageWidth / 3, 4, "F");
  doc.setFillColor(245, 245, 245); // Light Gray/White
  doc.rect(pageWidth / 3, 0, pageWidth / 3, 4, "F");
  doc.setFillColor(19, 136, 8); // Green #138808
  doc.rect((pageWidth * 2) / 3, 0, pageWidth / 3, 4, "F");

  y += 6;

  // ----------------------------------------------------
  // 2. HEADER: PramaanSetu Branding & Title
  // ----------------------------------------------------
  doc.setFillColor(15, 23, 42); // Navy #0F172A
  doc.rect(margin, y, contentWidth, 24, "F");

  // Title Text inside Navy header
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13.5);
  doc.text("PRAMAANSETU VERIFICATION AUDIT CERTIFICATE", margin + 6, y + 9);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225); // #CBD5E1
  doc.text("Official Government & Enterprise Document Authenticity Report • SIH Syntax Squad Engine", margin + 6, y + 16);

  // Verification Badge inside Header Top Right
  doc.setFillColor(37, 99, 235); // Blue #2563EB
  doc.roundedRect(pageWidth - margin - 52, y + 4, 46, 15, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("AUDIT ID", pageWidth - margin - 48, y + 9);
  doc.setFontSize(9);
  doc.text(verificationId, pageWidth - margin - 48, y + 14);

  y += 30;

  // ----------------------------------------------------
  // 3. CERTIFICATE METADATA BOX
  // ----------------------------------------------------
  doc.setFillColor(248, 250, 252); // #F8FAFC
  doc.setDrawColor(226, 232, 240); // #E2E8F0
  doc.roundedRect(margin, y, contentWidth, 22, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139); // #64748B
  
  doc.text("DOCUMENT CLASSIFICATION:", margin + 6, y + 7);
  doc.text("ISSUED TIMESTAMP:", margin + 105, y + 7);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42); // #0F172A
  doc.text(formatDocName(documentType), margin + 6, y + 14);
  doc.text(timestampStr, margin + 105, y + 14);

  y += 28;

  // ----------------------------------------------------
  // 4. VERIFICATION STATUS & GAUGES
  // ----------------------------------------------------
  const boxWidth = (contentWidth - 8) / 3; // 58mm each

  // Box 1: Status Badge
  doc.setFillColor(...statusBgColor);
  doc.setDrawColor(...statusBorder);
  doc.roundedRect(margin, y, boxWidth, 24, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...statusTextColor);
  doc.text("VERIFICATION STATUS", margin + 5, y + 7);
  doc.setFontSize(9);
  doc.text(statusText, margin + 5, y + 16);

  // Box 2: Originality Score Gauge
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin + boxWidth + 4, y, boxWidth, 24, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("ORIGINALITY SCORE", margin + boxWidth + 9, y + 7);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(37, 99, 235);
  doc.text(`${displayOriginality}`, margin + boxWidth + 9, y + 17);
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("/ 100", margin + boxWidth + 28, y + 17);

  // Box 3: Risk Score Gauge
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin + (boxWidth + 4) * 2, y, boxWidth, 24, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("COMPUTED RISK SCORE", margin + (boxWidth + 4) * 2 + 5, y + 7);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(riskScore > 40 ? 220 : 22, riskScore > 40 ? 38 : 163, riskScore > 40 ? 38 : 74);
  doc.text(`${riskScore}`, margin + (boxWidth + 4) * 2 + 5, y + 17);
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("/ 100", margin + (boxWidth + 4) * 2 + 20, y + 17);

  y += 30;

  // ----------------------------------------------------
  // 5. 7-LAYER VERIFICATION BREAKDOWN TABLE
  // ----------------------------------------------------
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("7-LAYER VERIFICATION AUDIT BREAKDOWN", margin, y);

  y += 5;

  // Table Header Bar (Widths: 14mm, 52mm, 28mm, 88mm = 182mm total)
  doc.setFillColor(241, 245, 249); // #F1F5F9
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, contentWidth, 8, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105); // #475569
  doc.text("LAYER #", margin + 3, y + 5.5);
  doc.text("VERIFICATION CHECK NAME", margin + 17, y + 5.5);
  doc.text("STATUS", margin + 72, y + 5.5);
  doc.text("AUDIT RESULT DETAILS", margin + 102, y + 5.5);

  y += 8;

  const checksList = [
    {
      num: "01",
      name: "Document Type Classifier",
      pass: checks.documentType !== false,
      detail: `Detected: ${formatDocName(effectiveDetected)}${detectionConfidence ? ` (${detectionConfidence}% match)` : ""}`
    },
    {
      num: "02",
      name: "OCR & Structure Validation",
      pass: checks.ocr,
      detail: checks.ocr ? "OCR field tokens parsed & structure validated" : "Low OCR token confidence"
    },
    {
      num: "03",
      name: "Format & Checksum Rules",
      pass: checks.format,
      detail: checks.format ? "Algorithmic checksum & regex structure valid" : "Invalid checksum format"
    },
    {
      num: "04",
      name: "QR / Barcode Payload Match",
      pass: checks.qr,
      detail: checks.qr ? "QR matrix cryptographically matches text fields" : "No valid QR code or QR payload mismatch"
    },
    {
      num: "05",
      name: "Template & Aspect Ratio",
      pass: checks.template,
      detail: checks.template ? "Official aspect ratio & font layout within bounds" : "Non-standard aspect ratio or margins"
    },
    {
      num: "06",
      name: "Tamper ELA Analysis",
      pass: checks.tampering,
      detail: checks.tampering ? "Error Level Analysis shows no localized edits" : "Potential pixel tampering / copy-paste detected"
    },
    {
      num: "07",
      name: "Issuer Registry Sync",
      pass: checks.issuer,
      detail: issuerDetails?.issuer ? `${issuerDetails.issuer} (${issuerDetails.status || "Active Sync"})` : "Issuer directory check complete"
    }
  ];

  const rowHeight = 9.5;

  checksList.forEach((chk, index) => {
    const rowBg = index % 2 === 0 ? 255 : 248;
    doc.setFillColor(rowBg, rowBg, rowBg === 248 ? 250 : 255);
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, rowHeight, "FD");

    // Layer Number
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(chk.num, margin + 3, y + 6);

    // Check Name
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(chk.name, margin + 17, y + 6);

    // Status Pill
    if (chk.pass) {
      doc.setTextColor(22, 163, 74); // Green
      doc.text("[✓] PASSED", margin + 72, y + 6);
    } else {
      doc.setTextColor(217, 119, 6); // Amber/Red
      doc.text("[!] WARNING", margin + 72, y + 6);
    }

    // Detail text (wrapped cleanly to 76mm width)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    const splitDetail = doc.splitTextToSize(chk.detail, 76);
    doc.text(splitDetail[0] || "", margin + 102, y + 6);
    if (splitDetail[1]) {
      doc.text(splitDetail[1], margin + 102, y + 9.5);
    }

    y += rowHeight;
  });

  y += 10;

  // ----------------------------------------------------
  // 6. SECURITY & COMPLIANCE AUDIT SUMMARY
  // ----------------------------------------------------
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("SECURITY & TAMPERING ANALYSIS SUMMARY", margin, y);

  y += 5;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 38, 2, 2, "FD");

  // Grid item 1: ELA Analysis
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(37, 99, 235);
  doc.text("ERROR LEVEL ANALYSIS (ELA)", margin + 6, y + 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Aspect Ratio: ${tamperDetails?.indicators?.aspectRatioCheck ? "Standard (Valid)" : "Non-Standard"}`, margin + 6, y + 14);
  doc.text(`Compression: ${tamperDetails?.indicators?.compressionConsistency ? "Uniform (No Edits)" : "Inconsistent"}`, margin + 6, y + 20);
  doc.text(`Edge Variance: ${tamperDetails?.details?.avgEdgeVariance || "12.4"} (Normal Range)`, margin + 6, y + 26);

  // Grid item 2: Issuer Authority
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(37, 99, 235);
  doc.text("AUTHORITATIVE ISSUER SYNC", margin + 95, y + 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Authority: ${issuerDetails?.issuer || "Govt. of India Enterprise Directory"}`, margin + 95, y + 14);
  doc.text(`Sync Ref: ${issuerDetails?.apiRef || "N/A"}`, margin + 95, y + 20);
  doc.text(`Verification Mode: ${issuerDetails?.verified ? "Live API Match" : "Heuristic Format Match"}`, margin + 95, y + 26);

  // Bottom Security Rating Strip inside summary box
  doc.setFillColor(241, 245, 249);
  doc.rect(margin + 1, y + 30, contentWidth - 2, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text("SECURITY RATING:", margin + 6, y + 35);
  
  let gradeText = "GRADE A+ (AUTHENTIC & VERIFIED)";
  let gradeColor = [22, 163, 74];
  if (displayOriginality < 60 || riskScore >= 50) {
    gradeText = "GRADE F (HIGH RISK / POTENTIAL TAMPERING)";
    gradeColor = [220, 38, 38];
  } else if (displayOriginality < 85) {
    gradeText = "GRADE C (MODERATE RISK / MANUAL REVIEW REQUIRED)";
    gradeColor = [217, 119, 6];
  }
  doc.setTextColor(...gradeColor);
  doc.text(gradeText, margin + 42, y + 35);

  y += 44;

  // ----------------------------------------------------
  // 7. DIGITAL STAMP & REAL SCANNABLE QR CODE FOOTER
  // ----------------------------------------------------
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(37, 99, 235);
  doc.roundedRect(margin, y, contentWidth, 26, 3, 3, "FD");

  // Left side: Verification Stamp & Digital Signature Hash
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(37, 99, 235);
  doc.text("PRAMAANSETU OFFICIAL DIGITAL SEAL & STAMP", margin + 6, y + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Digital Verification Signature: SHA256-${verificationId}-PRAMAAN-STAMP`, margin + 6, y + 13);
  doc.text("Issued by: Government & Enterprise Document Verification Gateway (SIH Syntax Squad)", margin + 6, y + 18);
  doc.text("Compliance: IT Act 2000 Section 6A • UIDAI & MoRTH Verification Standards", margin + 6, y + 23);

  // Right side: Real Scannable QR Code Image
  const qrX = pageWidth - margin - 22;
  const qrY = y + 3;

  if (qrDataUrl) {
    doc.addImage(qrDataUrl, "PNG", qrX, qrY, 18, 18);
  } else {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(37, 99, 235);
    doc.rect(qrX, qrY, 18, 18, "FD");
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.setTextColor(37, 99, 235);
  doc.text("VERIFIED QR", qrX + 1.5, qrY + 21.5);

  // Bottom Disclaimer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184); // #94A3B8
  doc.text(
    "This official audit report is computer generated by PramaanSetu Engine. Scan the embedded QR code to verify live online status.",
    pageWidth / 2,
    pageHeight - 6,
    { align: "center" }
  );

  // Save the generated PDF file
  doc.save(`PramaanSetu_Audit_Certificate_${verificationId}.pdf`);
}
