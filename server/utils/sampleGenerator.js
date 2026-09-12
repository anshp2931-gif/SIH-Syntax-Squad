import fs from "fs";
import path from "path";
import { PNG } from "pngjs";
import QRCode from "qrcode";

const samplesDir = "samples";

async function createSyntheticCard(filename, bgColor, textHeader, textSub, qrPayload) {
  const width = 600;
  const height = 380;
  const png = new PNG({ width, height });

  const [bgR, bgG, bgB] = bgColor;

  // Render background and card elements
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;

      // Card outer border
      if (x < 6 || x > width - 7 || y < 6 || y > height - 7) {
        png.data[idx] = 40;
        png.data[idx + 1] = 60;
        png.data[idx + 2] = 90;
        png.data[idx + 3] = 255;
        continue;
      }

      // Top banner
      if (y >= 10 && y <= 65) {
        png.data[idx] = Math.min(255, bgR + 30);
        png.data[idx + 1] = Math.min(255, bgG + 30);
        png.data[idx + 2] = Math.min(255, bgB + 50);
        png.data[idx + 3] = 255;
        continue;
      }

      // Photo placeholder box
      if (x >= 450 && x <= 560 && y >= 110 && y <= 250) {
        png.data[idx] = 200;
        png.data[idx + 1] = 210;
        png.data[idx + 2] = 220;
        png.data[idx + 3] = 255;
        continue;
      }

      // Default card background
      png.data[idx] = bgR;
      png.data[idx + 1] = bgG;
      png.data[idx + 2] = bgB;
      png.data[idx + 3] = 255;
    }
  }

  // Generate REAL QR Code using qrcode package
  try {
    const qrSize = 120;
    const qrBuffer = await QRCode.toBuffer(qrPayload, {
      width: qrSize,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF"
      }
    });

    const qrPng = PNG.sync.read(qrBuffer);
    const startX = 40;
    const startY = 240;

    for (let qy = 0; qy < qrPng.height; qy++) {
      for (let qx = 0; qx < qrPng.width; qx++) {
        const targetX = startX + qx;
        const targetY = startY + qy;
        if (targetX < width && targetY < height) {
          const srcIdx = (qrPng.width * qy + qx) << 2;
          const targetIdx = (width * targetY + targetX) << 2;
          png.data[targetIdx] = qrPng.data[srcIdx];
          png.data[targetIdx + 1] = qrPng.data[srcIdx + 1];
          png.data[targetIdx + 2] = qrPng.data[srcIdx + 2];
          png.data[targetIdx + 3] = 255;
        }
      }
    }
  } catch (err) {
    console.warn("Failed to overlay QR code:", err.message);
  }

  const filePath = path.join(samplesDir, filename);
  const buffer = PNG.sync.write(png);
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

export async function ensureSampleImagesExist() {
  if (!fs.existsSync(samplesDir)) {
    fs.mkdirSync(samplesDir, { recursive: true });
  }

  const sampleList = [
    { name: "sample_pan_card.png", color: [235, 245, 255], title: "INCOME TAX DEPARTMENT", sub: "PERMANENT ACCOUNT NUMBER", payload: "https://incometax.gov.in/verify/PAN:ABCDE1234F" },
    { name: "sample_driving_license.png", color: [255, 250, 240], title: "UNION OF INDIA", sub: "DRIVING LICENCE", payload: "https://parivahan.gov.in/verify/DL:DL1420110012345" },
    { name: "sample_aadhaar_card.png", color: [240, 255, 245], title: "UNIQUE IDENTIFICATION AUTHORITY OF INDIA", sub: "AADHAAR - MERA AADHAAR", payload: "https://digilocker.gov.in/verify/AADHAAR:999988887777" },
    { name: "sample_voter_id.png", color: [255, 240, 245], title: "ELECTION COMMISSION OF INDIA", sub: "ELECTORAL PHOTO IDENTITY CARD", payload: "https://nvsp.in/verify/EPIC:ABC1234567" },
    { name: "sample_passport.png", color: [240, 240, 255], title: "REPUBLIC OF INDIA", sub: "PASSPORT - PASSPORT NO Z1234567", payload: "https://passportindia.gov.in/verify/Z1234567" },
    { name: "sample_vehicle_rc.png", color: [255, 245, 235], title: "TRANSPORT DEPARTMENT", sub: "REGISTRATION CERTIFICATE", payload: "https://parivahan.gov.in/verify/RC:DL01AB1234" },
    { name: "sample_gstin.png", color: [250, 240, 255], title: "GOODS AND SERVICES TAX", sub: "GSTIN REGISTRATION CERTIFICATE", payload: "https://gst.gov.in/verify/GSTIN:27ABCDE1234F1Z5" },
    { name: "sample_ration_card.png", color: [245, 255, 240], title: "DEPARTMENT OF FOOD & CIVIL SUPPLIES", sub: "NATIONAL FOOD SECURITY RATION CARD", payload: "https://nfsa.gov.in/verify/RATION:RC1002345678" },
    { name: "sample_degree.png", color: [240, 245, 255], title: "UNIVERSITY GRANTS COMMISSION", sub: "BACHELOR OF TECHNOLOGY DEGREE", payload: "https://nad.digilocker.gov.in/verify/ROLL:180420010045" },
    { name: "sample_birth.png", color: [255, 245, 245], title: "DEPARTMENT OF HEALTH / MUNICIPAL CORP", sub: "CERTIFICATE OF BIRTH - CRS", payload: "https://crsorgi.gov.in/verify/BIRTH:CRS/2021/04561" }
  ];

  for (const s of sampleList) {
    const fullPath = path.join(samplesDir, s.name);
    if (!fs.existsSync(fullPath)) {
      await createSyntheticCard(s.name, s.color, s.title, s.sub, s.payload);
    }
  }

  return sampleList;
}
