import pool from './pool.js';

const migrate = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS cipher_types (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        group_name VARCHAR(50) NOT NULL CHECK (group_name IN ('regular', 'special', 'divb')),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL UNIQUE,
        username VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        division VARCHAR(10) NOT NULL CHECK (division IN ('b', 'c', 'other')),
        school_name VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS solves (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        cipher_type_id INTEGER NOT NULL REFERENCES cipher_types(id),
        time_ms INTEGER NOT NULL CHECK (time_ms > 0),
        solved_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_solves_user_id ON solves(user_id);
      CREATE INDEX IF NOT EXISTS idx_solves_cipher_type_id ON solves(cipher_type_id);
      CREATE INDEX IF NOT EXISTS idx_solves_solved_at ON solves(solved_at);
      CREATE INDEX IF NOT EXISTS idx_solves_user_cipher ON solves(user_id, cipher_type_id);
    `);

    await client.query('COMMIT');
    console.log('✓ Migration complete');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
};

migrate();
