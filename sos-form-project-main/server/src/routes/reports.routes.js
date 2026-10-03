import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import { validateBody, validateQuery, validateParams } from "../utils/validate.js";
import {
  createReport,
  listReports,
  getReport,
  getStats,
  createReportSchema,
  listReportsQuerySchema,
  idParamSchema,
} from "../controllers/reports.controller.js";

const router = Router();

// Toda rota de relatórios exige sessão válida (ACTIVE).
router.use(requireAuth);

router.post("/", validateBody(createReportSchema), createReport);
router.get("/", validateQuery(listReportsQuerySchema), listReports);
// Precisa vir antes de "/:id", senão "stats" seria lido como um ID.
router.get("/stats", requireRole("ADMIN"), getStats);
router.get("/:id", validateParams(idParamSchema), getReport);

export default router;
