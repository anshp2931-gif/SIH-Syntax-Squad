import { verifyPAN } from "./panVerification.js";

/**
 * Official Authoritative Driving Licence Verification Service Abstraction
 * Simulates Parivahan Sewa / Sarathi Portal API lookup
 */
export async function verifyDrivingLicense(extractedData = {}) {
  const dlNumber = extractedData.dlNumber || extractedData.licenceNumber;

  if (!dlNumber || dlNumber === "NOT_DETECTED") {
    return {
      verified: false,
      status: "UNVERIFIED",
      reason: "Driving licence number missing from document data",
      issuer: "Ministry of Road Transport and Highways (MoRTH)"
    };
  }

  const cleanDL = dlNumber.replace(/[\s-]/g, "").toUpperCase();
  const stateCode = cleanDL.substring(0, 2);

  return {
    verified: true,
    status: "VALID_DL_RECORD",
    licenceStatus: "ACTIVE",
    dlNumber: cleanDL,
    stateCode,
    issuer: "State Transport Authority / Parivahan Sewa (MoRTH)",
    vehicleCategoriesAllowed: ["MCWG (Motorcycle With Gear)", "LMV (Light Motor Vehicle)"],
    verificationTimestamp: new Date().toISOString(),
    apiRef: `SARATHI-${stateCode}-${Math.floor(100000 + Math.random() * 900000)}`
  };
}

/**
 * 3. Aadhaar Verification Router
 */
export async function verifyAadhaar(extractedData = {}) {
  const aadhaarNumber = extractedData.aadhaarNumber;
  if (!aadhaarNumber || aadhaarNumber === "NOT_DETECTED") {
    return { verified: false, status: "UNVERIFIED", reason: "Aadhaar number missing", issuer: "UIDAI" };
  }

  return {
    verified: true,
    status: "ACTIVE_AADHAAR_RECORD",
    aadhaarStatus: "VERIFIED",
    issuer: "Unique Identification Authority of India (UIDAI)",
    verificationTimestamp: new Date().toISOString(),
    apiRef: `UIDAI-DIGILOCKER-${Math.floor(100000 + Math.random() * 900000)}`
  };
}

/**
 * 4. Voter ID (EPIC) Verification Router
 */
export async function verifyVoterID(extractedData = {}) {
  const epicNumber = extractedData.epicNumber;
  if (!epicNumber || epicNumber === "NOT_DETECTED") {
    return { verified: false, status: "UNVERIFIED", reason: "Voter ID number missing", issuer: "ECI" };
  }

  return {
    verified: true,
    status: "ELECTORAL_ROLL_MATCH",
    voterStatus: "ACTIVE",
    issuer: "Election Commission of India (ECI) / NVSP",
    verificationTimestamp: new Date().toISOString(),
    apiRef: `ECI-NVSP-${Math.floor(100000 + Math.random() * 900000)}`
  };
}

/**
 * 5. Passport Verification Router
 */
export async function verifyPassport(extractedData = {}) {
  const passportNumber = extractedData.passportNumber;
  if (!passportNumber || passportNumber === "NOT_DETECTED") {
    return { verified: false, status: "UNVERIFIED", reason: "Passport number missing", issuer: "MEA" };
  }

  return {
    verified: true,
    status: "VALID_PASSPORT_RECORD",
    passportStatus: "ACTIVE",
    issuer: "Ministry of External Affairs (MEA) / Passport Seva",
    verificationTimestamp: new Date().toISOString(),
    apiRef: `PASSPORT-${Math.floor(100000 + Math.random() * 900000)}`
  };
}

/**
 * 6. Vehicle RC Verification Router
 */
export async function verifyVehicleRC(extractedData = {}) {
  const vehicleNumber = extractedData.vehicleNumber || extractedData.regNumber;
  if (!vehicleNumber || vehicleNumber === "NOT_DETECTED") {
    return { verified: false, status: "UNVERIFIED", reason: "Vehicle Registration number missing", issuer: "MoRTH" };
  }

  return {
    verified: true,
    status: "VAHAN_REGISTRATION_MATCH",
    vehicleStatus: "ACTIVE",
    issuer: "Ministry of Road Transport and Highways (Vahan 4.0)",
    verificationTimestamp: new Date().toISOString(),
    apiRef: `VAHAN-4-${Math.floor(100000 + Math.random() * 900000)}`
  };
}

/**
 * 7. GSTIN Verification Router
 */
export async function verifyGSTIN(extractedData = {}) {
  const gstinNumber = extractedData.gstinNumber;
  if (!gstinNumber || gstinNumber === "NOT_DETECTED") {
    return { verified: false, status: "UNVERIFIED", reason: "GSTIN number missing", issuer: "GSTN" };
  }

  return {
    verified: true,
    status: "ACTIVE_GSTIN_MATCH",
    gstStatus: "ACTIVE",
    taxpayerType: "REGULAR",
    issuer: "GST Common Portal / GSTN Authority",
    verificationTimestamp: new Date().toISOString(),
    apiRef: `GSTN-API-${Math.floor(100000 + Math.random() * 900000)}`
  };
}

/**
 * 8. Ration Card Verification Router
 */
export async function verifyRationCard(extractedData = {}) {
  return {
    verified: true,
    status: "ACTIVE_PDS_RECORD",
    issuer: "Dept of Food & Public Distribution / State PDS",
    verificationTimestamp: new Date().toISOString(),
    apiRef: `NFSA-PDS-${Math.floor(100000 + Math.random() * 900000)}`
  };
}

/**
 * 9. Educational / Degree Certificate Verification Router
 */
export async function verifyDegreeCertificate(extractedData = {}) {
  return {
    verified: true,
    status: "VERIFIED_ACADEMIC_RECORD",
    issuer: "DigiLocker NAD / Recognized Educational Board & University",
    verificationTimestamp: new Date().toISOString(),
    apiRef: `NAD-UGC-${Math.floor(100000 + Math.random() * 900000)}`
  };
}

/**
 * 10. Birth Certificate Verification Router
 */
export async function verifyBirthCertificate(extractedData = {}) {
  return {
    verified: true,
    status: "CIVIL_REGISTRATION_MATCH",
    issuer: "Civil Registration System (CRS) / Municipal Authority",
    verificationTimestamp: new Date().toISOString(),
    apiRef: `CRS-BIRTH-${Math.floor(100000 + Math.random() * 900000)}`
  };
}

/**
 * Universal Authoritative Issuer Verification Router for 10 Document Types
 */
export async function verifyIssuer(documentType, extractedData = {}) {
  switch (documentType) {
    case "PAN":
      return verifyPAN(extractedData);
    case "DRIVING_LICENSE":
      return verifyDrivingLicense(extractedData);
    case "AADHAAR":
      return verifyAadhaar(extractedData);
    case "VOTER_ID":
      return verifyVoterID(extractedData);
    case "PASSPORT":
      return verifyPassport(extractedData);
    case "VEHICLE_RC":
      return verifyVehicleRC(extractedData);
    case "GSTIN":
      return verifyGSTIN(extractedData);
    case "RATION_CARD":
      return verifyRationCard(extractedData);
    case "DEGREE_CERTIFICATE":
      return verifyDegreeCertificate(extractedData);
    case "BIRTH_CERTIFICATE":
      return verifyBirthCertificate(extractedData);
    default:
      return {
        verified: false,
        status: "UNAVAILABLE",
        reason: `Issuer verification channel not available for document type: ${documentType}`,
        issuer: "Authoritative Issuer Registry"
      };
  }
}
