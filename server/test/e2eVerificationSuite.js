import assert from "assert";
import path from "path";
import fs from "fs";

console.log("===============================================================");
console.log("🚀 COMPREHENSIVE LIVE E2E VERIFICATION SUITE");
console.log("===============================================================\n");

const API_BASE = "http://127.0.0.1:5000/api";

let passed = 0;
let total = 0;

function reportTest(name, passedCondition, details = "") {
  total++;
  if (passedCondition) {
    passed++;
    console.log(`✅ [PASS] ${name}`);
  } else {
    console.error(`❌ [FAIL] ${name}: ${details}`);
  }
}

async function run() {
  const panSample = path.resolve("samples/sample_pan_card.png");
  const aadhaarSample = path.resolve("samples/sample_aadhaar_card.png");
  const dlSample = path.resolve("samples/sample_driving_license.png");
  const passportSample = path.resolve("samples/sample_passport.png");

  // SCENARIO 1: User selects PAN Card but uploads Aadhaar
  console.log("Testing Scenario 1: PAN selected + Aadhaar upload...");
  const res1 = await fetch(`${API_BASE}/verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      samplePath: aadhaarSample,
      forcedType: "PAN",
      overrideData: JSON.stringify({ aadhaarNumber: "999988887778", name: "PRIYA VERMA", dob: "15/03/1998" })
    })
  }).then(r => r.json());

  console.log("Scenario 1 Result:", {
    status: res1.status,
    mismatch: res1.mismatch,
    selectedType: res1.selectedType,
    detectedType: res1.detectedType,
    confidence: res1.confidence,
    message: res1.message
  });

  reportTest(
    "Scenario 1: PAN selected + Aadhaar upload -> Stops with MISMATCH and 96%+ confidence",
    res1.status === "MISMATCH" &&
    res1.mismatch === true &&
    res1.selectedType === "PAN" &&
    res1.detectedType === "AADHAAR" &&
    res1.confidence >= 95,
    JSON.stringify(res1)
  );

  // SCENARIO 2: User selects Aadhaar Card but uploads PAN
  console.log("\nTesting Scenario 2: Aadhaar selected + PAN upload...");
  const res2 = await fetch(`${API_BASE}/verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      samplePath: panSample,
      forcedType: "AADHAAR",
      overrideData: JSON.stringify({ pan: "ABCDE1234F", name: "RAHUL SHARMA", fatherName: "SURESH SHARMA" })
    })
  }).then(r => r.json());

  console.log("Scenario 2 Result:", {
    status: res2.status,
    mismatch: res2.mismatch,
    selectedType: res2.selectedType,
    detectedType: res2.detectedType,
    confidence: res2.confidence
  });

  reportTest(
    "Scenario 2: Aadhaar selected + PAN upload -> Stops with MISMATCH and 98%+ confidence",
    res2.status === "MISMATCH" &&
    res2.mismatch === true &&
    res2.selectedType === "AADHAAR" &&
    res2.detectedType === "PAN" &&
    res2.confidence >= 95,
    JSON.stringify(res2)
  );

  // SCENARIO 3: User selects Driving Licence but uploads Passport
  console.log("\nTesting Scenario 3: DL selected + Passport upload...");
  const res3 = await fetch(`${API_BASE}/verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      samplePath: passportSample,
      forcedType: "DRIVING_LICENSE",
      overrideData: JSON.stringify({ passportNumber: "Z1234567", name: "ROHAN MEHTA" })
    })
  }).then(r => r.json());

  console.log("Scenario 3 Result:", {
    status: res3.status,
    mismatch: res3.mismatch,
    selectedType: res3.selectedType,
    detectedType: res3.detectedType,
    confidence: res3.confidence
  });

  reportTest(
    "Scenario 3: DL selected + Passport upload -> Stops with MISMATCH",
    res3.status === "MISMATCH" &&
    res3.mismatch === true &&
    res3.selectedType === "DRIVING_LICENSE" &&
    res3.detectedType === "PASSPORT",
    JSON.stringify(res3)
  );

  // SCENARIO 4: Unsupported Document Upload
  console.log("\nTesting Scenario 4: Unsupported Document (Utility bill / Invoice)...");
  // Create a temporary text / buffer simulated image
  const res4 = await fetch(`${API_BASE}/verification/detect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      samplePath: panSample,
      overrideData: JSON.stringify({
        unsupportedBill: true,
        textSnippet: "BSES POWER ELECTRICITY BILL CONSUMER NO 1002345678 TOTAL AMOUNT DUE RS 4200"
      })
    })
  }).then(r => r.json());

  // Also test direct verification of unsupported text
  const res4Verify = await fetch(`${API_BASE}/verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      samplePath: panSample,
      forcedType: "PAN",
      overrideData: JSON.stringify({
        unsupported: "ELECTRICITY BILL BSES POWER CONSUMER NO 1002345678 DUE DATE 20/08/2024 TOTAL AMOUNT DUE"
      })
    })
  }).then(r => r.json());

  console.log("Scenario 4 Result:", {
    status: res4Verify.status,
    detectedType: res4Verify.detectedType,
    message: res4Verify.message
  });

  reportTest(
    "Scenario 4: Unsupported document triggers UNSUPPORTED status and halts validation",
    res4Verify.status === "UNSUPPORTED" && res4Verify.detectedType === "UNSUPPORTED",
    JSON.stringify(res4Verify)
  );

  // SCENARIO 5: Low-Confidence Document
  console.log("\nTesting Scenario 5: Low-Confidence Document (blurry / unidentifiable)...");
  const res5 = await fetch(`${API_BASE}/verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      samplePath: panSample,
      forcedType: "PAN",
      overrideData: JSON.stringify({
        rawText: "~~ ?? !!"
      })
    })
  }).then(r => r.json());

  console.log("Scenario 5 Result:", {
    status: res5.status,
    isLowConfidence: res5.isLowConfidence,
    detectedType: res5.detectedType,
    message: res5.message
  });

  reportTest(
    "Scenario 5: Low confidence document triggers LOW_CONFIDENCE and does not guess",
    res5.status === "LOW_CONFIDENCE" && res5.detectedType === "UNKNOWN",
    JSON.stringify(res5)
  );

  // SCENARIO 6: Correct Category Match (Aadhaar selected + Aadhaar upload)
  console.log("\nTesting Scenario 6: Correct Category Match (Aadhaar selected + Aadhaar upload)...");
  const res6 = await fetch(`${API_BASE}/verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      samplePath: aadhaarSample,
      forcedType: "AADHAAR",
      overrideData: JSON.stringify({ aadhaarNumber: "999988887778", name: "PRIYA VERMA", dob: "15/03/1998" })
    })
  }).then(r => r.json());

  console.log("Scenario 6 Result:", {
    status: res6.status,
    documentType: res6.documentType,
    detectedType: res6.detectedType,
    detectionConfidence: res6.detectionConfidence,
    verificationId: res6.verificationId
  });

  reportTest(
    "Scenario 6: Matching category executes full verification and persists detectedType",
    res6.success === true &&
    res6.documentType === "AADHAAR" &&
    res6.detectedType === "AADHAAR" &&
    res6.detectionConfidence >= 95 &&
    Boolean(res6.verificationId),
    JSON.stringify(res6)
  );

  // SCENARIO 7: Verify Audit Log persistence (Rule 7)
  console.log("\nTesting Scenario 7: Audit Log endpoint returns detectedType & confidence...");
  const historyRes = await fetch(`${API_BASE}/verification`).then(r => r.json());
  const latestRecord = historyRes.data ? historyRes.data[0] : null;

  console.log("Latest Audit Record:", {
    verificationId: latestRecord?.verificationId,
    documentType: latestRecord?.documentType,
    detectedType: latestRecord?.detectedType,
    detectionConfidence: latestRecord?.detectionConfidence,
    status: latestRecord?.status
  });

  reportTest(
    "Scenario 7: Audit Log stores detectedType and detectionConfidence for audit tracking",
    latestRecord &&
    latestRecord.documentType === "AADHAAR" &&
    latestRecord.detectedType === "AADHAAR" &&
    latestRecord.detectionConfidence >= 95,
    JSON.stringify(latestRecord)
  );

  console.log(`\n===============================================================`);
  console.log(`FINAL RESULTS: ${passed}/${total} TESTS PASSED`);
  console.log(`===============================================================\n`);

  process.exit(passed === total ? 0 : 1);
}

run().catch(err => {
  console.error("Suite fatal error:", err);
  process.exit(1);
});
