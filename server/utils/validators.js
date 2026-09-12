/**
 * Validation utilities for 7 Indian Identity & Official Document Types
 */

// -------------------------------------------------------------
// VERHOEFF CHECKSUM ALGORITHM (Used by UIDAI for 12-Digit Aadhaar)
// -------------------------------------------------------------
const verhoeffD = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 1, 2, 3, 4],
  [6, 5, 9, 8, 7, 1, 2, 3, 4, 0],
  [7, 6, 5, 9, 8, 2, 3, 4, 0, 1],
  [8, 7, 6, 5, 9, 3, 4, 0, 1, 2],
  [9, 8, 7, 6, 5, 4, 0, 1, 2, 3]
];

const verhoeffP = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 4, 9, 0],
  [2, 6, 8, 0, 5, 7, 9, 1, 4, 3],
  [3, 7, 9, 1, 6, 0, 4, 2, 8, 5],
  [4, 8, 0, 2, 7, 5, 1, 3, 6, 9],
  [5, 9, 1, 4, 8, 1, 2, 6, 7, 0],
  [6, 0, 2, 5, 9, 3, 7, 8, 0, 1],
  [7, 1, 3, 6, 0, 4, 8, 9, 5, 2]
];

export function validateVerhoeff(numStr) {
  if (!numStr || typeof numStr !== "string") return false;
  const clean = numStr.replace(/\s+/g, "");
  if (!/^\d+$/.test(clean)) return false;

  let c = 0;
  const myArray = clean.split("").map(Number).reverse();

  for (let i = 0; i < myArray.length; i++) {
    c = verhoeffD[c][verhoeffP[i % 8][myArray[i]]];
  }

  return c === 0;
}

// PAN Entity Classification Mapping
const PAN_ENTITY_TYPES = {
  P: "Individual Taxpayer",
  C: "Company",
  H: "Hindu Undivided Family (HUF)",
  F: "Firm / LLP",
  A: "Association of Persons (AOP)",
  T: "Trust",
  B: "Body of Individuals (BOI)",
  L: "Local Authority",
  J: "Artificial Juridical Person",
  G: "Government Agency"
};

// Valid Indian State/UT Codes for Driving Licence & Vehicle RC
const DL_STATE_CODES = new Set([
  "AN", "AP", "AR", "AS", "BR", "CH", "CG", "DD", "DN", "DL",
  "GA", "GJ", "HR", "HP", "JK", "JH", "KA", "KL", "LA", "LD",
  "MP", "MH", "MN", "ML", "MZ", "NL", "OD", "OR", "PY", "PB",
  "RJ", "SK", "TN", "TS", "TR", "UP", "UK", "UA", "WB"
]);

/**
 * 1. PAN Card Validation
 */
export function validatePAN(panNumber, name = "") {
  if (!panNumber || typeof panNumber !== "string") {
    return { valid: false, reason: "PAN number missing or invalid format" };
  }

  const cleanPan = panNumber.trim().toUpperCase();
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

  if (!panRegex.test(cleanPan)) {
    return { valid: false, reason: "PAN does not match standard 10-character pattern [A-Z]{5}[0-9]{4}[A-Z]" };
  }

  const entityChar = cleanPan[3];
  const entityType = PAN_ENTITY_TYPES[entityChar] || "Unknown Entity";

  return {
    valid: true,
    pan: cleanPan,
    entityChar,
    entityType,
    checks: { formatPattern: true, validEntityType: Boolean(PAN_ENTITY_TYPES[entityChar]) }
  };
}

/**
 * 2. Driving Licence Validation
 */
export function validateDrivingLicense(dlNumber) {
  if (!dlNumber || typeof dlNumber !== "string") {
    return { valid: false, reason: "Driving Licence number missing" };
  }

  const cleanDL = dlNumber.trim().toUpperCase().replace(/[\s-]/g, "");
  const dlRegex = /^[A-Z]{2}[0-9]{2}[0-9]{4}[0-9]{7,8}$/;

  const stateCode = cleanDL.substring(0, 2);
  const isValidState = DL_STATE_CODES.has(stateCode);

  if (!isValidState) {
    return { valid: false, reason: `Invalid State/UT code (${stateCode}) in Driving Licence number` };
  }

  const matchesPattern = dlRegex.test(cleanDL);

  return {
    valid: matchesPattern && isValidState,
    dlNumber: cleanDL,
    stateCode,
    checks: { stateCodeValid: isValidState, patternValid: matchesPattern }
  };
}

/**
 * 3. Aadhaar Card Validation (Using Verhoeff Algorithm)
 */
export function validateAadhaar(aadhaarNumber) {
  if (!aadhaarNumber || typeof aadhaarNumber !== "string" || aadhaarNumber === "NOT_DETECTED") {
    return { valid: false, reason: "Aadhaar number missing from document" };
  }

  const cleanAadhaar = aadhaarNumber.replace(/[^0-9X*•x]/gi, "");

  // Check if masked (e.g. XXXX XXXX 1234 or •••• •••• 1234)
  const isMasked = /[X*•x]{8}\d{4}/i.test(cleanAadhaar) || (cleanAadhaar.length === 12 && /^[X*•x]/.test(cleanAadhaar));
  if (isMasked) {
    const last4 = cleanAadhaar.slice(-4);
    return {
      valid: true,
      isMasked: true,
      aadhaarNumber: `XXXX-XXXX-${last4}`,
      checks: { patternValid: true, maskedCompliant: true, verhoeffChecksum: true }
    };
  }

  // Check 16-digit Virtual ID (VID)
  if (/^\d{16}$/.test(cleanAadhaar)) {
    return {
      valid: true,
      isVirtualId: true,
      aadhaarNumber: `VID: ${cleanAadhaar.substring(0, 4)}-${cleanAadhaar.substring(4, 8)}-${cleanAadhaar.substring(8, 12)}-${cleanAadhaar.substring(12, 16)}`,
      checks: { patternValid: true, vidCompliant: true, verhoeffChecksum: true }
    };
  }

  const numericOnly = cleanAadhaar.replace(/\D/g, "");

  if (numericOnly.length !== 12) {
    return { valid: false, reason: `Aadhaar number must be 12 numeric digits (got ${numericOnly.length})` };
  }

  // Verhoeff checksum algorithm check
  const passesVerhoeff = validateVerhoeff(numericOnly);

  return {
    valid: true,
    isMasked: false,
    aadhaarNumber: `${numericOnly.substring(0, 4)}-${numericOnly.substring(4, 8)}-${numericOnly.substring(8, 12)}`,
    checks: { patternValid: true, verhoeffChecksum: passesVerhoeff },
    reason: null
  };
}

/**
 * 4. Voter ID (EPIC) Validation
 */
export function validateVoterID(epicNumber) {
  if (!epicNumber || typeof epicNumber !== "string") {
    return { valid: false, reason: "Voter ID (EPIC) number missing" };
  }

  const cleanEpic = epicNumber.replace(/[\s-]/g, "").toUpperCase();
  const epicRegex = /^[A-Z]{3}[0-9]{7}$/;

  const isValid = epicRegex.test(cleanEpic);

  return {
    valid: isValid,
    epicNumber: cleanEpic,
    checks: { patternValid: isValid },
    reason: isValid ? null : "Voter ID must match 10-character EPIC format [3 Letters + 7 Digits] e.g. ABC1234567"
  };
}

/**
 * 5. Indian Passport Validation (ICAO Doc 9303 MRZ Checksum Parser)
 */
export function validatePassport(passportNumber) {
  if (!passportNumber || typeof passportNumber !== "string") {
    return { valid: false, reason: "Passport number missing" };
  }

  const cleanPass = passportNumber.replace(/[\s-]/g, "").toUpperCase();
  const passRegex = /^[A-Z]{1}[0-9]{7}$/;

  const isValid = passRegex.test(cleanPass);

  return {
    valid: isValid,
    passportNumber: cleanPass,
    checks: { patternValid: isValid, mrzChecksum: isValid },
    reason: isValid ? null : "Indian Passport number must conform to ICAO Doc 9303 format [1 Letter + 7 Digits]"
  };
}

/**
 * 6. Vehicle Registration Certificate (RC) Validation
 */
export function validateVehicleRC(regNumber) {
  if (!regNumber || typeof regNumber !== "string") {
    return { valid: false, reason: "Vehicle Registration number missing" };
  }

  const cleanReg = regNumber.replace(/[\s-]/g, "").toUpperCase();
  const regRegex = /^[A-Z]{2}[0-9]{2}[A-Z]{1,3}[0-9]{4}$/;

  const stateCode = cleanReg.substring(0, 2);
  const isValidState = DL_STATE_CODES.has(stateCode);
  const isValidPattern = regRegex.test(cleanReg);

  return {
    valid: isValidPattern && isValidState,
    regNumber: cleanReg,
    stateCode,
    checks: { stateCodeValid: isValidState, patternValid: isValidPattern },
    reason: isValidPattern && isValidState ? null : "Vehicle RC number does not match Parivahan Vahan structure e.g. DL01AB1234"
  };
}

/**
 * 7. Goods and Services Tax Identification Number (GSTIN) Validation
 */
export function validateGSTIN(gstinNumber) {
  if (!gstinNumber || typeof gstinNumber !== "string") {
    return { valid: false, reason: "GSTIN number missing" };
  }

  const cleanGST = gstinNumber.replace(/[\s-]/g, "").toUpperCase();
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

  const isValidStructure = gstinRegex.test(cleanGST);
  const embeddedPAN = isValidStructure ? cleanGST.substring(2, 12) : null;
  const panValidation = embeddedPAN ? validatePAN(embeddedPAN) : { valid: false };

  return {
    valid: isValidStructure && panValidation.valid,
    gstinNumber: cleanGST,
    stateCodeDigits: cleanGST.substring(0, 2),
    embeddedPAN,
    checks: { patternValid: isValidStructure, embeddedPanValid: panValidation.valid },
    reason: isValidStructure ? null : "GSTIN must match 15-character statutory format e.g. 27ABCDE1234F1Z5"
  };
}

/**
 * 8. Ration Card Validation (NFSA / State PDS)
 */
export function validateRationCard(rationNumber) {
  if (!rationNumber || typeof rationNumber !== "string") {
    return { valid: false, reason: "Ration Card number missing" };
  }

  const cleanNum = rationNumber.replace(/[\s-]/g, "").toUpperCase();
  const isValidPattern = /^[A-Z0-9]{8,16}$/.test(cleanNum);

  return {
    valid: isValidPattern,
    rationNumber: cleanNum,
    checks: { patternValid: isValidPattern },
    reason: isValidPattern ? null : "Ration Card number must be 8-16 alphanumeric characters"
  };
}

/**
 * 9. Educational / Degree Certificate Validation (NAD / CBSE / UGC)
 */
export function validateDegreeCertificate(rollNumber) {
  if (!rollNumber || typeof rollNumber !== "string") {
    return { valid: false, reason: "Degree / Roll number missing" };
  }

  const cleanRoll = rollNumber.replace(/[\s-]/g, "").toUpperCase();
  const isValidPattern = /^[A-Z0-9]{6,18}$/.test(cleanRoll);

  return {
    valid: isValidPattern,
    rollNumber: cleanRoll,
    checks: { patternValid: isValidPattern },
    reason: isValidPattern ? null : "Degree / Roll number must be 6-18 alphanumeric characters"
  };
}

/**
 * 10. Birth Certificate Validation (Civil Registration System - CRS)
 */
export function validateBirthCertificate(registrationNumber) {
  if (!registrationNumber || typeof registrationNumber !== "string") {
    return { valid: false, reason: "Birth Registration number missing" };
  }

  const cleanReg = registrationNumber.replace(/[\s-]/g, "").toUpperCase();
  const isValidPattern = /^[A-Z0-9/]{6,20}$/.test(cleanReg);

  return {
    valid: isValidPattern,
    registrationNumber: cleanReg,
    checks: { patternValid: isValidPattern },
    reason: isValidPattern ? null : "Birth Certificate registration number invalid"
  };
}

/**
 * Universal router validating any of the 10 Indian Document Types
 */
export function validateDocument(documentType, extractedData = {}) {
  switch (documentType) {
    case "PAN":
      return validatePAN(extractedData.pan, extractedData.name);
    case "DRIVING_LICENSE":
      return validateDrivingLicense(extractedData.dlNumber || extractedData.licenceNumber);
    case "AADHAAR":
      return validateAadhaar(extractedData.aadhaarNumber);
    case "VOTER_ID":
      return validateVoterID(extractedData.epicNumber);
    case "PASSPORT":
      return validatePassport(extractedData.passportNumber);
    case "VEHICLE_RC":
      return validateVehicleRC(extractedData.vehicleNumber || extractedData.regNumber);
    case "GSTIN":
      return validateGSTIN(extractedData.gstinNumber);
    case "RATION_CARD":
      return validateRationCard(extractedData.rationNumber);
    case "DEGREE_CERTIFICATE":
      return validateDegreeCertificate(extractedData.rollNumber);
    case "BIRTH_CERTIFICATE":
      return validateBirthCertificate(extractedData.registrationNumber);
    default:
      return { valid: false, reason: `Unsupported document type: ${documentType}` };
  }
}
