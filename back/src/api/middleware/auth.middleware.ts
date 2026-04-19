import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import envData from "../../config/envData";
import { NotAuthorizedError } from "../errors/errors";

export interface AuthRequest extends Request {
  usuario?: { id: number; email: string };
}

export function authMiddleware(req: AuthRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw new NotAuthorizedError("Token não informado.");
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, envData.jwtSecret) as { id: number; email: string };
    req.usuario = { id: payload.id, email: payload.email };
    next();
  } catch {
    throw new NotAuthorizedError("Token inválido ou expirado.");
  }
}
