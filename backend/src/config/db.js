import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS || process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

// Add SSL for production (required for Aiven)
if (process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production') {
  dbConfig.ssl = {
    rejectUnauthorized: true
  };
}

// Create connection pool for better serverless performance
const pool = mysql.createPool(dbConfig);

// Export pool as db for compatibility
export const db = {
  query: (...args) => pool.query(...args),
  execute: (...args) => pool.execute(...args),
  getConnection: () => pool.getConnection(),
  pool: pool
};

// Test connection on startup (non-blocking)
pool.getConnection()
  .then(connection => {
    console.log("✅ MySQL connected successfully");
    connection.release();
  })
  .catch(err => {
    console.error("❌ MySQL connection failed:", err.message);
    console.error("Connection details:", {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      database: dbConfig.database,
      ssl: dbConfig.ssl ? 'enabled' : 'disabled'
    });
  });

