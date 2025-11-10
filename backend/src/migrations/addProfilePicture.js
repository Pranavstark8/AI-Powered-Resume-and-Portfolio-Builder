import { db } from "../config/db.js";

// NOTE: Run this script from the backend root directory: node src/migrations/addProfilePicture.js
// The .env file is loaded by db.js automatically

async function addProfilePictureColumn() {
  try {
    // Check if column exists
    const [columns] = await db.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'profile_picture'
    `);

    if (columns.length > 0) {
      console.log("✅ profile_picture column already exists");
      return;
    }

    // Add profile_picture column
    await db.execute(`
      ALTER TABLE users 
      ADD COLUMN profile_picture VARCHAR(500) DEFAULT NULL,
      ADD COLUMN profile_picture_public_id VARCHAR(255) DEFAULT NULL
    `);

    console.log("✅ Successfully added profile_picture and profile_picture_public_id columns to users table");
  } catch (error) {
    console.error("❌ Error adding profile_picture column:", error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  addProfilePictureColumn()
    .then(() => {
      console.log("✅ Migration completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Migration failed:", error);
      process.exit(1);
    })
    .finally(() => {
      // Close database connection
      if (db && db.end) {
        db.end();
      }
    });
}

export default addProfilePictureColumn;

