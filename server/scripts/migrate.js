require('dotenv/config');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function migrate() {
  const client = await pool.connect();
  try {
    // Créer la table migrations si elle n'existe pas
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Lire les fichiers de migration
    const migrationsDir = path.join(__dirname, '../migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    // Récupérer les migrations déjà exécutées
    const { rows: executed } = await client.query('SELECT name FROM migrations');
    const executedNames = new Set(executed.map(r => r.name));

    for (const file of files) {
      if (executedNames.has(file)) {
        console.log(`⏭️  ${file} (déjà exécutée)`);
        continue;
      }

      console.log(`▶️  Exécution de ${file}...`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`✅ ${file} exécutée avec succès`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`❌ Erreur dans ${file}:`, err.message);
        process.exit(1);
      }
    }

    console.log('\n🎉 Toutes les migrations sont à jour.');
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(err => {
  console.error('Erreur de migration:', err);
  process.exit(1);
});
