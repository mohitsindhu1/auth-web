import { pgTable, text, serial, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  firebaseUid: text("firebase_uid").notNull().unique(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastLogin: timestamp("last_login"),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  accountId: serial("account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
  username: text("username").notNull(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastLogin: timestamp("last_login"),
}, (table) => {
  return {
    uniqueUsernamePerAccount: index("unique_username_per_account").on(table.accountId, table.username),
    uniqueEmailPerAccount: index("unique_email_per_account").on(table.accountId, table.email),
  };
});

export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  accountId: serial("account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const authSessions = pgTable("auth_sessions", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").notNull(),
  sessionToken: text("session_token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAccountSchema = createInsertSchema(accounts).pick({
  firebaseUid: true,
  email: true,
  displayName: true,
  isActive: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  api_key: z.string().min(1, "API key is required"),
});

export const firebaseLoginSchema = z.object({
  firebase_token: z.string().min(1, "Firebase token is required"),
  firebase_uid: z.string().min(1, "Firebase UID is required"),
  email: z.string().email("Valid email is required"),
  display_name: z.string().optional(),
});

export const insertApiKeySchema = createInsertSchema(apiKeys).pick({
  name: true,
});

export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Account = typeof accounts.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginRequest = z.infer<typeof loginSchema>;
export type FirebaseLoginRequest = z.infer<typeof firebaseLoginSchema>;
export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type AuthSession = typeof authSessions.$inferSelect;
