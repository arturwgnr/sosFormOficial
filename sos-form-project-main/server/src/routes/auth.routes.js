import { Router } from "express";
import { register, login, logout, me, registerSchema, loginSchema } from "../controllers/auth.controller.js";
import { validateBody } from "../utils/validate.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.post("/register", validateBody(registerSchema), register);
router.post("/login", validateBody(loginSchema), login);
router.post("/logout", logout);
router.get("/me", requireAuth, me);

export default router;
