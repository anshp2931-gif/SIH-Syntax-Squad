const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

/**
 * Detects document type and checks for category mismatch
 */
export async function detectDocumentApi(file, selectedType = null) {
  const formData = new FormData();
  formData.append("document", file);
  if (selectedType && selectedType !== "AUTO") {
    formData.append("selectedType", selectedType);
  }

  const response = await fetch(`${API_BASE_URL}/verification/detect`, {
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
 * Uploads document image file to backend verification API
 */
export async function verifyDocumentApi(file, forcedType = null, manualNumber = "") {
  const formData = new FormData();
  formData.append("document", file);
  if (forcedType && forcedType !== "AUTO") {
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
    } else if (forcedType === "VISA") {
      overrideObj = { visaNumber: cleanNum };
    } else if (forcedType === "PERMIT") {
      overrideObj = { permitNumber: cleanNum };
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
    } else if (forcedType === "STUDENT_ID") {
      overrideObj = { idNumber: cleanNum };
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

/**
 * Mobile Camera Upload Session APIs
 */
export async function createMobileSessionApi() {
  const response = await fetch(`${API_BASE_URL}/session/create`, {
    method: "POST"
  });
  if (!response.ok) throw new Error("Failed to create mobile upload session");
  return response.json();
}

export async function getMobileSessionStatusApi(sessionId) {
  const response = await fetch(`${API_BASE_URL}/session/${sessionId}`);
  if (!response.ok) throw new Error("Failed to get session status");
  return response.json();
}

export async function uploadMobileDocumentApi(sessionId, file) {
  const formData = new FormData();
  formData.append("document", file);
  const response = await fetch(`${API_BASE_URL}/session/${sessionId}/upload`, {
    method: "POST",
    body: formData
  });
  if (!response.ok) throw new Error("Failed to upload document from mobile device");
  return response.json();
}

/**
 * Fetches sample documents from the backend
 */
export async function fetchSampleDocumentsApi() {
  const response = await fetch(`${API_BASE_URL}/samples`);
  if (!response.ok) {
    throw new Error("Failed to fetch sample documents");
  }
  return response.json();
}

/**
 * Downloads a sample document and passes it through the active verification engine
 */
export async function verifySampleApi(samplePath, documentType, simulatedData = {}) {
  const imgResponse = await fetch(samplePath);
  const blob = await imgResponse.blob();
  const file = new File([blob], "sample.png", { type: blob.type || "image/png" });

  let primaryNumber = "";
  if (simulatedData.pan) primaryNumber = simulatedData.pan;
  else if (simulatedData.aadhaarNumber) primaryNumber = simulatedData.aadhaarNumber;
  else if (simulatedData.dlNumber) primaryNumber = simulatedData.dlNumber;
  else if (simulatedData.epicNumber) primaryNumber = simulatedData.epicNumber;
  else if (simulatedData.passportNumber) primaryNumber = simulatedData.passportNumber;
  else if (Object.values(simulatedData).length > 0) {
    primaryNumber = Object.values(simulatedData)[0];
  }

  return verifyDocumentApi(file, documentType, primaryNumber);
}
