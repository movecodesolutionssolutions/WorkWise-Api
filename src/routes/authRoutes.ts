import { Router } from "express";
import {
  login,
  register,
  recoverPassword,
} from "../controllers/authController";
import { authorize } from "../middleware/roleMiddleware";

const router = Router();

router.post("/login", login);
router.post("/register", authorize(["admin"]), register);
router.post("/recover-password", recoverPassword);

// Exemplo de rota protegida para admin
router.get("/admin-only", authorize(["admin"]), (req, res) => {
  res.json({ message: "Acesso permitido apenas para admin." });
});

// Exemplo de rota para admin e manager
router.get("/gestao", authorize(["admin", "manager"]), (req, res) => {
  res.json({ message: "Acesso permitido para admin e manager." });
});

export default router;
