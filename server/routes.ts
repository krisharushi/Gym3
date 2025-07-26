import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertGymClassSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get all gym classes for authenticated user
  app.get("/api/gym-classes", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const classes = await storage.getAllGymClasses(userId);
      res.json(classes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch gym classes" });
    }
  });

  // Get a specific gym class
  app.get("/api/gym-classes/:id", isAuthenticated, async (req, res) => {
    try {
      const gymClass = await storage.getGymClass(req.params.id);
      if (!gymClass) {
        return res.status(404).json({ message: "Gym class not found" });
      }
      res.json(gymClass);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch gym class" });
    }
  });

  // Create a new gym class
  app.post("/api/gym-classes", isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertGymClassSchema.parse(req.body);
      const userId = req.user.claims.sub;
      const gymClass = await storage.createGymClass({ ...validatedData, userId });
      res.status(201).json(gymClass);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create gym class" });
    }
  });

  // Update a gym class
  app.patch("/api/gym-classes/:id", isAuthenticated, async (req, res) => {
    try {
      const updates = insertGymClassSchema.partial().parse(req.body);
      const updatedClass = await storage.updateGymClass(req.params.id, updates);
      if (!updatedClass) {
        return res.status(404).json({ message: "Gym class not found" });
      }
      res.json(updatedClass);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update gym class" });
    }
  });

  // Delete a gym class
  app.delete("/api/gym-classes/:id", isAuthenticated, async (req, res) => {
    try {
      const deleted = await storage.deleteGymClass(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Gym class not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete gym class" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
