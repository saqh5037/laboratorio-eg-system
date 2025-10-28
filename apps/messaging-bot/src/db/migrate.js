const fs = require('fs');
const path = require('path');
const { testConnection, query, closePool } = require('./pool');

/**
 * Run database migrations
 */
async function runMigrations() {
  console.log('🔄 Starting database migrations...\n');

  try {
    // Test connection first
    await testConnection();
    console.log('');

    // Read the migration files
    const migrations = ['001_create_schema.sql', '002_add_presupuestos_citas.sql'];

    for (const migrationFile of migrations) {
      const migrationPath = path.join(__dirname, 'migrations', migrationFile);
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

      console.log(`📄 Running migration: ${migrationFile}`);

      // Execute the migration
      await query(migrationSQL);
      console.log(`✅ ${migrationFile} completed`);
    }

    console.log('\n✅ Migration completed successfully!\n');

    // Show created tables
    console.log('📊 Verifying tables...');
    const result = await query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name LIKE 'bot_%'
      ORDER BY table_name
    `);

    console.log('\n📋 Bot tables in database:');
    result.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });

    console.log('\n✅ Database setup complete!\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

// Run if called directly
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
