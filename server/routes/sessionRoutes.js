import express from "express";
import crypto from "crypto";
import os from "os";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

export function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  let candidateIp = null;

  for (const name of Object.keys(interfaces)) {
    const lname = name.toLowerCase();
    if (lname.includes("vethernet") || lname.includes("wsl") || lname.includes("virtual") || lname.includes("docker") || lname.includes("vmware")) {
      continue;
    }
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        if (iface.address.startsWith("192.168.") || iface.address.startsWith("10.")) {
          return iface.address;
        }
        if (!candidateIp) candidateIp = iface.address;
      }
    }
  }

  if (!candidateIp) {
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === "IPv4" && !iface.internal) {
          return iface.address;
        }
      }
    }
  }

  return candidateIp || "localhost";
}

// In-memory store for live mobile camera upload sync sessions
const mobileSessions = new Map();

// Periodic cleanup of stale sessions older than 30 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, sess] of mobileSessions.entries()) {
    if (now - sess.createdAt > 30 * 60 * 1000) {
      mobileSessions.delete(id);
    }
  }
}, 5 * 60 * 1000);

// POST /api/session/create -> Create a new mobile camera upload sync session
router.post("/create", async (req, res) => {
  const sessionId = `SESS-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
  const localIp = getLocalIpAddress();

  mobileSessions.set(sessionId, {
    id: sessionId,
    status: "PENDING",
    createdAt: Date.now(),
    file: null
  });

  return res.json({
    success: true,
    sessionId,
    localIp
  });
});

// GET /api/session/:id -> Poll status of mobile upload session
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const sess = mobileSessions.get(id);
  if (!sess) {
    return res.status(404).json({ success: false, message: "Session expired or invalid" });
  }
  return res.json({
    success: true,
    status: sess.status,
    file: sess.file
  });
});

// POST /api/session/:id/upload -> Upload document photo from mobile device
router.post("/:id/upload", upload.single("document"), (req, res) => {
  const { id } = req.params;
  const sess = mobileSessions.get(id);

  if (!req.file) {
    return res.status(400).json({ success: false, message: "No document file uploaded" });
  }

  const fileData = {
    originalname: req.file.originalname,
    filename: req.file.filename,
    path: req.file.path,
    size: req.file.size,
    mimetype: req.file.mimetype,
    fileUrl: `/uploads/${req.file.filename}`
  };

  if (sess) {
    sess.status = "COMPLETED";
    sess.file = fileData;
  } else {
    mobileSessions.set(id, {
      id,
      status: "COMPLETED",
      createdAt: Date.now(),
      file: fileData
    });
  }

  return res.json({
    success: true,
    message: "Document captured and uploaded successfully from mobile device!",
    file: fileData
  });
});

export default router;
