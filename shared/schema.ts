import { pgTable, text, serial, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Files table to store code files
export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  content: text("content").notNull(),
  language: text("language").notNull().default("javascript"),
  lastModified: text("last_modified").notNull().default(new Date().toISOString()),
});

export const insertFileSchema = createInsertSchema(files).pick({
  name: true,
  content: true,
  language: true,
});

// Suggestions table to store AI code suggestions
export const suggestions = pgTable("suggestions", {
  id: serial("id").primaryKey(),
  fileId: serial("file_id").references(() => files.id),
  prompt: text("prompt").notNull(),
  suggestion: text("suggestion").notNull(),
  source: text("source").notNull(), // "openai" or "huggingface"
  timestamp: text("timestamp").notNull().default(new Date().toISOString()),
  metadata: jsonb("metadata"),
});

export const insertSuggestionSchema = createInsertSchema(suggestions).pick({
  fileId: true,
  prompt: true,
  suggestion: true,
  source: true,
  metadata: true,
});

// Feedback table to store user feedback on suggestions
export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  suggestionId: serial("suggestion_id").references(() => suggestions.id),
  isHelpful: text("is_helpful").notNull(), // "helpful" or "not_helpful"
  timestamp: text("timestamp").notNull().default(new Date().toISOString()),
});

export const insertFeedbackSchema = createInsertSchema(feedback).pick({
  suggestionId: true,
  isHelpful: true,
});

// Types
export type InsertFile = z.infer<typeof insertFileSchema>;
export type File = typeof files.$inferSelect;

export type InsertSuggestion = z.infer<typeof insertSuggestionSchema>;
export type Suggestion = typeof suggestions.$inferSelect;

export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedback.$inferSelect;

// Extended storage interface for in-memory implementation
export interface IFile {
  name: string;
  content: string;
  language: string;
  lastModified: string;
}
