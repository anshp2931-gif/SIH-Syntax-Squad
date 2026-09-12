import express from "express";
import { upload } from "../middleware/uploadMiddleware.js";
import {
  verifyDocument,
  detectDocumentType,
  getVerificationById,
  getAllVerifications
} from "../controllers/verificationController.js";

const router = express.Router();

// Smart document type detection endpoint
router.post("/detect", upload.single("document"), detectDocumentType);

// Upload document & trigger full 7-layer verification engine
router.post("/", upload.single("document"), verifyDocument);

// Get verification audit history
router.get("/", getAllVerifications);

// Get verification by unique Verification ID (e.g. DV-8F42A91)
router.get("/:id", getVerificationById);

export default router;
