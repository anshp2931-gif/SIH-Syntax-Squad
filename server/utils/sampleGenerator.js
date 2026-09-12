import fs from "fs";
import path from "path";
import { PNG } from "pngjs";

const samplesDir = "samples";

function createSyntheticCard(filename, bgColor, textHeader, textSub, qrPayload) {
  const width = 600;
  const height = 380;
  const png = new PNG({ width, height });

  const [bgR, bgG, bgB] = bgColor;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;

      if (x < 6 || x > width - 7 || y < 6 || y > height - 7) {
        png.data[idx] = 40;
        png.data[idx + 1] = 60;
        png.data[idx + 2] = 90;
        png.data[idx + 3] = 255;
        continue;
      }

      if (y >= 10 && y <= 65) {
        png.data[idx] = Math.min(255, bgR + 30);
        png.data[idx + 1] = Math.min(255, bgG + 30);
        png.data[idx + 2] = Math.min(255, bgB + 50);
        png.data[idx + 3] = 255;
        continue;
      }

      if (x >= 450 && x <= 560 && y >= 110 && y <= 250) {
        png.data[idx] = 200;
        png.data[idx + 1] = 210;
        png.data[idx + 2] = 220;
        png.data[idx + 3] = 255;
        continue;
      }

      if (x >= 50 && x <= 130 && y >= 250 && y <= 330) {
        const isDark = ((x + y) % 13 < 6) || (x % 7 === 0);
        png.data[idx] = isDark ? 20 : 240;
        png.data[idx + 1] = isDark ? 20 : 240;
        png.data[idx + 2] = isDark ? 20 : 240;
        png.data[idx + 3] = 255;
        continue;
      }

      png.data[idx] = bgR;
      png.data[idx + 1] = bgG;
      png.data[idx + 2] = bgB;
      png.data[idx + 3] = 255;
    }
  }

  const filePath = path.join(samplesDir, filename);
  const buffer = PNG.sync.write(png);
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

export function ensureSampleImagesExist() {
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
    { name: "sample_gstin.png", color: [250, 240, 255], title: "GOODS AND SERVICES TAX", sub: "GSTIN REGISTRATION CERTIFICATE", payload: "https://gst.gov.in/verify/GSTIN:27ABCDE1234F1Z5" }
  ];

  sampleList.forEach((s) => {
    const fullPath = path.join(samplesDir, s.name);
    if (!fs.existsSync(fullPath)) {
      createSyntheticCard(s.name, s.color, s.title, s.sub, s.payload);
    }
  });

  return sampleList;
}
