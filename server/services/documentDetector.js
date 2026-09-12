/**
 * Document Classifier & Field Extractor Suite
 * Detects and extracts identity fields across 7 Indian Document Types
 */

export function fixPanOcrErrors(token = "") {
  const clean = token.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  if (clean.length !== 10) return clean;

  const charToAlpha = { "0": "O", "1": "I", "5": "S", "8": "B", "2": "Z", "6": "G" };
  const charToNum = { "I": "1", "L": "1", "|": "1", "O": "0", "Q": "0", "S": "5", "B": "8", "Z": "2", "G": "6", "T": "7" };

  let fixed = "";
  for (let i = 0; i < 5; i++) {
    const c = clean[i];
    fixed += /[A-Z]/.test(c) ? c : (charToAlpha[c] || c);
  }
  for (let i = 5; i < 9; i++) {
    const c = clean[i];
    fixed += /[0-9]/.test(c) ? c : (charToNum[c] || c);
  }
  const last = clean[9];
  fixed += /[A-Z]/.test(last) ? last : (charToAlpha[last] || last);

  return fixed;
}

export function detectDocument(text = "") {
  if (!text || typeof text !== "string") {
    return { documentType: "UNKNOWN", confidence: 0, keywordsFound: [] };
  }

  const normalized = text.toUpperCase();

  const panKeywords = ["INCOME TAX DEPARTMENT", "PERMANENT ACCOUNT NUMBER", "GOVT OF INDIA", "GOVERNMENT OF INDIA", "INCOMETAX", "FATHER'S NAME"];
  const dlKeywords = ["DRIVING LICENCE", "DRIVING LICENSE", "TRANSPORT DEPARTMENT", "MOTOR VEHICLES", "LICENCE NO", "DL NO", "AUTHORISATION TO DRIVE"];
  const aadhaarKeywords = ["UNIQUE IDENTIFICATION AUTHORITY OF INDIA", "AADHAAR", "MERA AADHAAR", "ENROLMENT NO", "VID :"];
  const voterKeywords = ["ELECTION COMMISSION OF INDIA", "ELECTORAL PHOTO IDENTITY CARD", "EPIC", "ELECTOR'S NAME"];
  const passportKeywords = ["REPUBLIC OF INDIA", "PASSPORT", "PASSPORT NO", "P<IND", "GIVEN NAME(S)"];
  const rcKeywords = ["REGISTRATION CERTIFICATE", "MOTOR VEHICLES DEPARTMENT", "CHASSIS NO", "ENGINE NO", "UNLADEN WT", "VEHICLE CLASS"];
  const gstinKeywords = ["GOODS AND SERVICES TAX", "GSTIN", "REGISTRATION CERTIFICATE", "TAX PERIOD", "TRADE NAME"];

  const panPattern = /[A-Z]{5}[0-9]{4}[A-Z]/;
  const dlPattern = /[A-Z]{2}[0-9]{2}[ -]?[0-9]{4}[0-9]{7}/;
  const aadhaarPattern = /\b\d{4}\s?\d{4}\s?\d{4}\b/;
  const voterPattern = /[A-Z]{3}[0-9]{7}/;
  const passportPattern = /[A-Z]{1}[0-9]{7}/;
  const rcPattern = /[A-Z]{2}[0-9]{2}[A-Z]{1,3}[0-9]{4}/;
  const gstinPattern = /[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}/;

  const countMatches = (list) => list.filter((kw) => normalized.includes(kw));

  const scores = [
    { type: "PAN", score: countMatches(panKeywords).length * 20 + (panPattern.test(normalized) ? 40 : 0), matches: countMatches(panKeywords) },
    { type: "DRIVING_LICENSE", score: countMatches(dlKeywords).length * 20 + (dlPattern.test(normalized) ? 40 : 0), matches: countMatches(dlKeywords) },
    { type: "AADHAAR", score: countMatches(aadhaarKeywords).length * 25 + (aadhaarPattern.test(normalized) ? 40 : 0), matches: countMatches(aadhaarKeywords) },
    { type: "VOTER_ID", score: countMatches(voterKeywords).length * 25 + (voterPattern.test(normalized) ? 40 : 0), matches: countMatches(voterKeywords) },
    { type: "PASSPORT", score: countMatches(passportKeywords).length * 25 + (passportPattern.test(normalized) ? 40 : 0), matches: countMatches(passportKeywords) },
    { type: "VEHICLE_RC", score: countMatches(rcKeywords).length * 25 + (rcPattern.test(normalized) ? 40 : 0), matches: countMatches(rcKeywords) },
    { type: "GSTIN", score: countMatches(gstinKeywords).length * 25 + (gstinPattern.test(normalized) ? 40 : 0), matches: countMatches(gstinKeywords) }
  ];

  scores.sort((a, b) => b.score - a.score);
  const best = scores[0];

  if (best && best.score >= 20) {
    return { documentType: best.type, confidence: Math.min(100, best.score), keywordsFound: best.matches };
  }

  return { documentType: "UNKNOWN", confidence: 0, keywordsFound: [] };
}

/**
 * Universal Field Extractor for all 7 Document Types
 */
export function extractFields(documentType, text = "") {
  if (!text) return {};
  const rawLines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const normalizedText = text.toUpperCase();

  switch (documentType) {
    case "PAN": {
      let pan = null;
      const exactMatches = normalizedText.match(/[A-Z]{5}[0-9]{4}[A-Z]/g);
      if (exactMatches) pan = exactMatches[0];

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

      const dobMatch = text.match(/\b(0[1-9]|[12][0-9]|3[01])[\/\.-](0[1-9]|1[012])[\/\.-](19|20)\d\d\b/);
      let name = null;
      let fatherName = null;

      for (let i = 0; i < rawLines.length; i++) {
        const u = rawLines[i].toUpperCase();
        if (u.includes("NAME") && !u.includes("FATHER") && i + 1 < rawLines.length) {
          if (!name) name = rawLines[i + 1].replace(/[^A-Za-z\s]/g, "").trim();
        }
        if (u.includes("FATHER") && i + 1 < rawLines.length) {
          if (!fatherName) fatherName = rawLines[i + 1].replace(/[^A-Za-z\s]/g, "").trim();
        }
      }

      return {
        pan: pan || "NOT_DETECTED",
        name: name || "UNKNOWN",
        fatherName: fatherName || "UNKNOWN",
        dob: dobMatch ? dobMatch[0] : "NOT_DETECTED"
      };
    }

    case "DRIVING_LICENSE": {
      let dlNumber = null;
      const dlMatch = normalizedText.match(/[A-Z]{2}[0-9]{2}[ -]?[0-9]{4}[0-9]{7}/);
      if (dlMatch) dlNumber = dlMatch[0].replace(/\s+/g, "");

      if (!dlNumber) {
        for (const line of rawLines) {
          const cleanLine = line.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
          if (cleanLine.length >= 15) {
            for (let i = 0; i <= cleanLine.length - 15; i++) {
              const tok = cleanLine.substring(i, i + 15);
              if (/^[A-Z]{2}[0-9]{2}[0-9]{4}[0-9]{7}$/.test(tok)) {
                dlNumber = tok;
                break;
              }
            }
          }
          if (dlNumber) break;
        }
      }

      const dobMatches = text.match(/\b(0[1-9]|[12][0-9]|3[01])[\/\.-](0[1-9]|1[012])[\/\.-](19|20)\d\d\b/g);

      return {
        dlNumber: dlNumber || "NOT_DETECTED",
        name: "UNKNOWN",
        dob: dobMatches && dobMatches.length > 0 ? dobMatches[0] : "NOT_DETECTED",
        validTill: dobMatches && dobMatches.length > 1 ? dobMatches[1] : "NOT_SPECIFIED",
        stateCode: dlNumber ? dlNumber.substring(0, 2) : "UNKNOWN"
      };
    }

    case "AADHAAR": {
      let aadhaarNumber = null;
      const match = normalizedText.match(/\b\d{4}\s?\d{4}\s?\d{4}\b/);
      if (match) aadhaarNumber = match[0].replace(/\s+/g, "");

      if (!aadhaarNumber) {
        const maskedMatch = normalizedText.match(/X{4}\s?X{4}\s?\d{4}/i);
        if (maskedMatch) aadhaarNumber = maskedMatch[0].replace(/\s+/g, "");
      }

      return {
        aadhaarNumber: aadhaarNumber || "NOT_DETECTED",
        name: "UNKNOWN",
        dob: "NOT_DETECTED",
        gender: normalizedText.includes("FEMALE") ? "FEMALE" : normalizedText.includes("MALE") ? "MALE" : "NOT_SPECIFIED"
      };
    }

    case "VOTER_ID": {
      let epicNumber = null;
      const match = normalizedText.match(/[A-Z]{3}[0-9]{7}/);
      if (match) epicNumber = match[0];

      return {
        epicNumber: epicNumber || "NOT_DETECTED",
        name: "UNKNOWN",
        assemblyConstituency: "STATE ELECTORAL ROLL"
      };
    }

    case "PASSPORT": {
      let passportNumber = null;
      const match = normalizedText.match(/[A-Z]{1}[0-9]{7}/);
      if (match) passportNumber = match[0];

      return {
        passportNumber: passportNumber || "NOT_DETECTED",
        name: "UNKNOWN",
        nationality: "IND",
        expiryDate: "NOT_DETECTED"
      };
    }

    case "VEHICLE_RC": {
      let vehicleNumber = null;
      const match = normalizedText.match(/[A-Z]{2}[0-9]{2}[A-Z]{1,3}[0-9]{4}/);
      if (match) vehicleNumber = match[0];

      return {
        vehicleNumber: vehicleNumber || "NOT_DETECTED",
        ownerName: "UNKNOWN",
        vehicleClass: "LMV / MOTOR VEHICLE",
        chassisNo: "NOT_DETECTED"
      };
    }

    case "GSTIN": {
      let gstinNumber = null;
      const match = normalizedText.match(/[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}/);
      if (match) gstinNumber = match[0];

      return {
        gstinNumber: gstinNumber || "NOT_DETECTED",
        legalName: "REGISTERED TAXPAYER",
        taxpayerType: "REGULAR",
        stateCode: gstinNumber ? gstinNumber.substring(0, 2) : "UNKNOWN"
      };
    }

    default:
      return {};
  }
}
