/**
 * Document Classifier & Detector
 * Analyzes raw OCR text and layout signatures to determine document type
 */

export function detectDocument(text = "") {
  if (!text || typeof text !== "string") {
    return {
      documentType: "UNKNOWN",
      confidence: 0,
      keywordsFound: []
    };
  }

  const normalized = text.toUpperCase();
  const panScoreKeywords = [
    "INCOME TAX DEPARTMENT",
    "PERMANENT ACCOUNT NUMBER",
    "GOVT OF INDIA",
    "GOVERNMENT OF INDIA",
    "INCOMETAX",
    "SIGNATURE",
    "FATHER'S NAME",
    "DATE OF BIRTH"
  ];

  const dlScoreKeywords = [
    "DRIVING LICENCE",
    "DRIVING LICENSE",
    "TRANSPORT DEPARTMENT",
    "MOTOR VEHICLES",
    "LICENCE NO",
    "LICENSE NO",
    "DL NO",
    "FORM 7",
    "AUTHORISATION TO DRIVE",
    "UNION OF INDIA",
    "STATE TRANSPORT",
    "VALID TILL",
    "DOB",
    "BLOOD GROUP"
  ];

  const aadhaarKeywords = [
    "UNIQUE IDENTIFICATION AUTHORITY OF INDIA",
    "AADHAAR",
    "GOVERNMENT OF INDIA",
    "MERA AADHAAR",
    "ENROLMENT NO"
  ];

  // Regex patterns
  const panPattern = /[A-Z]{5}[0-9]{4}[A-Z]/;
  const dlPattern = /[A-Z]{2}[0-9]{2}[ -]?[0-9]{11}/;
  const aadhaarPattern = /\b\d{4}\s?\d{4}\s?\d{4}\b/;

  let panMatches = [];
  let dlMatches = [];
  let aadhaarMatches = [];

  panScoreKeywords.forEach((kw) => {
    if (normalized.includes(kw)) panMatches.push(kw);
  });

  dlScoreKeywords.forEach((kw) => {
    if (normalized.includes(kw)) dlMatches.push(kw);
  });

  aadhaarKeywords.forEach((kw) => {
    if (normalized.includes(kw)) aadhaarMatches.push(kw);
  });

  let panScore = panMatches.length * 20 + (panPattern.test(normalized) ? 40 : 0);
  let dlScore = dlMatches.length * 20 + (dlPattern.test(normalized) ? 40 : 0);
  let aadhaarScore = aadhaarMatches.length * 25 + (aadhaarPattern.test(normalized) ? 40 : 0);

  if (panScore > dlScore && panScore > aadhaarScore && panScore >= 20) {
    return {
      documentType: "PAN",
      confidence: Math.min(100, panScore),
      keywordsFound: panMatches
    };
  }

  if (dlScore > panScore && dlScore > aadhaarScore && dlScore >= 20) {
    return {
      documentType: "DRIVING_LICENSE",
      confidence: Math.min(100, dlScore),
      keywordsFound: dlMatches
    };
  }

  if (aadhaarScore > 30) {
    return {
      documentType: "AADHAAR",
      confidence: Math.min(100, aadhaarScore),
      keywordsFound: aadhaarMatches
    };
  }

  // Secondary checks based purely on regex if keywords are slightly obscured
  if (panPattern.test(normalized)) {
    return {
      documentType: "PAN",
      confidence: 60,
      keywordsFound: ["PAN_REGEX_MATCH"]
    };
  }

  if (dlPattern.test(normalized)) {
    return {
      documentType: "DRIVING_LICENSE",
      confidence: 60,
      keywordsFound: ["DL_REGEX_MATCH"]
    };
  }

  return {
    documentType: "UNKNOWN",
    confidence: 0,
    keywordsFound: []
  };
}

/**
 * Smart OCR Character Normalization for PAN numbers
 * Fixes common Tesseract misreads (0/O, 1/I/L, 5/S, 8/B, 2/Z) based on PAN positional structure
 */
export function fixPanOcrErrors(token = "") {
  const clean = token.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  if (clean.length !== 10) return clean;

  const charToAlpha = { "0": "O", "1": "I", "5": "S", "8": "B", "2": "Z", "6": "G" };
  const charToNum = { "I": "1", "L": "1", "|": "1", "O": "0", "Q": "0", "S": "5", "B": "8", "Z": "2", "G": "6", "T": "7" };

  let fixed = "";

  // Positions 1-5 must be alpha
  for (let i = 0; i < 5; i++) {
    const c = clean[i];
    fixed += /[A-Z]/.test(c) ? c : (charToAlpha[c] || c);
  }

  // Positions 6-9 must be numeric
  for (let i = 5; i < 9; i++) {
    const c = clean[i];
    fixed += /[0-9]/.test(c) ? c : (charToNum[c] || c);
  }

  // Position 10 must be alpha
  const last = clean[9];
  fixed += /[A-Z]/.test(last) ? last : (charToAlpha[last] || last);

  return fixed;
}

/**
 * Field Extractor for PAN and Driving Licence from raw OCR text
 * Uses sliding window algorithm across sanitized lines to extract ID numbers despite OCR noise, spaces, or punctuation
 */
export function extractFields(documentType, text = "") {
  if (!text) return {};
  const rawLines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const normalizedText = text.toUpperCase();

  if (documentType === "PAN") {
    let pan = null;

    // 1. Direct Regex Match
    const panRegex = /[A-Z]{5}[0-9]{4}[A-Z]/g;
    const exactMatches = normalizedText.match(panRegex);
    if (exactMatches && exactMatches.length > 0) {
      pan = exactMatches[0];
    }

    // 2. Sliding Window Extractor over line-by-line sanitized alphanumeric strings
    if (!pan) {
      for (const line of rawLines) {
        const cleanLine = line.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
        if (cleanLine.length >= 10) {
          for (let i = 0; i <= cleanLine.length - 10; i++) {
            const windowToken = cleanLine.substring(i, i + 10);
            const fixed = fixPanOcrErrors(windowToken);
            if (/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(fixed)) {
              pan = fixed;
              break;
            }
          }
        }
        if (pan) break;
      }
    }

    // 3. Fallback: Search across whole document text with spaces/punctuation stripped
    if (!pan) {
      const fullClean = normalizedText.replace(/[^A-Za-z0-9]/g, "");
      if (fullClean.length >= 10) {
        for (let i = 0; i <= fullClean.length - 10; i++) {
          const windowToken = fullClean.substring(i, i + 10);
          const fixed = fixPanOcrErrors(windowToken);
          if (/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(fixed)) {
            pan = fixed;
            break;
          }
        }
      }
    }

    // Extract DOB (DD/MM/YYYY)
    const dobRegex = /\b(0[1-9]|[12][0-9]|3[01])[\/\.-](0[1-9]|1[012])[\/\.-](19|20)\d\d\b/;
    const dobMatch = text.match(dobRegex);
    const dob = dobMatch ? dobMatch[0] : null;

    // Extract Name & Father's Name heuristic
    let name = null;
    let fatherName = null;

    for (let i = 0; i < rawLines.length; i++) {
      const lineUpper = rawLines[i].toUpperCase();
      if (lineUpper.includes("NAME") && !lineUpper.includes("FATHER") && i + 1 < rawLines.length) {
        if (!name) name = rawLines[i + 1].replace(/[^A-Za-z\s]/g, "").trim();
      }
      if (lineUpper.includes("FATHER") && i + 1 < rawLines.length) {
        if (!fatherName) fatherName = rawLines[i + 1].replace(/[^A-Za-z\s]/g, "").trim();
      }
    }

    if (!name) {
      const candidates = rawLines.filter((l) => {
        const u = l.toUpperCase();
        return (
          /^[A-Z\s]{3,30}$/.test(l) &&
          !u.includes("INCOME TAX") &&
          !u.includes("GOVT OF INDIA") &&
          !u.includes("PERMANENT ACCOUNT") &&
          !u.includes("CARD") &&
          !u.includes("SIGNATURE")
        );
      });
      if (candidates.length > 0) name = candidates[0].trim();
      if (candidates.length > 1) fatherName = candidates[1].trim();
    }

    return {
      pan: pan || "NOT_DETECTED",
      name: name || "UNKNOWN",
      fatherName: fatherName || "UNKNOWN",
      dob: dob || "NOT_DETECTED"
    };
  }

  if (documentType === "DRIVING_LICENSE") {
    let dlNumber = null;

    // 1. Exact DL Pattern Match
    const dlRegex = /[A-Z]{2}[0-9]{2}[ -]?[0-9]{4}[0-9]{7,8}/;
    const dlMatch = normalizedText.match(dlRegex);
    if (dlMatch) {
      dlNumber = dlMatch[0].replace(/\s+/g, "");
    }

    // 2. Sliding Window Extractor over sanitized lines for 15-character DL string
    if (!dlNumber) {
      for (const line of rawLines) {
        const cleanLine = line.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
        if (cleanLine.length >= 15) {
          for (let i = 0; i <= cleanLine.length - 15; i++) {
            const windowToken = cleanLine.substring(i, i + 15);
            // 2 State letters + 2 digits + 4 digits + 7 digits
            if (/^[A-Z]{2}[0-9]{2}[0-9]{4}[0-9]{7}$/.test(windowToken)) {
              dlNumber = windowToken;
              break;
            }
          }
        }
        if (dlNumber) break;
      }
    }

    const dobRegex = /\b(0[1-9]|[12][0-9]|3[01])[\/\.-](0[1-9]|1[012])[\/\.-](19|20)\d\d\b/g;
    const dobMatches = text.match(dobRegex);
    const dob = dobMatches && dobMatches.length > 0 ? dobMatches[0] : null;
    const expiry = dobMatches && dobMatches.length > 1 ? dobMatches[1] : null;

    let name = null;
    for (let i = 0; i < rawLines.length; i++) {
      const u = rawLines[i].toUpperCase();
      if ((u.includes("NAME") || u.includes("HOLDER")) && i + 1 < rawLines.length) {
        name = rawLines[i + 1].replace(/[^A-Za-z\s]/g, "").trim();
        break;
      }
    }

    if (!name) {
      const candidates = rawLines.filter((l) => /^[A-Z\s]{4,30}$/.test(l.toUpperCase()) && !l.toUpperCase().includes("DRIVING") && !l.toUpperCase().includes("LICENCE"));
      if (candidates.length > 0) name = candidates[0].trim();
    }

    const stateCode = dlNumber ? dlNumber.substring(0, 2) : "UNKNOWN";

    return {
      dlNumber: dlNumber || "NOT_DETECTED",
      name: name || "UNKNOWN",
      dob: dob || "NOT_DETECTED",
      validTill: expiry || "NOT_SPECIFIED",
      stateCode
    };
  }

  return {};
}
