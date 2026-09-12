import mongoose from "mongoose";

const verificationSchema = new mongoose.Schema(
  {
    verificationId: {
      type: String,
      required: true,
      unique: true
    },
    documentType: {
      type: String,
      enum: ["PAN", "DRIVING_LICENSE", "AADHAAR", "VOTER_ID", "PASSPORT", "VISA", "PERMIT", "VEHICLE_RC", "GSTIN", "RATION_CARD", "DEGREE_CERTIFICATE", "BIRTH_CERTIFICATE", "UNSUPPORTED", "UNKNOWN"],
      required: true
    },
    detectedType: {
      type: String,
      default: null
    },
    detectionConfidence: {
      type: Number,
      default: null
    },
    status: {
      type: String,
      enum: ["VERIFIED", "SUSPICIOUS", "UNVERIFIED"],
      required: true
    },
    checks: {
      documentType: Boolean,
      ocr: Boolean,
      format: Boolean,
      qr: Boolean,
      template: Boolean,
      tampering: Boolean,
      issuer: Boolean
    },
    extractedData: {
      type: Object,
      default: {}
    },
    riskScore: {
      type: Number,
      required: true
    },
    originalityScore: {
      type: Number,
      default: 100
    },
    tamperDetails: {
      type: Object,
      default: {}
    },
    qrDetails: {
      type: Object,
      default: {}
    },
    issuerDetails: {
      type: Object,
      default: {}
    },
    fileName: String
  },
  {
    timestamps: true
  }
);

// Mongoose model instance
const VerificationModel = mongoose.model("Verification", verificationSchema);

// In-Memory store fallback if MongoDB is disconnected
const inMemoryStore = [];

export default class Verification {
  static isConnected() {
    return mongoose.connection.readyState === 1;
  }

  static async create(data) {
    const record = {
      ...data,
      _id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (this.isConnected()) {
      try {
        const doc = await VerificationModel.create(data);
        return doc.toObject();
      } catch (err) {
        console.warn("MongoDB write failed, saving to local fallback store:", err.message);
      }
    }
    
    inMemoryStore.unshift(record);
    return record;
  }

  static async findById(verificationId) {
    if (this.isConnected()) {
      try {
        const doc = await VerificationModel.findOne({ verificationId });
        if (doc) return doc.toObject();
      } catch (err) {
        console.warn("MongoDB findById failed, searching fallback store:", err.message);
      }
    }
    return inMemoryStore.find((item) => item.verificationId === verificationId) || null;
  }

  static async find(query = {}, limit = 50) {
    if (this.isConnected()) {
      try {
        const docs = await VerificationModel.find(query).sort({ createdAt: -1 }).limit(limit);
        return docs.map(d => d.toObject());
      } catch (err) {
        console.warn("MongoDB find failed, returning fallback store:", err.message);
      }
    }
    return inMemoryStore.slice(0, limit);
  }
}
