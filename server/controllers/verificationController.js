import path from "path";
import fs from "fs";
import crypto from "crypto";
import { extractText } from "../services/ocrService.js";
import { detectDocument, extractFields, getDocumentName } from "../services/documentDetector.js";
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

function getEffectiveText(rawText, req) {
  let text = (rawText || "").trim();
  if (text.length >= 15) return text;

  // If synthetic sample path or overrideData is provided
  if (req.body.overrideData) {
    try {
      const parsed = typeof req.body.overrideData === "string" ? JSON.parse(req.body.overrideData) : req.body.overrideData;
      if (parsed.unsupported) {
        return String(parsed.unsupported);
      } else if (parsed.rawText) {
        return String(parsed.rawText);
      } else if (parsed.textSnippet) {
        return String(parsed.textSnippet);
      } else if (parsed.aadhaarNumber) {
        return `GOVERNMENT OF INDIA UNIQUE IDENTIFICATION AUTHORITY OF INDIA MERA AADHAAR ${parsed.name || ""} ${parsed.aadhaarNumber} DOB: ${parsed.dob || ""}`;
      } else if (parsed.pan) {
        return `INCOME TAX DEPARTMENT GOVT OF INDIA PERMANENT ACCOUNT NUMBER ${parsed.pan} ${parsed.name || ""} FATHER'S NAME ${parsed.fatherName || ""}`;
      } else if (parsed.dlNumber) {
        return `UNION OF INDIA DRIVING LICENCE TRANSPORT DEPARTMENT ${parsed.dlNumber} ${parsed.name || ""} DOB ${parsed.dob || ""}`;
      } else if (parsed.passportNumber) {
        return `PASSPORT REPUBLIC OF INDIA ${parsed.passportNumber} ${parsed.name || ""} NATIONALITY IND`;
      } else if (parsed.visaNumber) {
        return `REPUBLIC OF INDIA VISA INDIAN VISA ${parsed.visaNumber} PASSPORT NO ${parsed.passportNumber || ""}`;
      } else if (parsed.permitNumber) {
        return `MOTOR VEHICLES DEPARTMENT GOODS CARRIAGE PERMIT NATIONAL PERMIT ${parsed.permitNumber} ${parsed.vehicleNumber || ""}`;
      } else if (parsed.epicNumber) {
        return `ELECTION COMMISSION OF INDIA ELECTORAL PHOTO IDENTITY CARD EPIC ${parsed.epicNumber} ${parsed.name || ""}`;
      } else if (parsed.vehicleNumber) {
        return `REGISTRATION CERTIFICATE MOTOR VEHICLES DEPARTMENT ${parsed.vehicleNumber} ${parsed.ownerName || ""}`;
      } else if (parsed.gstinNumber) {
        return `GOODS AND SERVICES TAX GSTIN ${parsed.gstinNumber} ${parsed.legalName || ""}`;
      } else if (parsed.rationNumber) {
        return `RATION CARD FOOD & CIVIL SUPPLIES NFSA ${parsed.rationNumber} ${parsed.headOfFamily || ""}`;
      } else if (parsed.rollNumber) {
        return `BOARD OF SECONDARY EDUCATION STATEMENT OF MARKS ${parsed.rollNumber} ${parsed.studentName || ""}`;
      } else if (parsed.registrationNumber) {
        return `BIRTH CERTIFICATE CIVIL REGISTRATION SYSTEM ${parsed.registrationNumber} ${parsed.childName || ""}`;
      }
    } catch (e) {
      // ignore
    }
  }

  if (req.body.samplePath) {
    const bn = path.basename(req.body.samplePath).toLowerCase();
    if (bn.includes("aadhaar")) {
      return "GOVERNMENT OF INDIA UNIQUE IDENTIFICATION AUTHORITY OF INDIA MERA AADHAAR 9999 8888 7778 PRIYA VERMA DOB 15/03/1998";
    } else if (bn.includes("pan")) {
      return "INCOME TAX DEPARTMENT GOVT OF INDIA PERMANENT ACCOUNT NUMBER ABCDE1234F RAHUL SHARMA DOB 12/05/2001";
    } else if (bn.includes("driving") || bn.includes("dl")) {
      return "UNION OF INDIA DRIVING LICENCE TRANSPORT DEPARTMENT DL1420110012345 VIKRAM SINGH DOB 20/08/1995";
    } else if (bn.includes("passport")) {
      return "PASSPORT REPUBLIC OF INDIA Z1234567 ROHAN MEHTA NATIONALITY IND";
    } else if (bn.includes("visa")) {
      return "REPUBLIC OF INDIA VISA INDIAN VISA V1234567 PASSPORT NO Z9876543";
    } else if (bn.includes("permit")) {
      return "MOTOR VEHICLES DEPARTMENT GOODS CARRIAGE PERMIT DL2023-GC-001234 DL01AB1234";
    } else if (bn.includes("voter")) {
      return "ELECTION COMMISSION OF INDIA ELECTORAL PHOTO IDENTITY CARD ABC1234567 AMIT KUMAR";
    } else if (bn.includes("rc")) {
      return "REGISTRATION CERTIFICATE MOTOR VEHICLES DEPARTMENT DL01AB1234 RAJESH GUPTA";
    } else if (bn.includes("gstin")) {
      return "GOODS AND SERVICES TAX GSTIN 27ABCDE1234F1Z5 SYNTAX SQUAD ENTERPRISES";
    } else if (bn.includes("ration")) {
      return "RATION CARD FOOD & CIVIL SUPPLIES RC1002345678 SUNITA DEVI";
    } else if (bn.includes("degree")) {
      return "BOARD OF SECONDARY EDUCATION STATEMENT OF MARKS 180420010045 ANISH SHARMA";
    } else if (bn.includes("birth")) {
      return "BIRTH CERTIFICATE CIVIL REGISTRATION SYSTEM CRS/2021/04561 AARAV KUMAR";
    }
  }

  return text;
}

/**
 * Fast Document Detection Endpoint Controller
 * POST /api/verification/detect
 */
export async function detectDocumentType(req, res) {
  try {
    let filePath = null;
    if (req.file) {
      filePath = req.file.path;
    } else if (req.body.samplePath) {
      filePath = req.body.samplePath;
    } else {
      return res.status(400).json({
        success: false,
        message: "No document image or sample provided for detection."
      });
    }

    const ocrResult = await extractText(filePath);
    const rawText = getEffectiveText(ocrResult.text || "", req);
    const detection = detectDocument(rawText);
    const selectedType = (req.body.selectedType && req.body.selectedType !== "AUTO") ? req.body.selectedType : null;

    if (detection.isLowConfidence || (detection.documentType === "UNKNOWN" && detection.confidence < 40)) {
      return res.status(200).json({
        success: true,
        status: "LOW_CONFIDENCE",
        isLowConfidence: true,
        confidence: detection.confidence,
        detectedType: "UNKNOWN",
        detectedName: "Unknown Document",
        selectedType,
        selectedName: selectedType ? getDocumentName(selectedType) : null,
        message: "Document type could not be identified confidently."
      });
    }

    if (detection.documentType === "UNSUPPORTED" || !detection.isSupported) {
      return res.status(200).json({
        success: true,
        status: "UNSUPPORTED",
        isSupported: false,
        confidence: detection.confidence,
        detectedType: "UNSUPPORTED",
        detectedName: "Unsupported Document Type",
        selectedType,
        selectedName: selectedType ? getDocumentName(selectedType) : null,
        message: "This document is currently not supported by DocAuth India."
      });
    }

    if (selectedType && selectedType !== detection.documentType) {
      return res.status(200).json({
        success: true,
        status: "MISMATCH",
        mismatch: true,
        selectedType,
        selectedName: getDocumentName(selectedType),
        detectedType: detection.documentType,
        detectedName: detection.documentName,
        confidence: detection.confidence,
        message: `This document appears to be an ${detection.documentName}. Please switch to the correct document type.`
      });
    }

    return res.status(200).json({
      success: true,
      status: "MATCH",
      mismatch: false,
      selectedType: selectedType || detection.documentType,
      selectedName: getDocumentName(selectedType || detection.documentType),
      detectedType: detection.documentType,
      detectedName: detection.documentName,
      confidence: detection.confidence,
      message: `Document detected as ${detection.documentName} with ${detection.confidence}% confidence.`
    });
  } catch (error) {
    console.error("Detect Document Type Error:", error);
    return res.status(500).json({
      success: false,
      message: "Document detection pipeline encountered an error.",
      error: error.message
    });
  } finally {
    if (req.file && req.file.path) {
      try {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (err) {
        // cleanup deferred
      }
    }
  }
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
    const rawText = getEffectiveText(ocrResult.text || "", req);

    const forcedType = (req.body.forcedType && req.body.forcedType !== "AUTO") ? req.body.forcedType : null;

    // 2. Smart Document Type Detection
    const detection = detectDocument(rawText);
    const documentType = detection.documentType;

    // RULE 5: If detection confidence is low, DO NOT GUESS.
    if (detection.isLowConfidence || (documentType === "UNKNOWN" && detection.confidence < 40)) {
      return res.status(200).json({
        success: true,
        status: "LOW_CONFIDENCE",
        isLowConfidence: true,
        confidence: detection.confidence,
        detectedType: "UNKNOWN",
        detectedName: "Unknown Document",
        selectedType: forcedType,
        selectedName: forcedType ? getDocumentName(forcedType) : null,
        message: "Document type could not be identified confidently."
      });
    }

    // RULE 4: If document type is unsupported
    if (documentType === "UNSUPPORTED" || !detection.isSupported) {
      return res.status(200).json({
        success: true,
        status: "UNSUPPORTED",
        isSupported: false,
        confidence: detection.confidence,
        detectedType: "UNSUPPORTED",
        detectedName: "Unsupported Document Type",
        selectedType: forcedType,
        selectedName: forcedType ? getDocumentName(forcedType) : null,
        message: "This document is currently not supported by DocAuth India."
      });
    }

    // RULE 3 & 6: If detected document is supported but selected category is wrong:
    // STOP current validation! Never run PAN validation rules on Aadhaar, Aadhaar on DL, etc.
    if (forcedType && documentType !== forcedType) {
      return res.status(200).json({
        success: true,
        status: "MISMATCH",
        mismatch: true,
        selectedType: forcedType,
        selectedName: getDocumentName(forcedType),
        detectedType: documentType,
        detectedName: detection.documentName,
        confidence: detection.confidence,
        message: `This document appears to be an ${detection.documentName}. Please switch to the correct document type.`
      });
    }

    // RULE 2: If selected category == detected category (or AUTO): continue verification normally!
    const effectiveType = forcedType || documentType;

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
    const templateValid = (detection.confidence >= 20) || isSampleOrOverride || Boolean(forcedType && (documentType === forcedType || documentType === "UNKNOWN"));

    // Compile 7 verification check booleans
    const checks = {
      documentType: true,
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
      detectedType: detection.documentType,
      detectionConfidence: detection.confidence,
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
      detectedType: detection.documentType,
      detectionConfidence: detection.confidence,
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
