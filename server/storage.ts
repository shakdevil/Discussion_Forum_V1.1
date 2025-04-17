import { 
  questions, answers, users,
  type Question, type Answer, type User, 
  type InsertQuestion, type InsertAnswer, type InsertUser 
} from "@shared/schema";

export interface IStorage {
  // User methods (kept from template)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Question methods
  getAllQuestions(): Promise<Question[]>;
  getQuestionById(id: number): Promise<Question | undefined>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  searchQuestions(keyword: string): Promise<Question[]>;
  getQuestionsByTag(tag: string): Promise<Question[]>;
  getRecentQuestions(): Promise<Question[]>;
  
  // Answer methods
  getAnswersByQuestionId(questionId: number): Promise<Answer[]>;
  createAnswer(answer: InsertAnswer): Promise<Answer>;
  likeAnswer(id: number): Promise<Answer | undefined>;
  deleteAnswer(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private questions: Map<number, Question>;
  private answers: Map<number, Answer>;
  private userCurrentId: number;
  private questionCurrentId: number;
  private answerCurrentId: number;

  constructor() {
    this.users = new Map();
    this.questions = new Map();
    this.answers = new Map();
    this.userCurrentId = 1;
    this.questionCurrentId = 1;
    this.answerCurrentId = 1;
  }

  // User methods (kept from template)
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Question methods
  async getAllQuestions(): Promise<Question[]> {
    return Array.from(this.questions.values());
  }

  async getQuestionById(id: number): Promise<Question | undefined> {
    return this.questions.get(id);
  }

  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const id = this.questionCurrentId++;
    const now = new Date();
    const question: Question = { ...insertQuestion, id, created_at: now };
    this.questions.set(id, question);
    return question;
  }

  async searchQuestions(keyword: string): Promise<Question[]> {
    return Array.from(this.questions.values()).filter(
      (question) => 
        question.title.toLowerCase().includes(keyword.toLowerCase()) || 
        question.description.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  async getQuestionsByTag(tag: string): Promise<Question[]> {
    return Array.from(this.questions.values()).filter(
      (question) => question.tags && question.tags.toLowerCase().includes(tag.toLowerCase())
    );
  }

  async getRecentQuestions(): Promise<Question[]> {
    return Array.from(this.questions.values())
      .sort((a, b) => {
        const dateA = a.created_at instanceof Date ? a.created_at : new Date(a.created_at);
        const dateB = b.created_at instanceof Date ? b.created_at : new Date(b.created_at);
        return dateB.getTime() - dateA.getTime();
      });
  }

  // Answer methods
  async getAnswersByQuestionId(questionId: number): Promise<Answer[]> {
    return Array.from(this.answers.values())
      .filter(answer => answer.question_id === questionId);
  }

  async createAnswer(insertAnswer: InsertAnswer): Promise<Answer> {
    const id = this.answerCurrentId++;
    const now = new Date();
    const answer: Answer = { ...insertAnswer, id, created_at: now };
    this.answers.set(id, answer);
    return answer;
  }

  async likeAnswer(id: number): Promise<Answer | undefined> {
    const answer = this.answers.get(id);
    if (!answer) return undefined;
    
    const updatedAnswer: Answer = { 
      ...answer, 
      likes: (answer.likes || 0) + 1 
    };
    
    this.answers.set(id, updatedAnswer);
    return updatedAnswer;
  }

  async deleteAnswer(id: number): Promise<boolean> {
    return this.answers.delete(id);
  }
}

// Import and use DatabaseStorage
import { DatabaseStorage } from './databaseStorage';
export const storage = new DatabaseStorage();
