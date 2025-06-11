import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Applications table - users can create multiple applications
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  apiKey: text("api_key").notNull().unique(),
  version: text("version").notNull().default("1.0.0"),
  isActive: boolean("is_active").notNull().default(true),
  hwidLockEnabled: boolean("hwid_lock_enabled").notNull().default(false),
  // Custom messages for different scenarios
  loginSuccessMessage: text("login_success_message").default("Login successful!"),
  loginFailedMessage: text("login_failed_message").default("Invalid credentials!"),
  accountDisabledMessage: text("account_disabled_message").default("Account is disabled!"),
  accountExpiredMessage: text("account_expired_message").default("Account has expired!"),
  versionMismatchMessage: text("version_mismatch_message").default("Please update your application to the latest version!"),
  hwidMismatchMessage: text("hwid_mismatch_message").default("Hardware ID mismatch detected!"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Application users (users created for specific applications with time limits)
export const appUsers = pgTable("app_users", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").notNull().references(() => applications.id, { onDelete: "cascade" }),
  username: text("username").notNull(),
  password: text("password").notNull(),
  email: text("email"),
  isActive: boolean("is_active").notNull().default(true),
  isPaused: boolean("is_paused").notNull().default(false),
  hwid: text("hwid"), // Hardware ID for locking
  expiresAt: timestamp("expires_at"), // Time limit for user validity
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastLogin: timestamp("last_login"),
  loginAttempts: integer("login_attempts").notNull().default(0),
  lastLoginAttempt: timestamp("last_login_attempt"),
}, (table) => {
  return {
    uniqueUsernamePerApp: index("unique_username_per_app").on(table.applicationId, table.username),
    uniqueEmailPerApp: index("unique_email_per_app").on(table.applicationId, table.email),
  };
});

export const insertApplicationSchema = createInsertSchema(applications).pick({
  name: true,
  description: true,
  version: true,
  hwidLockEnabled: true,
  loginSuccessMessage: true,
  loginFailedMessage: true,
  accountDisabledMessage: true,
  accountExpiredMessage: true,
  versionMismatchMessage: true,
  hwidMismatchMessage: true,
});

export const insertAppUserSchema = createInsertSchema(appUsers).pick({
  username: true,
  password: true,
  email: true,
  expiresAt: true,
  hwid: true,
});

export const updateApplicationSchema = createInsertSchema(applications).pick({
  name: true,
  description: true,
  version: true,
  isActive: true,
  hwidLockEnabled: true,
  loginSuccessMessage: true,
  loginFailedMessage: true,
  accountDisabledMessage: true,
  accountExpiredMessage: true,
  versionMismatchMessage: true,
  hwidMismatchMessage: true,
}).partial();

export const updateAppUserSchema = createInsertSchema(appUsers).pick({
  username: true,
  password: true,
  email: true,
  isActive: true,
  isPaused: true,
  hwid: true,
  expiresAt: true,
  lastLogin: true,
  loginAttempts: true,
  lastLoginAttempt: true,
}).partial().extend({
  hwid: z.string().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  api_key: z.string().min(1, "API key is required"),
  version: z.string().optional(),
  hwid: z.string().optional(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type UpdateApplication = z.infer<typeof updateApplicationSchema>;
export type AppUser = typeof appUsers.$inferSelect;
export type InsertAppUser = z.infer<typeof insertAppUserSchema>;
export type UpdateAppUser = z.infer<typeof updateAppUserSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
