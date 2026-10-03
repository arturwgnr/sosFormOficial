import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import reportsRoutes from "./routes/reports.routes.js";

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  // limite maior que o padrão: assinaturas em base64 podem passar de 1mb.
  app.use(express.json({ limit: "10mb" }));
  app.use(cookieParser());

  app.get("/api/health", (req, res) => res.json({ ok: true }));

  app.use("/api/auth", authRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/reports", reportsRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
