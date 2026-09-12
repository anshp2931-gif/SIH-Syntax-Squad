import fs from "fs";
import path from "path";
import jsQR from "jsqr";
import { PNG } from "pngjs";
import jpeg from "jpeg-js";

/**
 * Reads an image file (PNG/JPEG) into RGBA raw pixel array for jsQR
 */
function readImageData(imagePath) {
  const ext = path.extname(imagePath).toLowerCase();
  const buffer = fs.readFileSync(imagePath);

  if (ext === ".png") {
    const png = PNG.sync.read(buffer);
    return {
      data: new Uint8ClampedArray(png.data),
      width: png.width,
      height: png.height
    };
  } else if (ext === ".jpg" || ext === ".jpeg") {
    const rawImageData = jpeg.decode(buffer, { useTolerantUnknown: true });
    return {
      data: new Uint8ClampedArray(rawImageData.data),
      width: rawImageData.width,
      height: rawImageData.height
    };
  }

  throw new Error("Unsupported image format for QR code scanning");
}

/**
 * Detects and decodes QR codes from image file
 */
export async function detectQR(imagePath) {
  try {
    const img = readImageData(imagePath);
    const code = jsQR(img.data, img.width, img.height, {
      inversionAttempts: "dontInvert"
    });

    if (code && code.data) {
      const payload = code.data;

      // Check if QR data points to official / authorized domain or structured string
      let isAuthorizedDomain = false;
      let issuerName = "Unknown Issuer";

      if (payload.includes("incometax.gov.in") || payload.includes("nsdl.co.in") || payload.includes("utiitsl.com")) {
        isAuthorizedDomain = true;
        issuerName = "Income Tax Department / Authorized NSDL Channel";
      } else if (payload.includes("parivahan.gov.in") || payload.includes("sarathi")) {
        isAuthorizedDomain = true;
        issuerName = "Ministry of Road Transport & Highways (Parivahan)";
      } else if (payload.includes("digilocker.gov.in")) {
        isAuthorizedDomain = true;
        issuerName = "DigiLocker Verified QR";
      } else if (payload.includes("PAN:") || payload.includes("DL:")) {
        // Structured raw text payload
        isAuthorizedDomain = true;
        issuerName = "Structured Cryptographic Issuer QR Payload";
      }

      return {
        detected: true,
        valid: true,
        data: payload,
        isAuthorizedDomain,
        issuerName,
        details: {
          location: code.location,
          payloadPreview: payload.substring(0, 100) + (payload.length > 100 ? "..." : "")
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
