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
    // Busca o perfil completo do usuário na tabela 'profiles'
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, nome, url_foto, whatsapp")
      .eq("id", data.user.id)
      .single();
    if (profileError || !profile) {
      res.status(500).json({ error: "Erro ao buscar perfil do usuário." });
      return;
    }
    const token = jwt.sign(
      {
        userId: data.user.id,
        email: data.user.email,
        role: profile.role,
        nome: profile.nome,
        url_foto: profile.url_foto,
        whatsapp: profile.role === "cliente" ? profile.whatsapp : undefined,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "2h" }
    );
    res.status(200).json({
      message: "Login realizado com sucesso.",
      token,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: profile.role,
        nome: profile.nome,
        url_foto: profile.url_foto,
        whatsapp: profile.role === "cliente" ? profile.whatsapp : undefined,
      },
    });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      email,
      password,
      role = "cliente",
      nome,
      url_foto,
      whatsapp,
    } = req.body;
    if (
      !email ||
      !password ||
      !nome ||
      !url_foto ||
      (role === "cliente" && !whatsapp)
    ) {
      res.status(400).json({ error: "Campos obrigatórios faltando." });
      return;
    }
    // Cria o usuário no Supabase Auth
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error || !data.user) {
      res
        .status(400)
        .json({ error: error?.message || "Erro ao criar usuário." });
      return;
    }
    // Monta o objeto de perfil
    const profileData: any = {
      id: data.user.id,
      role,
      nome,
      url_foto,
    };
    if (role === "cliente") {
      profileData.whatsapp = whatsapp;
    }
    // Cria o perfil na tabela 'profiles' com os campos corretos
    const { error: profileError } = await supabase
      .from("profiles")
      .insert([profileData]);
    if (profileError) {
      res.status(400).json({ error: profileError.message });
      return;
    }
    res.status(201).json({
      message: "Usuário criado com sucesso.",
      user: {
        id: data.user.id,
        email: data.user.email,
        role,
        nome,
        url_foto,
        whatsapp: role === "cliente" ? whatsapp : undefined,
      },
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
