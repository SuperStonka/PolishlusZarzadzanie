const fs = require('fs').promises;
const path = require('path');
const db = require('../config/database');

async function dropAllTables() {
  try {
    console.log('🗑️ Dropping all existing tables...');
    
    // Lista tabel w kolejności usuwania (od zależnych do niezależnych)
    const tables = [
      'aktualizacje_statusu',
      'powiadomienia',
      'wiadomosci_chat',
      'koszty_eventow',
      'kwiaty_w_eventach',
      'produkty_w_eventach',
      'etapy_eventow',
      'eventy',
      'samochody',
      'typy_kosztow',
      'wypozyczalnie',
      'pojemniki',
      'kwiaty',
      'dostawcy_kwiatow',
      'produkty',
      'kategorie_produktow',
      'kontakty',
      'pracownicy',
      'stanowiska',
      'uzytkownicy_grupy',
      'grupy_uprawnien',
      'users'
    ];

    for (const table of tables) {
      try {
        await db.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
        console.log(`✅ Dropped table: ${table}`);
      } catch (error) {
        console.log(`⚠️ Could not drop table ${table}:`, error.message);
      }
    }

    // Usuń funkcje i rozszerzenia
    try {
      await db.query('DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE');
      console.log('✅ Dropped function: update_updated_at_column');
    } catch (error) {
      console.log('⚠️ Could not drop function:', error.message);
    }

    console.log('✅ All tables and functions dropped successfully');
  } catch (error) {
    console.error('❌ Error dropping tables:', error);
    throw error;
  }
}

async function setupDatabase() {
  try {
    console.log('🚀 Setting up Polishlus database...');

    // Drop all existing tables first
    await dropAllTables();

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

    // Run data migration (always run since we dropped everything)
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