import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  integer,
  boolean,
  uuid,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User profiles with detailed information
export const profiles = pgTable("profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: varchar("name").notNull(),
  birthdate: date("birthdate").notNull(),
  gender: varchar("gender").notNull(),
  ethnicity: varchar("ethnicity"),
  religion: varchar("religion"),
  bio: text("bio"),
  lookingFor: varchar("looking_for"),
  location: varchar("location"),
  photos: text("photos").array().default([]),
  videoUrl: varchar("video_url"),
  verificationPhoto: varchar("verification_photo"),
  isVerified: boolean("is_verified").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User preferences for matching
export const preferences = pgTable("preferences", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull().unique(),
  minAge: integer("min_age").default(18),
  maxAge: integer("max_age").default(60),
  preferredGender: varchar("preferred_gender"),
  preferredReligion: varchar("preferred_religion"),
  maxDistance: integer("max_distance").default(50),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Swipe actions (likes/passes)
export const swipes = pgTable("swipes", {
  id: uuid("id").defaultRandom().primaryKey(),
  swiperId: varchar("swiper_id").references(() => users.id).notNull(),
  swipedId: varchar("swiped_id").references(() => users.id).notNull(),
  action: varchar("action").notNull(), // 'like' or 'pass'
  createdAt: timestamp("created_at").defaultNow(),
});

// Favorites/Super likes table
export const favorites = pgTable("favorites", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  favoriteUserId: varchar("favorite_user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Matches when both users like each other
export const matches = pgTable("matches", {
  id: uuid("id").defaultRandom().primaryKey(),
  user1Id: varchar("user1_id").references(() => users.id).notNull(),
  user2Id: varchar("user2_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat conversations
export const conversations = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  user1Id: varchar("user1_id").references(() => users.id).notNull(),
  user2Id: varchar("user2_id").references(() => users.id).notNull(),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat messages
export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id").references(() => conversations.id).notNull(),
  senderId: varchar("sender_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Blocked users
export const blocks = pgTable("blocks", {
  id: uuid("id").defaultRandom().primaryKey(),
  blockerId: varchar("blocker_id").references(() => users.id).notNull(),
  blockedId: varchar("blocked_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, { fields: [users.id], references: [profiles.userId] }),
  preferences: one(preferences, { fields: [users.id], references: [preferences.userId] }),
  sentSwipes: many(swipes, { relationName: "swiper" }),
  receivedSwipes: many(swipes, { relationName: "swiped" }),
  sentMessages: many(messages, { relationName: "sender" }),
  favorites: many(favorites, { relationName: "userFavorites" }),
  favoritedBy: many(favorites, { relationName: "favoritedUser" }),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, { fields: [profiles.userId], references: [users.id] }),
}));

export const preferencesRelations = relations(preferences, ({ one }) => ({
  user: one(users, { fields: [preferences.userId], references: [users.id] }),
}));

export const swipesRelations = relations(swipes, ({ one }) => ({
  swiper: one(users, { fields: [swipes.swiperId], references: [users.id], relationName: "swiper" }),
  swiped: one(users, { fields: [swipes.swipedId], references: [users.id], relationName: "swiped" }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, { fields: [favorites.userId], references: [users.id], relationName: "userFavorites" }),
  favoriteUser: one(users, { fields: [favorites.favoriteUserId], references: [users.id], relationName: "favoritedUser" }),
}));

export const matchesRelations = relations(matches, ({ one }) => ({
  user1: one(users, { fields: [matches.user1Id], references: [users.id] }),
  user2: one(users, { fields: [matches.user2Id], references: [users.id] }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  user1: one(users, { fields: [conversations.user1Id], references: [users.id] }),
  user2: one(users, { fields: [conversations.user2Id], references: [users.id] }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, { fields: [messages.conversationId], references: [conversations.id] }),
  sender: one(users, { fields: [messages.senderId], references: [users.id], relationName: "sender" }),
}));

// Blocked users table
export const blockedUsers = pgTable("blocked_users", {
  id: uuid("id").defaultRandom().primaryKey(),
  blockerId: varchar("blocker_id").references(() => users.id).notNull(),
  blockedId: varchar("blocked_id").references(() => users.id).notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reports table
export const reports = pgTable("reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  reporterId: varchar("reporter_id").references(() => users.id).notNull(),
  reportedId: varchar("reported_id").references(() => users.id).notNull(),
  reason: varchar("reason").notNull(),
  description: text("description"),
  status: varchar("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  birthdate: z.string().min(1, "Date of birth is required"),
});

export const insertPreferencesSchema = createInsertSchema(preferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSwipeSchema = createInsertSchema(swipes).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Preferences = typeof preferences.$inferSelect;
export type InsertPreferences = z.infer<typeof insertPreferencesSchema>;
export type Swipe = typeof swipes.$inferSelect;
export type InsertSwipe = z.infer<typeof insertSwipeSchema>;
export type Match = typeof matches.$inferSelect;
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = typeof favorites.$inferInsert;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Block = typeof blocks.$inferSelect;
export type InsertBlock = typeof blocks.$inferInsert;
