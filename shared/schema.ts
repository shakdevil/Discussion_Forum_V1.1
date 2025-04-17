import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Questions table
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  tags: text("tags"),
  created_at: timestamp("created_at").defaultNow()
});

// Answers table
export const answers = pgTable("answers", {
  id: serial("id").primaryKey(),
  question_id: integer("question_id").notNull().references(() => questions.id),
  answer_text: text("answer_text").notNull(),
  likes: integer("likes").default(0),
  created_at: timestamp("created_at").defaultNow()
});

// Insert schemas
export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
  created_at: true
});

export const insertAnswerSchema = createInsertSchema(answers).omit({
  id: true,
  created_at: true
});

// Types
export type Question = typeof questions.$inferSelect;
export type Answer = typeof answers.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type InsertAnswer = z.infer<typeof insertAnswerSchema>;

// The users table is kept as required by the template
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
