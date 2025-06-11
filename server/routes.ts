import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertApplicationSchema, insertAppUserSchema, loginSchema } from "@shared/schema";
import { z } from "zod";

// Middleware to validate API key for external API access
async function validateApiKey(req: any, res: any, next: any) {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  
  if (!apiKey) {
    return res.status(401).json({ message: "API key required" });
  }

  try {
    const application = await storage.getApplicationByApiKey(apiKey as string);
    if (!application || !application.isActive) {
      return res.status(401).json({ message: "Invalid or inactive API key" });
    }
    
    req.application = application;
    next();
  } catch (error) {
    console.error("API key validation error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
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
      const applications = await storage.getAllApplications(userId);
      
      let totalUsers = 0;
      for (const app of applications) {
        const users = await storage.getAllAppUsers(app.id);
        totalUsers += users.length;
      }

      res.json({
        totalApplications: applications.length,
        totalUsers,
        activeApplications: applications.filter(app => app.isActive).length,
        accountType: 'Premium'
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Application routes (authenticated)
  app.get('/api/applications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const applications = await storage.getAllApplications(userId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.post('/api/applications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertApplicationSchema.parse(req.body);
      const application = await storage.createApplication(userId, validatedData);
      res.status(201).json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Error creating application:", error);
      res.status(500).json({ message: "Failed to create application" });
    }
  });

  app.get('/api/applications/:id', isAuthenticated, async (req: any, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const application = await storage.getApplication(applicationId);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      // Check if user owns this application
      const userId = req.user.claims.sub;
      if (application.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(application);
    } catch (error) {
      console.error("Error fetching application:", error);
      res.status(500).json({ message: "Failed to fetch application" });
    }
  });

  app.get('/api/applications/:id/users', isAuthenticated, async (req: any, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const application = await storage.getApplication(applicationId);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      // Check if user owns this application
      const userId = req.user.claims.sub;
      if (application.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const users = await storage.getAllAppUsers(applicationId);
      res.json(users);
    } catch (error) {
      console.error("Error fetching application users:", error);
      res.status(500).json({ message: "Failed to fetch application users" });
    }
  });

  app.post('/api/applications/:id/users', isAuthenticated, async (req: any, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const application = await storage.getApplication(applicationId);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      // Check if user owns this application
      const userId = req.user.claims.sub;
      if (application.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const validatedData = insertAppUserSchema.parse(req.body);
      
      // Check for existing username/email in this application
      const existingUser = await storage.getAppUserByUsername(applicationId, validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists in this application" });
      }

      const existingEmail = await storage.getAppUserByEmail(applicationId, validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists in this application" });
      }

      const user = await storage.createAppUser(applicationId, validatedData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Error creating app user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // External API routes (require API key)
  
  // Register user via API
  app.post('/api/v1/register', validateApiKey, async (req: any, res) => {
    try {
      const application = req.application;
      const validatedData = insertAppUserSchema.parse(req.body);
      
      // Check for existing username/email in this application
      const existingUser = await storage.getAppUserByUsername(application.id, validatedData.username);
      if (existingUser) {
        return res.status(400).json({ success: false, message: "Username already exists" });
      }

      const existingEmail = await storage.getAppUserByEmail(application.id, validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ success: false, message: "Email already exists" });
      }

      const user = await storage.createAppUser(application.id, validatedData);
      res.status(201).json({ 
        success: true, 
        message: "User registered successfully",
        user_id: user.id
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, message: "Invalid input", errors: error.errors });
      }
      console.error("Error registering user:", error);
      res.status(500).json({ success: false, message: "Registration failed" });
    }
  });

  // Login via API
  app.post('/api/v1/login', validateApiKey, async (req: any, res) => {
    try {
      const application = req.application;
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ success: false, message: "Username and password required" });
      }

      const user = await storage.getAppUserByUsername(application.id, username);
      if (!user) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
      }

      if (!user.isActive) {
        return res.status(401).json({ success: false, message: "Account is disabled" });
      }

      // Check expiration
      if (user.expiresAt && new Date() > user.expiresAt) {
        return res.status(401).json({ success: false, message: "Account has expired" });
      }

      const isValidPassword = await storage.validatePassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
      }

      // Update last login
      await storage.updateAppUser(user.id, { lastLogin: new Date() });

      res.json({ 
        success: true, 
        message: "Login successful",
        user_id: user.id,
        username: user.username,
        email: user.email
      });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ success: false, message: "Login failed" });
    }
  });

  // Verify user session via API
  app.post('/api/v1/verify', validateApiKey, async (req: any, res) => {
    try {
      const application = req.application;
      const { user_id } = req.body;
      
      if (!user_id) {
        return res.status(400).json({ success: false, message: "User ID required" });
      }

      const user = await storage.getAppUser(user_id);
      if (!user || user.applicationId !== application.id) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      if (!user.isActive) {
        return res.status(401).json({ success: false, message: "Account is disabled" });
      }

      // Check expiration
      if (user.expiresAt && new Date() > user.expiresAt) {
        return res.status(401).json({ success: false, message: "Account has expired" });
      }

      res.json({ 
        success: true, 
        message: "User verified",
        user_id: user.id,
        username: user.username,
        email: user.email,
        expires_at: user.expiresAt
      });
    } catch (error) {
      console.error("Error verifying user:", error);
      res.status(500).json({ success: false, message: "Verification failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}