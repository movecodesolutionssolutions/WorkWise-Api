import { Router } from "express";
import {
  login,
  register,
  recoverPassword,
} from "../controllers/authController";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.post("/recover-password", recoverPassword);

export default router;
