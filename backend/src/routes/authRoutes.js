import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { 
  validateRegistration, 
  validateLogin, 
  rateLimitLogin 
} from "../middleware/validationMiddleware.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { db } from "../config/db.js";

const router = express.Router();

router.post("/register", validateRegistration, registerUser);
router.post("/login", validateLogin, rateLimitLogin, loginUser);

// Update profile picture
router.put("/profile-picture", verifyToken, async (req, res) => {
  const { profilePictureUrl, publicId } = req.body;
  const userId = req.user.id;

  try {
    // Check if columns exist first
    let updateQuery = "UPDATE users SET profile_picture = ?, profile_picture_public_id = ? WHERE id = ?";
    try {
      await db.execute(updateQuery, [profilePictureUrl || null, publicId || null, userId]);
    } catch (err) {
      // If columns don't exist, try to add them first (or just skip)
      if (err.code && err.code.startsWith('ER_BAD_FIELD_ERROR')) {
        console.log("profile_picture columns don't exist, skipping update");
        return res.json({
          success: true,
          message: "Profile picture feature not available (columns not set up)",
          user: { id: userId }
        });
      }
      throw err;
    }

    // Get updated user data
    let userRows = [];
    try {
      const [result] = await db.execute(
        "SELECT id, name, email, profile_picture, profile_picture_public_id FROM users WHERE id = ?",
        [userId]
      );
      userRows = result;
    } catch (err) {
      // Fallback if columns don't exist
      const [result] = await db.execute(
        "SELECT id, name, email FROM users WHERE id = ?",
        [userId]
      );
      userRows = result;
      if (userRows.length > 0) {
        userRows[0].profile_picture = profilePictureUrl || null;
        userRows[0].profile_picture_public_id = publicId || null;
      }
    }

    res.json({
      success: true,
      message: profilePictureUrl ? "Profile picture updated successfully" : "Profile picture removed successfully",
      user: userRows[0] || { id: userId }
    });
  } catch (error) {
    console.error("Error updating profile picture:", error);
    res.status(500).json({ 
      success: false,
      message: "Error updating profile picture" 
    });
  }
});

// Get current user profile
router.get("/profile", verifyToken, async (req, res) => {
  try {
    // Try to get profile with picture columns first
    let userRows = [];
    try {
      const [result] = await db.execute(
        "SELECT id, name, email, profile_picture, profile_picture_public_id FROM users WHERE id = ?",
        [req.user.id]
      );
      userRows = result;
    } catch (err) {
      // Fallback if profile_picture columns don't exist
      const [result] = await db.execute(
        "SELECT id, name, email FROM users WHERE id = ?",
        [req.user.id]
      );
      userRows = result;
      // Add null values for missing columns
      if (userRows.length > 0) {
        userRows[0].profile_picture = null;
        userRows[0].profile_picture_public_id = null;
      }
    }

    if (userRows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      user: userRows[0]
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
    res.status(500).json({ 
      success: false,
      message: "Error fetching profile",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
