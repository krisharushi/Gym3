import type { RequestHandler } from "express";

// Simple authentication bypass for Vercel deployment
// This creates a mock user session for development/demo purposes
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // Create a mock user session
  req.user = {
    claims: {
      sub: "demo-user-123",
      email: "demo@example.com"
    }
  };
  
  next();
};

export async function setupSimpleAuth(app: any) {
  // Simple demo routes
  app.get("/api/login", (req: any, res: any) => {
    // For demo purposes, redirect directly to home
    res.redirect("/");
  });

  app.get("/api/logout", (req: any, res: any) => {
    res.redirect("/");
  });
}