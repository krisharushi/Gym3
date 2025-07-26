import {
  type User,
  type UpsertUser,
  type GymClass,
  type InsertGymClass,
} from "@shared/schema";
import type { IStorage } from "./storage";

// In-memory storage for demo deployment without database
export class MemoryStorage implements IStorage {
  private users = new Map<string, User>();
  private gymClasses = new Map<string, GymClass>();

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const user: User = {
      id: userData.id || "demo-user-123",
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async getAllGymClasses(userId: string): Promise<GymClass[]> {
    const userClasses = Array.from(this.gymClasses.values())
      .filter(gymClass => gymClass.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return userClasses;
  }

  async getGymClass(id: string): Promise<GymClass | undefined> {
    return this.gymClasses.get(id);
  }

  async createGymClass(insertGymClass: InsertGymClass & { userId: string }): Promise<GymClass> {
    const id = `gym-class-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const gymClass: GymClass = {
      id,
      userId: insertGymClass.userId,
      date: insertGymClass.date,
      attendance: insertGymClass.attendance,
      notes: insertGymClass.notes || null,
      createdAt: new Date(),
    };
    this.gymClasses.set(id, gymClass);
    return gymClass;
  }

  async updateGymClass(id: string, updates: Partial<InsertGymClass>): Promise<GymClass | undefined> {
    const existing = this.gymClasses.get(id);
    if (!existing) return undefined;

    const updated: GymClass = {
      ...existing,
      ...updates,
    };
    this.gymClasses.set(id, updated);
    return updated;
  }

  async deleteGymClass(id: string): Promise<boolean> {
    return this.gymClasses.delete(id);
  }
}