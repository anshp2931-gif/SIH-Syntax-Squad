import path from "path";
import fs from "fs";
import crypto from "crypto";
import { extractText } from "../services/ocrService.js";
import { detectDocument, extractFields } from "../services/documentDetector.js";
import { validateDocument } from "../utils/validators.js";
import { detectQR } from "../services/qrService.js";
import { detectTampering } from "../services/tamperService.js";
import { verifyIssuer } from "../services/dlVerification.js";
import { calculateRisk, getStatus } from "../services/riskEngine.js";
import Verification from "../models/Verification.js";

/**
 * Generates a unique verification ID in format DV-XXXXXXX
 */
function generateVerificationId() {
  const hex = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `DV-${hex}`;
}

/**
 * Primary verification endpoint controller
 * POST /api/verification
 */
export async function verifyDocument(req, res) {
  try {
    let filePath = null;
    let originalName = "uploaded_document";

    if (req.file) {
      filePath = req.file.path;
      originalName = req.file.originalname;
    } else if (req.body.samplePath) {
      filePath = req.body.samplePath;
      originalName = path.basename(filePath);
    } else {
      return res.status(400).json({
        success: false,
        message: "No document image or sample provided for verification."
      });
    }

    // 1. OCR Text Extraction
    const ocrResult = await extractText(filePath);
    const rawText = ocrResult.text || "";

    const forcedType = (req.body.forcedType && req.body.forcedType !== "AUTO") ? req.body.forcedType : null;

    // 2. Document Type Detection
    const detection = detectDocument(rawText);
    let documentType = detection.documentType;

    // Smart Deterministic Pattern Validation Override & Fallback
    if (rawText) {
      const normUpper = rawText.toUpperCase();
      const isPassport = normUpper.includes("PASSPORT") || normUpper.includes("P<IND") || normUpper.includes("REPUBLIC OF INDIA");
      const isDegree = normUpper.includes("STATEMENT OF MARKS") || normUpper.includes("MARKSHEET") || normUpper.includes("BOARD OF SECONDARY") || normUpper.includes("HIGHER SECONDARY") || (normUpper.includes("BOARD") && normUpper.includes("EXAMINATION"));

      if (isPassport) {
        documentType = "PASSPORT";
        detection.confidence = 95;
      } else if (isDegree) {
        documentType = "DEGREE_CERTIFICATE";
        detection.confidence = 90;
      } else {
        // Check PAN (only for genuine non-passport documents)
        const panFields = extractFields("PAN", rawText);
        const panVal = validateDocument("PAN", panFields);
        if (panVal && panVal.valid && panFields.pan && !panFields.pan.includes("<")) {
          documentType = "PAN";
          detection.confidence = 95;
        } else {
          const aadhFields = extractFields("AADHAAR", rawText);
          const aadhVal = validateDocument("AADHAAR", aadhFields);
          if (aadhVal && aadhVal.valid) {
            documentType = "AADHAAR";
            detection.confidence = 95;
          } else {
            const dlFields = extractFields("DRIVING_LICENSE", rawText);
            const dlVal = validateDocument("DRIVING_LICENSE", dlFields);
            if (dlVal && dlVal.valid) {
              documentType = "DRIVING_LICENSE";
              detection.confidence = 95;
            } else {
              const voterFields = extractFields("VOTER_ID", rawText);
              const voterVal = validateDocument("VOTER_ID", voterFields);
              if (voterVal && voterVal.valid) {
                documentType = "VOTER_ID";
                detection.confidence = 95;
              }
            }
          }
        }
      }
    }

    // If AUTO mode was selected and document type could not be identified
    if (!forcedType && documentType === "UNKNOWN") {
      const verificationId = generateVerificationId();
      const riskCalculation = calculateRisk({
        documentType: false,
        ocr: ocrResult.success && rawText.length > 10,
        format: false,
        qr: false,
        template: false,
        tampering: true,
        issuer: false
      });

      const unverifiedRecord = await Verification.create({
        verificationId,
        documentType: "UNKNOWN",
        status: getStatus(riskCalculation.riskScore),
        checks: {
          documentType: false,
          ocr: ocrResult.success && rawText.length > 10,
          format: false,
          qr: false,
          template: false,
          tampering: true,
          issuer: false
        },
        extractedData: { rawTextSnippet: rawText.substring(0, 200) },
        riskScore: riskCalculation.riskScore,
        originalityScore: riskCalculation.originalityScore,
        fileName: originalName
      });

      return res.status(200).json({
        success: true,
        verificationId,
        documentType: "UNKNOWN",
        status: getStatus(riskCalculation.riskScore),
        riskScore: riskCalculation.riskScore,
        originalityScore: riskCalculation.originalityScore,
        checks: unverifiedRecord.checks,
        extractedData: unverifiedRecord.extractedData,
        penalties: riskCalculation.penalties,
        message: "Document uploaded but document structure could not be automatically identified.",
        data: unverifiedRecord
      });
    }

    // Determine effective target document type (explicitly selected button takes precedence)
    const effectiveType = forcedType || (documentType !== "UNKNOWN" ? documentType : "PAN");

    // Check if target selection matches detected document type
    let documentTypeCheckPassed = true;
    if (forcedType && documentType !== "UNKNOWN" && documentType !== forcedType) {
      // Document mismatch: User selected target X, but OCR detected layout Y
      documentTypeCheckPassed = false;
    } else if (!forcedType && documentType === "UNKNOWN") {
      documentTypeCheckPassed = false;
    }

    // 3. Extract key fields for the target document type
    const extractedData = extractFields(effectiveType, rawText);

    // If sample mode or overrides provided in request, merge extracted fields
    const isSampleOrOverride = Boolean(req.body.overrideData);
    if (req.body.overrideData) {
      try {
        const parsed = JSON.parse(req.body.overrideData);
        Object.assign(extractedData, parsed);
      } catch (e) {
        // ignore JSON parse error
      }
    }

    // 4. Format Validation
    const formatResult = validateDocument(effectiveType, extractedData);

    // 5. QR Code Scanning & Payload Check
    const qrResult = await detectQR(filePath);

    // 6. Image Tampering & ELA Analysis
    const tamperResult = await detectTampering(filePath);

    // 7. Official Authoritative Issuer Verification
    const issuerResult = await verifyIssuer(effectiveType, extractedData);

    // 8. Template & Structural Check
    const templateValid = (detection.confidence >= 15) || formatResult.valid || isSampleOrOverride || Boolean(forcedType && (documentType === forcedType || documentType === "UNKNOWN"));

    // Compile 7 verification check booleans
    const checks = {
      documentType: documentTypeCheckPassed,
      ocr: ocrResult.success && (rawText.length > 5 || isSampleOrOverride),
      format: formatResult.valid,
      qr: qrResult.detected && qrResult.valid,
      template: templateValid,
      tampering: !tamperResult.suspicious,
      issuer: issuerResult.verified
    };

    // 9. Calculate Risk Score & Final Status
    const riskAnalysis = calculateRisk(checks);
    const status = getStatus(riskAnalysis.riskScore);
    const verificationId = generateVerificationId();

    // 10. Persist Verification Audit Record
    const verificationRecord = await Verification.create({
      verificationId,
      documentType: effectiveType,
      status,
      checks,
      extractedData,
      riskScore: riskAnalysis.riskScore,
      originalityScore: riskAnalysis.originalityScore,
      tamperDetails: tamperResult,
      qrDetails: qrResult,
      issuerDetails: issuerResult,
      fileName: originalName
    });

    // 11. Return detailed JSON response
    return res.status(200).json({
      success: true,
      verificationId,
      documentType: effectiveType,
      status,
      riskScore: riskAnalysis.riskScore,
      originalityScore: riskAnalysis.originalityScore,
      checks,
      extractedData,
      tamperDetails: tamperResult,
      qrDetails: qrResult,
      issuerDetails: issuerResult,
      penalties: riskAnalysis.penalties,
      data: verificationRecord
    });
  } catch (error) {
    console.error("Verification Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: "Document verification pipeline encountered an error.",
      error: error.message
    });
  } finally {
    // Privacy & Zero-Retention Compliance: Immediately wipe raw uploaded private document from server disk
    if (req.file && req.file.path) {
      const fullPath = path.resolve(req.file.path);
      const attemptDelete = (delay = 0) => {
        setTimeout(() => {
          if (fs.existsSync(fullPath)) {
            try {
              fs.unlinkSync(fullPath);
              console.log(`[Zero-Retention Cleanup] Successfully deleted temporary file: ${path.basename(fullPath)}`);
            } catch (cleanupErr) {
              if (delay < 1000) {
                attemptDelete(delay + 250);
              } else {
                console.warn(`[Zero-Retention Notice] Transient cleanup deferred for ${path.basename(fullPath)}:`, cleanupErr.message);
              }
            }
          }
        }, delay);
      };
      attemptDelete(0);
    }
  }
}

/**
 * GET /api/verification/:id
 * Retrieve previous verification result by ID
 */
export async function getVerificationById(req, res) {
  try {
    const { id } = req.params;
    const record = await Verification.findById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: `Verification record with ID ${id} not found.`
      });
    }

    return res.status(200).json({
      success: true,
      data: record
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve verification record.",
      error: error.message
    });
  }
}

/**
 * GET /api/verification
 * Retrieve recent verification history list
 */
export async function getAllVerifications(req, res) {
  try {
    const records = await Verification.find({}, 50);
    return res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve verification history.",
      error: error.message
    });
  }
}
