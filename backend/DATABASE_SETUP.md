# Database Setup Guide

## Quick Setup

Run this **ONE TIME** to set up all required database tables and columns:

### Option 1: MySQL Command Line (Recommended)

```bash
mysql -u your_username -p your_database_name < setup_database.sql
```

Replace:
- `your_username` with your MySQL username (e.g., `root`)
- `your_database_name` with your database name (e.g., `resume_builder`)
- Enter your password when prompted

### Option 2: Automated Script

```bash
npm run setup:dashboard
```

This will run the setup script automatically.

### Option 3: MySQL Workbench

1. Open MySQL Workbench
2. Connect to your database
3. Click: **File → Open SQL Script**
4. Select `setup_database.sql`
5. Click the **⚡ Execute** button

### Option 4: phpMyAdmin

1. Open phpMyAdmin
2. Select your database from the left sidebar
3. Click the **SQL** tab
4. Copy all contents from `setup_database.sql`
5. Paste and click **Go**

## What This Script Does

✅ Adds `title` column to resumes table
✅ Adds `internship`, `job_experience`, `projects` columns (JSON)
✅ Adds `created_at` and `updated_at` timestamp columns
✅ Creates `portfolio_views` table for tracking views
✅ Initializes data for existing users
✅ Creates database indexes for better performance

## After Running the Script

1. **Restart your backend server:**
   ```bash
   npm start
   ```

2. **Check that it worked:**
   - The errors about "Unknown column 'updated_at'" should be gone
   - Dashboard should load without errors
   - Portfolio view tracking should work

## Troubleshooting

### "Duplicate column" or "Duplicate key" errors

This is **NORMAL** if you've already run parts of the script before. You can safely ignore these errors and continue.

### "Table doesn't exist" errors

Make sure you're running the script on the correct database.

### Still getting errors?

Check that:
- You're using the correct database name
- Your MySQL user has ALTER TABLE permissions
- The `users` and `resumes` tables exist
- Your backend `.env` file has the correct database credentials

## Verify Setup

After running the script, you should see:
- ✅ Database setup completed successfully!
- Tables listed with their structure
- Record counts showing your data

---

**File:** `backend/setup_database.sql`

**One-time setup only** - No need to run this again unless setting up a new database!







