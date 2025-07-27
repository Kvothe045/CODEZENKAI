import type { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import { verifyPassword } from '@/lib/auth';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const client = await pool.connect();

    const result = await client.query(
      'SELECT id, name, email, uid, codeforces_username, password_hash FROM users WHERE email = $1',
      [email]
    );

    client.release();

    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });

    const user = result.rows[0];
    const isMatch = await verifyPassword(password, user.password_hash);

    if (!isMatch) return res.status(401).json({ error: 'Invalid password' });

    // Return user info excluding password_hash
    delete user.password_hash;

    return res.status(200).json({ user });
  } catch (error) {
    console.error('Login error', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
