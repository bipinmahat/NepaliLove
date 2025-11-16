import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { sql } from 'drizzle-orm';
import * as schema from '../shared/schema';

neonConfig.webSocketConstructor = ws;

async function initDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set');
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle({ client: pool, schema });

  try {
    console.log('Creating tables...');

    // Create sessions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR PRIMARY KEY,
        sess JSONB NOT NULL,
        expire TIMESTAMP NOT NULL
      );
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions (expire);
    `);

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY,
        email VARCHAR UNIQUE,
        first_name VARCHAR,
        last_name VARCHAR,
        profile_image_url VARCHAR,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create profiles table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id),
        name VARCHAR NOT NULL,
        age INTEGER NOT NULL,
        gender VARCHAR NOT NULL,
        ethnicity VARCHAR,
        religion VARCHAR,
        bio TEXT,
        looking_for VARCHAR,
        location VARCHAR,
        photos TEXT[] DEFAULT '{}',
        video_url VARCHAR,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create preferences table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS preferences (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id) UNIQUE,
        min_age INTEGER DEFAULT 18,
        max_age INTEGER DEFAULT 60,
        preferred_gender VARCHAR,
        preferred_religion VARCHAR,
        max_distance INTEGER DEFAULT 50,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create swipes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS swipes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        swiper_id VARCHAR NOT NULL REFERENCES users(id),
        swiped_id VARCHAR NOT NULL REFERENCES users(id),
        action VARCHAR NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create matches table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS matches (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user1_id VARCHAR NOT NULL REFERENCES users(id),
        user2_id VARCHAR NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create conversations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user1_id VARCHAR NOT NULL REFERENCES users(id),
        user2_id VARCHAR NOT NULL REFERENCES users(id),
        last_message_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create messages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id UUID NOT NULL REFERENCES conversations(id),
        sender_id VARCHAR NOT NULL REFERENCES users(id),
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create blocks table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS blocks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        blocker_id VARCHAR NOT NULL REFERENCES users(id),
        blocked_id VARCHAR NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('All tables created successfully!');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

initDatabase();
