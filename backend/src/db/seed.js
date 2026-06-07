import pool from './pool.js';

const CIPHER_TYPES = [
  // Regular
  { name: 'Aristocrat', group_name: 'regular' },
  { name: 'Patristocrat', group_name: 'regular' },
  { name: 'Xenocrypt', group_name: 'regular' },
  { name: 'Cryptarithmetic', group_name: 'regular' },
  { name: 'Fractionated Morse', group_name: 'regular' },
  { name: 'Columnar', group_name: 'regular' },
  { name: 'Nihilist', group_name: 'regular' },
  { name: 'Checkerboard', group_name: 'regular' },
  { name: 'Hill 2x2', group_name: 'regular' },
  { name: 'Baconian', group_name: 'regular' },
  { name: 'Porta', group_name: 'regular' },
  // Special
  { name: 'Nihilist Cryptanalysis', group_name: 'special' },
  { name: 'Checkerboard Cryptanalysis', group_name: 'special' },
  { name: 'Hill 3x3', group_name: 'special' },
  // Div B Only
  { name: 'Atbash', group_name: 'divb' },
  { name: 'Caesar', group_name: 'divb' },
  { name: 'Affine', group_name: 'divb' },
];

const seed = async () => {
  const client = await pool.connect();
  try {
    for (const cipher of CIPHER_TYPES) {
      await client.query(
        `INSERT INTO cipher_types (name, group_name)
         VALUES ($1, $2)
         ON CONFLICT (name) DO NOTHING`,
        [cipher.name, cipher.group_name]
      );
    }
    console.log(`✓ Seeded ${CIPHER_TYPES.length} cipher types`);
  } finally {
    client.release();
    await pool.end();
  }
};

seed();
