const fs = require('fs').promises;
const path = require('path');
const db = require('../config/database');

async function setupDatabase() {
  try {
    console.log('🚀 Setting up Polishlus database...');

    // Read and execute schema
    console.log('📋 Creating database schema...');
    const schemaPath = path.join(__dirname, '../config/schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');

    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await db.query(statement);
        } catch (error) {
          // Ignore errors for existing objects
          if (!error.message.includes('already exists')) {
            console.error('Schema execution error:', error.message);
          }
        }
      }
    }

    console.log('✅ Database schema created successfully');

    // Check if data already exists
    const existingData = await db.query('SELECT COUNT(*) as count FROM users');
    if (parseInt(existingData.rows[0].count) > 0) {
      console.log('📊 Data already exists, skipping migration');
      return;
    }

    // Run data migration
    console.log('📦 Migrating sample data...');
    const { migrateData } = require('./migrateData');
    await migrateData();

    console.log('🎉 Database setup completed successfully!');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase().then(() => {
    console.log('🎯 Setup script finished');
    process.exit(0);
  }).catch((error) => {
    console.error('💥 Setup script failed:', error);
    process.exit(1);
  });
}

module.exports = { setupDatabase }; 