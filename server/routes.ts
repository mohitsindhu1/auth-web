import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertApiKeySchema, insertAppUserSchema, loginSchema } from "@shared/schema";

async function validateApiKey(req: any, res: any, next: any) {
  const apiKey = req.headers['x-api-key'] || req.body.api_key;
  
  if (!apiKey) {
    return res.status(401).json({ 
      success: false, 
      message: "API key is required" 
    });
  }

  try {
    const key = await storage.getApiKey(apiKey);
    if (!key || !key.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid or inactive API key" 
      });
    }
    
    req.apiKey = key;
    next();
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: "Error validating API key" 
    });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Replit Auth
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const apiKeys = await storage.getAllApiKeys(userId);
      const appUsers = await storage.getAllAppUsers(userId);
      
      res.json({
        totalUsers: appUsers.length,
        totalApiKeys: apiKeys.length,
        activeApiKeys: apiKeys.filter(key => key.isActive).length,
        accountType: "Premium"
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // API Key management
  app.get('/api/api-keys', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const apiKeys = await storage.getAllApiKeys(userId);
      res.json(apiKeys);
    } catch (error) {
      console.error("Error fetching API keys:", error);
      res.status(500).json({ message: "Failed to fetch API keys" });
    }
  });

  app.post('/api/api-keys', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertApiKeySchema.parse(req.body);
      
      const apiKey = await storage.createApiKey(userId, validatedData);
      res.json(apiKey);
    } catch (error) {
      console.error("Error creating API key:", error);
      res.status(500).json({ message: "Failed to create API key" });
    }
  });

  app.delete('/api/api-keys/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deactivateApiKey(id);
      
      if (success) {
        res.json({ message: "API key deactivated successfully" });
      } else {
        res.status(404).json({ message: "API key not found" });
      }
    } catch (error) {
      console.error("Error deactivating API key:", error);
      res.status(500).json({ message: "Failed to deactivate API key" });
    }
  });

  // App Users management
  app.get('/api/users', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const users = await storage.getAllAppUsers(userId);
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post('/api/users', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertAppUserSchema.parse(req.body);
      
      // Check if username already exists for this user
      const existingUser = await storage.getAppUserByUsername(userId, validatedData.username);
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: "Username already exists" 
        });
      }

      const user = await storage.createAppUser(userId, validatedData);
      res.json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Auth API for created users
  app.post('/api/auth/login', validateApiKey, async (req: any, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const apiKey = req.apiKey;
      
      // Find user by username
      const user = await storage.getAppUserByUsername(apiKey.userId, validatedData.username);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials"
        });
      }

      // Validate password
      const isValidPassword = await storage.validatePassword(validatedData.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials"
        });
      }

      // Update last login
      await storage.updateAppUser(user.id, { lastLogin: new Date() });

      res.json({
        success: true,
        message: "Login successful",
        user_id: user.id.toString(),
        username: user.username,
        email: user.email
      });

    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Login failed"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}