import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertQuestionSchema, insertAnswerSchema } from "@shared/schema";
import { ZodError } from "zod";

// Types for WebSocket events
type WebSocketEventType = 'NEW_QUESTION' | 'NEW_ANSWER' | 'LIKE_ANSWER';

interface WebSocketEvent {
  type: WebSocketEventType;
  payload: any;
}

// Global WebSocket clients collection
let wsClients: WebSocket[] = [];

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
  
  // Tags API route
  app.get("/api/tags/popular", async (req: Request, res: Response) => {
    try {
      const limitStr = req.query.limit as string | undefined;
      const limit = limitStr ? parseInt(limitStr) : 10;
      
      const tags = await storage.getPopularTags(limit);
      res.status(200).json(tags);
    } catch (error) {
      res.status(500).json({ message: "Error fetching popular tags" });
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
  
  // Setup WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Broadcast to all connected clients
  const broadcast = (event: WebSocketEvent) => {
    const message = JSON.stringify(event);
    wsClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  };

  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    wsClients.push(ws);
    
    // Send welcome message
    ws.send(JSON.stringify({
      type: 'CONNECTED',
      payload: { message: 'Connected to discussion forum WebSocket server' }
    }));
    
    ws.on('message', (message) => {
      console.log('Received message:', message.toString());
    });
    
    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
      wsClients = wsClients.filter(client => client !== ws);
    });
  });
  
  // Override post question route to add WebSocket broadcast
  app.post("/api/questions", async (req: Request, res: Response) => {
    try {
      const questionData = insertQuestionSchema.parse(req.body);
      const newQuestion = await storage.createQuestion(questionData);
      
      // Broadcast the new question to all clients
      broadcast({
        type: 'NEW_QUESTION',
        payload: newQuestion
      });
      
      res.status(201).json(newQuestion);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid question data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error creating question" });
      }
    }
  });
  
  // Override answer creation to broadcast events
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
      
      // Broadcast the new answer
      broadcast({
        type: 'NEW_ANSWER',
        payload: {
          answer: newAnswer,
          questionId
        }
      });
      
      res.status(201).json(newAnswer);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid answer data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error creating answer" });
      }
    }
  });
  
  // Override like reaction to broadcast events
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
      
      // Broadcast the like update
      broadcast({
        type: 'LIKE_ANSWER',
        payload: updatedAnswer
      });

      res.status(200).json(updatedAnswer);
    } catch (error) {
      res.status(500).json({ message: "Error updating answer likes" });
    }
  });
  
  return httpServer;
}
