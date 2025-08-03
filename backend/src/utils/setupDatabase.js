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
        // Sprawdź czy tabela istnieje przed usunięciem
        const checkResult = await db.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          );
        `, [table]);
        
        if (checkResult.rows[0].exists) {
          await db.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
          console.log(`✅ Dropped table: ${table}`);
        } else {
          console.log(`ℹ️ Table ${table} does not exist, skipping`);
        }
      } catch (error) {
        console.log(`⚠️ Could not drop table ${table}:`, error.message);
      }
    }

    // Usuń funkcje i rozszerzenia
    try {
      const functionCheck = await db.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.routines 
          WHERE routine_schema = 'public' 
          AND routine_name = 'update_updated_at_column'
        );
      `);
      
      if (functionCheck.rows[0].exists) {
        await db.query('DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE');
        console.log('✅ Dropped function: update_updated_at_column');
      } else {
        console.log('ℹ️ Function update_updated_at_column does not exist, skipping');
      }
    } catch (error) {
      console.log('⚠️ Could not drop function:', error.message);
    }

    console.log('✅ All existing tables and functions dropped successfully');
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

    // Execute the entire schema as one transaction
    try {
      await db.query(schema);
      console.log('✅ Database schema created successfully');
    } catch (error) {
      console.error('❌ Schema execution failed:', error.message);
      throw error;
    }

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