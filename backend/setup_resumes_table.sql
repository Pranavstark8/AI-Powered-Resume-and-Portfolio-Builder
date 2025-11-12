-- Create resumes table with basic structure
-- Run this if your resumes table is missing or incomplete

-- First, check if resumes table exists, if not create it
CREATE TABLE IF NOT EXISTS resumes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  summary JSON,
  experience JSON,
  education JSON,
  skills JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add title column if it doesn't exist
SET @sql = IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'resumes' 
     AND COLUMN_NAME = 'title') = 0,
    'ALTER TABLE resumes ADD COLUMN title VARCHAR(255) DEFAULT NULL AFTER user_id',
    'SELECT 1'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add internship column if it doesn't exist
SET @sql2 = IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'resumes' 
     AND COLUMN_NAME = 'internship') = 0,
    'ALTER TABLE resumes ADD COLUMN internship JSON AFTER skills',
    'SELECT 1'
);

PREPARE stmt2 FROM @sql2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

-- Add job_experience column if it doesn't exist
SET @sql3 = IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'resumes' 
     AND COLUMN_NAME = 'job_experience') = 0,
    'ALTER TABLE resumes ADD COLUMN job_experience JSON AFTER internship',
    'SELECT 1'
);

PREPARE stmt3 FROM @sql3;
EXECUTE stmt3;
DEALLOCATE PREPARE stmt3;

-- Add projects column if it doesn't exist
SET @sql4 = IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'resumes' 
     AND COLUMN_NAME = 'projects') = 0,
    'ALTER TABLE resumes ADD COLUMN projects JSON AFTER job_experience',
    'SELECT 1'
);

PREPARE stmt4 FROM @sql4;
EXECUTE stmt4;
DEALLOCATE PREPARE stmt4;

-- Add updated_at column if it doesn't exist
SET @sql5 = IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'resumes' 
     AND COLUMN_NAME = 'updated_at') = 0,
    'ALTER TABLE resumes ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at',
    'SELECT 1'
);

PREPARE stmt5 FROM @sql5;
EXECUTE stmt5;
DEALLOCATE PREPARE stmt5;

-- Verify the table structure
DESCRIBE resumes;

-- Success message
SELECT 'Resumes table setup completed successfully! ✅' as message;

