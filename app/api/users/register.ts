import type { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import { hashPassword } from '@/lib/auth';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { name, email, password, uid, codeforces_username } = req.body;

    if (!name || !email || !password || !codeforces_username) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const client = await pool.connect();

    // Check if user/email already exists
    const exists = await client.query('SELECT id FROM users WHERE email = $1 OR codeforces_username = $2', [
      email,
      codeforces_username,
    ]);

    if (exists.rows.length > 0) {
      client.release();
      return res.status(409).json({ error: 'Email or codeforces_username already in use' });
    }

    const password_hash = await hashPassword(password);

    const result = await client.query(
      `INSERT INTO users (name, email, uid, codeforces_username, password_hash, is_admin) 
       VALUES ($1, $2, $3, $4, $5, false) RETURNING id, name, email, uid, codeforces_username`,
      [name, email, uid || null, codeforces_username, password_hash]
    );

    client.release();

    return res.status(201).json({ user: result.rows[0] });
  } catch (error) {
    console.error('Register error', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
