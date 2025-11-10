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
    // Allow null for deletion
    await db.execute(
      "UPDATE users SET profile_picture = ?, profile_picture_public_id = ? WHERE id = ?",
      [profilePictureUrl || null, publicId || null, userId]
    );

    // Get updated user data
    const [userRows] = await db.execute(
      "SELECT id, name, email, profile_picture, profile_picture_public_id FROM users WHERE id = ?",
      [userId]
    );

    res.json({
      success: true,
      message: profilePictureUrl ? "Profile picture updated successfully" : "Profile picture removed successfully",
      user: userRows[0]
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
    const [userRows] = await db.execute(
      "SELECT id, name, email, profile_picture, profile_picture_public_id FROM users WHERE id = ?",
      [req.user.id]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      user: userRows[0]
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ 
      success: false,
      message: "Error fetching profile" 
    });
  }
});

export default router;
