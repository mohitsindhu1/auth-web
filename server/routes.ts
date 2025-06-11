import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, insertAccountSchema, firebaseLoginSchema } from "@shared/schema";
import rateLimit from "express-rate-limit";
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// Rate limiting middleware
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: { success: false, message: "Too many authentication attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { success: false, message: "Rate limit exceeded, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware to validate API key
async function validateApiKey(req: any, res: any, next: any) {
  const apiKey = req.body.api_key || req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: "API key is required"
    });
  }
  
  const key = await storage.getApiKey(apiKey);
  if (!key || !key.isActive) {
    return res.status(401).json({
      success: false,
      message: "Invalid or inactive API key"
    });
  }
  
  req.apiKey = key;
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply rate limiting to all API routes
  app.use('/api', apiLimiter);
  
  // User Registration
  app.post('/api/auth/register', authLimiter, validateApiKey, async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Username already exists"
        });
      }
      
      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already exists"
        });
      }
      
      const user = await storage.createUser(validatedData);
      
      res.status(201).json({
        success: true,
        message: "User registered successfully",
        user_id: user.id.toString()
      });
      
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Registration failed"
      });
    }
  });
  
  // User Login
  app.post('/api/auth/login', authLimiter, validateApiKey, async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(validatedData.username);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials"
        });
      }
      
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: "Account is deactivated"
        });
      }
      
      const isValidPassword = await storage.validatePassword(validatedData.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials"
        });
      }
      
      // Update last login
      await storage.updateUser(user.id, { lastLogin: new Date() });
      
      // Create session
      const session = await storage.createSession(user.id);
      
      res.json({
        success: true,
        message: "Login successful",
        user_id: user.id.toString(),
        session_token: session.sessionToken
      });
      
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Login failed"
      });
    }
  });
  
  // Verify Session
  app.post('/api/auth/verify', validateApiKey, async (req, res) => {
    try {
      const { session_token } = req.body;
      
      if (!session_token) {
        return res.status(400).json({
          success: false,
          message: "Session token is required"
        });
      }
      
      const session = await storage.getSession(session_token);
      if (!session) {
        return res.status(401).json({
          success: false,
          message: "Invalid or expired session"
        });
      }
      
      const user = await storage.getUser(session.userId);
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: "User not found or inactive"
        });
      }
      
      res.json({
        success: true,
        message: "Session is valid",
        user_id: user.id.toString(),
        username: user.username
      });
      
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Session verification failed"
      });
    }
  });
  
  // Logout
  app.post('/api/auth/logout', validateApiKey, async (req, res) => {
    try {
      const { session_token } = req.body;
      
      if (session_token) {
        await storage.deleteSession(session_token);
      }
      
      res.json({
        success: true,
        message: "Logged out successfully"
      });
      
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Logout failed"
      });
    }
  });
  
  // Admin Routes
  
  // Get all users (admin)
  app.get('/api/admin/users', validateApiKey, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const sanitizedUsers = users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }));
      
      res.json({
        success: true,
        users: sanitizedUsers,
        total: sanitizedUsers.length
      });
      
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch users"
      });
    }
  });
  
  // Toggle user status (admin)
  app.patch('/api/admin/users/:id/toggle', validateApiKey, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
      
      const updatedUser = await storage.updateUser(userId, { isActive: !user.isActive });
      
      res.json({
        success: true,
        message: `User ${updatedUser?.isActive ? 'activated' : 'deactivated'} successfully`,
        user: {
          id: updatedUser?.id,
          username: updatedUser?.username,
          isActive: updatedUser?.isActive
        }
      });
      
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to update user"
      });
    }
  });
  
  // Delete user (admin)
  app.delete('/api/admin/users/:id', validateApiKey, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const deleted = await storage.deleteUser(userId);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
      
      res.json({
        success: true,
        message: "User deleted successfully"
      });
      
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to delete user"
      });
    }
  });
  
  // Get API keys (admin)
  app.get('/api/admin/api-keys', validateApiKey, async (req, res) => {
    try {
      const apiKeys = await storage.getAllApiKeys();
      
      res.json({
        success: true,
        api_keys: apiKeys,
        total: apiKeys.length
      });
      
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch API keys"
      });
    }
  });
  
  // Create API key (admin)
  app.post('/api/admin/api-keys', validateApiKey, async (req, res) => {
    try {
      const { name } = req.body;
      
      if (!name) {
        return res.status(400).json({
          success: false,
          message: "API key name is required"
        });
      }
      
      const apiKey = await storage.createApiKey({ name });
      
      res.status(201).json({
        success: true,
        message: "API key created successfully",
        api_key: apiKey
      });
      
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to create API key"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
