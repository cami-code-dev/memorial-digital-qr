import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";

export const memorials = pgTable("memorials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerId: varchar("owner_id").notNull(),
  nombreDifunto: text("nombre_difunto").notNull(),
  biografia: text("biografia").notNull(),
  fechaNacimiento: timestamp("fecha_nacimiento"),
  fechaDefuncion: timestamp("fecha_defuncion").notNull(),
  isPublic: boolean("is_public").default(false).notNull(),
  accessToken: varchar("access_token").notNull().default(sql`gen_random_uuid()`),
  consentimientoConfirmado: boolean("consentimiento_confirmado").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const memorialMedia = pgTable("memorial_media", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  memorialId: varchar("memorial_id").notNull(),
  type: text("type").notNull(),
  url: text("url").notNull(),
  filename: text("filename").notNull(),
  sizeBytes: integer("size_bytes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const memorialsRelations = relations(memorials, ({ many }) => ({
  media: many(memorialMedia),
}));

export const memorialMediaRelations = relations(memorialMedia, ({ one }) => ({
  memorial: one(memorials, {
    fields: [memorialMedia.memorialId],
    references: [memorials.id],
  }),
}));

export const insertMemorialSchema = createInsertSchema(memorials).omit({
  id: true,
  ownerId: true,
  accessToken: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMemorialMediaSchema = createInsertSchema(memorialMedia).omit({
  id: true,
  createdAt: true,
});

export type Memorial = typeof memorials.$inferSelect;
export type InsertMemorial = z.infer<typeof insertMemorialSchema>;
export type MemorialMedia = typeof memorialMedia.$inferSelect;
export type InsertMemorialMedia = z.infer<typeof insertMemorialMediaSchema>;
