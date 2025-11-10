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
    'SELECT "Column title already exists" as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
-- 2. Add created_at column if it doesn't exist
ALTER TABLE resumes 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER projects;

-- 3. Add updated_at column if it doesn't exist
ALTER TABLE resumes 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

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

-- 8. Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_resumes_user_updated ON resumes(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_resumes_user_created ON resumes(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_portfolio_views_user ON portfolio_views(user_id);

-- Verification queries (uncomment to test)
-- SELECT COUNT(*) as total_resumes FROM resumes;
-- SELECT COUNT(*) as total_users_with_views FROM portfolio_views;
-- SELECT * FROM resumes LIMIT 5;
-- SELECT * FROM portfolio_views LIMIT 5;

-- Success message
SELECT 'Database schema updated successfully! ✅' as message;

