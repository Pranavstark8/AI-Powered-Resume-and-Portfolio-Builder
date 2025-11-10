import { db } from "../config/db.js";

async function columnExists(tableName, columnName) {
  try {
    const [rows] = await db.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = ? 
        AND COLUMN_NAME = ?
    `, [tableName, columnName]);
    return rows.length > 0;
  } catch (error) {
    return false;
  }
}

async function updateResumesTable() {
  try {
    console.log("🔄 Updating resumes table...");
    
    // Check and add internship column
    const hasInternship = await columnExists('resumes', 'internship');
    if (!hasInternship) {
      await db.execute(`ALTER TABLE resumes ADD COLUMN internship JSON`);
      console.log("   ✅ Added internship column");
    } else {
      console.log("   ⏭️  internship column already exists");
    }
    
    // Check and add job_experience column
    const hasJobExperience = await columnExists('resumes', 'job_experience');
    if (!hasJobExperience) {
      await db.execute(`ALTER TABLE resumes ADD COLUMN job_experience JSON`);
      console.log("   ✅ Added job_experience column");
    } else {
      console.log("   ⏭️  job_experience column already exists");
    }
    
    // Check and add projects column
    const hasProjects = await columnExists('resumes', 'projects');
    if (!hasProjects) {
      await db.execute(`ALTER TABLE resumes ADD COLUMN projects JSON`);
      console.log("   ✅ Added projects column");
    } else {
      console.log("   ⏭️  projects column already exists");
    }
    
    // Update existing records to have empty arrays for NULL values
    if (hasInternship || hasJobExperience || hasProjects) {
      await db.execute(`
        UPDATE resumes 
        SET internship = COALESCE(internship, '[]'),
            job_experience = COALESCE(job_experience, '[]'),
            projects = COALESCE(projects, '[]')
      `);
      console.log("   ✅ Updated existing records");
    }
    
    console.log("\n✅ Database migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Migration failed:", error.message);
    process.exit(1);
  }
}

updateResumesTable();

