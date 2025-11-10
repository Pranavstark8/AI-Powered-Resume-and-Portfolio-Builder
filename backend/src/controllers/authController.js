import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { db } from "../config/db.js";

dotenv.config();

// 🔹 REGISTER
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  
  try {
    // Check if JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in environment variables");
      return res.status(500).json({ message: "Server configuration error" });
    }

    // Check if user already exists (using parameterized query - prevents SQL injection)
    const [existing] = await db.execute(
      "SELECT id FROM users WHERE email = ? LIMIT 1", 
      [email]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password with bcrypt (salt rounds = 12 for better security)
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Insert new user
    const [result] = await db.execute(
      "INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, NOW())", 
      [name, email, hashedPassword]
    );

    console.log(`New user registered: ${email}`);
    
    res.status(201).json({ 
      message: "User registered successfully",
      userId: result.insertId 
    });
  } catch (error) {
    console.error("Registration error:", error);
    
    // Don't expose internal error details to client
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: "Email already registered" });
    }
    
    res.status(500).json({ message: "Registration failed. Please try again." });
  }
};

// 🔹 LOGIN
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Check if JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in environment variables");
      return res.status(500).json({ message: "Server configuration error" });
    }

    // Fetch user by email (parameterized query prevents SQL injection)
    const [userRows] = await db.execute(
      "SELECT id, name, email, password FROM users WHERE email = ? LIMIT 1", 
      [email]
    );
    
    if (userRows.length === 0) {
      // Use generic error message to prevent email enumeration
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = userRows[0];
    
    // Compare password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      // Use generic error message to prevent email enumeration
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email 
      }, 
      process.env.JWT_SECRET, 
      { 
        expiresIn: "24h",
        algorithm: "HS256"
      }
    );

    // Update last login timestamp (optional - only if column exists)
    try {
      await db.execute(
        "UPDATE users SET last_login = NOW() WHERE id = ?", 
        [user.id]
      );
    } catch (err) {
      // Ignore if last_login column doesn't exist
      console.log("Note: last_login column not found in users table");
    }

    console.log(`User logged in: ${email}`);
    
    // Send response without password
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email 
      } 
    });
  } catch (error) {
    console.error("Login error:", error);
    
    // Don't expose internal error details to client
    res.status(500).json({ message: "Login failed. Please try again." });
  }
};
