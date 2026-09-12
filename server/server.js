import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import verificationRoutes from "./routes/verificationRoutes.js";
import { upload, purgeUploadsDirectory } from "./middleware/uploadMiddleware.js";
import { ensureSampleImagesExist } from "./utils/sampleGenerator.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static("uploads"));
app.use("/samples", express.static("samples"));

ensureSampleImagesExist();
purgeUploadsDirectory();

app.get("/api/health", (req, res) => {
  res.json({
    status: "HEALTHY",
    service: "Indian Document Authenticity & Verification Platform API",
    version: "2.0.0",
    supportedDocumentTypes: ["PAN", "DRIVING_LICENSE", "AADHAAR", "VOTER_ID", "PASSPORT", "VISA", "PERMIT", "VEHICLE_RC", "GSTIN", "RATION_CARD", "DEGREE_CERTIFICATE", "BIRTH_CERTIFICATE"],
    mongoConnected: mongoose.connection.readyState === 1,
    timestamp: new Date().toISOString()
  });
});

app.get("/api/samples", (req, res) => {
  res.json({
    success: true,
    samples: [
      {
        id: "sample_pan",
        documentType: "PAN",
        title: "Sample PAN Card",
        fileName: "sample_pan_card.png",
        samplePath: path.resolve("samples/sample_pan_card.png"),
        previewUrl: `http://localhost:${PORT}/samples/sample_pan_card.png`,
        simulatedData: { pan: "ABCDE1234F", name: "RAHUL SHARMA", fatherName: "SURESH SHARMA", dob: "12/05/2001" }
      },
      {
        id: "sample_dl",
        documentType: "DRIVING_LICENSE",
        title: "Sample Driving Licence",
        fileName: "sample_driving_license.png",
        samplePath: path.resolve("samples/sample_driving_license.png"),
        previewUrl: `http://localhost:${PORT}/samples/sample_driving_license.png`,
        simulatedData: { dlNumber: "DL1420110012345", name: "VIKRAM SINGH", dob: "20/08/1995", stateCode: "DL", validTill: "19/08/2035" }
      },
      {
        id: "sample_aadhaar",
        documentType: "AADHAAR",
        title: "Sample Aadhaar Card",
        fileName: "sample_aadhaar_card.png",
        samplePath: path.resolve("samples/sample_aadhaar_card.png"),
        previewUrl: `http://localhost:${PORT}/samples/sample_aadhaar_card.png`,
        simulatedData: { aadhaarNumber: "999988887778", name: "PRIYA VERMA", dob: "15/03/1998", gender: "FEMALE" }
      },
      {
        id: "sample_voter",
        documentType: "VOTER_ID",
        title: "Sample Voter ID (EPIC)",
        fileName: "sample_voter_id.png",
        samplePath: path.resolve("samples/sample_voter_id.png"),
        previewUrl: `http://localhost:${PORT}/samples/sample_voter_id.png`,
        simulatedData: { epicNumber: "ABC1234567", name: "AMIT KUMAR", assemblyConstituency: "NEW DELHI AC-40" }
      },
      {
        id: "sample_passport",
        documentType: "PASSPORT",
        title: "Sample Indian Passport",
        fileName: "sample_passport.png",
        samplePath: path.resolve("samples/sample_passport.png"),
        previewUrl: `http://localhost:${PORT}/samples/sample_passport.png`,
        simulatedData: { passportNumber: "Z1234567", name: "ROHAN MEHTA", nationality: "IND", expiryDate: "10/12/2032" }
      },
      {
        id: "sample_rc",
        documentType: "VEHICLE_RC",
        title: "Sample Vehicle RC",
        fileName: "sample_vehicle_rc.png",
        samplePath: path.resolve("samples/sample_vehicle_rc.png"),
        previewUrl: `http://localhost:${PORT}/samples/sample_vehicle_rc.png`,
        simulatedData: { vehicleNumber: "DL01AB1234", ownerName: "RAJESH GUPTA", vehicleClass: "LMV / MOTOR CAR" }
      },
      {
        id: "sample_gstin",
        documentType: "GSTIN",
        title: "Sample GSTIN Certificate",
        fileName: "sample_gstin.png",
        samplePath: path.resolve("samples/sample_gstin.png"),
        previewUrl: `http://localhost:${PORT}/samples/sample_gstin.png`,
        simulatedData: { gstinNumber: "27ABCDE1234F1Z5", legalName: "SYNTAX SQUAD ENTERPRISES", taxpayerType: "REGULAR" }
      },
      {
        id: "sample_ration",
        documentType: "RATION_CARD",
        title: "Sample Ration Card",
        fileName: "sample_ration_card.png",
        samplePath: path.resolve("samples/sample_ration_card.png"),
        previewUrl: `http://localhost:${PORT}/samples/sample_ration_card.png`,
        simulatedData: { rationNumber: "RC1002345678", headOfFamily: "SUNITA DEVI", category: "NFSA / PDS" }
      },
      {
        id: "sample_degree",
        documentType: "DEGREE_CERTIFICATE",
        title: "Sample Degree Certificate",
        fileName: "sample_degree.png",
        samplePath: path.resolve("samples/sample_degree.png"),
        previewUrl: `http://localhost:${PORT}/samples/sample_degree.png`,
        simulatedData: { rollNumber: "180420010045", studentName: "ANISH SHARMA", institution: "INDIAN INSTITUTE OF TECHNOLOGY" }
      },
      {
        id: "sample_birth",
        documentType: "BIRTH_CERTIFICATE",
        title: "Sample Birth Certificate",
        fileName: "sample_birth.png",
        samplePath: path.resolve("samples/sample_birth.png"),
        previewUrl: `http://localhost:${PORT}/samples/sample_birth.png`,
        simulatedData: { registrationNumber: "CRS/2021/04561", childName: "AARAV KUMAR", registrar: "MUNICIPAL CORPORATION" }
      }
    ]
  });
});

app.use("/api/verification", verificationRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "API route not found." });
});

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/document_verification";

mongoose
  .connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 })
  .then(() => {
    console.log("Connected successfully to MongoDB instance.");
  })
  .catch((err) => {
    console.warn("[WARN] Operating with high-performance local fallback store.");
  });

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`[SERVER] Verification API Server listening on port ${PORT}`);
  console.log(`[HEALTH] Healthcheck: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});
