import {
  users,
  profiles,
  preferences,
  swipes,
  matches,
  conversations,
  messages,
  blocks,
  type User,
  type UpsertUser,
  type Profile,
  type InsertProfile,
  type Preferences,
  type InsertPreferences,
  type InsertSwipe,
  type Match,
  type Conversation,
  type Message,
  type InsertMessage,
  type Block,
  type InsertBlock,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, ne, sql, desc } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Profile operations
  getProfile(userId: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(
    userId: string,
    profile: Partial<InsertProfile>,
  ): Promise<Profile>;
  getProfilesForDiscovery(userId: string, limit?: number): Promise<Profile[]>;

  // Preferences operations
  getPreferences(userId: string): Promise<Preferences | undefined>;
  upsertPreferences(preferences: InsertPreferences): Promise<Preferences>;

  // Swipe operations
  createSwipe(swipe: InsertSwipe): Promise<void>;
  checkMutualLike(user1Id: string, user2Id: string): Promise<boolean>;

  // Match operations
  createMatch(user1Id: string, user2Id: string): Promise<Match>;
  getUserMatches(userId: string): Promise<Match[]>;

  // Favorite operations
  createFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: string, favoriteUserId: string): Promise<void>;
  isFavorite(userId: string, favoriteUserId: string): Promise<boolean>;
  getUserFavorites(userId: string): Promise<Favorite[]>;

  // Conversation operations
  getOrCreateConversation(
    user1Id: string,
    user2Id: string,
  ): Promise<Conversation>;
  getUserConversations(userId: string): Promise<Conversation[]>;

  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getConversationMessages(conversationId: string): Promise<Message[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Profile operations
  async getProfile(userId: string): Promise<Profile | undefined> {
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId));
    return profile;
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const [newProfile] = await db.insert(profiles).values(profile).returning();
    return newProfile;
  }

  async updateProfile(
    userId: string,
    profileData: Partial<InsertProfile>,
  ): Promise<Profile> {
    const [profile] = await db
      .update(profiles)
      .set({ ...profileData, updatedAt: new Date() })
      .where(eq(profiles.userId, userId))
      .returning();
    return profile;
  }

  async getProfilesForDiscovery(
    userId: string,
    limit = 10,
  ): Promise<Profile[]> {
    // Get profiles that haven't been swiped on by the current user
    const swipedProfiles = db
      .select({ swipedId: swipes.swipedId })
      .from(swipes)
      .where(eq(swipes.swiperId, userId));

    const discoveryProfiles = await db
      .select()
      .from(profiles)
      .where(
        and(
          ne(profiles.userId, userId),
          eq(profiles.isActive, true),
          sql`${profiles.userId} NOT IN (${swipedProfiles})`,
        ),
      )
      .limit(limit);

    return discoveryProfiles;
  }

  // Preferences operations
  async getPreferences(userId: string): Promise<Preferences | undefined> {
    const [prefs] = await db
      .select()
      .from(preferences)
      .where(eq(preferences.userId, userId));
    return prefs;
  }

  async upsertPreferences(
    preferencesData: InsertPreferences,
  ): Promise<Preferences> {
    const [prefs] = await db
      .insert(preferences)
      .values(preferencesData)
      .onConflictDoUpdate({
        target: preferences.userId,
        set: {
          ...preferencesData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return prefs;
  }

  // Swipe operations
  async createSwipe(swipe: InsertSwipe): Promise<void> {
    await db.insert(swipes).values(swipe);
  }

  async checkMutualLike(user1Id: string, user2Id: string): Promise<boolean> {
    const [mutualLike] = await db
      .select()
      .from(swipes)
      .where(
        and(
          eq(swipes.swiperId, user2Id),
          eq(swipes.swipedId, user1Id),
          eq(swipes.action, "like"),
        ),
      );
    return !!mutualLike;
  }

  // Match operations
  async createMatch(user1Id: string, user2Id: string): Promise<Match> {
    const [match] = await db
      .insert(matches)
      .values({ user1Id, user2Id })
      .returning();
    return match;
  }

  async getUserMatches(userId: string): Promise<Match[]> {
    const userMatches = await db
      .select()
      .from(matches)
      .where(or(eq(matches.user1Id, userId), eq(matches.user2Id, userId)))
      .orderBy(desc(matches.createdAt));
    return userMatches;
  }

  // Favorite operations
  async createFavorite(favorite: InsertFavorite): Promise<Favorite> {
    const [newFavorite] = await db
      .insert(favorites)
      .values(favorite)
      .returning();
    return newFavorite;
  }

  async removeFavorite(userId: string, favoriteUserId: string): Promise<void> {
    await db
      .delete(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.favoriteUserId, favoriteUserId),
        ),
      );
  }

  async isFavorite(userId: string, favoriteUserId: string): Promise<boolean> {
    const [favorite] = await db
      .select()
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.favoriteUserId, favoriteUserId),
        ),
      );
    return !!favorite;
  }

  async getUserFavorites(userId: string): Promise<Favorite[]> {
    const userFavorites = await db
      .select()
      .from(favorites)
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt));
    return userFavorites;
  }

  // Conversation operations
  async getOrCreateConversation(
    user1Id: string,
    user2Id: string,
  ): Promise<Conversation> {
    // Check if conversation already exists
    const [existingConv] = await db
      .select()
      .from(conversations)
      .where(
        or(
          and(
            eq(conversations.user1Id, user1Id),
            eq(conversations.user2Id, user2Id),
          ),
          and(
            eq(conversations.user1Id, user2Id),
            eq(conversations.user2Id, user1Id),
          ),
        ),
      );

    if (existingConv) {
      return existingConv;
    }

    // Create new conversation
    const [newConv] = await db
      .insert(conversations)
      .values({ user1Id, user2Id })
      .returning();
    return newConv;
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    const convs = await db
      .select()
      .from(conversations)
      .where(
        or(
          eq(conversations.user1Id, userId),
          eq(conversations.user2Id, userId),
        ),
      )
      .orderBy(desc(conversations.lastMessageAt));
    return convs;
  }

  // Message operations
  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();

    // Update conversation's last message timestamp
    await db
      .update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, message.conversationId));

    return newMessage;
  }

  async getConversationMessages(conversationId: string): Promise<Message[]> {
    const msgs = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
    return msgs;
  }

  // Block operations
  async blockUser(blockerId: string, blockedId: string): Promise<Block> {
    const [block] = await db
      .insert(blocks)
      .values({ blockerId, blockedId })
      .onConflictDoNothing()
      .returning();
    return block;
  }

  async isUserBlocked(userId1: string, userId2: string): Promise<boolean> {
    const [block] = await db
      .select()
      .from(blocks)
      .where(
        or(
          and(eq(blocks.blockerId, userId1), eq(blocks.blockedId, userId2)),
          and(eq(blocks.blockerId, userId2), eq(blocks.blockedId, userId1)),
        ),
      )
      .limit(1);
    return !!block;
  }
}

export const storage = new DatabaseStorage();
