import express from "express";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { insertMemorialSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import QRCode from "qrcode";
import { z } from "zod";

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "image/jpeg", "image/png", "image/webp",
      "audio/mpeg", "audio/mp3",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Tipo de archivo no permitido"));
    }
  },
});

const createMemorialSchema = z.object({
  nombreDifunto: z.string().min(1),
  biografia: z.string().min(1),
  fechaNacimiento: z.string().nullable().optional(),
  fechaDefuncion: z.string().min(1),
  isPublic: z.boolean().default(false),
  consentimientoConfirmado: z.literal(true, {
    errorMap: () => ({ message: "El consentimiento es obligatorio" }),
  }),
});

const updateMemorialSchema = z.object({
  nombreDifunto: z.string().min(1).optional(),
  biografia: z.string().min(1).optional(),
  fechaNacimiento: z.string().nullable().optional(),
  fechaDefuncion: z.string().min(1).optional(),
  isPublic: z.boolean().optional(),
  consentimientoConfirmado: z.literal(true, {
    errorMap: () => ({ message: "El consentimiento es obligatorio" }),
  }),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

  app.use("/uploads", (req, res, next) => {
    res.setHeader("Cache-Control", "public, max-age=86400");
    next();
  });
  app.use("/uploads", express.static(uploadDir));

  app.get("/api/memorials", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const memorials = await storage.getMemorialsByOwner(userId);
      res.json(memorials);
    } catch (error) {
      console.error("Error fetching memorials:", error);
      res.status(500).json({ message: "Error al obtener memoriales" });
    }
  });

  app.get("/api/memorials/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const memorial = await storage.getMemorial(req.params.id);
      if (!memorial) return res.status(404).json({ message: "Memorial no encontrado" });
      if (memorial.ownerId !== userId) return res.status(403).json({ message: "No autorizado" });
      res.json(memorial);
    } catch (error) {
      console.error("Error fetching memorial:", error);
      res.status(500).json({ message: "Error al obtener memorial" });
    }
  });

  app.post("/api/memorials", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = createMemorialSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0]?.message || "Datos inv\u00e1lidos" });
      }
      const memorial = await storage.createMemorial(userId, parsed.data as any);
      res.status(201).json(memorial);
    } catch (error) {
      console.error("Error creating memorial:", error);
      res.status(500).json({ message: "Error al crear memorial" });
    }
  });

  app.patch("/api/memorials/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = updateMemorialSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0]?.message || "Datos inv\u00e1lidos" });
      }
      const memorial = await storage.updateMemorial(req.params.id, userId, parsed.data as any);
      if (!memorial) return res.status(404).json({ message: "Memorial no encontrado" });
      res.json(memorial);
    } catch (error) {
      console.error("Error updating memorial:", error);
      res.status(500).json({ message: "Error al actualizar memorial" });
    }
  });

  app.delete("/api/memorials/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const memorial = await storage.getMemorial(req.params.id);
      if (memorial?.media) {
        for (const m of memorial.media) {
          const filePath = path.join(uploadDir, path.basename(m.url));
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
      }
      const deleted = await storage.deleteMemorial(req.params.id, userId);
      if (!deleted) return res.status(404).json({ message: "Memorial no encontrado" });
      res.json({ message: "Memorial eliminado" });
    } catch (error) {
      console.error("Error deleting memorial:", error);
      res.status(500).json({ message: "Error al eliminar memorial" });
    }
  });

  app.post("/api/memorials/:id/media", isAuthenticated, upload.single("file"), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const memorial = await storage.getMemorial(req.params.id);
      if (!memorial) return res.status(404).json({ message: "Memorial no encontrado" });
      if (memorial.ownerId !== userId) return res.status(403).json({ message: "No autorizado" });
      if (!memorial.consentimientoConfirmado) return res.status(400).json({ message: "El consentimiento es obligatorio" });

      if (!req.file) return res.status(400).json({ message: "No se proporcion\u00f3 archivo" });

      const fileType = req.file.mimetype.startsWith("image/") ? "image" : "audio";
      const media = await storage.addMedia({
        memorialId: req.params.id,
        type: fileType,
        url: `/uploads/${req.file.filename}`,
        filename: req.file.originalname,
        sizeBytes: req.file.size,
      });
      res.status(201).json(media);
    } catch (error: any) {
      console.error("Error uploading media:", error);
      res.status(500).json({ message: error.message || "Error al subir archivo" });
    }
  });

  app.delete("/api/memorials/:id/media/:mediaId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const deleted = await storage.deleteMedia(req.params.mediaId, userId);
      if (!deleted) return res.status(404).json({ message: "Archivo no encontrado" });
      res.json({ message: "Archivo eliminado" });
    } catch (error) {
      console.error("Error deleting media:", error);
      res.status(500).json({ message: "Error al eliminar archivo" });
    }
  });

  app.get("/api/memorials/:id/qr", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const memorial = await storage.getMemorial(req.params.id);
      if (!memorial) return res.status(404).json({ message: "Memorial no encontrado" });
      if (memorial.ownerId !== userId) return res.status(403).json({ message: "No autorizado" });

      const publicUrl = `${req.protocol}://${req.hostname}/m/${memorial.accessToken}`;
      const qrDataUrl = await QRCode.toDataURL(publicUrl, {
        width: 400,
        margin: 2,
        color: { dark: "#2d2520", light: "#f7f5f2" },
      });
      res.json({ qrDataUrl, publicUrl });
    } catch (error) {
      console.error("Error generating QR:", error);
      res.status(500).json({ message: "Error al generar QR" });
    }
  });

  app.get("/api/public/memorial/:token", async (req, res) => {
    try {
      const memorial = await storage.getMemorialByToken(req.params.token);
      if (!memorial) return res.status(404).json({ message: "Memorial no encontrado" });
      if (!memorial.isPublic) return res.status(403).json({ message: "Memorial privado" });
      const { ownerId, accessToken, ...publicData } = memorial;
      res.json(publicData);
    } catch (error) {
      console.error("Error fetching public memorial:", error);
      res.status(500).json({ message: "Error" });
    }
  });

  return httpServer;
}
