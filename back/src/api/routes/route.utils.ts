import type { Request } from "express";
import { BadRequestError } from "../errors/errors";
import type { AuthRequest, UserCtx } from "../middleware/auth.middleware";

export type PaginationParams = {
  page?: number;
  limit?: number;
};

export function getUserCtx(req: Request): UserCtx {
  const authReq = req as AuthRequest;
  return { usuarioId: authReq.usuario!.id, isAdmin: authReq.usuario!.admin };
}

export function getPaginationParams(req: Request): PaginationParams {
  const pageRaw = Number(req.query.page);
  const limitRaw = Number(req.query.limit);

  return {
    page: Number.isFinite(pageRaw) ? pageRaw : undefined,
    limit: Number.isFinite(limitRaw) ? limitRaw : undefined,
  };
}

export function parseRequiredNumber(value: unknown, errorMessage: string): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    throw new BadRequestError(errorMessage);
  }

  return parsed;
}