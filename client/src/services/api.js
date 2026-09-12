const API_BASE_URL = "http://localhost:5000/api";

/**
 * Uploads document image file to backend verification API
 */
export async function verifyDocumentApi(file, forcedType = null, manualNumber = "") {
  const formData = new FormData();
  formData.append("document", file);
  if (forcedType) {
    formData.append("forcedType", forcedType);
  }
  if (manualNumber && manualNumber.trim()) {
    const cleanNum = manualNumber.trim().toUpperCase().replace(/[\s-]/g, "");
    let overrideObj = {};
    if (forcedType === "AADHAAR" || cleanNum.length === 12) {
      overrideObj = { aadhaarNumber: cleanNum };
    } else if (forcedType === "PAN" || cleanNum.length === 10) {
      overrideObj = { pan: cleanNum };
    } else if (forcedType === "DRIVING_LICENSE" || cleanNum.length >= 14) {
      overrideObj = { dlNumber: cleanNum };
    } else if (forcedType === "VOTER_ID") {
      overrideObj = { epicNumber: cleanNum };
    } else if (forcedType === "PASSPORT") {
      overrideObj = { passportNumber: cleanNum };
    } else if (forcedType === "VEHICLE_RC") {
      overrideObj = { vehicleNumber: cleanNum };
    } else if (forcedType === "GSTIN") {
      overrideObj = { gstinNumber: cleanNum };
    } else if (forcedType === "RATION_CARD") {
      overrideObj = { rationNumber: cleanNum };
    } else if (forcedType === "DEGREE_CERTIFICATE") {
      overrideObj = { rollNumber: cleanNum };
    } else if (forcedType === "BIRTH_CERTIFICATE") {
      overrideObj = { registrationNumber: cleanNum };
    } else {
      overrideObj = { aadhaarNumber: cleanNum, pan: cleanNum, dlNumber: cleanNum, epicNumber: cleanNum };
    }
    formData.append("overrideData", JSON.stringify(overrideObj));
  }

  const response = await fetch(`${API_BASE_URL}/verification`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Server responded with error status ${response.status}`);
  }

  return response.json();
}

/**
 * Verifies document using built-in synthetic sample path
 */
export async function verifySampleApi(samplePath, documentType, simulatedData) {
  const response = await fetch(`${API_BASE_URL}/verification`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      samplePath,
      forcedType: documentType,
      overrideData: JSON.stringify(simulatedData)
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Sample verification failed");
  }

  return response.json();
}

/**
 * Fetches available synthetic sample documents for testing
 */
export async function fetchSampleDocumentsApi() {
  const response = await fetch(`${API_BASE_URL}/samples`);
  if (!response.ok) {
    throw new Error("Failed to fetch sample documents");
  }
  return response.json();
}

/**
 * Fetches verification audit record by unique ID
 */
export async function getVerificationByIdApi(verificationId) {
  const response = await fetch(`${API_BASE_URL}/verification/${verificationId}`);
  if (!response.ok) {
    throw new Error("Verification record not found");
  }
  return response.json();
}

/**
 * Fetches verification history list
 */
export async function getVerificationHistoryApi() {
  const response = await fetch(`${API_BASE_URL}/verification`);
  if (!response.ok) {
    throw new Error("Failed to fetch verification history");
  }
  return response.json();
}

/**
 * Health check API status
 */
export async function checkHealthApi() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    // API down
  }
  return { status: "OFFLINE", mongoConnected: false };
}
