import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function authorize(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: "Token não fornecido." });
      return;
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      res.status(401).json({ error: "Token inválido." });
      return;
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      // @ts-ignore
      if (!roles.includes(decoded.role)) {
        res.status(403).json({ error: "Acesso negado." });
        return;
      }
      // @ts-ignore
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: "Token inválido." });
    }
  };
}
