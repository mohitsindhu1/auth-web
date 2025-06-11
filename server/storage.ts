import {
  users,
  apiKeys,
  appUsers,
  type User,
  type ApiKey,
  type InsertApiKey,
  type AppUser,
  type InsertAppUser,
  type UpsertUser,
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import bcrypt from "bcrypt";

export interface IStorage {
  // User operations for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // App User methods
  getAppUser(id: number): Promise<AppUser | undefined>;
  getAppUserByUsername(userId: string, username: string): Promise<AppUser | undefined>;
  getAppUserByEmail(userId: string, email: string): Promise<AppUser | undefined>;
  createAppUser(userId: string, user: InsertAppUser): Promise<AppUser>;
  updateAppUser(id: number, updates: Partial<AppUser>): Promise<AppUser | undefined>;
  deleteAppUser(id: number): Promise<boolean>;
  getAllAppUsers(userId: string): Promise<AppUser[]>;
  
  // API Key methods
  getApiKey(key: string): Promise<ApiKey | undefined>;
  createApiKey(userId: string, apiKey: InsertApiKey): Promise<ApiKey>;
  getAllApiKeys(userId: string): Promise<ApiKey[]>;
  deactivateApiKey(id: number): Promise<boolean>;
  
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

  // App User methods
  async getAppUser(id: number): Promise<AppUser | undefined> {
    const [user] = await db.select().from(appUsers).where(eq(appUsers.id, id));
    return user;
  }

  async getAppUserByUsername(userId: string, username: string): Promise<AppUser | undefined> {
    const [user] = await db
      .select()
      .from(appUsers)
      .where(and(eq(appUsers.userId, userId), eq(appUsers.username, username)));
    return user;
  }

  async getAppUserByEmail(userId: string, email: string): Promise<AppUser | undefined> {
    const [user] = await db
      .select()
      .from(appUsers)
      .where(and(eq(appUsers.userId, userId), eq(appUsers.email, email)));
    return user;
  }

  async createAppUser(userId: string, insertUser: InsertAppUser): Promise<AppUser> {
    const hashedPassword = await this.hashPassword(insertUser.password);
    const [user] = await db
      .insert(appUsers)
      .values({
        ...insertUser,
        userId,
        password: hashedPassword,
      })
      .returning();
    return user;
  }

  async updateAppUser(id: number, updates: Partial<AppUser>): Promise<AppUser | undefined> {
    const [updatedUser] = await db
      .update(appUsers)
      .set(updates)
      .where(eq(appUsers.id, id))
      .returning();
    return updatedUser;
  }

  async deleteAppUser(id: number): Promise<boolean> {
    const result = await db.delete(appUsers).where(eq(appUsers.id, id));
    return result.rowCount > 0;
  }

  async getAllAppUsers(userId: string): Promise<AppUser[]> {
    return await db.select().from(appUsers).where(eq(appUsers.userId, userId));
  }

  // API Key methods
  async getApiKey(key: string): Promise<ApiKey | undefined> {
    const [apiKey] = await db.select().from(apiKeys).where(eq(apiKeys.key, key));
    return apiKey;
  }

  async createApiKey(userId: string, insertApiKey: InsertApiKey): Promise<ApiKey> {
    const key = `pk_${nanoid(32)}`;
    const [apiKey] = await db
      .insert(apiKeys)
      .values({
        ...insertApiKey,
        userId,
        key,
      })
      .returning();
    return apiKey;
  }

  async getAllApiKeys(userId: string): Promise<ApiKey[]> {
    return await db.select().from(apiKeys).where(eq(apiKeys.userId, userId));
  }

  async deactivateApiKey(id: number): Promise<boolean> {
    const [updatedKey] = await db
      .update(apiKeys)
      .set({ isActive: false })
      .where(eq(apiKeys.id, id))
      .returning();
    return !!updatedKey;
  }

  // Auth methods
  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }
}

export const storage = new DatabaseStorage();