import path from "path";
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

    // 2. Document Type Detection
    const detection = detectDocument(rawText);
    const documentType = detection.documentType;

    if (documentType === "UNKNOWN" && !req.body.forcedType) {
      // If document type could not be confidently identified from raw OCR text
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
        fileName: originalName
      });

      return res.status(200).json({
        success: true,
        message: "Document uploaded but document structure could not be automatically identified as PAN or Driving License.",
        data: unverifiedRecord
      });
    }

    const effectiveType = documentType !== "UNKNOWN" ? documentType : (req.body.forcedType || "PAN");

    // 3. Extract key fields (PAN, Name, DOB, License No, etc.)
    const extractedData = extractFields(effectiveType, rawText);

    // If sample mode or overrides provided in request, merge extracted fields
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

    // 7. Official Authoritative Issuer Verification (NSDL / Income Tax / Parivahan)
    const issuerResult = await verifyIssuer(effectiveType, extractedData);

    // 8. Template & Structural Check
    const templateValid = detection.confidence >= 30;

    // Compile 7 verification check booleans
    const checks = {
      documentType: true,
      ocr: ocrResult.success && rawText.length > 5,
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
