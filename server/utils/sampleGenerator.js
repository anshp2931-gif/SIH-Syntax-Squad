import fs from "fs";
import path from "path";
import { PNG } from "pngjs";

const samplesDir = "samples";

/**
 * Creates a synthetic ID Card image with text and layout elements
 */
function createSyntheticCard(filename, bgColor, textLines, qrPayload) {
  const width = 600;
  const height = 380;
  const png = new PNG({ width, height });

  // Fill background
  const [bgR, bgG, bgB] = bgColor;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;

      // Card border
      if (x < 6 || x > width - 7 || y < 6 || y > height - 7) {
        png.data[idx] = 40;
        png.data[idx + 1] = 60;
        png.data[idx + 2] = 90;
        png.data[idx + 3] = 255;
        continue;
      }

      // Gradient header line
      if (y >= 10 && y <= 65) {
        png.data[idx] = Math.min(255, bgR + 30);
        png.data[idx + 1] = Math.min(255, bgG + 30);
        png.data[idx + 2] = Math.min(255, bgB + 50);
        png.data[idx + 3] = 255;
        continue;
      }

      // Simulated photo box on right
      if (x >= 450 && x <= 560 && y >= 110 && y <= 250) {
        png.data[idx] = 200;
        png.data[idx + 1] = 210;
        png.data[idx + 2] = 220;
        png.data[idx + 3] = 255;
        continue;
      }

      // Simulated QR pattern on bottom left
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

  const panPath = path.join(samplesDir, "sample_pan_card.png");
  const dlPath = path.join(samplesDir, "sample_driving_license.png");

  if (!fs.existsSync(panPath)) {
    createSyntheticCard(
      "sample_pan_card.png",
      [235, 245, 255], // Soft blue PAN theme
      ["INCOME TAX DEPARTMENT", "GOVT OF INDIA", "PERMANENT ACCOUNT NUMBER", "ABCDE1234F", "RAHUL SHARMA"],
      "https://incometax.gov.in/verify/PAN:ABCDE1234F"
    );
  }

  if (!fs.existsSync(dlPath)) {
    createSyntheticCard(
      "sample_driving_license.png",
      [255, 250, 240], // Soft amber DL theme
      ["UNION OF INDIA", "DRIVING LICENCE", "DL1420110012345", "VIKRAM SINGH", "VALID TILL: 2035"],
      "https://parivahan.gov.in/verify/DL:DL1420110012345"
    );
  }

  return {
    panSample: panPath,
    dlSample: dlPath
  };
}
