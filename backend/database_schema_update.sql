-- Database Schema Updates for Enhanced Dashboard
-- Run this SQL script in your MySQL database

-- 1. Add title column to resumes table if it doesn't exist
-- For MySQL - Add column only if it doesn't exist
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

-- 2. Add created_at column if it doesn't exist
SET @sql2 = IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'resumes' 
     AND COLUMN_NAME = 'created_at') = 0,
    'ALTER TABLE resumes ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    'SELECT 1'
);

PREPARE stmt2 FROM @sql2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

-- 3. Add updated_at column if it doesn't exist
SET @sql3 = IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'resumes' 
     AND COLUMN_NAME = 'updated_at') = 0,
    'ALTER TABLE resumes ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    'SELECT 1'
);

PREPARE stmt3 FROM @sql3;
EXECUTE stmt3;
DEALLOCATE PREPARE stmt3;


-- 4. Create portfolio_views table for tracking portfolio views
CREATE TABLE IF NOT EXISTS portfolio_views (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  views INT DEFAULT 0,
  views_this_week INT DEFAULT 0,
  last_view_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Initialize portfolio_views for existing users
INSERT INTO portfolio_views (user_id, views, views_this_week)
SELECT id, 0, 0 FROM users
WHERE id NOT IN (SELECT user_id FROM portfolio_views)
ON DUPLICATE KEY UPDATE user_id = user_id;

-- 6. Update existing resumes to have a default created_at if NULL
UPDATE resumes 
SET created_at = CURRENT_TIMESTAMP 
WHERE created_at IS NULL;

-- 7. Update existing resumes to have a default updated_at if NULL
UPDATE resumes 
SET updated_at = CURRENT_TIMESTAMP 
WHERE updated_at IS NULL;

-- 8. Add indexes for better query performance (only if they don't exist)
-- Note: MySQL doesn't support IF NOT EXISTS for indexes, so we'll use a workaround
SET @index1 = IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'resumes' 
     AND INDEX_NAME = 'idx_resumes_user_updated') = 0,
    'CREATE INDEX idx_resumes_user_updated ON resumes (user_id, updated_at DESC)',
    'SELECT 1'
);

PREPARE stmt4 FROM @index1;
EXECUTE stmt4;
DEALLOCATE PREPARE stmt4;

SET @index2 = IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'resumes' 
     AND INDEX_NAME = 'idx_resumes_user_created') = 0,
    'CREATE INDEX idx_resumes_user_created ON resumes (user_id, created_at DESC)',
    'SELECT 1'
);

PREPARE stmt5 FROM @index2;
EXECUTE stmt5;
DEALLOCATE PREPARE stmt5;

SET @index3 = IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'portfolio_views' 
     AND INDEX_NAME = 'idx_portfolio_views_user') = 0,
    'CREATE INDEX idx_portfolio_views_user ON portfolio_views (user_id)',
    'SELECT 1'
);

PREPARE stmt6 FROM @index3;
EXECUTE stmt6;
DEALLOCATE PREPARE stmt6;


-- Verification queries (uncomment to test)
-- SELECT COUNT(*) as total_resumes FROM resumes;
-- SELECT COUNT(*) as total_users_with_views FROM portfolio_views;
-- SELECT * FROM resumes LIMIT 5;
-- SELECT * FROM portfolio_views LIMIT 5;

-- Success message
SELECT 'Database schema updated successfully! ✅' as message;








-- Check all tables exist
SHOW TABLES;

-- Check users table structure
DESCRIBE users;

-- Check resumes table structure
DESCRIBE resumes;

-- Check portfolio_views table exists
DESCRIBE portfolio_views;