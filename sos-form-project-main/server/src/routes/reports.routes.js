import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import { validateBody, validateQuery, validateParams } from "../utils/validate.js";
import {
  createReport,
  listReports,
  getReport,
  getStats,
  deleteReports,
  deleteReportsSchema,
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
// Ação sensível (só ADMIN): exige a senha de ações administrativas no corpo.
// POST e não DELETE com corpo: vários IDs de uma vez, sem depender de
// proxies que descartam corpo em DELETE.
router.post("/delete", requireRole("ADMIN"), validateBody(deleteReportsSchema), deleteReports);
router.get("/:id", validateParams(idParamSchema), getReport);

export default router;
