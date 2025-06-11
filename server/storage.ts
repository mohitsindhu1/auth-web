import {
  users,
  applications,
  appUsers,
  type User,
  type UpsertUser,
  type Application,
  type InsertApplication,
  type UpdateApplication,
  type AppUser,
  type InsertAppUser,
  type UpdateAppUser,
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";

// Interface for storage operations
export interface IStorage {
  // User operations for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Application methods
  getApplication(id: number): Promise<Application | undefined>;
  getApplicationByApiKey(apiKey: string): Promise<Application | undefined>;
  createApplication(userId: string, app: InsertApplication): Promise<Application>;
  updateApplication(id: number, updates: UpdateApplication): Promise<Application | undefined>;
  deleteApplication(id: number): Promise<boolean>;
  getAllApplications(userId: string): Promise<Application[]>;
  
  // App User methods
  getAppUser(id: number): Promise<AppUser | undefined>;
  getAppUserByUsername(applicationId: number, username: string): Promise<AppUser | undefined>;
  getAppUserByEmail(applicationId: number, email: string): Promise<AppUser | undefined>;
  createAppUser(applicationId: number, user: InsertAppUser): Promise<AppUser>;
  updateAppUser(id: number, updates: UpdateAppUser): Promise<AppUser | undefined>;
  deleteAppUser(id: number): Promise<boolean>;
  pauseAppUser(id: number): Promise<boolean>;
  unpauseAppUser(id: number): Promise<boolean>;
  getAllAppUsers(applicationId: number): Promise<AppUser[]>;
  
  // Auth methods
  validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean>;
  hashPassword(password: string): Promise<string>;
}

export class DatabaseStorage implements IStorage {
  // User operations for Replit Auth
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

  // Application methods
  async getApplication(id: number): Promise<Application | undefined> {
    const [app] = await db.select().from(applications).where(eq(applications.id, id));
    return app;
  }

  async getApplicationByApiKey(apiKey: string): Promise<Application | undefined> {
    const [app] = await db.select().from(applications).where(eq(applications.apiKey, apiKey));
    return app;
  }

  async createApplication(userId: string, insertApp: InsertApplication): Promise<Application> {
    const apiKey = `phantom_${nanoid(32)}`;
    const [app] = await db
      .insert(applications)
      .values({
        ...insertApp,
        userId,
        apiKey,
      })
      .returning();
    return app;
  }

  async updateApplication(id: number, updates: UpdateApplication): Promise<Application | undefined> {
    const [app] = await db
      .update(applications)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(applications.id, id))
      .returning();
    return app;
  }

  async deleteApplication(id: number): Promise<boolean> {
    const result = await db.delete(applications).where(eq(applications.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getAllApplications(userId: string): Promise<Application[]> {
    return await db.select().from(applications).where(eq(applications.userId, userId));
  }

  // App User methods
  async getAppUser(id: number): Promise<AppUser | undefined> {
    const [user] = await db.select().from(appUsers).where(eq(appUsers.id, id));
    return user;
  }

  async getAppUserByUsername(applicationId: number, username: string): Promise<AppUser | undefined> {
    const [user] = await db
      .select()
      .from(appUsers)
      .where(and(eq(appUsers.applicationId, applicationId), eq(appUsers.username, username)));
    return user;
  }

  async getAppUserByEmail(applicationId: number, email: string): Promise<AppUser | undefined> {
    const [user] = await db
      .select()
      .from(appUsers)
      .where(and(eq(appUsers.applicationId, applicationId), eq(appUsers.email, email)));
    return user;
  }

  async createAppUser(applicationId: number, insertUser: InsertAppUser): Promise<AppUser> {
    const hashedPassword = await this.hashPassword(insertUser.password);
    const [user] = await db
      .insert(appUsers)
      .values({
        ...insertUser,
        applicationId,
        password: hashedPassword,
      })
      .returning();
    return user;
  }

  async updateAppUser(id: number, updates: UpdateAppUser): Promise<AppUser | undefined> {
    // If password is being updated, hash it first
    if (updates.password) {
      updates.password = await this.hashPassword(updates.password);
    }
    
    const [user] = await db
      .update(appUsers)
      .set(updates)
      .where(eq(appUsers.id, id))
      .returning();
    return user;
  }

  async pauseAppUser(id: number): Promise<boolean> {
    const result = await db
      .update(appUsers)
      .set({ isPaused: true })
      .where(eq(appUsers.id, id));
    return (result.rowCount || 0) > 0;
  }

  async unpauseAppUser(id: number): Promise<boolean> {
    const result = await db
      .update(appUsers)
      .set({ isPaused: false })
      .where(eq(appUsers.id, id));
    return (result.rowCount || 0) > 0;
  }

  async deleteAppUser(id: number): Promise<boolean> {
    const result = await db.delete(appUsers).where(eq(appUsers.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getAllAppUsers(applicationId: number): Promise<AppUser[]> {
    return await db.select().from(appUsers).where(eq(appUsers.applicationId, applicationId));
  }

  // Auth methods
  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 12);
  }
}

export const storage = new DatabaseStorage();