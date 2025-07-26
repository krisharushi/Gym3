import {
  users,
  gymClasses,
  type User,
  type UpsertUser,
  type GymClass,
  type InsertGymClass,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Gym class methods
  getAllGymClasses(userId: string): Promise<GymClass[]>;
  getGymClass(id: string): Promise<GymClass | undefined>;
  createGymClass(gymClass: InsertGymClass & { userId: string }): Promise<GymClass>;
  updateGymClass(id: string, gymClass: Partial<InsertGymClass>): Promise<GymClass | undefined>;
  deleteGymClass(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Gym class methods
  async getAllGymClasses(userId: string): Promise<GymClass[]> {
    return await db
      .select()
      .from(gymClasses)
      .where(eq(gymClasses.userId, userId))
      .orderBy(desc(gymClasses.date));
  }

  async getGymClass(id: string): Promise<GymClass | undefined> {
    const [gymClass] = await db
      .select()
      .from(gymClasses)
      .where(eq(gymClasses.id, id));
    return gymClass;
  }

  async createGymClass(insertGymClass: InsertGymClass & { userId: string }): Promise<GymClass> {
    const [gymClass] = await db
      .insert(gymClasses)
      .values({
        ...insertGymClass,
        notes: insertGymClass.notes || null,
      })
      .returning();
    return gymClass;
  }

  async updateGymClass(id: string, updates: Partial<InsertGymClass>): Promise<GymClass | undefined> {
    const [updated] = await db
      .update(gymClasses)
      .set(updates)
      .where(eq(gymClasses.id, id))
      .returning();
    return updated;
  }

  async deleteGymClass(id: string): Promise<boolean> {
    const result = await db
      .delete(gymClasses)
      .where(eq(gymClasses.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}

export const storage = new DatabaseStorage();
