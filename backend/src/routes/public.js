import { Router } from 'express';
import pool from '../db/pool.js';

const router = Router();

// GET /public/team-count — distinct schools + total users
router.get('/team-count', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT COUNT(DISTINCT school_name)::int AS team_count, COUNT(*)::int AS user_count FROM users`
    );
    res.json({ team_count: result.rows[0].team_count, user_count: result.rows[0].user_count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /public/cipher-types — all cipher types grouped
router.get('/cipher-types', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, group_name FROM cipher_types ORDER BY group_name, name`
    );
    res.json({ cipher_types: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
