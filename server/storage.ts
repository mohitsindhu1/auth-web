import { accounts, users, apiKeys, authSessions, type Account, type InsertAccount, type User, type InsertUser, type ApiKey, type InsertApiKey, type AuthSession } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";

export interface IStorage {
  // Account methods
  getAccount(id: number): Promise<Account | undefined>;
  getAccountByFirebaseUid(firebaseUid: string): Promise<Account | undefined>;
  getAccountByEmail(email: string): Promise<Account | undefined>;
  createAccount(account: InsertAccount): Promise<Account>;
  updateAccount(id: number, updates: Partial<Account>): Promise<Account | undefined>;
  deleteAccount(id: number): Promise<boolean>;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(accountId: number, username: string): Promise<User | undefined>;
  getUserByEmail(accountId: number, email: string): Promise<User | undefined>;
  createUser(accountId: number, user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getAllUsers(accountId: number): Promise<User[]>;
  
  // API Key methods
  getApiKey(key: string): Promise<ApiKey | undefined>;
  createApiKey(accountId: number, apiKey: InsertApiKey): Promise<ApiKey>;
  getAllApiKeys(accountId: number): Promise<ApiKey[]>;
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
  // Account methods
  async getAccount(id: number): Promise<Account | undefined> {
    const [account] = await db.select().from(accounts).where(eq(accounts.id, id));
    return account || undefined;
  }

  async getAccountByFirebaseUid(firebaseUid: string): Promise<Account | undefined> {
    const [account] = await db.select().from(accounts).where(eq(accounts.firebaseUid, firebaseUid));
    return account || undefined;
  }

  async getAccountByEmail(email: string): Promise<Account | undefined> {
    const [account] = await db.select().from(accounts).where(eq(accounts.email, email));
    return account || undefined;
  }

  async createAccount(insertAccount: InsertAccount): Promise<Account> {
    const [account] = await db
      .insert(accounts)
      .values(insertAccount)
      .returning();
    return account;
  }

  async updateAccount(id: number, updates: Partial<Account>): Promise<Account | undefined> {
    const [account] = await db
      .update(accounts)
      .set(updates)
      .where(eq(accounts.id, id))
      .returning();
    return account || undefined;
  }

  async deleteAccount(id: number): Promise<boolean> {
    const result = await db.delete(accounts).where(eq(accounts.id, id));
    return (result.rowCount || 0) > 0;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(accountId: number, username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(
      and(eq(users.accountId, accountId), eq(users.username, username))
    );
    return user || undefined;
  }

  async getUserByEmail(accountId: number, email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(
      and(eq(users.accountId, accountId), eq(users.email, email))
    );
    return user || undefined;
  }

  async createUser(accountId: number, insertUser: InsertUser): Promise<User> {
    const hashedPassword = await this.hashPassword(insertUser.password);
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        accountId,
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

  async getAllUsers(accountId: number): Promise<User[]> {
    return await db.select().from(users).where(eq(users.accountId, accountId));
  }

  // API Key methods
  async getApiKey(key: string): Promise<ApiKey | undefined> {
    const [apiKey] = await db.select().from(apiKeys).where(eq(apiKeys.key, key));
    return apiKey || undefined;
  }

  async createApiKey(accountId: number, insertApiKey: InsertApiKey): Promise<ApiKey> {
    const key = `ak_${nanoid(32)}`;
    const [apiKey] = await db
      .insert(apiKeys)
      .values({
        ...insertApiKey,
        accountId,
        key,
      })
      .returning();
    return apiKey;
  }

  async getAllApiKeys(accountId: number): Promise<ApiKey[]> {
    return await db.select().from(apiKeys).where(eq(apiKeys.accountId, accountId));
  }

  async deactivateApiKey(id: number): Promise<boolean> {
    const [apiKey] = await db
      .update(apiKeys)
      .set({ isActive: false })
      .where(eq(apiKeys.id, id))
      .returning();
    return !!apiKey;
  }

  // Session methods
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

  // Auth methods
  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}

export const storage = new DatabaseStorage();
