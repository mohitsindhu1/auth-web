import { accounts, users, apiKeys, authSessions, type Account, type InsertAccount, type User, type InsertUser, type ApiKey, type InsertApiKey, type AuthSession } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  
  // API Key methods
  getApiKey(key: string): Promise<ApiKey | undefined>;
  createApiKey(apiKey: InsertApiKey): Promise<ApiKey>;
  getAllApiKeys(): Promise<ApiKey[]>;
  deactivateApiKey(id: number): Promise<boolean>;
  
  // Session methods
  createSession(userId: number): Promise<AuthSession>;
  getSession(token: string): Promise<AuthSession | undefined>;
  deleteSession(token: string): Promise<boolean>;
  
  // Auth methods
  validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean>;
  hashPassword(password: string): Promise<string>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await this.hashPassword(insertUser.password);
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        password: hashedPassword,
      })
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getApiKey(key: string): Promise<ApiKey | undefined> {
    const [apiKey] = await db.select().from(apiKeys).where(eq(apiKeys.key, key));
    return apiKey || undefined;
  }

  async createApiKey(insertApiKey: InsertApiKey): Promise<ApiKey> {
    const key = `ak_${nanoid(32)}`;
    const [apiKey] = await db
      .insert(apiKeys)
      .values({
        ...insertApiKey,
        key,
      })
      .returning();
    return apiKey;
  }

  async getAllApiKeys(): Promise<ApiKey[]> {
    return await db.select().from(apiKeys);
  }

  async deactivateApiKey(id: number): Promise<boolean> {
    const [apiKey] = await db
      .update(apiKeys)
      .set({ isActive: false })
      .where(eq(apiKeys.id, id))
      .returning();
    return !!apiKey;
  }

  async createSession(userId: number): Promise<AuthSession> {
    const sessionToken = `st_${nanoid(32)}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    const [session] = await db
      .insert(authSessions)
      .values({
        userId,
        sessionToken,
        expiresAt,
      })
      .returning();
    
    return session;
  }

  async getSession(token: string): Promise<AuthSession | undefined> {
    const [session] = await db
      .select()
      .from(authSessions)
      .where(eq(authSessions.sessionToken, token));
    
    if (!session) return undefined;
    
    // Check if session is expired
    if (session.expiresAt < new Date()) {
      await db.delete(authSessions).where(eq(authSessions.sessionToken, token));
      return undefined;
    }
    
    return session;
  }

  async deleteSession(token: string): Promise<boolean> {
    const result = await db.delete(authSessions).where(eq(authSessions.sessionToken, token));
    return (result.rowCount || 0) > 0;
  }

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}

export const storage = new DatabaseStorage();
