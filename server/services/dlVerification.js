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
 * Universal Issuer Verification Router
 */
export async function verifyIssuer(documentType, extractedData = {}) {
  switch (documentType) {
    case "PAN":
      return verifyPAN(extractedData);
    case "DRIVING_LICENSE":
      return verifyDrivingLicense(extractedData);
    default:
      return {
        verified: false,
        status: "UNAVAILABLE",
        reason: `Issuer verification channel not available for document type: ${documentType}`,
        issuer: "Authoritative Issuer Registry"
      };
  }
}
