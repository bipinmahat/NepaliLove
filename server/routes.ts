import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { log } from "./vite";
import { setupAuth, isAuthenticated, getSessionStore } from "./replitAuth";
import {
  insertProfileSchema,
  insertPreferencesSchema,
  insertSwipeSchema,
  insertMessageSchema,
  blockedUsers,
  reports,
} from "@shared/schema";
import { db } from "./db";
import { eq, or } from "drizzle-orm";
import multer from "multer";
import path from "path";
import fs from "fs";

// media magic header validation
async function validateMediaFile(filePath: string, mimetype: string) {
  try {
    const fd = await fs.promises.open(filePath, "r");
    const header = Buffer.alloc(12);
    await fd.read(header, 0, 12, 0);
    await fd.close();

    // images
    if (mimetype.startsWith("image/")) {
      // JPEG
      if (header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff) return true;
      // PNG
      if (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4e && header[3] === 0x47) return true;
      // GIF
      if (header.toString("ascii", 0, 3) === "GIF") return true;
      // WebP ('RIFF'....'WEBP')
      if (header.toString("ascii", 0, 4) === "RIFF") return true;
      return false;
    }

    // videos: check for MP4 (ftyp) or WebM (EBML signature)
    if (mimetype.startsWith("video/")) {
      // WebM/Matroska: 0x1A 0x45 0xDF 0xA3
      if (header[0] === 0x1a && header[1] === 0x45 && header[2] === 0xdf && header[3] === 0xa3) return true;
      // MP4: 'ftyp' box within first 12 bytes
      if (header.toString().includes("ftyp")) return true;
      return false;
    }

    return false;
  } catch (e) {
    return false;
  }
}

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for videos
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype.startsWith("video/")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only image and video files are allowed"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Serve uploaded files
  app.use("/uploads", express.static(uploadDir));

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const profile = await storage.getProfile(userId);

      res.json({
        ...user,
        profile,
        hasProfile: !!profile,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Profile routes
  app.post(
    "/api/profile",
    isAuthenticated,
    upload.array("photos", 5),
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const profileData = req.body;

        // Handle uploaded files
        // Validate file signatures to avoid spoofed MIME types
        const photos: string[] = [];
        if (req.files && Array.isArray(req.files)) {
          for (const file of req.files) {
            const filePath = path.join(uploadDir, file.filename);
            const ok = await validateMediaFile(filePath, file.mimetype);
            if (!ok) {
              // remove invalid file
              try {
                fs.unlinkSync(filePath);
              } catch (e) {
                // ignore
              }
              return res.status(400).json({ message: "Invalid media file" });
            }
            photos.push(`/uploads/${file.filename}`);
          }
        }

        const profile = await storage.createProfile({
          ...profileData,
          userId,
          photos,
          age: parseInt(profileData.age) || 18,
        });

        res.json(profile);
      } catch (error) {
        console.error("Error creating profile:", error);
        res.status(500).json({ message: "Failed to create profile" });
      }
    },
  );

  app.put(
    "/api/profile",
    isAuthenticated,
    upload.fields([
      { name: "photos", maxCount: 6 },
      { name: "video", maxCount: 1 },
    ]),
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const profileData = req.body;

        // Handle existing photos
        let photos = [];
        if (profileData.existingPhotos) {
          photos = JSON.parse(profileData.existingPhotos);
        }

        // Handle new uploaded photos with signature validation
        if (req.files && req.files.photos) {
          for (const file of req.files.photos) {
            const filePath = path.join(uploadDir, file.filename);
            const ok = await validateMediaFile(filePath, file.mimetype);
            if (!ok) {
              try {
                fs.unlinkSync(filePath);
              } catch (e) {
                // ignore
              }
              return res.status(400).json({ message: "Invalid media file" });
            }
            photos.push(`/uploads/${file.filename}`);
          }
        }

        // Handle video upload with signature validation
        let videoUrl = profileData.videoUrl || null;
        if (req.files && req.files.video && req.files.video[0]) {
          const file = req.files.video[0];
          const filePath = path.join(uploadDir, file.filename);
          const ok = await validateMediaFile(filePath, file.mimetype);
          if (!ok) {
            try {
              fs.unlinkSync(filePath);
            } catch (e) {
              // ignore
            }
            return res.status(400).json({ message: "Invalid media file" });
          }
          videoUrl = `/uploads/${req.files.video[0].filename}`;
        }

        if (profileData.age) {
          profileData.age = parseInt(profileData.age) || 18;
        }

        const profile = await storage.updateProfile(userId, {
          ...profileData,
          photos,
          videoUrl,
        });
        res.json(profile);
      } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Failed to update profile" });
      }
    },
  );

  app.get("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getProfile(userId);
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Get any user's profile by ID
  app.get("/api/profile/:userId", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const profile = await storage.getProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Discovery routes
  app.get("/api/discover", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userPreferences = await storage.getPreferences(userId);
      let profiles = await storage.getProfilesForDiscovery(userId);

      res.json(profiles);
    } catch (error) {
      console.error("Error fetching discovery profiles:", error);
      res.status(500).json({ message: "Failed to fetch profiles" });
    }
  });

  // Swipe routes
  app.post("/api/swipe", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { swipedId, action } = req.body;

      // Process all swipes for real users only

      // Create swipe record for real users
      await storage.createSwipe({
        swiperId: userId,
        swipedId,
        action,
      });

      let isMatch = false;

      // Check for mutual like
      if (action === "like") {
        const mutualLike = await storage.checkMutualLike(userId, swipedId);
        if (mutualLike) {
          await storage.createMatch(userId, swipedId);
          isMatch = true;
        }
      }

      res.json({ success: true, isMatch });
    } catch (error) {
      console.error("Error processing swipe:", error);
      res.status(500).json({ message: "Failed to process swipe" });
    }
  });

  // Favorite routes
  app.post("/api/favorites", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { favoriteUserId } = req.body;

      // Skip database operations for demo users
      if (favoriteUserId.startsWith("demo-user-")) {
        res.json({ success: true, isFavorite: true });
        return;
      }

      // Check if already favorited
      const alreadyFavorite = await storage.isFavorite(userId, favoriteUserId);

      if (alreadyFavorite) {
        await storage.removeFavorite(userId, favoriteUserId);
        res.json({ success: true, isFavorite: false });
      } else {
        await storage.createFavorite({ userId, favoriteUserId });
        res.json({ success: true, isFavorite: true });
      }
    } catch (error) {
      console.error("Error processing favorite:", error);
      res.status(500).json({ message: "Failed to process favorite" });
    }
  });

  app.get("/api/favorites/:userId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { userId: targetUserId } = req.params;

      const isFavorite = await storage.isFavorite(userId, targetUserId);
      res.json({ isFavorite });
    } catch (error) {
      console.error("Error checking favorite status:", error);
      res.status(500).json({ message: "Failed to check favorite status" });
    }
  });

  // Match routes
  app.get("/api/matches", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const matches = await storage.getUserMatches(userId);

      // Get profile details for each match
      const matchesWithProfiles = await Promise.all(
        matches.map(async (match) => {
          const otherUserId =
            match.user1Id === userId ? match.user2Id : match.user1Id;
          const profile = await storage.getProfile(otherUserId);
          return {
            ...match,
            profile,
          };
        }),
      );

      res.json(matchesWithProfiles);
    } catch (error) {
      console.error("Error fetching matches:", error);
      res.status(500).json({ message: "Failed to fetch matches" });
    }
  });

  // Conversation routes
  app.get("/api/conversations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversations = await storage.getUserConversations(userId);

      // Get profile details and last message for each conversation
      const conversationsWithDetails = await Promise.all(
        conversations.map(async (conv) => {
          const otherUserId =
            conv.user1Id === userId ? conv.user2Id : conv.user1Id;
          const profile = await storage.getProfile(otherUserId);
          const messages = await storage.getConversationMessages(conv.id);
          const lastMessage = messages[messages.length - 1];

          return {
            ...conv,
            profile,
            lastMessage,
          };
        }),
      );

      res.json(conversationsWithDetails);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.post("/api/conversations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { otherUserId } = req.body;

      const conversation = await storage.getOrCreateConversation(
        userId,
        otherUserId,
      );
      res.json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });

  // Message routes
  app.get(
    "/api/conversations/:id/messages",
    isAuthenticated,
    async (req: any, res) => {
      try {
        const { id } = req.params;
        const messages = await storage.getConversationMessages(id);
        res.json(messages);
      } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ message: "Failed to fetch messages" });
      }
    },
  );

  app.post(
    "/api/conversations/:id/messages",
    isAuthenticated,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const { id } = req.params;
        const { content } = req.body;

        const message = await storage.createMessage({
          conversationId: id,
          senderId: userId,
          content,
        });

        // Broadcast message to WebSocket clients
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: "new_message",
                message,
              }),
            );
          }
        });

        res.json(message);
      } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ message: "Failed to send message" });
      }
    },
  );

  // Preferences routes
  app.get("/api/preferences", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const preferences = await storage.getPreferences(userId);
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching preferences:", error);
      res.status(500).json({ message: "Failed to fetch preferences" });
    }
  });

  app.post("/api/preferences", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const preferencesData = req.body;

      const preferences = await storage.upsertPreferences({
        ...preferencesData,
        userId,
      });

      res.json(preferences);
    } catch (error) {
      console.error("Error saving preferences:", error);
      res.status(500).json({ message: "Failed to save preferences" });
    }
  });

  // Block user
  app.post("/api/block", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { blockedUserId } = req.body;

      await storage.blockUser(userId, blockedUserId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error blocking user:", error);
      res.status(500).json({ message: "Failed to block user" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", async (ws, req) => {
    // Validate session cookie using the session store (connect-pg-simple)
    const cookies = req?.headers?.cookie;
    if (!cookies || !cookies.includes("connect.sid")) {
      log("Rejected WebSocket connection without session cookie", "ws");
      try {
        ws.close(1008, "Unauthorized");
      } catch (e) {
        // swallow
      }
      return;
    }

    const sessionStore = getSessionStore();
    if (!sessionStore) {
      log("Session store not available; rejecting WS connection", "ws");
      try {
        ws.close(1011, "Server configuration");
      } catch (e) {
        // swallow
      }
      return;
    }

    // Extract connect.sid cookie value (plain session id)
    const sidRaw = cookies
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("connect.sid="));

    if (!sidRaw) {
      log("No connect.sid cookie found; rejecting WS connection", "ws");
      ws.close(1008, "Unauthorized");
      return;
    }

    const sid = decodeURIComponent(sidRaw.split("=")[1] || "");

    try {
      // sessionStore.get follows (sid, cb)
      sessionStore.get(sid, (err: any, sess: any) => {
        if (err || !sess) {
          log("Invalid or expired session; rejecting WS connection", "ws");
          try {
            ws.close(1008, "Unauthorized");
          } catch (e) {
            // swallow
          }
          return;
        }

        // attach session to socket for later use if needed
        (ws as any).session = sess;
        (ws as any).authUser = sess?.passport || sess?.user || null;

        log("New WebSocket connection (authenticated)", "ws");
      });
    } catch (e) {
      log("Error validating session for WS connection", "ws");
      ws.close(1011, "Server error");
      return;
    }

    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        log(`Received message: ${JSON.stringify(message)}`, "ws");

        // Broadcast to all clients (in a real app, you'd filter by conversation)
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
          }
        });
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    });

    ws.on("close", () => {
      log("WebSocket connection closed", "ws");
    });
  });

  return httpServer;
}
