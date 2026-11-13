import { Router } from "express";
import {
  register,
  login,
  logout,
  me,
  changePassword,
  registerSchema,
  loginSchema,
  changePasswordSchema,
} from "../controllers/auth.controller.js";
import { validateBody } from "../utils/validate.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.post("/register", validateBody(registerSchema), register);
router.post("/login", validateBody(loginSchema), login);
router.post("/logout", logout);
router.get("/me", requireAuth, me);
router.post("/change-password", requireAuth, validateBody(changePasswordSchema), changePassword);

export default router;
