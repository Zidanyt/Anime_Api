// routes/auth.routes.ts
import { Router } from "express";
import { login, register, getProfile } from "../controllers/auth.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, getProfile);

export default router;
