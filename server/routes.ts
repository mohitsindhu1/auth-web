import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { requirePermission, requireRole, PERMISSIONS, ROLES, getUserPermissions } from "./permissions";
import { webhookService } from "./webhookService";
import { 
  insertApplicationSchema, 
  insertAppUserSchema, 
  updateApplicationSchema,
  updateAppUserSchema,
  insertLicenseKeySchema,
  loginSchema,
  insertWebhookSchema,
  insertBlacklistSchema
} from "@shared/schema";
import { z } from "zod";

// Middleware to validate API key for external API access
async function validateApiKey(req: any, res: any, next: any) {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  
  if (!apiKey) {
    return res.status(401).json({ success: false, message: "API key required" });
  }

  try {
    const application = await storage.getApplicationByApiKey(apiKey as string);
    if (!application || !application.isActive) {
      return res.status(401).json({ success: false, message: "Invalid or inactive API key" });
    }
    
    req.application = application;
    next();
  } catch (error) {
    console.error("API key validation error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Debug route for testing authentication
  app.get('/api/debug/auth', async (req: any, res) => {
    try {
      console.log('Debug auth - Headers:', req.headers);
      console.log('Debug auth - Session:', req.session);
      console.log('Debug auth - User:', req.user);
      
      const accountId = req.headers['x-account-id'];
      if (accountId) {
        const user = await storage.getUser(accountId as string);
        console.log('Debug auth - Found user by account ID:', user);
        return res.json({
          status: 'authenticated',
          method: 'account-id-header',
          accountId,
          user
        });
      }
      
      if (req.session && (req.session as any).user) {
        return res.json({
          status: 'authenticated',
          method: 'session',
          user: (req.session as any).user
        });
      }
      
      res.json({
        status: 'not-authenticated',
        session: req.session,
        headers: req.headers
      });
    } catch (error) {
      console.error('Debug auth error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      console.log('Auth check - req.user:', req.user);
      console.log('Auth check - session:', req.session);
      
      const userId = req.user.claims.sub;
      console.log('Fetching user for ID:', userId);
      
      const user = await storage.getUser(userId);
      console.log('Found user:', user);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const permissions = await getUserPermissions(userId);
      console.log('User permissions:', permissions);
      
      res.json({ ...user, userPermissions: permissions });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Firebase authentication route
  app.post('/api/auth/firebase-login', async (req: any, res) => {
    try {
      const { firebase_uid, email, display_name } = req.body;

      if (!firebase_uid || !email) {
        return res.status(400).json({ 
          success: false, 
          message: "Firebase UID and email are required" 
        });
      }

      console.log('Firebase login attempt:', { firebase_uid, email, display_name });

      // Create or update user in our system
      const userData = {
        id: firebase_uid,
        email: email,
        firstName: display_name?.split(' ')[0] || '',
        lastName: display_name?.split(' ').slice(1).join(' ') || '',
        profileImageUrl: null,
      };

      const user = await storage.upsertUser(userData);
      console.log('User upserted:', user);

      // Create session
      (req.session as any).user = {
        claims: {
          sub: firebase_uid,
          email: email,
        }
      };

      // Save session explicitly
      await new Promise((resolve, reject) => {
        req.session.save((err: any) => {
          if (err) reject(err);
          else resolve(true);
        });
      });

      console.log('Session created and saved successfully');

      res.json({
        success: true,
        message: "Login successful! Redirecting to dashboard...",
        account_id: firebase_uid,
        user: user
      });

    } catch (error) {
      console.error("Firebase login error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Authentication failed: " + (error instanceof Error ? error.message : 'Unknown error')
      });
    }
  });

  // Logout function to handle both GET and POST requests
  const handleLogout = async (req: any, res: any) => {
    try {
      console.log(`${req.method} /api/logout - Session before destroy:`, req.session);
      
      // Force clear session data immediately
      if (req.session) {
        req.session.user = null;
        req.session.destroy((err: any) => {
          if (err) {
            console.error('Error destroying session:', err);
          } else {
            console.log("Session destroyed successfully");
          }
        });
      }
      
      // Clear all possible session cookies with multiple domain variations
      const cookieOptions = [
        { path: '/' },
        { path: '/', domain: '.replit.app' },
        { path: '/', domain: '.replit.dev' },
        { path: '/', domain: '.replit.co' },
        { path: '/', secure: false, httpOnly: true },
        { path: '/', secure: true, httpOnly: true }
      ];
      
      cookieOptions.forEach(options => {
        res.clearCookie('connect.sid', options);
        res.clearCookie('session', options);
        res.clearCookie('.AuthSession', options);
      });
      
      // Set comprehensive cache control headers
      res.set({
        'Cache-Control': 'no-store, no-cache, must-revalidate, private, max-age=0',
        'Expires': 'Thu, 01 Jan 1970 00:00:00 GMT',
        'Pragma': 'no-cache',
        'Clear-Site-Data': '"cache", "cookies", "storage", "executionContexts"'
      });
      
      // For GET requests, redirect to Firebase login page with logout flag
      if (req.method === 'GET') {
        console.log("GET logout - Redirecting to Firebase login");
        return res.redirect('/firebase-login?logged_out=true');
      }
      
      // For POST requests, return JSON
      res.json({ 
        success: true,
        message: "Logged out successfully",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error in logout:", error);
      if (req.method === 'GET') {
        return res.redirect('/?logout_error=true');
      }
      res.status(500).json({ success: false, message: "Failed to logout" });
    }
  };

  // Logout routes - support both GET and POST
  app.post('/api/logout', handleLogout);
  app.get('/api/logout', handleLogout);

  // Dashboard stats with real-time information
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const applications = await storage.getAllApplications(userId);
      
      let totalUsers = 0;
      let totalActiveSessions = 0;
      let totalApiRequests = 0;
      
      for (const app of applications) {
        const users = await storage.getAllAppUsers(app.id);
        const activeSessions = await storage.getActiveSessions(app.id);
        const recentActivity = await storage.getActivityLogs(app.id, 1000);
        
        totalUsers += users.length;
        totalActiveSessions += activeSessions.length;
        totalApiRequests += recentActivity.length;
      }

      res.json({
        totalApplications: applications.length,
        totalUsers,
        activeApplications: applications.filter(app => app.isActive).length,
        totalActiveSessions,
        totalApiRequests,
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

  // Update application with enhanced features (PUT)
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

  // Update application with enhanced features (PATCH)
  app.patch('/api/applications/:id', isAuthenticated, async (req: any, res) => {
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
      console.log("DELETE application request received for ID:", req.params.id);
      const applicationId = parseInt(req.params.id);
      const application = await storage.getApplication(applicationId);
      
      if (!application) {
        console.log("Application not found for ID:", applicationId);
        return res.status(404).json({ message: "Application not found" });
      }

      // Check if user owns this application
      const userId = req.user.claims.sub;
      console.log("Checking ownership - User:", userId, "App owner:", application.userId);
      if (application.userId !== userId) {
        console.log("Access denied - user does not own application");
        return res.status(403).json({ message: "Access denied" });
      }

      console.log("Attempting to delete application:", applicationId);
      const deleted = await storage.deleteApplication(applicationId);
      console.log("Delete result:", deleted);
      
      if (!deleted) {
        console.log("Failed to delete application");
        return res.status(404).json({ message: "Application not found" });
      }

      console.log("Application deleted successfully");
      res.json({ message: "Application deleted successfully" });
    } catch (error) {
      console.error("Error deleting application:", error);
      res.status(500).json({ message: "Failed to delete application" });
    }
  });



  // Get real-time application statistics
  app.get('/api/applications/:id/stats', isAuthenticated, async (req: any, res) => {
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

      // Get real-time statistics
      const users = await storage.getAllAppUsers(applicationId);
      const activeSessions = await storage.getActiveSessions(applicationId);
      const recentActivity = await storage.getActivityLogs(applicationId, 100);
      
      // Calculate active users (users who are active and not paused)
      const activeUsers = users.filter(u => u.isActive && !u.isPaused).length;
      const totalUsers = users.length;
      const registeredUsers = users.filter(u => u.isActive && !u.isPaused).length;
      
      // Calculate login success rate from recent activity
      const loginAttempts = recentActivity.filter(log => log.event.includes('login'));
      const successfulLogins = loginAttempts.filter(log => log.success);
      const loginSuccessRate = loginAttempts.length > 0 ? 
        Math.round((successfulLogins.length / loginAttempts.length) * 100) : 100;

      // Get latest activity timestamp
      const lastActivity = recentActivity.length > 0 ? 
        recentActivity[recentActivity.length - 1].createdAt : null;

      res.json({
        totalUsers,
        activeUsers,
        registeredUsers,
        activeSessions: activeSessions.length,
        loginSuccessRate,
        totalApiRequests: recentActivity.length,
        lastActivity,
        applicationStatus: application.isActive ? 'online' : 'offline',
        hwidLockEnabled: application.hwidLockEnabled
      });
    } catch (error) {
      console.error("Error fetching application stats:", error);
      res.status(500).json({ message: "Failed to fetch application stats" });
    }
  });

  // Get active sessions for an application
  app.get('/api/applications/:id/sessions', isAuthenticated, async (req: any, res) => {
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

      const activeSessions = await storage.getActiveSessions(applicationId);
      res.json(activeSessions);
    } catch (error) {
      console.error("Error fetching active sessions:", error);
      res.status(500).json({ message: "Failed to fetch active sessions" });
    }
  });

  // License Key Management Routes
  
  // Get all license keys for an application
  app.get('/api/applications/:id/licenses', isAuthenticated, async (req: any, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const application = await storage.getApplication(applicationId);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      const userId = req.user.claims.sub;
      if (application.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const licenses = await storage.getAllLicenseKeys(applicationId);
      res.json(licenses);
    } catch (error) {
      console.error("Error fetching license keys:", error);
      res.status(500).json({ message: "Failed to fetch license keys" });
    }
  });

  // Create a new license key
  app.post('/api/applications/:id/licenses', isAuthenticated, async (req: any, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const application = await storage.getApplication(applicationId);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      const userId = req.user.claims.sub;
      if (application.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const validatedData = insertLicenseKeySchema.parse(req.body);
      const license = await storage.createLicenseKey(applicationId, validatedData);
      res.status(201).json(license);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Error creating license key:", error);
      res.status(500).json({ message: "Failed to create license key" });
    }
  });

  // Generate a random license key (GET route for generating default values)
  app.get('/api/applications/:id/licenses/generate', isAuthenticated, async (req: any, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const application = await storage.getApplication(applicationId);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      const userId = req.user.claims.sub;
      if (application.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Generate a secure license key with default values
      const { nanoid } = await import(
