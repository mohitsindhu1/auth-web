import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertApplicationSchema, 
  insertAppUserSchema, 
  updateApplicationSchema,
  updateAppUserSchema,
  loginSchema 
} from "@shared/schema";
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

  // Update application with enhanced features
  app.put('/api/applications/:id', isAuthenticated, async (req: any, res) => {
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

      const validatedData = updateApplicationSchema.parse(req.body);
      const updatedApplication = await storage.updateApplication(applicationId, validatedData);
      
      if (!updatedApplication) {
        return res.status(404).json({ message: "Application not found" });
      }

      res.json(updatedApplication);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Error updating application:", error);
      res.status(500).json({ message: "Failed to update application" });
    }
  });

  // Delete application
  app.delete('/api/applications/:id', isAuthenticated, async (req: any, res) => {
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

      const deleted = await storage.deleteApplication(applicationId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Application not found" });
      }

      res.json({ message: "Application deleted successfully" });
    } catch (error) {
      console.error("Error deleting application:", error);
      res.status(500).json({ message: "Failed to delete application" });
    }
  });

  // Get single application
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

  // Update app user
  app.put('/api/applications/:id/users/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const userId = parseInt(req.params.userId);
      
      const application = await storage.getApplication(applicationId);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      // Check if user owns this application
      const ownerId = req.user.claims.sub;
      if (application.userId !== ownerId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const user = await storage.getAppUser(userId);
      if (!user || user.applicationId !== applicationId) {
        return res.status(404).json({ message: "User not found" });
      }

      const validatedData = updateAppUserSchema.parse(req.body);
      const updatedUser = await storage.updateAppUser(userId, validatedData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Don't return password in response
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Error updating app user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Pause app user
  app.post('/api/applications/:id/users/:userId/pause', isAuthenticated, async (req: any, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const userId = parseInt(req.params.userId);
      
      const application = await storage.getApplication(applicationId);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      // Check if user owns this application
      const ownerId = req.user.claims.sub;
      if (application.userId !== ownerId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const user = await storage.getAppUser(userId);
      if (!user || user.applicationId !== applicationId) {
        return res.status(404).json({ message: "User not found" });
      }

      const paused = await storage.pauseAppUser(userId);
      if (!paused) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "User paused successfully" });
    } catch (error) {
      console.error("Error pausing app user:", error);
      res.status(500).json({ message: "Failed to pause user" });
    }
  });

  // Unpause app user
  app.post('/api/applications/:id/users/:userId/unpause', isAuthenticated, async (req: any, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const userId = parseInt(req.params.userId);
      
      const application = await storage.getApplication(applicationId);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      // Check if user owns this application
      const ownerId = req.user.claims.sub;
      if (application.userId !== ownerId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const user = await storage.getAppUser(userId);
      if (!user || user.applicationId !== applicationId) {
        return res.status(404).json({ message: "User not found" });
      }

      const unpaused = await storage.unpauseAppUser(userId);
      if (!unpaused) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "User unpaused successfully" });
    } catch (error) {
      console.error("Error unpausing app user:", error);
      res.status(500).json({ message: "Failed to unpause user" });
    }
  });

  // Delete app user
  app.delete('/api/applications/:id/users/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const userId = parseInt(req.params.userId);
      
      const application = await storage.getApplication(applicationId);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      // Check if user owns this application
      const ownerId = req.user.claims.sub;
      if (application.userId !== ownerId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const user = await storage.getAppUser(userId);
      if (!user || user.applicationId !== applicationId) {
        return res.status(404).json({ message: "User not found" });
      }

      const deleted = await storage.deleteAppUser(userId);
      if (!deleted) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting app user:", error);
      res.status(500).json({ message: "Failed to delete user" });
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

  // Enhanced Login via API with version checking, HWID locking, and custom messages
  app.post('/api/v1/login', validateApiKey, async (req: any, res) => {
    try {
      const application = req.application;
      const validatedData = loginSchema.parse(req.body);
      const { username, password, version, hwid } = validatedData;

      // Check application version if provided
      if (version && version !== application.version) {
        return res.status(400).json({ 
          success: false, 
          message: application.versionMismatchMessage || "Please update your application to the latest version!",
          required_version: application.version,
          current_version: version
        });
      }

      const user = await storage.getAppUserByUsername(application.id, username);
      if (!user) {
        // Update login attempts for security
        return res.status(401).json({ 
          success: false, 
          message: application.loginFailedMessage || "Invalid credentials!" 
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({ 
          success: false, 
          message: application.accountDisabledMessage || "Account is disabled!" 
        });
      }

      // Check if user is paused
      if (user.isPaused) {
        return res.status(401).json({ 
          success: false, 
          message: "Account is temporarily paused. Contact support." 
        });
      }

      // Check expiration
      if (user.expiresAt && new Date() > user.expiresAt) {
        return res.status(401).json({ 
          success: false, 
          message: application.accountExpiredMessage || "Account has expired!" 
        });
      }

      // Validate password
      const isValidPassword = await storage.validatePassword(password, user.password);
      if (!isValidPassword) {
        // Increment login attempts
        await storage.updateAppUser(user.id, { 
          loginAttempts: user.loginAttempts + 1,
          lastLoginAttempt: new Date()
        });
        
        return res.status(401).json({ 
          success: false, 
          message: application.loginFailedMessage || "Invalid credentials!" 
        });
      }

      // HWID Lock Check
      if (application.hwidLockEnabled) {
        if (!hwid) {
          return res.status(400).json({ 
            success: false, 
            message: "Hardware ID is required for this application" 
          });
        }

        // If user has no HWID set, set it on first login
        if (!user.hwid) {
          await storage.updateAppUser(user.id, { hwid });
        } else if (user.hwid !== hwid) {
          // HWID mismatch
          return res.status(401).json({ 
            success: false, 
            message: application.hwidMismatchMessage || "Hardware ID mismatch detected!" 
          });
        }
      }

      // Reset login attempts on successful login and update last login
      await storage.updateAppUser(user.id, { 
        lastLogin: new Date(),
        loginAttempts: 0,
        lastLoginAttempt: new Date()
      });

      // Success response with custom message
      res.json({ 
        success: true, 
        message: application.loginSuccessMessage || "Login successful!",
        user_id: user.id,
        username: user.username,
        email: user.email,
        expires_at: user.expiresAt,
        hwid_locked: application.hwidLockEnabled && !!user.hwid
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, message: "Invalid request data", errors: error.errors });
      }
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