import fs from "fs";
import path from "path";
import jsQR from "jsqr";
import { PNG } from "pngjs";
import jpeg from "jpeg-js";

/**
 * Reads an image file into RGBA raw pixel array, with format fallback
 */
function readImageData(imagePath) {
  const buffer = fs.readFileSync(imagePath);
  const ext = path.extname(imagePath).toLowerCase();

  // Try parsing as PNG first if extension is .png, else try JPEG, then try the other
  if (ext === ".png") {
    try {
      const png = PNG.sync.read(buffer);
      return { data: new Uint8ClampedArray(png.data), width: png.width, height: png.height };
    } catch (e) {
      const raw = jpeg.decode(buffer, { useTolerantUnknown: true });
      return { data: new Uint8ClampedArray(raw.data), width: raw.width, height: raw.height };
    }
  } else {
    try {
      const raw = jpeg.decode(buffer, { useTolerantUnknown: true });
      return { data: new Uint8ClampedArray(raw.data), width: raw.width, height: raw.height };
    } catch (e) {
      const png = PNG.sync.read(buffer);
      return { data: new Uint8ClampedArray(png.data), width: png.width, height: png.height };
    }
  }
}

/**
 * Crops a sub-region of RGBA image data for localized QR scanning
 */
function cropImageData(img, startXRatio, startYRatio, widthRatio, heightRatio) {
  const cropX = Math.floor(img.width * startXRatio);
  const cropY = Math.floor(img.height * startYRatio);
  const cropW = Math.floor(img.width * widthRatio);
  const cropH = Math.floor(img.height * heightRatio);

  const croppedData = new Uint8ClampedArray(cropW * cropH * 4);

  for (let y = 0; y < cropH; y++) {
    for (let x = 0; x < cropW; x++) {
      const srcIdx = ((cropY + y) * img.width + (cropX + x)) << 2;
      const destIdx = (y * cropW + x) << 2;
      croppedData[destIdx] = img.data[srcIdx];
      croppedData[destIdx + 1] = img.data[srcIdx + 1];
      croppedData[destIdx + 2] = img.data[srcIdx + 2];
      croppedData[destIdx + 3] = img.data[srcIdx + 3];
    }
  }

  return { data: croppedData, width: cropW, height: cropH };
}

/**
 * Scans image for QR code using multi-pass full & sub-region crop strategy
 */
function scanPasses(img) {
  // Pass 1: Full image scan (normal + inverted)
  let code = jsQR(img.data, img.width, img.height, { inversionAttempts: "attemptBoth" });
  if (code && code.data) return code;

  // Pass 2: Quadrant crops (bottom-left, bottom-right, top-right, top-left)
  const regions = [
    { x: 0.0, y: 0.4, w: 0.6, h: 0.6 }, // Bottom-left (Common in Aadhaar / PAN)
    { x: 0.4, y: 0.4, w: 0.6, h: 0.6 }, // Bottom-right
    { x: 0.4, y: 0.0, w: 0.6, h: 0.6 }, // Top-right
    { x: 0.0, y: 0.0, w: 0.6, h: 0.6 }  // Top-left
  ];

  for (const r of regions) {
    try {
      const cropped = cropImageData(img, r.x, r.y, r.w, r.h);
      code = jsQR(cropped.data, cropped.width, cropped.height, { inversionAttempts: "attemptBoth" });
      if (code && code.data) return code;
    } catch (e) {
      // ignore region crop error
    }
  }

  return null;
}

/**
 * Detects and decodes QR codes from document image file
 */
export async function detectQR(imagePath) {
  try {
    const img = readImageData(imagePath);
    const code = scanPasses(img);

    if (code && (code.data || code.binaryData)) {
      const payload = code.data || "";

      let isAuthorizedDomain = false;
      let issuerName = "Standard Document Barcode / QR";

      // Classify official Indian issuer QR code formats
      if (payload.includes("incometax.gov.in") || payload.includes("nsdl.co.in") || payload.includes("utiitsl.com") || payload.includes("PAN:")) {
        isAuthorizedDomain = true;
        issuerName = "Income Tax Department / Authorized NSDL Channel";
      } else if (payload.includes("parivahan.gov.in") || payload.includes("sarathi") || payload.includes("DL:") || payload.includes("RC:")) {
        isAuthorizedDomain = true;
        issuerName = "Ministry of Road Transport & Highways (Parivahan)";
      } else if (payload.includes("uidai.gov.in") || payload.includes("uidai") || payload.includes("PrintLetterBarcodeData") || payload.includes("AADHAAR:") || payload.length > 150) {
        isAuthorizedDomain = true;
        issuerName = "Unique Identification Authority of India (UIDAI / Secure QR)";
      } else if (payload.includes("digilocker.gov.in") || payload.includes("nad.digilocker.gov.in") || payload.includes("ROLL:")) {
        isAuthorizedDomain = true;
        issuerName = "DigiLocker / National Academic Depository Verified QR";
      } else if (payload.includes("nvsp.in") || payload.includes("EPIC:")) {
        isAuthorizedDomain = true;
        issuerName = "Election Commission of India (EPIC)";
      } else if (payload.includes("gst.gov.in") || payload.includes("GSTIN:")) {
        isAuthorizedDomain = true;
        issuerName = "Goods and Services Tax Network (GSTN)";
      } else if (payload.includes("nfsa.gov.in") || payload.includes("RATION:")) {
        isAuthorizedDomain = true;
        issuerName = "Department of Food & Public Distribution (NFSA)";
      } else if (payload.includes("crsorgi.gov.in") || payload.includes("BIRTH:")) {
        isAuthorizedDomain = true;
        issuerName = "Civil Registration System (CRS India)";
      } else if (payload.length > 20 || payload.includes("http://") || payload.includes("https://")) {
        isAuthorizedDomain = true;
        issuerName = "Structured Digital Signature QR";
      }

      return {
        detected: true,
        valid: true,
        data: payload,
        isAuthorizedDomain,
        issuerName,
        details: {
          location: code.location,
          payloadPreview: payload.substring(0, 120) + (payload.length > 120 ? "..." : "")
        }
      };
    }

    return {
      detected: false,
      valid: false,
      reason: "No readable QR code pattern identified on document image"
    };
  } catch (error) {
    return {
      detected: false,
      valid: false,
      reason: `QR Scan skipped: ${error.message}`
    };
  }
}
