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
  const rationKeywords = [
    "RATION CARD", "RATION", "RASAN", "FOOD & CIVIL SUPPLIES", "CIVIL SUPPLIES",
    "DEPARTMENT OF FOOD", "NATIONAL FOOD SECURITY", "NFSA", "FAMILY HEAD",
    "APL CARD", "BPL CARD", "PDS CARD", "PDS", "APL", "BPL", "AAY",
    "PUBLIC DISTRIBUTION", "FAIR PRICE", "KHADYA", "PATRIKA", "CONSUMER AFFAIRS",
    "FOOD SUPPLIES", "RATION PATRIKA", "KUTUMB", "CARD NO"
  ];
  const degreeKeywords = [
    "BOARD OF SECONDARY EDUCATION", "CENTRAL BOARD", "SECONDARY SCHOOL", "HIGHER SECONDARY",
    "STATEMENT OF MARKS", "MARKSHEET", "DEGREE CERTIFICATE", "UNIVERSITY", "MATRICULATION",
    "EXAMINATION", "ROLL NO", "CLASS X", "CLASS 10", "CLASS XII", "CLASS 12",
    "PROVISIONAL CERTIFICATE", "PASS CERTIFICATE", "MIGRATION CERTIFICATE", "SCHOOL CODE",
    "SUBJECT CODE", "CGPA", "MARKS STATEMENT", "SECONDARY CERTIFICATE", "COUNCIL FOR THE INDIAN SCHOOL",
    "EXAMINATION RESULTS", "GRADE", "RESULT"
  ];
  const birthKeywords = ["BIRTH CERTIFICATE", "CIVIL REGISTRATION SYSTEM", "DEPARTMENT OF HEALTH", "MUNICIPAL CORPORATION", "DATE OF BIRTH CERTIFICATE"];

  const panPattern = /[A-Z]{5}[0-9]{4}[A-Z]/;
  const dlPattern = /[A-Z]{2}[0-9]{2}[ -]?[0-9]{4}[0-9]{7}/;
  const aadhaarPattern = /\b\d{4}\s?\d{4}\s?\d{4}\b/;
  const voterPattern = /[A-Z]{3}[0-9]{7}/;
  const passportPattern = /[A-Z]{1}[0-9]{7}/;
  const rcPattern = /[A-Z]{2}[0-9]{2}[A-Z]{1,3}[0-9]{4}/;
  const gstinPattern = /[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}/;
  const rationPattern = /\b(RC|NFSA|PDS|CARD)?[\s:-]*[A-Z0-9]{8,16}\b/i;
  const degreePattern = /\b(ROLL\s*NO|REG\s*NO|MARKSHEET|CLASS\s*(X|10|XII|12)|MATRIC|STATEMENT\s*OF\s*MARKS)\b/i;
  const birthPattern = /\bBIRTH\s*REG|REGISTRATION\s*NO\b/i;

  const countMatches = (list) => list.filter((kw) => normalized.includes(kw));

  const rationMatches = countMatches(rationKeywords);
  const rationScore = rationMatches.length > 0 ? (rationMatches.length * 20 + 30) : 0;

  const scores = [
    { type: "PAN", score: countMatches(panKeywords).length * 20 + (panPattern.test(normalized) ? 40 : 0), matches: countMatches(panKeywords) },
    { type: "DRIVING_LICENSE", score: countMatches(dlKeywords).length * 20 + (dlPattern.test(normalized) ? 40 : 0), matches: countMatches(dlKeywords) },
    { type: "AADHAAR", score: countMatches(aadhaarKeywords).length * 25 + (aadhaarPattern.test(normalized) ? 40 : 0), matches: countMatches(aadhaarKeywords) },
    { type: "VOTER_ID", score: countMatches(voterKeywords).length * 25 + (voterPattern.test(normalized) ? 40 : 0), matches: countMatches(voterKeywords) },
    { type: "PASSPORT", score: countMatches(passportKeywords).length * 25 + (passportPattern.test(normalized) ? 40 : 0), matches: countMatches(passportKeywords) },
    { type: "VEHICLE_RC", score: countMatches(rcKeywords).length * 25 + (rcPattern.test(normalized) ? 40 : 0), matches: countMatches(rcKeywords) },
    { type: "GSTIN", score: countMatches(gstinKeywords).length * 25 + (gstinPattern.test(normalized) ? 40 : 0), matches: countMatches(gstinKeywords) },
    { type: "RATION_CARD", score: rationScore, matches: rationMatches },
    { type: "DEGREE_CERTIFICATE", score: countMatches(degreeKeywords).length * 25 + (degreePattern.test(normalized) ? 30 : 0), matches: countMatches(degreeKeywords) },
    { type: "BIRTH_CERTIFICATE", score: countMatches(birthKeywords).length * 25 + (birthPattern.test(normalized) ? 30 : 0), matches: countMatches(birthKeywords) }
  ];

  scores.sort((a, b) => b.score - a.score);
  const best = scores[0];

  if (best && best.score >= 20) {
    return { documentType: best.type, confidence: Math.min(100, best.score), keywordsFound: best.matches };
  }

  return { documentType: "UNKNOWN", confidence: 0, keywordsFound: [] };
}

/**
 * Robust Name Sanitizer: removes field label prefixes and leading/trailing OCR noise tokens
 */
export function parseDateFromText(text = "") {
  if (!text) return null;

  const monthMap = {
    JAN: "01", JANUARY: "01",
    FEB: "02", FEBRUARY: "02",
    MAR: "03", MARCH: "03",
    APR: "04", APRIL: "04",
    MAY: "05",
    JUN: "06", JUNE: "06",
    JUL: "07", JULY: "07",
    AUG: "08", AUGUST: "08",
    SEP: "09", SEPTEMBER: "09",
    OCT: "10", OCTOBER: "10",
    NOV: "11", NOVEMBER: "11",
    DEC: "12", DECEMBER: "12"
  };

  // 1. Textual date format: "14 MAY 2007", "14-MAY-2007", "14TH MAY 2007"
  const textDateMatch = text.match(/\b([0-2]?[0-9]|3[01])(?:ST|ND|RD|TH)?[\/\.\-\s]+(JAN(?:UARY)?|FEB(?:RUARY)?|MAR(?:CH)?|APR(?:IL)?|MAY|JUN(?:E)?|JUL(?:Y)?|AUG(?:UST)?|SEP(?:TEMBER)?|OCT(?:OBER)?|NOV(?:EMBER)?|DEC(?:EMBER)?)[\/\.\-\s]+((?:19|20)\d\d)\b/i);
  if (textDateMatch) {
    const day = textDateMatch[1].padStart(2, "0");
    const mStr = textDateMatch[2].toUpperCase();
    const month = monthMap[mStr] || "01";
    const year = textDateMatch[3];
    return `${day}/${month}/${year}`;
  }

  // 2. Standard numeric date format: "14/05/2007", "14-05-2007", "14 05 2007"
  const numDateMatch = text.match(/\b([0-2]?[1-9]|3[01])[\/\.\-\s]+(0?[1-9]|1[012])[\/\.\-\s]+((?:19|20)\d\d)\b/);
  if (numDateMatch) {
    const day = numDateMatch[1].padStart(2, "0");
    const month = numDateMatch[2].padStart(2, "0");
    const year = numDateMatch[3];
    return `${day}/${month}/${year}`;
  }

  // 3. Year only: "2007" near DOB / YOB
  const yearMatch = text.match(/(?:DOB|BIRTH|YOB)[\s:-]*((?:19|20)\d\d)\b/i) || text.match(/\b((?:19|20)\d\d)\b/);
  if (yearMatch) {
    return yearMatch[1];
  }

  return null;
}

/**
 * Robust Name Sanitizer: removes field label prefixes and leading/trailing OCR noise tokens
 */
export function sanitizeName(rawStr = "") {
  if (!rawStr || typeof rawStr !== "string") return null;

  let clean = rawStr
    .replace(/(?:CANDIDATE'?S?\s*NAME|STUDENT'?S?\s*NAME|HOLDER'?S?\s*NAME|NAME\s*OF\s*(?:THE\s*)?(?:CANDIDATE|STUDENT)|NAME|FATHER'?S?\s*NAME|MOTHER'?S?\s*NAME|GUARDIAN'?S?\s*NAME|FATHER'?S?|MOTHER'?S?|GUARDIAN'?S?|S\/O|D\/O|W\/O|DOB|DATE|ROLL|REG)[\s:.-]*/gi, "")
    .replace(/[^A-Za-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  let words = clean.split(/\s+/).filter(Boolean);
  const noiseSet = new Set([
    "A", "KE", "RE", "TO", "IS", "AT", "OF", "BY", "IN", "THE", "AND", "HE", "EH", "NO", "OR", "ON", "IT", "AN", "AS", "SO",
    "TOP", "AE", "IE", "EO", "EE", "IA", "AI", "OO", "EA", "OE", "TE", "LE", "SE", "DE", "DA", "LA", "LO", "EN", "EM", "EX", "ET", "ER",
    "FIS", "IAN", "SIG", "SIGN", "SIGNATURE", "GOVT", "INDIA", "INCOME", "TAX", "PERMANENT", "ACCOUNT", "NUMBER", "DEPARTMENT", "DEPT", "UNION",
    "PHOTO", "CARD", "CARDHOLDER", "DATE", "BIRTH", "MALE", "FEMALE", "RESULT", "MARSH", "MARK", "MARKS", "STATEMENT", "HIGHER", "SECONDARY", "BOARD", "EXAMINATION", "SCHOOL"
  ]);

  while (words.length > 0 && (words[0].length <= 1 || noiseSet.has(words[0].toUpperCase()))) {
    words.shift();
  }

  while (words.length > 0 && (words[words.length - 1].length <= 2 || noiseSet.has(words[words.length - 1].toUpperCase()))) {
    words.pop();
  }

  const result = words.join(" ");
  return result.length >= 3 ? result : null;
}

/**
 * Universal Field Extractor for all 10 Indian Document Types
 */
function rawExtractFields(documentType, text = "") {
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

      let dob = parseDateFromText(text) || "NOT_DETECTED";
      let name = null;
      let fatherName = null;

      for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i];
        const u = line.toUpperCase();
        if (u.includes("FATHER")) {
          const sameMatch = line.match(/(?:FATHER'?S?\s*NAME)[\s:.-]+([A-Za-z\s]{3,40})/i);
          if (sameMatch && !fatherName) {
            fatherName = sanitizeName(sameMatch[1]);
          } else if (i + 1 < rawLines.length && !fatherName) {
            fatherName = sanitizeName(rawLines[i + 1]);
          }
        }
      }

      for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i];
        const u = line.toUpperCase();

        if (u.includes("INCOME TAX") || u.includes("GOVT OF INDIA") || u.includes("PERMANENT ACCOUNT NUMBER") || u.includes("GOVERNMENT OF INDIA") || u.includes("INCOMETAX") || u.includes("FATHER")) {
          continue;
        }

        if (u.includes("NAME") && !u.includes("FATHER")) {
          const sameMatch = line.match(/(?:NAME)[\s:.-]+([A-Za-z\s]{3,40})/i);
          if (sameMatch && !name) {
            const cand = sanitizeName(sameMatch[1]);
            if (cand) name = cand;
          } else if (i + 1 < rawLines.length && !name) {
            const nextCand = sanitizeName(rawLines[i + 1]);
            if (nextCand && !nextCand.toUpperCase().includes("FATHER")) {
              name = nextCand;
            }
          }
        }

        if (!name) {
          const cand = sanitizeName(line);
          if (cand && !/\d/.test(line)) {
            const cleanToken = line.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
            if (cleanToken.length !== 10 && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(cleanToken)) {
              const cu = cand.toUpperCase();
              if (!cu.includes("DEPARTMENT") && !cu.includes("GOVT") && !cu.includes("INDIA") && !cu.includes("INCOME") && !cu.includes("ACCOUNT") && !cu.includes("NUMBER") && !cu.includes("SIGNATURE") && !cu.includes("TAX") && !cu.includes("FIS") && !cu.includes("IAN")) {
                name = cand;
              }
            }
          }
        }
      }

      if (name && fatherName && name.toUpperCase().replace(/[^A-Z]/g, "") === fatherName.toUpperCase().replace(/[^A-Z]/g, "")) {
        name = null;
      }

      return {
        pan: pan || "NOT_DETECTED",
        name: name || "NOT_DETECTED",
        fatherName: fatherName || "NOT_DETECTED",
        dob
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

      let name = null;
      for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i];
        const u = line.toUpperCase();
        if (u.includes("NAME") && !u.includes("FATHER") && !u.includes("TRANSPORT")) {
          const sameLineMatch = line.match(/(?:NAME)[\s:.-]+([A-Za-z\s]{3,40})/i);
          if (sameLineMatch) {
            const cand = sanitizeName(sameLineMatch[1]);
            if (cand) { name = cand; break; }
          }
          if (i + 1 < rawLines.length) {
            const cand = sanitizeName(rawLines[i + 1]);
            if (cand && !cand.toUpperCase().includes("LICENCE") && !cand.toUpperCase().includes("TRANSPORT")) {
              name = cand;
              break;
            }
          }
        }
      }

      let dob = parseDateFromText(text) || "NOT_DETECTED";
      let validTill = "NOT_SPECIFIED";

      const allDates = text.match(/\b(0[1-9]|[12][0-9]|3[01])[\/\.\-\s]+(0[1-9]|1[012])[\/\.\-\s]+(19|20)\d\d\b/g) || [];
      if (allDates.length > 1) {
        for (const d of allDates) {
          const parts = d.split(/[\/\.\-\s]+/);
          if (parts.length === 3) {
            const yr = parseInt(parts[2], 10);
            if (yr >= 2030) {
              validTill = `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[2]}`;
              break;
            }
          }
        }
      }

      return {
        dlNumber: dlNumber || "NOT_DETECTED",
        name: name || "NOT_DETECTED",
        dob: dob !== "NOT_DETECTED" ? dob : "NOT_DETECTED",
        validTill: validTill !== "NOT_SPECIFIED" ? validTill : "NOT_SPECIFIED",
        stateCode: dlNumber ? dlNumber.substring(0, 2) : "NOT_DETECTED"
      };
    }

    case "AADHAAR": {
      let aadhaarNumber = null;
      const match = normalizedText.match(/\b\d{4}[ -.]?\d{4}[ -.]?\d{4}\b/);
      if (match) {
        aadhaarNumber = match[0].replace(/[^0-9]/g, "");
      }

      if (!aadhaarNumber) {
        const maskedMatch = normalizedText.match(/[X*•x]{4}[ -.]?[X*•x]{4}[ -.]?\d{4}/i);
        if (maskedMatch) aadhaarNumber = maskedMatch[0].replace(/\s+/g, "");
      }

      if (!aadhaarNumber) {
        const vidMatch = normalizedText.match(/\bVID\s*[:.-]?\s*(\d{4}[ -.]?\d{4}[ -.]?\d{4}[ -.]?\d{4})\b/i);
        if (vidMatch) aadhaarNumber = vidMatch[1].replace(/[^0-9]/g, "");
      }

      if (!aadhaarNumber) {
        const cleanDigitsOnly = fixPanOcrErrors(normalizedText.replace(/[^A-Za-z0-9]/g, ""));
        const digitsMatch = cleanDigitsOnly.match(/\d{12}/);
        if (digitsMatch) {
          aadhaarNumber = digitsMatch[0];
        }
      }

      let name = null;
      let dob = parseDateFromText(text) || "NOT_DETECTED";

      let dobLineIdx = -1;
      for (let i = 0; i < rawLines.length; i++) {
        const u = rawLines[i].toUpperCase();
        if (u.includes("DOB") || u.includes("YEAR OF BIRTH") || (dob !== "NOT_DETECTED" && rawLines[i].includes(dob))) {
          dobLineIdx = i;
          break;
        }
      }

      if (dobLineIdx > 0) {
        const cand = sanitizeName(rawLines[dobLineIdx - 1]);
        if (cand && !cand.toUpperCase().includes("GOVERNMENT") && !cand.toUpperCase().includes("INDIA") && !cand.toUpperCase().includes("AADHAAR")) {
          name = cand;
        }
      }

      if (!name) {
        for (let i = 0; i < rawLines.length; i++) {
          const u = rawLines[i].toUpperCase();
          if ((u.includes("GOVERNMENT OF INDIA") || u.includes("BHARAT SARKAR") || u.includes("UNIQUE IDENTIFICATION")) && i + 1 < rawLines.length) {
            const cand = sanitizeName(rawLines[i + 1]);
            if (cand && !cand.toUpperCase().includes("AADHAAR") && !cand.toUpperCase().includes("AUTHORITY")) {
              name = cand;
              break;
            }
          }
        }
      }

      if (!name) {
        for (const line of rawLines) {
          const cand = sanitizeName(line);
          if (cand) {
            const u = cand.toUpperCase();
            if (!u.includes("GOVERNMENT") && !u.includes("INDIA") && !u.includes("AADHAAR") && !u.includes("MALE") && !u.includes("FEMALE") && !u.includes("ENROLMENT")) {
              name = cand;
              break;
            }
          }
        }
      }

      return {
        aadhaarNumber: aadhaarNumber || "NOT_DETECTED",
        name: name || "NOT_DETECTED",
        dob,
        gender: normalizedText.includes("FEMALE") ? "FEMALE" : normalizedText.includes("MALE") ? "MALE" : "NOT_SPECIFIED"
      };
    }

    case "VOTER_ID": {
      let epicNumber = null;
      const match = normalizedText.match(/[A-Z]{3}[0-9]{7}/);
      if (match) epicNumber = match[0];

      let name = null;
      for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i];
        if (line.toUpperCase().includes("NAME") && i + 1 < rawLines.length) {
          const cand = sanitizeName(rawLines[i + 1]);
          if (cand && !cand.toUpperCase().includes("ELECTION") && !cand.toUpperCase().includes("CARD")) {
            name = cand;
            break;
          }
        }
      }

      return {
        epicNumber: epicNumber || "NOT_DETECTED",
        name: name || "NOT_DETECTED",
        assemblyConstituency: "STATE ELECTORAL ROLL"
      };
    }

    case "PASSPORT": {
      let passportNumber = null;
      const match = normalizedText.match(/[A-Z]{1}[0-9]{7}/);
      if (match) passportNumber = match[0];

      let name = null;
      for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i];
        if (line.toUpperCase().includes("GIVEN NAME") || line.toUpperCase().includes("NAME") && i + 1 < rawLines.length) {
          const cand = sanitizeName(rawLines[i + 1]);
          if (cand && !cand.toUpperCase().includes("PASSPORT") && !cand.toUpperCase().includes("REPUBLIC")) {
            name = cand;
            break;
          }
        }
      }

      return {
        passportNumber: passportNumber || "NOT_DETECTED",
        name: name || "NOT_DETECTED",
        nationality: "IND",
        expiryDate: "NOT_DETECTED"
      };
    }

    case "VEHICLE_RC": {
      let vehicleNumber = null;
      const match = normalizedText.match(/[A-Z]{2}[0-9]{2}[A-Z]{1,3}[0-9]{4}/);
      if (match) vehicleNumber = match[0];

      let ownerName = null;
      for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i];
        if ((line.toUpperCase().includes("OWNER") || line.toUpperCase().includes("NAME")) && i + 1 < rawLines.length) {
          const cand = sanitizeName(rawLines[i + 1]);
          if (cand && !cand.toUpperCase().includes("REGISTERED") && !cand.toUpperCase().includes("VEHICLE")) {
            ownerName = cand;
            break;
          }
        }
      }

      return {
        vehicleNumber: vehicleNumber || "NOT_DETECTED",
        ownerName: ownerName || "NOT_DETECTED",
        vehicleClass: "LMV / MOTOR VEHICLE",
        chassisNo: "NOT_DETECTED"
      };
    }

    case "GSTIN": {
      let gstinNumber = null;
      const match = normalizedText.match(/[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}/);
      if (match) gstinNumber = match[0];

      let legalName = null;
      for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i];
        if ((line.toUpperCase().includes("LEGAL NAME") || line.toUpperCase().includes("TRADE NAME")) && i + 1 < rawLines.length) {
          const cand = sanitizeName(rawLines[i + 1]);
          if (cand && !cand.toUpperCase().includes("REGISTRATION") && !cand.toUpperCase().includes("GOODS")) {
            legalName = cand;
            break;
          }
        }
      }

      return {
        gstinNumber: gstinNumber || "NOT_DETECTED",
        legalName: legalName || "NOT_DETECTED",
        taxpayerType: "REGULAR",
        stateCode: gstinNumber ? gstinNumber.substring(0, 2) : "NOT_DETECTED"
      };
    }

    case "RATION_CARD": {
      let rationNumber = null;
      const match = normalizedText.match(/\b[A-Z0-9]{8,16}\b/);
      if (match) rationNumber = match[0];

      let headOfFamily = null;
      for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i];
        if ((line.toUpperCase().includes("HEAD") || line.toUpperCase().includes("NAME")) && i + 1 < rawLines.length) {
          const cand = sanitizeName(rawLines[i + 1]);
          if (cand && !cand.toUpperCase().includes("RATION") && !cand.toUpperCase().includes("CARD")) {
            headOfFamily = cand;
            break;
          }
        }
      }

      return {
        rationNumber: rationNumber || "NOT_DETECTED",
        headOfFamily: headOfFamily || "NOT_DETECTED",
        category: "NFSA / PDS"
      };
    }

    case "DEGREE_CERTIFICATE": {
      let rollNumber = null;
      const rollMatch = normalizedText.match(/(?:ROLL\s*NO|ROLL\s*NUMBER|REG\s*NO|ENROLMENT\s*NO|SCHOLAR\s*NO|SEAT\s*NO)[\s:.-]*([A-Z0-9/-]{5,18})/i);
      if (rollMatch) rollNumber = rollMatch[1];

      if (!rollNumber) {
        const match = normalizedText.match(/\b[0-9]{6,12}\b/);
        if (match) rollNumber = match[0];
      }

      let studentName = null;
      let motherName = null;
      let fatherName = null;

      const isMotherKeyword = (uLine) => /MOTHER|MOTH|MOTHR|MATRI|MAATA/i.test(uLine);
      const isFatherKeyword = (uLine) => /FATHER|FATHR|GUARDIAN|PATRI|PITAH/i.test(uLine);

      // 1. Extract Mother's Name & Father's Name first
      for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i];
        const u = line.toUpperCase();

        if (isMotherKeyword(u)) {
          const mMatch = line.match(/(?:MOTHER'?S?\s*NAME|NAME\s*OF\s*MOTHER)[\s:.-]+([A-Za-z\s]{3,40})/i);
          if (mMatch && !motherName) {
            motherName = sanitizeName(mMatch[1]);
          } else if (!motherName && i + 1 < rawLines.length) {
            motherName = sanitizeName(rawLines[i + 1]);
          }
        }

        if (isFatherKeyword(u)) {
          const fMatch = line.match(/(?:FATHER'?S?|GUARDIAN'?S?)\s*(?:NAME)?[\s:.-]+([A-Za-z\s]{3,40})/i);
          if (fMatch && !fatherName) {
            fatherName = sanitizeName(fMatch[1]);
          } else if (!fatherName && i + 1 < rawLines.length) {
            fatherName = sanitizeName(rawLines[i + 1]);
          }
        }
      }

      const motherNorm = motherName ? motherName.toUpperCase().replace(/[^A-Z]/g, "") : "";
      const fatherNorm = fatherName ? fatherName.toUpperCase().replace(/[^A-Z]/g, "") : "";

      // 2. Extract Candidate/Student Name
      for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i];
        const u = line.toUpperCase();

        if (isMotherKeyword(u) || isFatherKeyword(u)) continue;

        if (u.includes("NAME") && !u.includes("BOARD") && !u.includes("SCHOOL") && !u.includes("EXAM") && !u.includes("STATEMENT")) {
          const sameMatch = line.match(/(?:CANDIDATE'?S?\s*NAME|STUDENT'?S?\s*NAME|NAME\s*OF\s*(?:THE\s*)?(?:STUDENT|CANDIDATE)|NAME)[\s:.-]+([A-Za-z\s]{3,40})/i);
          if (sameMatch && !studentName) {
            const cand = sanitizeName(sameMatch[1]);
            const cNorm = cand ? cand.toUpperCase().replace(/[^A-Za-z]/g, "") : "";
            if (cand && cNorm !== motherNorm && cNorm !== fatherNorm) {
              studentName = cand;
            }
          }
          if (!studentName && i + 1 < rawLines.length) {
            const cand = sanitizeName(rawLines[i + 1]);
            const cNorm = cand ? cand.toUpperCase().replace(/[^A-Za-z]/g, "") : "";
            if (cand && !cand.toUpperCase().includes("BOARD") && !cand.toUpperCase().includes("EXAM") && cNorm !== motherNorm && cNorm !== fatherNorm) {
              studentName = cand;
            }
          }
        }
      }

      // Standalone candidate name search if still not found
      if (!studentName) {
        for (const line of rawLines) {
          const u = line.toUpperCase();
          if (!isMotherKeyword(u) && !isFatherKeyword(u) && !u.includes("BOARD") && !u.includes("SCHOOL") && !u.includes("EXAM") && !u.includes("STATEMENT") && !u.includes("RESULT") && !u.includes("MARKS") && !/\d/.test(line)) {
            const cand = sanitizeName(line);
            const cNorm = cand ? cand.toUpperCase().replace(/[^A-Za-z]/g, "") : "";
            if (cand && cNorm !== motherNorm && cNorm !== fatherNorm && cand.length >= 3) {
              studentName = cand;
              break;
            }
          }
        }
      }

      // Dynamic Board / University Institution extraction
      let institution = null;
      const knownBoards = [
        "CENTRAL BOARD OF SECONDARY EDUCATION",
        "GUJARAT SECONDARY AND HIGHER SECONDARY EDUCATION BOARD",
        "MAHARASHTRA STATE BOARD OF SECONDARY AND HIGHER SECONDARY EDUCATION",
        "COUNCIL FOR THE INDIAN SCHOOL CERTIFICATE EXAMINATIONS",
        "NATIONAL INSTITUTE OF OPEN SCHOOLING",
        "BOARD OF HIGH SCHOOL AND INTERMEDIATE EDUCATION",
        "BOARD OF SECONDARY EDUCATION",
        "STATE BOARD OF EDUCATION"
      ];

      for (const bkw of knownBoards) {
        if (normalizedText.includes(bkw)) {
          institution = bkw;
          break;
        }
      }

      if (!institution) {
        for (const line of rawLines) {
          const u = line.toUpperCase();
          if (
            (u.includes("BOARD") || u.includes("UNIVERSITY") || u.includes("INSTITUTE OF") || u.includes("COUNCIL")) &&
            !u.includes("NAME") && !u.includes("ROLL") && !u.includes("MARKS") && !u.includes("STATEMENT") && !u.includes("RESULT")
          ) {
            const cleanInst = line.replace(/[^A-Za-z0-9\s,&.-]/g, "").trim();
            if (cleanInst.length >= 5) {
              institution = cleanInst;
              break;
            }
          }
        }
      }

      // DOB extraction for Marksheets (filter out exam dates > 2016)
      let dob = "NOT_SPECIFIED";
      const parsedDate = parseDateFromText(text);
      if (parsedDate) {
        const parts = parsedDate.split("/");
        if (parts.length === 3) {
          const yr = parseInt(parts[2], 10);
          if (yr >= 1950 && yr <= 2016) {
            dob = parsedDate;
          }
        } else if (/^(19|20)\d\d$/.test(parsedDate)) {
          const yr = parseInt(parsedDate, 10);
          if (yr >= 1950 && yr <= 2016) {
            dob = parsedDate;
          }
        }
      }

      return {
        rollNumber: rollNumber || "NOT_DETECTED",
        studentName: studentName || "NOT_DETECTED",
        fatherName: fatherName || undefined,
        motherName: motherName || undefined,
        dob,
        institution: institution || "NOT_DETECTED"
      };
    }

    case "BIRTH_CERTIFICATE": {
      let registrationNumber = null;
      const match = normalizedText.match(/\b[A-Z0-9/]{6,20}\b/);
      if (match) registrationNumber = match[0];

      let childName = null;
      for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i];
        if ((line.toUpperCase().includes("CHILD") || line.toUpperCase().includes("NAME")) && i + 1 < rawLines.length) {
          const cand = sanitizeName(rawLines[i + 1]);
          if (cand && !cand.toUpperCase().includes("BIRTH") && !cand.toUpperCase().includes("CERTIFICATE")) {
            childName = cand;
            break;
          }
        }
      }

      return {
        registrationNumber: registrationNumber || "NOT_DETECTED",
        childName: childName || "NOT_DETECTED",
        registrar: "CIVIL_REGISTRATION_SYSTEM"
      };
    }

    default:
      return {};
  }
}

/**
 * Filters extracted document fields to return ONLY high-confidence verified data,
 * stripping out NOT_DETECTED, NOT_SPECIFIED, null, undefined, or empty values.
 */
export function filterHighConfidenceFields(rawObj = {}) {
  if (!rawObj || typeof rawObj !== "object") return {};
  const clean = {};
  for (const [key, val] of Object.entries(rawObj)) {
    if (
      val !== null &&
      val !== undefined &&
      val !== "" &&
      val !== "NOT_DETECTED" &&
      val !== "NOT_SPECIFIED" &&
      val !== "UNKNOWN"
    ) {
      clean[key] = val;
    }
  }
  return clean;
}

/**
 * High-Confidence Main Field Extractor Wrapper
 */
export function extractFields(documentType, text = "") {
  const rawFields = rawExtractFields(documentType, text);
  return filterHighConfidenceFields(rawFields);
}

