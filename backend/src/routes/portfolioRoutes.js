import express from "express";
import { db } from "../config/db.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Save resume data after generation
router.post("/save", verifyToken, async (req, res) => {
  const { resumeData } = req.body;
  const userId = req.user.id;
  try {
    // Create summary object with contact details and AI-generated summary
    const summaryObj = {
      name: resumeData.name || "",
      email: resumeData.email || "",
      mobile: resumeData.mobile || "",
      linkedin: resumeData.linkedin || "",
      github: resumeData.github || "",
      portfolio: resumeData.portfolio || "",
      summary: resumeData.summary || ""
    };
    
    await db.execute(
      "INSERT INTO resumes (user_id, title, summary, experience, education, skills, internship, job_experience, projects) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", 
      [
        userId,
        resumeData.title || null,
        JSON.stringify(summaryObj),
        JSON.stringify(resumeData.experience || []),
        JSON.stringify(resumeData.education || []),
        JSON.stringify(resumeData.skills || []),
        JSON.stringify(resumeData.internship || []),
        JSON.stringify(resumeData.jobExperience || []),
        JSON.stringify(resumeData.projects || []),
      ]
    );
    res.json({ message: "Resume saved successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get resume data by user
router.get("/user", verifyToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const [rows] = await db.execute("SELECT * FROM resumes WHERE user_id = ?", [userId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get specific resume by ID (for editing)
router.get("/resume/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  try {
    const [rows] = await db.execute(
      "SELECT * FROM resumes WHERE id = ? AND user_id = ?",
      [id, userId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "Resume not found" });
    }
    
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user stats for dashboard
router.get("/stats", verifyToken, async (req, res) => {
  const userId = req.user.id;
  try {
    // Get total resumes
    const [resumeCount] = await db.execute(
      "SELECT COUNT(*) as total FROM resumes WHERE user_id = ?",
      [userId]
    );

    // Get last updated resume
    const [lastResume] = await db.execute(
      "SELECT id, updated_at, experience FROM resumes WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1",
      [userId]
    );

    // Get resumes from last month for comparison
    const [lastMonthCount] = await db.execute(
      "SELECT COUNT(*) as total FROM resumes WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)",
      [userId]
    );

    // Get portfolio views
    const [viewsData] = await db.execute(
      "SELECT views, views_this_week FROM portfolio_views WHERE user_id = ?",
      [userId]
    );

    let lastResumeTitle = null;
    if (lastResume.length > 0) {
      try {
        const experience = JSON.parse(lastResume[0].experience || "[]");
        if (experience.length > 0 && experience[0].position) {
          lastResumeTitle = `${experience[0].position} Resume`;
        } else {
          lastResumeTitle = `Resume ${lastResume[0].id}`;
        }
      } catch (e) {
        lastResumeTitle = `Resume ${lastResume[0].id}`;
      }
    }

    res.json({
      totalResumes: resumeCount[0].total,
      lastUpdated: lastResume.length > 0 ? lastResume[0].updated_at : null,
      lastResumeTitle: lastResumeTitle,
      newThisMonth: lastMonthCount[0].total,
      portfolioViews: viewsData.length > 0 ? viewsData[0].views : 0,
      viewsThisWeek: viewsData.length > 0 ? viewsData[0].views_this_week : 0,
    });
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ message: err.message });
  }
});

// Public portfolio route (with view tracking)
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    // Get resume data
    const [rows] = await db.execute(
      "SELECT * FROM resumes WHERE user_id = ? ORDER BY id DESC LIMIT 1",
      [userId]
    );
    if (rows.length === 0) return res.status(404).json({ message: "No portfolio found" });

    // Get user's name and profile picture from users table
    const [userRows] = await db.execute(
      "SELECT name, profile_picture, profile_picture_public_id FROM users WHERE id = ?",
      [userId]
    );

    // Track view (increment both total views and weekly views)
    await db.execute(
      `INSERT INTO portfolio_views (user_id, views, views_this_week, last_view_date) 
       VALUES (?, 1, 1, NOW()) 
       ON DUPLICATE KEY UPDATE 
         views = views + 1,
         views_this_week = CASE 
           WHEN YEARWEEK(last_view_date, 1) = YEARWEEK(NOW(), 1) THEN views_this_week + 1
           ELSE 1
         END,
         last_view_date = NOW()`,
      [userId]
    );

    // Add user's account name and profile picture to the response
    const resume = rows[0];
    if (userRows.length > 0) {
      resume.accountName = userRows[0].name;
      resume.profilePicture = userRows[0].profile_picture;
      resume.profilePicturePublicId = userRows[0].profile_picture_public_id;
    }

    res.json(resume);
  } catch (err) {
    console.error("Error fetching portfolio:", err);
    res.status(500).json({ message: err.message });
  }
});

// Update resume (full update)
router.put("/update/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { resumeData } = req.body;
  const userId = req.user.id;
  
  try {
    // Verify ownership
    const [resume] = await db.execute(
      "SELECT id FROM resumes WHERE id = ? AND user_id = ?",
      [id, userId]
    );
    
    if (resume.length === 0) {
      return res.status(404).json({ message: "Resume not found or unauthorized" });
    }

    // Create summary object with contact details and AI-generated summary
    const summaryObj = {
      name: resumeData.name || "",
      email: resumeData.email || "",
      mobile: resumeData.mobile || "",
      linkedin: resumeData.linkedin || "",
      github: resumeData.github || "",
      portfolio: resumeData.portfolio || "",
      summary: resumeData.summary || ""
    };

    await db.execute(
      "UPDATE resumes SET title = ?, summary = ?, experience = ?, education = ?, skills = ?, internship = ?, job_experience = ?, projects = ?, updated_at = NOW() WHERE id = ? AND user_id = ?",
      [
        resumeData.title || null,
        JSON.stringify(summaryObj),
        JSON.stringify(resumeData.experience || []),
        JSON.stringify(resumeData.education || []),
        JSON.stringify(resumeData.skills || []),
        JSON.stringify(resumeData.internship || []),
        JSON.stringify(resumeData.jobExperience || []),
        JSON.stringify(resumeData.projects || []),
        id,
        userId
      ]
    );
    
    res.json({ message: "Resume updated successfully" });
  } catch (err) {
    console.error("Error updating resume:", err);
    res.status(500).json({ message: err.message });
  }
});

// Delete resume
router.delete("/delete/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  try {
    // Verify ownership
    const [resume] = await db.execute(
      "SELECT id FROM resumes WHERE id = ? AND user_id = ?",
      [id, userId]
    );
    
    if (resume.length === 0) {
      return res.status(404).json({ message: "Resume not found or unauthorized" });
    }

    await db.execute("DELETE FROM resumes WHERE id = ? AND user_id = ?", [id, userId]);
    
    res.json({ message: "Resume deleted successfully" });
  } catch (err) {
    console.error("Error deleting resume:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
