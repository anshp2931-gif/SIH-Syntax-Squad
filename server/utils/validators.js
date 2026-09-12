/**
 * Validation utilities for Indian Identity Documents
 */

// PAN Entity Classification Mapping (4th character of PAN)
const PAN_ENTITY_TYPES = {
  P: "Individual",
  C: "Company",
  H: "Hindu Undivided Family (HUF)",
  F: "Firm / LL.P",
  A: "Association of Persons (AOP)",
  T: "Trust",
  B: "Body of Individuals (BOI)",
  L: "Local Authority",
  J: "Artificial Juridical Person",
  G: "Government Agency"
};

// Valid Indian State/UT Codes for Driving Licence
const DL_STATE_CODES = new Set([
  "AN", "AP", "AR", "AS", "BR", "CH", "CG", "DD", "DN", "DL",
  "GA", "GJ", "HR", "HP", "JK", "JH", "KA", "KL", "LA", "LD",
  "MP", "MH", "MN", "ML", "MZ", "NL", "OD", "OR", "PY", "PB",
  "RJ", "SK", "TN", "TS", "TR", "UP", "UK", "UA", "WB"
]);

/**
 * Validates a PAN Card Number & returns detailed structural audit
 */
export function validatePAN(panNumber, name = "", dob = "") {
  if (!panNumber || typeof panNumber !== "string") {
    return {
      valid: false,
      reason: "PAN number missing or invalid format"
    };
  }

  const cleanPan = panNumber.trim().toUpperCase();
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

  if (!panRegex.test(cleanPan)) {
    return {
      valid: false,
      reason: "PAN does not match standard 10-character pattern [A-Z]{5}[0-9]{4}[A-Z]"
    };
  }

  const entityChar = cleanPan[3];
  const entityType = PAN_ENTITY_TYPES[entityChar] || "Unknown Entity";

  // Check 5th character vs Name first character if Name provided
  let surnameMatch = true;
  if (name && name.trim().length > 0) {
    const cleanName = name.trim().toUpperCase();
    const words = cleanName.split(/\s+/);
    const surname = words[words.length - 1];
    const expectedChar = cleanPan[4];
    if (surname && surname[0] !== expectedChar) {
      surnameMatch = false;
    }
  }

  return {
    valid: true,
    pan: cleanPan,
    entityChar,
    entityType,
    surnameMatch,
    checks: {
      formatPattern: true,
      validEntityType: Boolean(PAN_ENTITY_TYPES[entityChar]),
      surnameMatch
    }
  };
}

/**
 * Validates a Driving Licence Number & returns detailed audit
 */
export function validateDrivingLicense(dlNumber) {
  if (!dlNumber || typeof dlNumber !== "string") {
    return {
      valid: false,
      reason: "Driving Licence number missing"
    };
  }

  const cleanDL = dlNumber.trim().toUpperCase().replace(/[\s-]/g, "");

  // Indian DL numbers are typically 15 alphanumeric chars e.g. DL1420110012345 or MH0220190001234
  // Format: 2 State chars + 2 RTO digits + 4 Issue Year digits + 7 Serial digits (or variations up to 16 chars)
  const dlRegex = /^[A-Z]{2}[0-9]{2}[0-9]{4}[0-9]{7,8}$/;

  const stateCode = cleanDL.substring(0, 2);
  const isValidState = DL_STATE_CODES.has(stateCode);

  if (!isValidState) {
    return {
      valid: false,
      reason: `Invalid State/UT code (${stateCode}) in Driving Licence number`
    };
  }

  const matchesPattern = dlRegex.test(cleanDL);
  const issueYear = parseInt(cleanDL.substring(4, 8), 10);
  const currentYear = new Date().getFullYear();
  const validYear = !isNaN(issueYear) && issueYear >= 1950 && issueYear <= currentYear;

  return {
    valid: matchesPattern && isValidState && validYear,
    dlNumber: cleanDL,
    stateCode,
    issueYear: validYear ? issueYear : null,
    checks: {
      stateCodeValid: isValidState,
      patternValid: matchesPattern,
      issueYearValid: validYear
    },
    reason: matchesPattern
      ? null
      : "DL number does not conform to standard 15-digit Indian RTO structure"
  };
}

/**
 * Universal validator for document based on type
 */
export function validateDocument(documentType, extractedData = {}) {
  switch (documentType) {
    case "PAN":
      return validatePAN(extractedData.pan, extractedData.name, extractedData.dob);
    case "DRIVING_LICENSE":
      return validateDrivingLicense(extractedData.dlNumber || extractedData.licenceNumber);
    default:
      return {
        valid: false,
        reason: `Unsupported document type: ${documentType}`
      };
  }
}
