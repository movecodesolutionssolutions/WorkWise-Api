import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { supabase } from "../lib/supabase";
import dotenv from "dotenv";

dotenv.config();

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email e senha são obrigatórios." });
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      res.status(401).json({ error: "Email ou senha inválidos." });
      return;
    }

    const token = jwt.sign(
      { userId: data.user.id, email: data.user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "2h" }
    );

    res.status(200).json({
      message: "Login realizado com sucesso.",
      token,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email e senha são obrigatórios." });
      return;
    }
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(201).json({
      message: "Usuário criado com sucesso.",
      user: data.user,
    });
  } catch (err) {
    console.error("Erro ao criar usuário:", err);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
};

export const recoverPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: "Email é obrigatório." });
      return;
    }
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(200).json({
      message:
        "Se o email estiver cadastrado, as instruções de recuperação foram enviadas.",
    });
  } catch (err) {
    console.error("Erro ao recuperar senha:", err);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
};
