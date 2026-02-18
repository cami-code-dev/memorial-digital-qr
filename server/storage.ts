import {
  memorials, memorialMedia,
  type Memorial, type InsertMemorial,
  type MemorialMedia, type InsertMemorialMedia,
} from "@shared/schema";
import { users, type User, type UpsertUser } from "@shared/models/auth";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  getMemorialsByOwner(ownerId: string): Promise<Memorial[]>;
  getMemorial(id: string): Promise<(Memorial & { media: MemorialMedia[] }) | undefined>;
  getMemorialByToken(token: string): Promise<(Memorial & { media: MemorialMedia[] }) | undefined>;
  createMemorial(ownerId: string, data: InsertMemorial): Promise<Memorial>;
  updateMemorial(id: string, ownerId: string, data: Partial<InsertMemorial>): Promise<Memorial | undefined>;
  deleteMemorial(id: string, ownerId: string): Promise<boolean>;
  addMedia(data: InsertMemorialMedia): Promise<MemorialMedia>;
  deleteMedia(mediaId: string, ownerId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getMemorialsByOwner(ownerId: string): Promise<Memorial[]> {
    return db.select().from(memorials).where(eq(memorials.ownerId, ownerId));
  }

  async getMemorial(id: string): Promise<(Memorial & { media: MemorialMedia[] }) | undefined> {
    const [memorial] = await db.select().from(memorials).where(eq(memorials.id, id));
    if (!memorial) return undefined;
    const media = await db.select().from(memorialMedia).where(eq(memorialMedia.memorialId, id));
    return { ...memorial, media };
  }

  async getMemorialByToken(token: string): Promise<(Memorial & { media: MemorialMedia[] }) | undefined> {
    const [memorial] = await db.select().from(memorials).where(eq(memorials.accessToken, token));
    if (!memorial) return undefined;
    const media = await db.select().from(memorialMedia).where(eq(memorialMedia.memorialId, memorial.id));
    return { ...memorial, media };
  }

  async createMemorial(ownerId: string, data: InsertMemorial): Promise<Memorial> {
    const [memorial] = await db
      .insert(memorials)
      .values({
        ...data,
        ownerId,
        fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : null,
        fechaDefuncion: new Date(data.fechaDefuncion),
      })
      .returning();
    return memorial;
  }

  async updateMemorial(id: string, ownerId: string, data: Partial<InsertMemorial>): Promise<Memorial | undefined> {
    const updateData: any = { ...data, updatedAt: new Date() };
    if (data.fechaNacimiento) updateData.fechaNacimiento = new Date(data.fechaNacimiento);
    if (data.fechaDefuncion) updateData.fechaDefuncion = new Date(data.fechaDefuncion);

    const [memorial] = await db
      .update(memorials)
      .set(updateData)
      .where(and(eq(memorials.id, id), eq(memorials.ownerId, ownerId)))
      .returning();
    return memorial;
  }

  async deleteMemorial(id: string, ownerId: string): Promise<boolean> {
    await db.delete(memorialMedia).where(eq(memorialMedia.memorialId, id));
    const result = await db
      .delete(memorials)
      .where(and(eq(memorials.id, id), eq(memorials.ownerId, ownerId)))
      .returning();
    return result.length > 0;
  }

  async addMedia(data: InsertMemorialMedia): Promise<MemorialMedia> {
    const [media] = await db.insert(memorialMedia).values(data).returning();
    return media;
  }

  async deleteMedia(mediaId: string, ownerId: string): Promise<boolean> {
    const [media] = await db.select().from(memorialMedia).where(eq(memorialMedia.id, mediaId));
    if (!media) return false;
    const [memorial] = await db.select().from(memorials).where(
      and(eq(memorials.id, media.memorialId), eq(memorials.ownerId, ownerId))
    );
    if (!memorial) return false;
    await db.delete(memorialMedia).where(eq(memorialMedia.id, mediaId));
    return true;
  }
}

export const storage = new DatabaseStorage();
