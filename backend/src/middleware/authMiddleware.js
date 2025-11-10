import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Check if authorization header exists
    if (!authHeader) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    // Check if JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in environment variables");
      return res.status(500).json({ message: "Server configuration error" });
    }

    // Validate authorization header format
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Invalid token format. Use 'Bearer <token>'" });
    }

    const token = authHeader.split(" ")[1];

    // Check if token exists after "Bearer "
    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({ message: "Token expired. Please login again." });
        }
        if (err.name === "JsonWebTokenError") {
          return res.status(403).json({ message: "Invalid token." });
        }
        return res.status(403).json({ message: "Token verification failed." });
      }

      // Validate decoded token structure
      if (!decoded.id) {
        return res.status(403).json({ message: "Invalid token payload." });
      }

      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
