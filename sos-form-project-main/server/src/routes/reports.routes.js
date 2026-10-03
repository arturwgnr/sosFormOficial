import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { validateBody, validateQuery, validateParams } from "../utils/validate.js";
import {
  createReport,
  listReports,
  getReport,
  createReportSchema,
  listReportsQuerySchema,
  idParamSchema,
} from "../controllers/reports.controller.js";

const router = Router();

// Toda rota de relatórios exige sessão válida (ACTIVE).
router.use(requireAuth);

router.post("/", validateBody(createReportSchema), createReport);
router.get("/", validateQuery(listReportsQuerySchema), listReports);
router.get("/:id", validateParams(idParamSchema), getReport);

export default router;
