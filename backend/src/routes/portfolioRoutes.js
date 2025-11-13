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
    
    // First, check what columns actually exist in the resumes table
    const [columns] = await db.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'resumes'`
    );
    
    const existingColumns = columns.map(col => col.COLUMN_NAME.toLowerCase());
    console.log("Available columns in resumes table:", existingColumns);
    
    // Build INSERT query dynamically based on available columns
    const insertColumns = [];
    const insertValues = [];
    
    // Always include user_id if it exists
    if (existingColumns.includes('user_id')) {
      insertColumns.push('user_id');
      insertValues.push(userId);
    }
    
    // Add optional columns if they exist
    if (existingColumns.includes('title')) {
      insertColumns.push('title');
      insertValues.push(resumeData.title || null);
    }
    
    if (existingColumns.includes('summary')) {
      insertColumns.push('summary');
      insertValues.push(JSON.stringify(summaryObj));
    }
    
    if (existingColumns.includes('experience')) {
      insertColumns.push('experience');
      insertValues.push(JSON.stringify(resumeData.experience || []));
    }
    
    if (existingColumns.includes('education')) {
      insertColumns.push('education');
      insertValues.push(JSON.stringify(resumeData.education || []));
    }
    
    if (existingColumns.includes('skills')) {
      insertColumns.push('skills');
      insertValues.push(JSON.stringify(resumeData.skills || []));
    }
    
    if (existingColumns.includes('internship')) {
      insertColumns.push('internship');
      insertValues.push(JSON.stringify(resumeData.internship || []));
    }
    
    if (existingColumns.includes('job_experience')) {
      insertColumns.push('job_experience');
      insertValues.push(JSON.stringify(resumeData.jobExperience || []));
    }
    
    if (existingColumns.includes('projects')) {
      insertColumns.push('projects');
      insertValues.push(JSON.stringify(resumeData.projects || []));
    }
    
    // Check if we have at least user_id
    if (insertColumns.length === 0) {
      throw new Error("resumes table structure is invalid. Missing required columns.");
    }
    
    // Build and execute the INSERT query
    const placeholders = insertColumns.map(() => '?').join(', ');
    const query = `INSERT INTO resumes (${insertColumns.join(', ')}) VALUES (${placeholders})`;
    
    console.log("Executing INSERT with columns:", insertColumns);
    await db.execute(query, insertValues);
    
    res.json({ message: "Resume saved successfully!" });
  } catch (err) {
    console.error("Error saving resume:", err);
    console.error("Error details:", {
      message: err.message,
      code: err.code,
      sqlState: err.sqlState,
      sqlMessage: err.sqlMessage
    });
    
    // Provide helpful error message
    if (err.code === 'ER_BAD_FIELD_ERROR' || err.message.includes('table structure')) {
      res.status(500).json({ 
        message: "Database schema error. Please ensure the resumes table has the required columns (user_id, summary, experience, education, skills).",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    } else {
      res.status(500).json({ 
        message: "Error saving resume",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }
});

// Get resume data by user
router.get("/user", verifyToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const [rows] = await db.execute("SELECT * FROM resumes WHERE user_id = ?", [userId]);
    
    // Parse JSON strings from database to objects/arrays
    const fieldsToParse = ['summary', 'skills', 'experience', 'education', 'internship', 'job_experience', 'projects'];
    const parsedRows = rows.map(resume => {
      const parsed = { ...resume };
      fieldsToParse.forEach(field => {
        if (parsed[field] && typeof parsed[field] === 'string') {
          try {
            parsed[field] = JSON.parse(parsed[field]);
          } catch (e) {
            // If parsing fails, keep as string
            console.log(`Warning: Could not parse ${field} as JSON for resume ${resume.id}`);
          }
        }
      });
      return parsed;
    });
    
    res.json(parsedRows);
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
    
    // Parse JSON strings from database to objects/arrays
    const resume = rows[0];
    const fieldsToParse = ['summary', 'skills', 'experience', 'education', 'internship', 'job_experience', 'projects'];
    fieldsToParse.forEach(field => {
      if (resume[field] && typeof resume[field] === 'string') {
        try {
          resume[field] = JSON.parse(resume[field]);
        } catch (e) {
          // If parsing fails, keep as string
          console.log(`Warning: Could not parse ${field} as JSON for resume ${id}`);
        }
      }
    });
    
    res.json(resume);
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

    // Get last updated resume (handle missing updated_at column)
    let lastResume = [];
    try {
      const [result] = await db.execute(
        "SELECT id, updated_at, experience FROM resumes WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1",
        [userId]
      );
      lastResume = result;
    } catch (err) {
      // Fallback if updated_at doesn't exist, use created_at or id
      try {
        const [result] = await db.execute(
          "SELECT id, created_at as updated_at, experience FROM resumes WHERE user_id = ? ORDER BY id DESC LIMIT 1",
          [userId]
        );
        lastResume = result;
      } catch (err2) {
        const [result] = await db.execute(
          "SELECT id, experience FROM resumes WHERE user_id = ? ORDER BY id DESC LIMIT 1",
          [userId]
        );
        lastResume = result;
      }
    }

    // Get resumes from last month for comparison (handle missing created_at)
    let lastMonthCount = [{ total: 0 }];
    try {
      const [result] = await db.execute(
        "SELECT COUNT(*) as total FROM resumes WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)",
        [userId]
      );
      lastMonthCount = result;
    } catch (err) {
      // If created_at doesn't exist, just return 0
      console.log("created_at column not found, returning 0 for newThisMonth");
      lastMonthCount = [{ total: 0 }];
    }

    // Get portfolio views (handle missing table gracefully)
    let viewsData = [];
    try {
      const [result] = await db.execute(
        "SELECT views, views_this_week FROM portfolio_views WHERE user_id = ?",
        [userId]
      );
      viewsData = result;
    } catch (err) {
      // portfolio_views table doesn't exist yet - return zeros
      console.log("portfolio_views table not found, returning default values");
      viewsData = [];
    }

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
      lastUpdated: lastResume.length > 0 ? (lastResume[0].updated_at || lastResume[0].created_at || null) : null,
      lastResumeTitle: lastResumeTitle,
      newThisMonth: lastMonthCount[0].total,
      portfolioViews: viewsData.length > 0 ? viewsData[0].views : 0,
      viewsThisWeek: viewsData.length > 0 ? viewsData[0].views_this_week : 0,
    });
  } catch (err) {
    console.error("Error fetching stats:", err);
    console.error("Error details:", {
      message: err.message,
      code: err.code,
      sqlState: err.sqlState,
      sqlMessage: err.sqlMessage
    });
    res.status(500).json({ 
      message: "Error fetching dashboard stats",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
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

    // Get user's name and profile picture from users table (handle missing columns)
    let userRows = [];
    try {
      const [result] = await db.execute(
        "SELECT name, profile_picture, profile_picture_public_id FROM users WHERE id = ?",
        [userId]
      );
      userRows = result;
    } catch (err) {
      // Fallback if profile_picture columns don't exist
      try {
        const [result] = await db.execute(
          "SELECT name FROM users WHERE id = ?",
          [userId]
        );
        userRows = result;
      } catch (err2) {
        console.error("Error fetching user:", err2);
        userRows = [];
      }
    }

    // Track view (increment both total views and weekly views) - handle missing table
    try {
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
    } catch (err) {
      // portfolio_views table doesn't exist - silently continue
      console.log("portfolio_views table not found, skipping view tracking");
    }

    // Add user's account name and profile picture to the response
    const resume = rows[0];
    if (userRows.length > 0) {
      resume.accountName = userRows[0].name;
      resume.profilePicture = userRows[0].profile_picture;
      resume.profilePicturePublicId = userRows[0].profile_picture_public_id;
    }

    // Parse JSON strings from database to objects/arrays
    // MySQL returns JSON columns as strings, so we need to parse them
    const fieldsToParse = ['summary', 'skills', 'experience', 'education', 'internship', 'job_experience', 'projects'];
    fieldsToParse.forEach(field => {
      if (resume[field] && typeof resume[field] === 'string') {
        try {
          resume[field] = JSON.parse(resume[field]);
        } catch (e) {
          // If parsing fails, keep as string
          console.log(`Warning: Could not parse ${field} as JSON, keeping as string`);
        }
      }
    });

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

    // Try full UPDATE first (with all columns)
    try {
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
    } catch (err) {
      // If that fails, try with only basic columns (fallback for older schema)
      if (err.code && err.code.startsWith('ER_BAD_FIELD_ERROR')) {
        console.log("Some columns missing, trying basic UPDATE");
        try {
          // Try with title and updated_at
          await db.execute(
            "UPDATE resumes SET title = ?, summary = ?, experience = ?, education = ?, skills = ?, updated_at = NOW() WHERE id = ? AND user_id = ?",
            [
              resumeData.title || null,
              JSON.stringify(summaryObj),
              JSON.stringify(resumeData.experience || []),
              JSON.stringify(resumeData.education || []),
              JSON.stringify(resumeData.skills || []),
              id,
              userId
            ]
          );
        } catch (err2) {
          // Final fallback - no title or updated_at columns
          console.log("Title/updated_at columns missing, using minimal UPDATE");
          await db.execute(
            "UPDATE resumes SET summary = ?, experience = ?, education = ?, skills = ? WHERE id = ? AND user_id = ?",
            [
              JSON.stringify(summaryObj),
              JSON.stringify(resumeData.experience || []),
              JSON.stringify(resumeData.education || []),
              JSON.stringify(resumeData.skills || []),
              id,
              userId
            ]
          );
        }
      } else {
        throw err; // Re-throw if it's not a column error
      }
    }
    
    res.json({ message: "Resume updated successfully" });
  } catch (err) {
    console.error("Error updating resume:", err);
    console.error("Error details:", {
      message: err.message,
      code: err.code,
      sqlState: err.sqlState,
      sqlMessage: err.sqlMessage,
      stack: err.stack
    });
    console.error("Request data received:", {
      id,
      userId,
      resumeDataKeys: resumeData ? Object.keys(resumeData) : 'no data',
      resumeData: resumeData
    });
    res.status(500).json({ 
      message: "Error updating resume",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
      details: process.env.NODE_ENV === 'development' ? {
        code: err.code,
        sqlMessage: err.sqlMessage
      } : undefined
    });
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
