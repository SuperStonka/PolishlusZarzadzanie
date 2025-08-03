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

    // Check if data already exists in multiple tables
    const checkTables = ['users', 'eventy', 'produkty', 'kwiaty', 'pracownicy', 'kontakty'];
    let hasData = false;
    
    for (const table of checkTables) {
      try {
        const result = await db.query(`SELECT COUNT(*) as count FROM ${table}`);
        if (parseInt(result.rows[0].count) > 0) {
          hasData = true;
          break;
        }
      } catch (error) {
        // Table might not exist yet, continue checking
        console.log(`⚠️ Table ${table} not found, continuing...`);
      }
    }
    
    if (hasData) {
      console.log('📊 Data already exists in some tables, but checking if migration is needed...');
      
      // Check if we need to force migration (e.g., if some tables are empty)
      const emptyTables = [];
      for (const table of checkTables) {
        try {
          const result = await db.query(`SELECT COUNT(*) as count FROM ${table}`);
          if (parseInt(result.rows[0].count) === 0) {
            emptyTables.push(table);
          }
        } catch (error) {
          // Table doesn't exist, consider it empty
          emptyTables.push(table);
        }
      }
      
      if (emptyTables.length > 0) {
        console.log(`⚠️ Found empty tables: ${emptyTables.join(', ')}`);
        console.log('🔄 Running migration to fill missing data...');
      } else {
        console.log('✅ All tables have data, skipping migration');
        return;
      }
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