import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import verificationRoutes from "./routes/verificationRoutes.js";
import { ensureSampleImagesExist } from "./utils/sampleGenerator.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS & JSON payload parsing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files & static sample documents
app.use("/uploads", express.static("uploads"));
app.use("/samples", express.static("samples"));

// Ensure demo sample cards exist
ensureSampleImagesExist();

// API Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "HEALTHY",
    service: "Indian Document Authenticity & Verification Platform API",
    version: "1.0.0",
    mongoConnected: mongoose.connection.readyState === 1,
    timestamp: new Date().toISOString()
  });
});

// Sample documents metadata endpoint
app.get("/api/samples", (req, res) => {
  res.json({
    success: true,
    samples: [
      {
        id: "sample_pan",
        documentType: "PAN",
        title: "Sample Indian PAN Card",
        fileName: "sample_pan_card.png",
        samplePath: path.resolve("samples/sample_pan_card.png"),
        previewUrl: `http://localhost:${PORT}/samples/sample_pan_card.png`,
        simulatedData: {
          pan: "ABCDE1234F",
          name: "RAHUL SHARMA",
          fatherName: "SURESH SHARMA",
          dob: "12/05/2001"
        }
      },
      {
        id: "sample_dl",
        documentType: "DRIVING_LICENSE",
        title: "Sample Driving Licence (DL)",
        fileName: "sample_driving_license.png",
        samplePath: path.resolve("samples/sample_driving_license.png"),
        previewUrl: `http://localhost:${PORT}/samples/sample_driving_license.png`,
        simulatedData: {
          dlNumber: "DL1420110012345",
          name: "VIKRAM SINGH",
          dob: "20/08/1995",
          stateCode: "DL",
          validTill: "19/08/2035"
        }
      }
    ]
  });
});

// Mount Verification Routes
app.use("/api/verification", verificationRoutes);

// Global 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "API route not found." });
});

// Connect to MongoDB & Start Express Server
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/document_verification";

mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 3000
  })
  .then(() => {
    console.log("Connected successfully to MongoDB instance.");
  })
  .catch((err) => {
    console.warn("⚠️ Could not connect to local MongoDB daemon. Operating with high-performance local fallback store.");
  });

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Verification API Server listening on port ${PORT}`);
  console.log(`🔗 Healthcheck: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Verification API: http://localhost:${PORT}/api/verification`);
  console.log(`=======================================================`);
});
