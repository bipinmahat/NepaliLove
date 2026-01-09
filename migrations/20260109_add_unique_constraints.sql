-- Migration: add unique constraints to prevent duplicate matches, conversations, and favorites

-- Prevent duplicate favorites: user cannot favorite another user twice
ALTER TABLE IF EXISTS favorites
  ADD CONSTRAINT IF NOT EXISTS favorites_user_favorite_unique UNIQUE (user_id, favorite_user_id);

-- Prevent duplicate matches for unordered pairs
CREATE UNIQUE INDEX IF NOT EXISTS matches_unique_pair ON matches (
  LEAST(user1_id, user2_id),
  GREATEST(user1_id, user2_id)
);

-- Prevent duplicate conversations for unordered pairs
CREATE UNIQUE INDEX IF NOT EXISTS conversations_unique_pair ON conversations (
  LEAST(user1_id, user2_id),
  GREATEST(user1_id, user2_id)
);
