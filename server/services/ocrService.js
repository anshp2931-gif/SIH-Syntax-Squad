import { createWorker } from "tesseract.js";

/**
 * OCR Service wrapper using Tesseract.js
 * Performs text extraction with optimized worker configuration
 */
export async function extractText(imagePath) {
  let worker = null;
  try {
    worker = await createWorker("eng");
    
    // Process image
    const { data: { text, confidence } } = await worker.recognize(imagePath);
    await worker.terminate();

    return {
      text: text || "",
      confidence: confidence || 0,
      success: true
    };
  } catch (error) {
    if (worker) {
      try {
        await worker.terminate();
      } catch (e) {
        // ignore cleanup error
      }
    }
    console.error("OCR Extraction Error:", error);
    return {
      text: "",
      confidence: 0,
      success: false,
      error: error.message
    };
  }
}
