import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertQuestionSchema, insertAnswerSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Question API routes
  app.get("/api/questions", async (_req: Request, res: Response) => {
    try {
      const questions = await storage.getAllQuestions();
      res.status(200).json(questions);
    } catch (error) {
      res.status(500).json({ message: "Error fetching questions" });
    }
  });

  app.post("/api/questions", async (req: Request, res: Response) => {
    try {
      const questionData = insertQuestionSchema.parse(req.body);
      const newQuestion = await storage.createQuestion(questionData);
      res.status(201).json(newQuestion);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid question data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error creating question" });
      }
    }
  });

  app.get("/api/questions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid question ID" });
      }

      const question = await storage.getQuestionById(id);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }

      res.status(200).json(question);
    } catch (error) {
      res.status(500).json({ message: "Error fetching question" });
    }
  });

  app.get("/api/questions/search", async (req: Request, res: Response) => {
    try {
      const keyword = req.query.keyword as string;
      if (!keyword) {
        return res.status(400).json({ message: "Search keyword is required" });
      }

      const questions = await storage.searchQuestions(keyword);
      res.status(200).json(questions);
    } catch (error) {
      res.status(500).json({ message: "Error searching questions" });
    }
  });

  app.get("/api/questions/tag/:tag", async (req: Request, res: Response) => {
    try {
      const tag = req.params.tag;
      const questions = await storage.getQuestionsByTag(tag);
      res.status(200).json(questions);
    } catch (error) {
      res.status(500).json({ message: "Error fetching questions by tag" });
    }
  });

  app.get("/api/questions/recent", async (_req: Request, res: Response) => {
    try {
      const questions = await storage.getRecentQuestions();
      res.status(200).json(questions);
    } catch (error) {
      res.status(500).json({ message: "Error fetching recent questions" });
    }
  });

  // Answer API routes
  app.get("/api/questions/:id/answers", async (req: Request, res: Response) => {
    try {
      const questionId = parseInt(req.params.id);
      if (isNaN(questionId)) {
        return res.status(400).json({ message: "Invalid question ID" });
      }

      const answers = await storage.getAnswersByQuestionId(questionId);
      res.status(200).json(answers);
    } catch (error) {
      res.status(500).json({ message: "Error fetching answers" });
    }
  });

  app.post("/api/questions/:id/answers", async (req: Request, res: Response) => {
    try {
      const questionId = parseInt(req.params.id);
      if (isNaN(questionId)) {
        return res.status(400).json({ message: "Invalid question ID" });
      }

      const question = await storage.getQuestionById(questionId);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }

      const answerData = insertAnswerSchema.parse({
        ...req.body,
        question_id: questionId
      });

      const newAnswer = await storage.createAnswer(answerData);
      res.status(201).json(newAnswer);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid answer data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error creating answer" });
      }
    }
  });

  app.put("/api/answers/:id/reaction", async (req: Request, res: Response) => {
    try {
      const answerId = parseInt(req.params.id);
      if (isNaN(answerId)) {
        return res.status(400).json({ message: "Invalid answer ID" });
      }

      const updatedAnswer = await storage.likeAnswer(answerId);
      if (!updatedAnswer) {
        return res.status(404).json({ message: "Answer not found" });
      }

      res.status(200).json(updatedAnswer);
    } catch (error) {
      res.status(500).json({ message: "Error updating answer likes" });
    }
  });

  app.delete("/api/answers/:id", async (req: Request, res: Response) => {
    try {
      const answerId = parseInt(req.params.id);
      if (isNaN(answerId)) {
        return res.status(400).json({ message: "Invalid answer ID" });
      }

      const success = await storage.deleteAnswer(answerId);
      if (!success) {
        return res.status(404).json({ message: "Answer not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting answer" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
