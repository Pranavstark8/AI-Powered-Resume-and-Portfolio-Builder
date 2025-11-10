import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "resume_builder_profiles", // Cloudinary folder name
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
    transformation: [
      { width: 500, height: 500, crop: "limit" }, // Limit max dimensions
      { quality: "auto" }, // Auto quality optimization
      { fetch_format: "auto" } // Auto format selection
    ]
  },
});

// Initialize multer with Cloudinary storage
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// Protected upload endpoint
router.post("/upload", verifyToken, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: "No image file provided" 
      });
    }

    // Return the Cloudinary URL
    res.json({
      success: true,
      message: "Image uploaded successfully",
      url: req.file.path, // Cloudinary URL
      public_id: req.file.filename, // Cloudinary public ID for deletion
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message || "Error uploading image" 
    });
  }
});

// Optional: Delete image endpoint
router.delete("/delete/:publicId", verifyToken, async (req, res) => {
  try {
    const { publicId } = req.params;
    const decodedPublicId = decodeURIComponent(publicId);
    
    // Delete image from Cloudinary
    const result = await cloudinary.uploader.destroy(decodedPublicId);
    
    if (result.result === "ok") {
      res.json({ 
        success: true,
        message: "Image deleted successfully" 
      });
    } else {
      res.status(404).json({ 
        success: false,
        message: "Image not found or already deleted" 
      });
    }
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message || "Error deleting image" 
    });
  }
});

export default router;

