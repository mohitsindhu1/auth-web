import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { webhookService } from "./webhookService";
import { 
  insertApplicationSchema, 
  insertAppUserSchema, 
  updateApplicationSchema,
  updateAppUserSchema,
  loginSchema,
  insertWebhookSchema,
  insertBlacklistSchema
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

  // Firebase authentication route
  app.post('/api/auth/firebase-login', async (req: any, res) => {
    // Prevent duplicate responses
    if (res.headersSent) {
      return;
    }

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

      // Create session without passport
      (req.session as any).user = {
        claims: {
          sub: firebase_uid,
          email: email,
        }
      };

      console.log('Session created successfully');

      return res.json({
        success: true,
        message: "Login successful! Redirecting to dashboard...",
        account_id: firebase_uid,
        user: user
      });

    } catch (error) {
      console.error("Firebase login error:", error);
      if (!res.headersSent) {
        return res.status(500).json({ 
          success: false, 
          message: "Authentication failed: " + (error instanceof Error ? error.message : 'Unknown error')
        });
      }
    }
  });

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
      
      // Calculate active users (users with active sessions)
      const activeUsers = activeSessions.length;
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

  app.get('/api/applications/:id/users', isAuthenticated, async (req: any, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      console.log(`Fetching users for application ${applicationId}`);
      
      const application = await storage.getApplication(applicationId);
      
      if (!application) {
        console.log(`Application ${applicationId} not found`);
        return res.status(404).json({ message: "Application not found" });
      }

      // Check if user owns this application
      const userId = req.user.claims.sub;
      if (application.userId !== userId) {
        console.log(`Access denied for user ${userId} to application ${applicationId}`);
        return res.status(403).json({ message: "Access denied" });
      }

      const users = await storage.getAllAppUsers(applicationId);
      console.log(`Found ${users.length} users for application ${applicationId}:`, users);
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
      
      // Process date conversion for expiresAt and handle empty email
      const processedData: any = { ...validatedData };
      if (processedData.expiresAt && typeof processedData.expiresAt === 'string') {
        processedData.expiresAt = new Date(processedData.expiresAt);
      }
      
      // Convert empty email string to null
      if (processedData.email === '' || processedData.email === undefined) {
        processedData.email = null;
      }
      
      // Check for existing username/email in this application
      const existingUser = await storage.getAppUserByUsername(applicationId, validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists in this application" });
      }

      if (processedData.email) {
        const existingEmail = await storage.getAppUserByEmail(applicationId, processedData.email);
        if (existingEmail) {
          return res.status(400).json({ message: "Email already exists in this application" });
        }
      }

      const user = await storage.createAppUser(applicationId, processedData);
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

  // Reset user HWID
  app.post('/api/applications/:id/users/:userId/reset-hwid', isAuthenticated, async (req: any, res) => {
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

      const reset = await storage.resetAppUserHwid(userId);
      if (!reset) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "HWID reset successfully" });
    } catch (error) {
      console.error("Error resetting user HWID:", error);
      res.status(500).json({ message: "Failed to reset HWID" });
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

      if (validatedData.email) {
        const existingEmail = await storage.getAppUserByEmail(application.id, validatedData.email);
        if (existingEmail) {
          return res.status(400).json({ success: false, message: "Email already exists" });
        }
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

  // Enhanced Login via API with version checking, HWID locking, blacklist checking, and webhook notifications
  app.post('/api/v1/login', validateApiKey, async (req: any, res) => {
    try {
      const application = req.application;
      const validatedData = loginSchema.parse(req.body);
      const { username, password, version, hwid } = validatedData;
      
      // Get client info
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'];

      // Check blacklist - IP address
      if (ipAddress) {
        const ipBlacklist = await storage.checkBlacklist(application.id, 'ip', ipAddress);
        if (ipBlacklist) {
          await webhookService.logAndNotify(
            application.userId,
            application.id,
            'login_blocked_ip',
            { username },
            { 
              success: false, 
              errorMessage: `Login blocked: IP ${ipAddress} is blacklisted - ${ipBlacklist.reason || 'No reason provided'}`,
              ipAddress,
              userAgent,
              hwid
            }
          );
          
          return res.status(403).json({ 
            success: false, 
            message: "Access denied: IP address is blacklisted"
          });
        }
      }

      // Check blacklist - Username
      const usernameBlacklist = await storage.checkBlacklist(application.id, 'username', username);
      if (usernameBlacklist) {
        await webhookService.logAndNotify(
          application.userId,
          application.id,
          'login_blocked_username',
          { username },
          { 
            success: false, 
            errorMessage: `Login blocked: Username ${username} is blacklisted - ${usernameBlacklist.reason || 'No reason provided'}`,
            ipAddress,
            userAgent,
            hwid
          }
        );
        
        return res.status(403).json({ 
          success: false, 
          message: "Access denied: Username is blacklisted"
        });
      }

      // Check blacklist - HWID
      if (hwid) {
        const hwidBlacklist = await storage.checkBlacklist(application.id, 'hwid', hwid);
        if (hwidBlacklist) {
          await webhookService.logAndNotify(
            application.userId,
            application.id,
            'login_blocked_hwid',
            { username },
            { 
              success: false, 
              errorMessage: `Login blocked: HWID ${hwid} is blacklisted - ${hwidBlacklist.reason || 'No reason provided'}`,
              ipAddress,
              userAgent,
              hwid
            }
          );
          
          return res.status(403).json({ 
            success: false, 
            message: "Access denied: Hardware ID is blacklisted"
          });
        }
      }

      // Check application version if provided
      if (version && version !== application.version) {
        await webhookService.logAndNotify(
          application.userId,
          application.id,
          'login_version_mismatch',
          { username },
          { 
            success: false, 
            errorMessage: `Version mismatch: Required ${application.version}, provided ${version}`,
            ipAddress,
            userAgent,
            hwid,
            metadata: { required_version: application.version, current_version: version }
          }
        );
        
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

  // Webhook routes
  app.get('/api/webhooks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const webhooks = await storage.getUserWebhooks(userId);
      res.json(webhooks);
    } catch (error) {
      console.error("Error fetching webhooks:", error);
      res.status(500).json({ message: "Failed to fetch webhooks" });
    }
  });

  app.post('/api/webhooks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertWebhookSchema.parse(req.body);
      const webhook = await storage.createWebhook(userId, validatedData);
      res.status(201).json(webhook);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Error creating webhook:", error);
      res.status(500).json({ message: "Failed to create webhook" });
    }
  });

  app.put('/api/webhooks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const webhookId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const validatedData = insertWebhookSchema.partial().parse(req.body);
      
      // Check ownership
      const webhooks = await storage.getUserWebhooks(userId);
      const webhook = webhooks.find(w => w.id === webhookId);
      
      if (!webhook) {
        return res.status(404).json({ message: "Webhook not found" });
      }

      const updatedWebhook = await storage.updateWebhook(webhookId, validatedData);
      if (!updatedWebhook) {
        return res.status(404).json({ message: "Webhook not found" });
      }

      res.json(updatedWebhook);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Error updating webhook:", error);
      res.status(500).json({ message: "Failed to update webhook" });
    }
  });

  app.delete('/api/webhooks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const webhookId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Check ownership
      const webhooks = await storage.getUserWebhooks(userId);
      const webhook = webhooks.find(w => w.id === webhookId);
      
      if (!webhook) {
        return res.status(404).json({ message: "Webhook not found" });
      }

      const deleted = await storage.deleteWebhook(webhookId);
      if (!deleted) {
        return res.status(404).json({ message: "Webhook not found" });
      }

      res.json({ message: "Webhook deleted successfully" });
    } catch (error) {
      console.error("Error deleting webhook:", error);
      res.status(500).json({ message: "Failed to delete webhook" });
    }
  });

  // Blacklist routes
  app.get('/api/blacklist', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const applications = await storage.getAllApplications(userId);
      
      // Get blacklist entries for all user's applications plus global entries
      const applicationIds = applications.map(app => app.id);
      const blacklistEntries = await storage.getBlacklistEntries();
      
      // Filter to show only entries that belong to user's applications or are global
      const filteredEntries = blacklistEntries.filter(entry => 
        !entry.applicationId || applicationIds.includes(entry.applicationId)
      );

      res.json(filteredEntries);
    } catch (error) {
      console.error("Error fetching blacklist:", error);
      res.status(500).json({ message: "Failed to fetch blacklist" });
    }
  });

  app.post('/api/blacklist', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertBlacklistSchema.parse(req.body);
      
      // If applicationId is provided, verify user owns that application
      if (validatedData.applicationId) {
        const application = await storage.getApplication(validatedData.applicationId);
        if (!application || application.userId !== userId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      const blacklistEntry = await storage.createBlacklistEntry(validatedData);
      res.status(201).json(blacklistEntry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Error creating blacklist entry:", error);
      res.status(500).json({ message: "Failed to create blacklist entry" });
    }
  });

  app.delete('/api/blacklist/:id', isAuthenticated, async (req: any, res) => {
    try {
      const entryId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Get the blacklist entry and verify ownership
      const blacklistEntries = await storage.getBlacklistEntries();
      const entry = blacklistEntries.find(e => e.id === entryId);
      
      if (!entry) {
        return res.status(404).json({ message: "Blacklist entry not found" });
      }

      // Check if user owns the application (if it's not a global entry)
      if (entry.applicationId) {
        const application = await storage.getApplication(entry.applicationId);
        if (!application || application.userId !== userId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      const deleted = await storage.deleteBlacklistEntry(entryId);
      if (!deleted) {
        return res.status(404).json({ message: "Blacklist entry not found" });
      }

      res.json({ message: "Blacklist entry deleted successfully" });
    } catch (error) {
      console.error("Error deleting blacklist entry:", error);
      res.status(500).json({ message: "Failed to delete blacklist entry" });
    }
  });

  // Activity logs routes
  app.get('/api/activity-logs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const applicationId = req.query.applicationId;
      
      if (applicationId) {
        // Get logs for specific application
        const application = await storage.getApplication(parseInt(applicationId));
        if (!application || application.userId !== userId) {
          return res.status(403).json({ message: "Access denied" });
        }
        
        const logs = await storage.getActivityLogs(parseInt(applicationId));
        res.json(logs);
      } else {
        // Get logs for all user's applications
        const applications = await storage.getAllApplications(userId);
        const allLogs = [];
        
        for (const app of applications) {
          const logs = await storage.getActivityLogs(app.id);
          allLogs.push(...logs);
        }
        
        // Sort by creation date (newest first)
        allLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        res.json(allLogs);
      }
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      res.status(500).json({ message: "Failed to fetch activity logs" });
    }
  });

  // Get activity logs for specific user
  app.get('/api/activity-logs/user/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const appUserId = parseInt(req.params.userId);
      
      // Get the app user and verify ownership
      const appUser = await storage.getAppUser(appUserId);
      if (!appUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const application = await storage.getApplication(appUser.applicationId);
      if (!application || application.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const logs = await storage.getUserActivityLogs(appUserId);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching user activity logs:", error);
      res.status(500).json({ message: "Failed to fetch user activity logs" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}