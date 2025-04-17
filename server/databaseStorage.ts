import { users, questions, answers, type User, type Question, type Answer, type InsertUser, type InsertQuestion, type InsertAnswer } from "@shared/schema";
import { db } from "./db";
import { eq, desc, like, sql, asc } from "drizzle-orm";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Question methods
  async getAllQuestions(): Promise<Question[]> {
    return await db.select().from(questions);
  }

  async getQuestionById(id: number): Promise<Question | undefined> {
    const [question] = await db.select().from(questions).where(eq(questions.id, id));
    return question || undefined;
  }

  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const [question] = await db
      .insert(questions)
      .values({
        ...insertQuestion,
        created_at: new Date(),
      })
      .returning();
    return question;
  }

  async searchQuestions(keyword: string): Promise<Question[]> {
    return await db
      .select()
      .from(questions)
      .where(
        sql`${questions.title} ILIKE ${`%${keyword}%`} OR ${questions.description} ILIKE ${`%${keyword}%`}`
      );
  }

  async getQuestionsByTag(tag: string): Promise<Question[]> {
    return await db
      .select()
      .from(questions)
      .where(sql`${questions.tags} ILIKE ${`%${tag}%`}`);
  }

  async getRecentQuestions(): Promise<Question[]> {
    return await db
      .select()
      .from(questions)
      .orderBy(desc(questions.created_at))
      .limit(10);
  }
  
  async getPopularTags(limit: number = 10): Promise<{ tag: string; count: number }[]> {
    // Get all questions with tags
    const allQuestions = await db
      .select({ tags: questions.tags })
      .from(questions)
      .where(sql`${questions.tags} IS NOT NULL`);
    
    // Process tags
    const tagCounts = new Map<string, number>();
    
    allQuestions.forEach(question => {
      if (question.tags) {
        const tags = question.tags.split(',').map(tag => tag.trim());
        tags.forEach(tag => {
          if (tag) {
            const count = tagCounts.get(tag) || 0;
            tagCounts.set(tag, count + 1);
          }
        });
      }
    });
    
    // Convert to array and sort by count (descending)
    const sortedTags = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
    
    return sortedTags;
  }

  // Answer methods
  async getAnswersByQuestionId(questionId: number): Promise<Answer[]> {
    return await db
      .select()
      .from(answers)
      .where(eq(answers.question_id, questionId))
      .orderBy(desc(answers.created_at));
  }

  async createAnswer(insertAnswer: InsertAnswer): Promise<Answer> {
    const [answer] = await db
      .insert(answers)
      .values({
        ...insertAnswer,
        created_at: new Date(),
        likes: 0, // Initialize with 0 likes
      })
      .returning();
    return answer;
  }

  async likeAnswer(id: number): Promise<Answer | undefined> {
    const [answer] = await db
      .select()
      .from(answers)
      .where(eq(answers.id, id));

    if (!answer) return undefined;

    const [updatedAnswer] = await db
      .update(answers)
      .set({ likes: (answer.likes || 0) + 1 })
      .where(eq(answers.id, id))
      .returning();

    return updatedAnswer;
  }

  async deleteAnswer(id: number): Promise<boolean> {
    const result = await db
      .delete(answers)
      .where(eq(answers.id, id));
    
    // For PostgreSQL, a successful deletion returns at least 1 row
    return result.rowCount !== null && result.rowCount > 0;
  }
}