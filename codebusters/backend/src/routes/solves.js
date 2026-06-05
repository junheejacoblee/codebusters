import { Router } from 'express';
import pool from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// POST /solves
router.post('/', authenticate, async (req, res) => {
  const { cipher_type_id, time_ms, solved_at } = req.body;
  if (!cipher_type_id || !time_ms) return res.status(400).json({ error: 'cipher_type_id and time_ms required' });
  if (!Number.isInteger(time_ms) || time_ms <= 0) return res.status(400).json({ error: 'time_ms must be a positive integer' });
  try {
    const ctCheck = await pool.query('SELECT id FROM cipher_types WHERE id = $1', [cipher_type_id]);
    if (!ctCheck.rows[0]) return res.status(400).json({ error: 'Invalid cipher_type_id' });
    const result = await pool.query(
      solved_at
        ? `INSERT INTO solves (user_id, cipher_type_id, time_ms, solved_at) VALUES ($1, $2, $3, $4) RETURNING id, cipher_type_id, time_ms, solved_at`
        : `INSERT INTO solves (user_id, cipher_type_id, time_ms) VALUES ($1, $2, $3) RETURNING id, cipher_type_id, time_ms, solved_at`,
      solved_at ? [req.user.id, cipher_type_id, time_ms, new Date(solved_at)] : [req.user.id, cipher_type_id, time_ms]
    );
    res.status(201).json({ solve: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /solves/stats
router.get('/stats', authenticate, async (req, res) => {
  try {
    const byCipher = await pool.query(
      `SELECT
        ct.id AS cipher_type_id, ct.name AS cipher_name, ct.group_name,
        COUNT(*) AS total_solves,
        SUM(s.time_ms)::bigint AS total_time_ms,
        MIN(s.time_ms) AS best_time_ms,
        ROUND(AVG(s.time_ms))::int AS overall_avg_ms,
        ROUND(AVG(s.time_ms) FILTER (WHERE s.solved_at > NOW() - INTERVAL '1 month'))::int AS avg_1mo_ms,
        COUNT(*) FILTER (WHERE s.solved_at > NOW() - INTERVAL '1 month') AS solves_1mo,
        ROUND(AVG(s.time_ms) FILTER (WHERE s.solved_at > NOW() - INTERVAL '3 months'))::int AS avg_3mo_ms,
        COUNT(*) FILTER (WHERE s.solved_at > NOW() - INTERVAL '3 months') AS solves_3mo,
        ROUND(AVG(s.time_ms) FILTER (WHERE s.solved_at > NOW() - INTERVAL '6 months'))::int AS avg_6mo_ms,
        COUNT(*) FILTER (WHERE s.solved_at > NOW() - INTERVAL '6 months') AS solves_6mo
       FROM solves s JOIN cipher_types ct ON ct.id = s.cipher_type_id
       WHERE s.user_id = $1
       GROUP BY ct.id, ct.name, ct.group_name ORDER BY ct.group_name, ct.name`,
      [req.user.id]
    );

    const overall = await pool.query(
      `SELECT
        COUNT(*) AS total_solves,
        SUM(time_ms)::bigint AS total_time_ms,
        MIN(time_ms) AS best_time_ms,
        ROUND(AVG(time_ms))::int AS overall_avg_ms,
        ROUND(AVG(time_ms) FILTER (WHERE solved_at > NOW() - INTERVAL '1 month'))::int AS avg_1mo_ms,
        COUNT(*) FILTER (WHERE solved_at > NOW() - INTERVAL '1 month') AS solves_1mo,
        ROUND(AVG(time_ms) FILTER (WHERE solved_at > NOW() - INTERVAL '3 months'))::int AS avg_3mo_ms,
        COUNT(*) FILTER (WHERE solved_at > NOW() - INTERVAL '3 months') AS solves_3mo,
        ROUND(AVG(time_ms) FILTER (WHERE solved_at > NOW() - INTERVAL '6 months'))::int AS avg_6mo_ms,
        COUNT(*) FILTER (WHERE solved_at > NOW() - INTERVAL '6 months') AS solves_6mo
       FROM solves WHERE user_id = $1`,
      [req.user.id]
    );

    // Daily solve counts for the last 90 days
    const daily = await pool.query(
      `SELECT
        DATE(solved_at AT TIME ZONE 'UTC') AS day,
        COUNT(*)::int AS solve_count
       FROM solves
       WHERE user_id = $1 AND solved_at > NOW() - INTERVAL '366 days'
       GROUP BY day ORDER BY day ASC`,
      [req.user.id]
    );

    res.json({ by_cipher: byCipher.rows, overall: overall.rows[0], daily: daily.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /solves/raw
router.get('/raw', authenticate, async (req, res) => {
  const { cipher_type_id, from, to, limit = 500 } = req.query;
  const conditions = ['s.user_id = $1'];
  const params = [req.user.id];
  let i = 2;
  if (cipher_type_id) { conditions.push(`s.cipher_type_id = $${i++}`); params.push(parseInt(cipher_type_id)); }
  if (from) { conditions.push(`s.solved_at >= $${i++}`); params.push(new Date(from)); }
  if (to) { conditions.push(`s.solved_at <= $${i++}`); params.push(new Date(to)); }
  params.push(Math.min(parseInt(limit), 1000));
  const where = conditions.join(' AND ');
  try {
    const result = await pool.query(
      `SELECT s.id, s.time_ms, s.solved_at, ct.id AS cipher_type_id, ct.name AS cipher_name, ct.group_name
       FROM solves s JOIN cipher_types ct ON ct.id = s.cipher_type_id
       WHERE ${where} ORDER BY s.solved_at DESC LIMIT $${i}`,
      params
    );
    res.json({ solves: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /solves/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM solves WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Solve not found' });
    res.json({ deleted: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /solves
router.delete('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM solves WHERE user_id = $1 RETURNING id', [req.user.id]);
    res.json({ deleted_count: result.rowCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
