import { sql } from "drizzle-orm";
import { db, pool } from "./db";

export async function runMigrations() {
  try {
    console.log("Running database migrations...");
    console.log("DATABASE_URL:", process.env.DATABASE_URL?.substring(0, 60) + "...");
    
    // Test connection first
    try {
      await db.execute(sql`SELECT 1`);
      console.log("✓ Database connection successful");
    } catch (connError: any) {
      console.error("✗ Database connection failed:", connError.message);
      console.error("\n⚠️  IMPORTANT: Please check your database credentials in Replit Secrets");
      console.error("   The DATABASE_URL may be pointing to an old or invalid database.");
      throw connError;
    }
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR PRIMARY KEY,
        sess JSONB NOT NULL,
        expire TIMESTAMP NOT NULL
      );
      CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY NOT NULL,
        email VARCHAR UNIQUE,
        first_name VARCHAR,
        last_name VARCHAR,
        profile_image_url VARCHAR,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id),
        name VARCHAR NOT NULL,
        birthdate DATE NOT NULL,
        gender VARCHAR NOT NULL,
        ethnicity VARCHAR,
        religion VARCHAR,
        bio TEXT,
        looking_for VARCHAR,
        location VARCHAR,
        photos TEXT[] DEFAULT '{}',
        video_url VARCHAR,
        verification_photo VARCHAR,
        is_verified BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS preferences (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL UNIQUE REFERENCES users(id),
        min_age INTEGER DEFAULT 18,
        max_age INTEGER DEFAULT 60,
        preferred_gender VARCHAR,
        preferred_religion VARCHAR,
        max_distance INTEGER DEFAULT 50,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS swipes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        swiper_id VARCHAR NOT NULL REFERENCES users(id),
        swiped_id VARCHAR NOT NULL REFERENCES users(id),
        action VARCHAR NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS favorites (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id),
        favorite_user_id VARCHAR NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS matches (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user1_id VARCHAR NOT NULL REFERENCES users(id),
        user2_id VARCHAR NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user1_id VARCHAR NOT NULL REFERENCES users(id),
        user2_id VARCHAR NOT NULL REFERENCES users(id),
        last_message_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id UUID NOT NULL REFERENCES conversations(id),
        sender_id VARCHAR NOT NULL REFERENCES users(id),
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS blocks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        blocker_id VARCHAR NOT NULL REFERENCES users(id),
        blocked_id VARCHAR NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS blocked_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        blocker_id VARCHAR NOT NULL REFERENCES users(id),
        blocked_id VARCHAR NOT NULL REFERENCES users(id),
        reason TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        reporter_id VARCHAR NOT NULL REFERENCES users(id),
        reported_id VARCHAR NOT NULL REFERENCES users(id),
        reason VARCHAR NOT NULL,
        description TEXT,
        status VARCHAR DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log("Database migrations completed successfully!");
  } catch (error) {
    console.error("Error running migrations:", error);
    throw error;
  }
}
