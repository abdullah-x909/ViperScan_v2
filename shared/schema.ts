import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const httpRequests = pgTable("http_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  method: varchar("method", { length: 10 }).notNull(),
  url: text("url").notNull(),
  headers: jsonb("headers").notNull().default({}),
  body: text("body"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  statusCode: integer("status_code"),
  responseHeaders: jsonb("response_headers").default({}),
  responseBody: text("response_body"),
  responseTime: integer("response_time"),
  size: integer("size"),
  intercepted: boolean("intercepted").default(false),
});

export const vulnerabilities = pgTable("vulnerabilities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  severity: varchar("severity", { length: 20 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  url: text("url").notNull(),
  method: varchar("method", { length: 10 }).notNull(),
  parameter: varchar("parameter", { length: 255 }),
  payload: text("payload"),
  evidence: text("evidence"),
  remediation: text("remediation"),
  cvssScore: integer("cvss_score"),
  owaspCategory: varchar("owasp_category", { length: 50 }),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const scanSessions = pgTable("scan_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  targetUrl: text("target_url").notNull(),
  profile: varchar("profile", { length: 100 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  progress: integer("progress").default(0),
  startTime: timestamp("start_time").notNull().defaultNow(),
  endTime: timestamp("end_time"),
  vulnerabilitiesFound: integer("vulnerabilities_found").default(0),
});

export const fuzzerResults = pgTable("fuzzer_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
  payload: text("payload").notNull(),
  url: text("url").notNull(),
  statusCode: integer("status_code"),
  responseLength: integer("response_length"),
  responseTime: integer("response_time"),
  response: text("response"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const tools = pgTable("tools", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  command: text("command").notNull(),
  installed: boolean("installed").default(false),
  version: varchar("version", { length: 50 }),
  lastUsed: timestamp("last_used"),
});

export const directoryResults = pgTable("directory_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
  targetUrl: text("target_url").notNull(),
  foundPath: text("found_path").notNull(),
  statusCode: integer("status_code"),
  contentLength: integer("content_length"),
  contentType: varchar("content_type", { length: 100 }),
  responseTime: integer("response_time"),
  method: varchar("method", { length: 10 }).default("GET"),
  source: varchar("source", { length: 50 }).notNull(), // 'dirb', 'dirbuster', 'google_dork', etc.
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const dorking_sessions = pgTable("dorking_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  targetDomain: text("target_domain").notNull(),
  dorkType: varchar("dork_type", { length: 50 }).notNull(), // 'files', 'directories', 'subdomains', 'sensitive'
  query: text("query").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  resultsFound: integer("results_found").default(0),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertHttpRequestSchema = createInsertSchema(httpRequests).omit({
  id: true,
  timestamp: true,
});

export const insertVulnerabilitySchema = createInsertSchema(vulnerabilities).omit({
  id: true,
  timestamp: true,
});

export const insertScanSessionSchema = createInsertSchema(scanSessions).omit({
  id: true,
  startTime: true,
});

export const insertFuzzerResultSchema = createInsertSchema(fuzzerResults).omit({
  id: true,
  timestamp: true,
});

export const insertToolSchema = createInsertSchema(tools).omit({
  id: true,
});

export const insertDirectoryResultSchema = createInsertSchema(directoryResults).omit({
  id: true,
  timestamp: true,
});

export const insertDorkingSessionSchema = createInsertSchema(dorking_sessions).omit({
  id: true,
  timestamp: true,
});

export type HttpRequest = typeof httpRequests.$inferSelect;
export type InsertHttpRequest = z.infer<typeof insertHttpRequestSchema>;
export type Vulnerability = typeof vulnerabilities.$inferSelect;
export type InsertVulnerability = z.infer<typeof insertVulnerabilitySchema>;
export type ScanSession = typeof scanSessions.$inferSelect;
export type InsertScanSession = z.infer<typeof insertScanSessionSchema>;
export type FuzzerResult = typeof fuzzerResults.$inferSelect;
export type InsertFuzzerResult = z.infer<typeof insertFuzzerResultSchema>;
export type Tool = typeof tools.$inferSelect;
export type InsertTool = z.infer<typeof insertToolSchema>;
export type DirectoryResult = typeof directoryResults.$inferSelect;
export type InsertDirectoryResult = z.infer<typeof insertDirectoryResultSchema>;
export type DorkingSession = typeof dorking_sessions.$inferSelect;
export type InsertDorkingSession = z.infer<typeof insertDorkingSessionSchema>;

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
