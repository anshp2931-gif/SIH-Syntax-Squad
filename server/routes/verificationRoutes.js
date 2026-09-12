import express from "express";
import { upload } from "../middleware/uploadMiddleware.js";
import {
  verifyDocument,
  getVerificationById,
  getAllVerifications
} from "../controllers/verificationController.js";

const router = express.Router();

// Upload document & trigger full 7-layer verification engine
router.post("/", upload.single("document"), verifyDocument);

// Get verification audit history
router.get("/", getAllVerifications);

// Get verification by unique Verification ID (e.g. DV-8F42A91)
router.get("/:id", getVerificationById);

export default router;
