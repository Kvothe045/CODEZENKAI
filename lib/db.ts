import { Pool } from 'pg';
import { User, Contest, Submission, ActivityLog, UserRanking } from './database';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Auto-initialize database on first connection
let isInitialized = false;

async function ensureInitialized() {
  if (isInitialized) return;
  
  try {
    await initializeDatabase();
    isInitialized = true;
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    // Don't throw error - let the app continue, just log the issue
  }
}

// Initialize database tables with IF NOT EXISTS
export async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Checking database tables...');

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        uid VARCHAR(50) UNIQUE,
        codeforces_username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        highest_ranking INTEGER,
        current_ranking INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Profiles table - FIXED: Remove auth.users reference
    await client.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        supabase_id VARCHAR(255) UNIQUE,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        codeforces_username VARCHAR(100) UNIQUE NOT NULL,
        uid VARCHAR(50) UNIQUE,
        role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
        highest_ranking INTEGER,
        current_ranking INTEGER,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Contests table
    await client.query(`
      CREATE TABLE IF NOT EXISTS contests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(200) NOT NULL,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        duration INTEGER NOT NULL,
        problems TEXT[] NOT NULL,
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Submissions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS submissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        contest_id UUID REFERENCES contests(id),
        problem_index INTEGER NOT NULL,
        verdict VARCHAR(50) NOT NULL,
        submission_time TIMESTAMP NOT NULL,
        attempts INTEGER DEFAULT 1,
        time_taken INTEGER NOT NULL
      )
    `);

    // Activity logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        contest_id UUID REFERENCES contests(id),
        event_type VARCHAR(100) NOT NULL,
        timestamp TIMESTAMP DEFAULT NOW(),
        details JSONB
      )
    `);

    // User rankings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_rankings (
        user_id UUID REFERENCES users(id),
        contest_id UUID REFERENCES contests(id),
        rank INTEGER NOT NULL,
        problems_solved INTEGER DEFAULT 0,
        total_penalty INTEGER DEFAULT 0,
        total_time INTEGER DEFAULT 0,
        PRIMARY KEY (user_id, contest_id)
      )
    `);

    console.log('✅ All database tables ready');

  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Wrapper function that ensures DB is initialized before any operation
async function withInitialization<T>(operation: () => Promise<T>): Promise<T> {
  await ensureInitialized();
  return operation();
}

// Profile operations
export async function createProfile(profileData: {
  supabase_id: string;
  email: string;
  name: string;
  codeforces_username: string;
  uid?: string;
  role?: string;
}): Promise<any | null> {
  return withInitialization(async () => {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `INSERT INTO profiles (supabase_id, email, name, codeforces_username, uid, role) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [
          profileData.supabase_id,
          profileData.email,
          profileData.name,
          profileData.codeforces_username,
          profileData.uid || null,
          profileData.role || 'user'
        ]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating profile:', error);
      return null;
    } finally {
      client.release();
    }
  });
}

export async function getProfileBySupabaseId(supabaseId: string): Promise<any | null> {
  return withInitialization(async () => {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'SELECT * FROM profiles WHERE supabase_id = $1',
        [supabaseId]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  });
}

export async function getProfileByEmail(email: string): Promise<any | null> {
  return withInitialization(async () => {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'SELECT * FROM profiles WHERE email = $1',
        [email]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  });
}

// User operations with auto-initialization
export async function createUser(userData: Omit<User, 'id' | 'created_at'>): Promise<User | null> {
  return withInitialization(async () => {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `INSERT INTO users (name, uid, codeforces_username, email, is_admin) 
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [userData.name, userData.uid, userData.codeforces_username, userData.email, userData.is_admin]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    } finally {
      client.release();
    }
  });
}

export async function getUserByCodeforcesUsername(username: string): Promise<User | null> {
  return withInitialization(async () => {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'SELECT * FROM users WHERE codeforces_username = $1',
        [username]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  });
}

export async function getAllUsers(): Promise<User[]> {
  return withInitialization(async () => {
    const client = await pool.connect();
    
    try {
      const result = await client.query('SELECT * FROM users ORDER BY current_ranking ASC NULLS LAST');
      return result.rows;
    } finally {
      client.release();
    }
  });
}

// Contest operations with auto-initialization
export async function createContest(contestData: Omit<Contest, 'id' | 'created_at'>): Promise<Contest | null> {
  return withInitialization(async () => {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `INSERT INTO contests (title, start_time, end_time, duration, problems, created_by, is_active) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [contestData.title, contestData.start_time, contestData.end_time, contestData.duration, 
         contestData.problems, contestData.created_by, contestData.is_active]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating contest:', error);
      return null;
    } finally {
      client.release();
    }
  });
}

export async function getActiveContests(): Promise<Contest[]> {
  return withInitialization(async () => {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'SELECT * FROM contests WHERE is_active = TRUE ORDER BY start_time DESC'
      );
      return result.rows;
    } finally {
      client.release();
    }
  });
}

export async function getContestById(id: string): Promise<Contest | null> {
  return withInitialization(async () => {
    const client = await pool.connect();
    
    try {
      const result = await client.query('SELECT * FROM contests WHERE id = $1', [id]);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  });
}

// Activity logging with auto-initialization
export async function logActivity(userId: string, contestId: string, eventType: string, details: any): Promise<void> {
  return withInitialization(async () => {
    const client = await pool.connect();
    
    try {
      await client.query(
        `INSERT INTO activity_logs (user_id, contest_id, event_type, details) 
         VALUES ($1, $2, $3, $4)`,
        [userId, contestId, eventType, JSON.stringify(details)]
      );
    } catch (error) {
      console.error('Error logging activity:', error);
    } finally {
      client.release();
    }
  });
}

export async function getActivityLogs(contestId: string): Promise<ActivityLog[]> {
  return withInitialization(async () => {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `SELECT al.*, u.name, u.codeforces_username 
         FROM activity_logs al 
         JOIN users u ON al.user_id = u.id 
         WHERE al.contest_id = $1 
         ORDER BY al.timestamp DESC`,
        [contestId]
      );
      return result.rows;
    } finally {
      client.release();
    }
  });
}

// Rankings with auto-initialization
export async function updateUserRanking(ranking: UserRanking): Promise<void> {
  return withInitialization(async () => {
    const client = await pool.connect();
    
    try {
      await client.query(
        `INSERT INTO user_rankings (user_id, contest_id, rank, problems_solved, total_penalty, total_time)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (user_id, contest_id) 
         DO UPDATE SET rank = $3, problems_solved = $4, total_penalty = $5, total_time = $6`,
        [ranking.user_id, ranking.contest_id, ranking.rank, ranking.problems_solved, ranking.total_penalty, ranking.total_time]
      );
    } finally {
      client.release();
    }
  });
}

export async function getContestRankings(contestId: string): Promise<any[]> {
  return withInitialization(async () => {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `SELECT ur.*, u.name, u.codeforces_username 
         FROM user_rankings ur 
         JOIN users u ON ur.user_id = u.id 
         WHERE ur.contest_id = $1 
         ORDER BY ur.rank ASC`,
        [contestId]
      );
      return result.rows;
    } finally {
      client.release();
    }
  });
}

// Health check function
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}
