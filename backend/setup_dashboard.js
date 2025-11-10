import { db } from './src/config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDashboard() {
  console.log('🚀 Starting Dashboard Enhancement Setup...\n');

  try {
    // Read the SQL file
    const sqlFile = fs.readFileSync(
      path.join(__dirname, 'setup_database.sql'),
      'utf8'
    );

    // Split SQL commands (simple split by semicolon)
    const commands = sqlFile
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--') && !cmd.startsWith('SELECT'));

    console.log(`📝 Found ${commands.length} SQL commands to execute\n`);

    // Execute each command
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.includes('CREATE TABLE') || command.includes('ALTER TABLE')) {
        const tableName = command.match(/TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/i)?.[1];
        try {
          await db.execute(command);
          console.log(`✅ ${i + 1}. Successfully executed for table: ${tableName}`);
        } catch (err) {
          if (err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_TABLE_EXISTS_ERROR') {
            console.log(`⚠️  ${i + 1}. Table/Column already exists: ${tableName} (skipping)`);
          } else {
            console.error(`❌ ${i + 1}. Error executing command for ${tableName}:`, err.message);
          }
        }
      } else if (command.includes('INSERT INTO') || command.includes('UPDATE')) {
        try {
          await db.execute(command);
          console.log(`✅ ${i + 1}. Successfully executed data command`);
        } catch (err) {
          console.log(`⚠️  ${i + 1}. ${err.message} (might be okay if already done)`);
        }
      } else if (command.includes('CREATE INDEX')) {
        const indexName = command.match(/INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/i)?.[1];
        try {
          await db.execute(command);
          console.log(`✅ ${i + 1}. Successfully created index: ${indexName}`);
        } catch (err) {
          if (err.code === 'ER_DUP_KEYNAME') {
            console.log(`⚠️  ${i + 1}. Index already exists: ${indexName} (skipping)`);
          } else {
            console.error(`❌ ${i + 1}. Error creating index ${indexName}:`, err.message);
          }
        }
      }
    }

    // Verify setup
    console.log('\n🔍 Verifying setup...\n');

    // Check if portfolio_views table exists
    const [tables] = await db.execute("SHOW TABLES LIKE 'portfolio_views'");
    if (tables.length > 0) {
      console.log('✅ portfolio_views table exists');
      
      // Count records
      const [count] = await db.execute('SELECT COUNT(*) as count FROM portfolio_views');
      console.log(`   📊 Total view records: ${count[0].count}`);
    } else {
      console.log('❌ portfolio_views table not found!');
    }

    // Check resumes table columns
    const [columns] = await db.execute("SHOW COLUMNS FROM resumes LIKE 'title'");
    if (columns.length > 0) {
      console.log('✅ resumes.title column exists');
    } else {
      console.log('❌ resumes.title column not found!');
    }

    const [timestampCols] = await db.execute("SHOW COLUMNS FROM resumes LIKE 'created_at'");
    if (timestampCols.length > 0) {
      console.log('✅ resumes timestamp columns exist');
    } else {
      console.log('❌ resumes timestamp columns not found!');
    }

    console.log('\n🎉 Dashboard enhancement setup complete!\n');
    console.log('📝 Next steps:');
    console.log('   1. Restart your backend server: npm start');
    console.log('   2. Restart your frontend: cd ../frontend && npm start');
    console.log('   3. Login and check out your new dashboard!\n');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await db.end();
    process.exit(0);
  }
}

// Run setup
setupDashboard();

