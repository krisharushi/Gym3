import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupSimpleAuth, isAuthenticated } from "./simpleAuth";
import { insertGymClassSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupSimpleAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Check if user exists in database, if not create them
      let user = await storage.getUser(userId);
      if (!user) {
        user = await storage.upsertUser({
          id: userId,
          email: req.user.claims.email,
          firstName: "Demo",
          lastName: "User",
          profileImageUrl: null,
        });
      }
      
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
      console.log("Creating gym class with data:", req.body);
      const validatedData = insertGymClassSchema.parse(req.body);
      console.log("Validated data:", validatedData);
      const userId = req.user.claims.sub;
      console.log("User ID:", userId);
      
      // Ensure user exists in database before creating gym class
      let user = await storage.getUser(userId);
      if (!user) {
        console.log("User not found, creating demo user");
        user = await storage.upsertUser({
          id: userId,
          email: req.user.claims.email,
          firstName: "Demo",
          lastName: "User",
          profileImageUrl: null,
        });
        console.log("Created user:", user);
      }
      
      const gymClass = await storage.createGymClass({ ...validatedData, userId });
      console.log("Created gym class:", gymClass);
      res.status(201).json(gymClass);
    } catch (error) {
      console.error("Error creating gym class:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create gym class", error: String(error) });
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
