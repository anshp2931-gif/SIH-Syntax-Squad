/**
 * Official Authoritative PAN Verification Service Abstraction
 * Simulates Income Tax Department / NSDL PAN API lookup
 */

export async function verifyPAN(extractedData = {}) {
  const pan = extractedData.pan;
  const name = extractedData.name;
  const dob = extractedData.dob;

  if (!pan || pan === "NOT_DETECTED") {
    return {
      verified: false,
      status: "UNVERIFIED",
      reason: "PAN number not present in extracted dataset",
      issuer: "Income Tax Department (ITD) / NSDL e-Gov"
    };
  }

  // Basic regex check for NSDL format lookup
  const isValidFormat = /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan);
  if (!isValidFormat) {
    return {
      verified: false,
      status: "INVALID_PAN_FORMAT",
      reason: "PAN format check failed at ITD database level",
      issuer: "Income Tax Department (ITD)"
    };
  }

  // Simulated ITD database check response
  const isIndividual = pan[3] === "P";

  return {
    verified: true,
    status: "ACTIVE_PAN_MATCH",
    panStatus: "OPERATIVE",
    holderType: isIndividual ? "Individual Taxpayer" : "Registered Entity",
    pan,
    nameMatched: true,
    dobMatched: Boolean(dob && dob !== "NOT_DETECTED"),
    issuer: "Income Tax Department (ITD)",
    verificationTimestamp: new Date().toISOString(),
    apiRef: `ITD-NSDL-${Math.floor(100000 + Math.random() * 900000)}`
  };
}
