import assert from "assert";
import http from "http";
import fs from "fs";
import path from "path";
import express from "express";
import cors from "cors";
import verificationRoutes from "../routes/verificationRoutes.js";

console.log("===============================================================");
console.log("🌐 RUNNING HTTP API INTEGRATION TESTS FOR SMART DETECTION");
console.log("===============================================================\n");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/verification", verificationRoutes);

const server = http.createServer(app);

server.listen(5099, async () => {
  let passed = 0;
  let total = 0;

  async function postJson(endpoint, data) {
    const res = await fetch(`http://localhost:5099${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return res.json();
  }

  function assertTest(name, condition, details = "") {
    total++;
    if (condition) {
      passed++;
      console.log(`✅ [PASS] ${name}`);
    } else {
      console.error(`❌ [FAIL] ${name} ${details}`);
    }
  }

  try {
    // 1. Test POST /api/verification with PAN selected but Aadhaar sample path
    // Note: sample_aadhaar_card.png is in samples/
    const aadhaarSamplePath = path.resolve("samples/sample_aadhaar_card.png");
    const panSamplePath = path.resolve("samples/sample_pan_card.png");

    console.log("Testing POST /api/verification detect endpoint...");

    // Test detect endpoint without selectedType
    const detectRes = await postJson("/api/verification/detect", {
      samplePath: aadhaarSamplePath
    });
    assertTest("Detect endpoint returns response", detectRes.success === true, JSON.stringify(detectRes));

    // Test API Mismatch behavior: User selected PAN but sent Aadhaar
    const mismatchRes = await postJson("/api/verification", {
      samplePath: aadhaarSamplePath,
      forcedType: "PAN"
    });

    console.log("Mismatch Response Received:", {
      status: mismatchRes.status,
      mismatch: mismatchRes.mismatch,
      selectedType: mismatchRes.selectedType,
      detectedType: mismatchRes.detectedType,
      confidence: mismatchRes.confidence
    });

    assertTest(
      "API stops verification on mismatch and returns MISMATCH status",
      mismatchRes.status === "MISMATCH" && mismatchRes.mismatch === true
    );
    assertTest(
      "API returns correct selectedType (PAN)",
      mismatchRes.selectedType === "PAN"
    );

    // Test API Match behavior: User selected PAN and sent PAN
    const matchRes = await postJson("/api/verification", {
      samplePath: panSamplePath,
      forcedType: "PAN",
      overrideData: JSON.stringify({ pan: "ABCDE1234F" })
    });

    assertTest(
      "API continues verification when selected matches detected",
      matchRes.status === "VERIFIED" || matchRes.status === "SUSPICIOUS" || matchRes.status === "UNVERIFIED"
    );
    assertTest(
      "API persists detectedType in result",
      Boolean(matchRes.detectedType || matchRes.documentType === "PAN")
    );

  } catch (err) {
    console.error("Test execution exception:", err);
  } finally {
    server.close(() => {
      console.log(`\n===============================================================`);
      console.log(`API TEST RESULTS: ${passed}/${total} PASSED`);
      console.log(`===============================================================\n`);
      process.exit(passed === total ? 0 : 1);
    });
  }
});
