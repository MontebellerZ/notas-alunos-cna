import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import envData from "../../config/envData";
import { NotAuthorizedError } from "../errors/errors";
import { AuthUsuario } from "../types/auth/authUsuario.type";

export type UserCtx = { usuarioId: number; isAdmin: boolean };

export interface AuthRequest extends Request {
  usuario?: AuthUsuario;
}

export function authMiddleware(req: AuthRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw new NotAuthorizedError("Token não informado.");
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, envData.jwtSecret) as AuthUsuario;
    req.usuario = { id: payload.id, email: payload.email, admin: payload.admin ?? false };
    next();
  } catch {
    throw new NotAuthorizedError("Token inválido ou expirado.");
  }
}
