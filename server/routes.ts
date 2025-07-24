import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertProfileSchema, insertPreferencesSchema, insertSwipeSchema, insertMessageSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Serve uploaded files
  app.use('/uploads', express.static(uploadDir));

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const profile = await storage.getProfile(userId);
      
      res.json({
        ...user,
        profile,
        hasProfile: !!profile
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Profile routes
  app.post('/api/profile', isAuthenticated, upload.array('photos', 5), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = req.body;
      
      // Handle uploaded files
      const photos = req.files?.map((file: any) => `/uploads/${file.filename}`) || [];
      
      const profile = await storage.createProfile({
        ...profileData,
        userId,
        photos,
        age: parseInt(profileData.age),
      });
      
      res.json(profile);
    } catch (error) {
      console.error("Error creating profile:", error);
      res.status(500).json({ message: "Failed to create profile" });
    }
  });

  app.put('/api/profile', isAuthenticated, upload.array('photos', 5), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = req.body;
      
      // Handle uploaded files
      if (req.files && req.files.length > 0) {
        const newPhotos = req.files.map((file: any) => `/uploads/${file.filename}`);
        profileData.photos = [...(profileData.photos || []), ...newPhotos];
      }
      
      if (profileData.age) {
        profileData.age = parseInt(profileData.age);
      }
      
      const profile = await storage.updateProfile(userId, profileData);
      res.json(profile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.get('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getProfile(userId);
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Discovery routes
  app.get('/api/discover', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let profiles = await storage.getProfilesForDiscovery(userId);
      
      // If no real profiles available, add demo users for testing
      if (profiles.length === 0) {
        const demoUsers = [
          {
            id: 'demo-1',
            userId: 'demo-user-1',
            name: 'Priya Sharma',
            age: 24,
            gender: 'female',
            ethnicity: 'brahmin',
            religion: 'hindu',
            bio: 'Love traveling and exploring new places. Looking for someone genuine and caring.',
            lookingFor: 'serious',
            location: 'Kathmandu',
            photos: ['/api/placeholder/400/300'],
            videoUrl: null,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'demo-2',
            userId: 'demo-user-2',
            name: 'Raj Gurung',
            age: 27,
            gender: 'male',
            ethnicity: 'gurung',
            religion: 'buddhist',
            bio: 'Software engineer who loves hiking and photography. Family means everything to me.',
            lookingFor: 'marriage',
            location: 'Pokhara',
            photos: ['/api/placeholder/400/300'],
            videoUrl: null,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'demo-3',
            userId: 'demo-user-3',
            name: 'Maya Thapa',
            age: 22,
            gender: 'female',
            ethnicity: 'chhetri',
            religion: 'hindu',
            bio: 'Teacher and dancer. I believe in traditional values and modern thinking.',
            lookingFor: 'serious',
            location: 'Lalitpur',
            photos: ['/api/placeholder/400/300'],
            videoUrl: null,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'demo-4',
            userId: 'demo-user-4',
            name: 'Arjun Magar',
            age: 29,
            gender: 'male',
            ethnicity: 'magar',
            religion: 'hindu',
            bio: 'Business owner with a passion for adventure sports and social work.',
            lookingFor: 'marriage',
            location: 'Bhaktapur',
            photos: ['/api/placeholder/400/300'],
            videoUrl: null,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'demo-5',
            userId: 'demo-user-5',
            name: 'Sita Newar',
            age: 26,
            gender: 'female',
            ethnicity: 'newar',
            religion: 'buddhist',
            bio: 'Artist and cultural enthusiast. Love cooking traditional Newari food.',
            lookingFor: 'friendship',
            location: 'Kathmandu',
            photos: ['/api/placeholder/400/300'],
            videoUrl: null,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];
        profiles = demoUsers;
      }
      
      res.json(profiles);
    } catch (error) {
      console.error("Error fetching discovery profiles:", error);
      res.status(500).json({ message: "Failed to fetch profiles" });
    }
  });

  // Swipe routes
  app.post('/api/swipe', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { swipedId, action } = req.body;
      
      // Skip database operations for demo users - check userId instead of swipedId
      if (swipedId === 'demo-user-1' || swipedId === 'demo-user-2' || swipedId === 'demo-user-3' || swipedId === 'demo-user-4' || swipedId === 'demo-user-5') {
        // Simulate random match for demo users (30% chance)
        const isMatch = action === 'like' && Math.random() < 0.3;
        res.json({ success: true, isMatch });
        return;
      }
      
      // Create swipe record for real users
      await storage.createSwipe({
        swiperId: userId,
        swipedId,
        action,
      });
      
      let isMatch = false;
      
      // Check for mutual like
      if (action === 'like') {
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

  // Match routes
  app.get('/api/matches', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const matches = await storage.getUserMatches(userId);
      
      // Get profile details for each match
      const matchesWithProfiles = await Promise.all(
        matches.map(async (match) => {
          const otherUserId = match.user1Id === userId ? match.user2Id : match.user1Id;
          const profile = await storage.getProfile(otherUserId);
          return {
            ...match,
            profile,
          };
        })
      );
      
      res.json(matchesWithProfiles);
    } catch (error) {
      console.error("Error fetching matches:", error);
      res.status(500).json({ message: "Failed to fetch matches" });
    }
  });

  // Conversation routes
  app.get('/api/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversations = await storage.getUserConversations(userId);
      
      // Get profile details and last message for each conversation
      const conversationsWithDetails = await Promise.all(
        conversations.map(async (conv) => {
          const otherUserId = conv.user1Id === userId ? conv.user2Id : conv.user1Id;
          const profile = await storage.getProfile(otherUserId);
          const messages = await storage.getConversationMessages(conv.id);
          const lastMessage = messages[messages.length - 1];
          
          return {
            ...conv,
            profile,
            lastMessage,
          };
        })
      );
      
      res.json(conversationsWithDetails);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.post('/api/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { otherUserId } = req.body;
      
      const conversation = await storage.getOrCreateConversation(userId, otherUserId);
      res.json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });

  // Message routes
  app.get('/api/conversations/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const messages = await storage.getConversationMessages(id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/conversations/:id/messages', isAuthenticated, async (req: any, res) => {
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
          client.send(JSON.stringify({
            type: 'new_message',
            message,
          }));
        }
      });
      
      res.json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Preferences routes
  app.get('/api/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const preferences = await storage.getPreferences(userId);
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching preferences:", error);
      res.status(500).json({ message: "Failed to fetch preferences" });
    }
  });

  app.post('/api/preferences', isAuthenticated, async (req: any, res) => {
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

  const httpServer = createServer(app);

  // WebSocket server for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('New WebSocket connection');

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log('Received message:', message);
        
        // Broadcast to all clients (in a real app, you'd filter by conversation)
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
          }
        });
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  return httpServer;
}
