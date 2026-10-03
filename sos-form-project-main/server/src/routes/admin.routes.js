import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import { validateParams, validateQuery, validateBody } from "../utils/validate.js";
import {
  listPendingUsers,
  listUsers,
  approveUser,
  rejectUser,
  blockUser,
  updatePermissions,
  idParamSchema,
  permissionsSchema,
  listUsersQuerySchema,
} from "../controllers/admin.controller.js";

const router = Router();

// Toda rota de admin exige sessão válida E papel ADMIN.
router.use(requireAuth, requireRole("ADMIN"));

router.get("/users/pending", listPendingUsers);
router.get("/users", validateQuery(listUsersQuerySchema), listUsers);
router.post("/users/:id/approve", validateParams(idParamSchema), approveUser);
router.post("/users/:id/reject", validateParams(idParamSchema), rejectUser);
router.post("/users/:id/block", validateParams(idParamSchema), blockUser);
router.patch(
  "/users/:id/permissions",
  validateParams(idParamSchema),
  validateBody(permissionsSchema),
  updatePermissions
);

export default router;
