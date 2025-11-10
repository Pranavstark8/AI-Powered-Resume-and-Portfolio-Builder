import express from "express";
import { generateResume } from "../controllers/aiController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected route
router.post("/generate", verifyToken, generateResume);

export default router;
