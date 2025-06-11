import { users, apiKeys, authSessions, type User, type InsertUser, type ApiKey, type InsertApiKey, type AuthSession } from "@shared/schema";
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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private apiKeys: Map<string, ApiKey>;
  private sessions: Map<string, AuthSession>;
  private currentUserId: number;
  private currentApiKeyId: number;
  private currentSessionId: number;

  constructor() {
    this.users = new Map();
    this.apiKeys = new Map();
    this.sessions = new Map();
    this.currentUserId = 1;
    this.currentApiKeyId = 1;
    this.currentSessionId = 1;
    
    // Create default API key
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    // Create a default API key for testing
    const defaultApiKey: ApiKey = {
      id: this.currentApiKeyId++,
      key: "test-api-key-123",
      name: "Default Test Key",
      isActive: true,
      createdAt: new Date(),
    };
    this.apiKeys.set(defaultApiKey.key, defaultApiKey);
    
    // Create a test user
    const hashedPassword = await this.hashPassword("password123");
    const testUser: User = {
      id: this.currentUserId++,
      username: "testuser",
      password: hashedPassword,
      email: "test@example.com",
      isActive: true,
      createdAt: new Date(),
      lastLogin: null,
    };
    this.users.set(testUser.id, testUser);
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await this.hashPassword(insertUser.password);
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      password: hashedPassword,
      isActive: true,
      createdAt: new Date(),
      lastLogin: null,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getApiKey(key: string): Promise<ApiKey | undefined> {
    return this.apiKeys.get(key);
  }

  async createApiKey(insertApiKey: InsertApiKey): Promise<ApiKey> {
    const id = this.currentApiKeyId++;
    const key = `ak_${nanoid(32)}`;
    const apiKey: ApiKey = {
      id,
      key,
      name: insertApiKey.name,
      isActive: true,
      createdAt: new Date(),
    };
    this.apiKeys.set(key, apiKey);
    return apiKey;
  }

  async getAllApiKeys(): Promise<ApiKey[]> {
    return Array.from(this.apiKeys.values());
  }

  async deactivateApiKey(id: number): Promise<boolean> {
    const apiKey = Array.from(this.apiKeys.values()).find(ak => ak.id === id);
    if (!apiKey) return false;
    
    apiKey.isActive = false;
    this.apiKeys.set(apiKey.key, apiKey);
    return true;
  }

  async createSession(userId: number): Promise<AuthSession> {
    const id = this.currentSessionId++;
    const sessionToken = `st_${nanoid(32)}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    const session: AuthSession = {
      id,
      userId,
      sessionToken,
      expiresAt,
      createdAt: new Date(),
    };
    
    this.sessions.set(sessionToken, session);
    return session;
  }

  async getSession(token: string): Promise<AuthSession | undefined> {
    const session = this.sessions.get(token);
    if (!session) return undefined;
    
    // Check if session is expired
    if (session.expiresAt < new Date()) {
      this.sessions.delete(token);
      return undefined;
    }
    
    return session;
  }

  async deleteSession(token: string): Promise<boolean> {
    return this.sessions.delete(token);
  }

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}

export const storage = new MemStorage();
