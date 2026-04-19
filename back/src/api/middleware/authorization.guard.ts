import type { Request, RequestHandler } from "express";
import prisma from "../../../prisma";
import { BadRequestError, ForbiddenError } from "../errors/errors";
import type { AuthRequest } from "./auth.middleware";

type IdSource = "params" | "body";

type GuardOptions = {
  source: IdSource;
  field: string;
  fieldLabel: string;
  resourceName: string;
  canAccess: (usuarioId: number, resourceId: number) => Promise<boolean>;
};

function getAuthenticatedUser(req: Request) {
  const usuario = (req as AuthRequest).usuario;

  if (!usuario) {
    throw new ForbiddenError("Usuário não autenticado.");
  }

  return usuario;
}

function readRequiredId(req: Request, source: IdSource, field: string, fieldLabel: string): number {
  const rawValue = source === "params" ? req.params[field] : req.body?.[field];
  const id = Number(rawValue);

  if (!Number.isFinite(id)) {
    throw new BadRequestError(`${fieldLabel} inválido.`);
  }

  return id;
}

function makeOwnershipGuard(options: GuardOptions): RequestHandler {
  return async (req, _res, next) => {
    try {
      const usuario = getAuthenticatedUser(req);
      const resourceId = readRequiredId(req, options.source, options.field, options.fieldLabel);

      if (usuario.admin) {
        next();
        return;
      }

      const allowed = await options.canAccess(usuario.id, resourceId);
      if (!allowed) {
        throw new ForbiddenError(`Sem permissão para acessar ${options.resourceName}.`);
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

function makeBodyArrayOwnershipGuard(
  field: string,
  idField: string,
  fieldLabel: string,
  resourceName: string,
  canAccess: (usuarioId: number, resourceId: number) => Promise<boolean>
): RequestHandler {
  return async (req, _res, next) => {
    try {
      const usuario = getAuthenticatedUser(req);

      if (usuario.admin) {
        next();
        return;
      }

      const list = req.body?.[field];
      if (!Array.isArray(list)) {
        throw new BadRequestError(`${fieldLabel} inválido.`);
      }

      const rawIds = list.map((item) => Number(item?.[idField]));
      if (rawIds.some((id) => !Number.isFinite(id))) {
        throw new BadRequestError(`${fieldLabel} inválido.`);
      }

      const ids = [...new Set(rawIds)] as number[];

      if (ids.length === 0) {
        throw new BadRequestError(`${fieldLabel} inválido.`);
      }

      for (const id of ids) {
        const allowed = await canAccess(usuario.id, id);
        if (!allowed) {
          throw new ForbiddenError(`Sem permissão para acessar ${resourceName}.`);
        }
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

async function canAccessTurma(usuarioId: number, turmaId: number) {
  const count = await prisma.turma.count({ where: { id: turmaId, ativo: true, usuarioId } });
  return count > 0;
}

async function canAccessAluno(usuarioId: number, alunoId: number) {
  const count = await prisma.aluno.count({
    where: {
      id: alunoId,
      ativo: true,
      turmas: { some: { ativo: true, turma: { ativo: true, usuarioId } } },
    },
  });
  return count > 0;
}

async function canAccessAtividade(usuarioId: number, atividadeId: number) {
  const count = await prisma.atividade.count({
    where: { id: atividadeId, ativo: true, turma: { ativo: true, usuarioId } },
  });
  return count > 0;
}

async function canAccessAtividadeItem(usuarioId: number, atividadeItemId: number) {
  const count = await prisma.atividadeItem.count({
    where: {
      id: atividadeItemId,
      ativo: true,
      atividade: { ativo: true, turma: { ativo: true, usuarioId } },
    },
  });
  return count > 0;
}

async function canAccessNota(usuarioId: number, notaId: number) {
  const count = await prisma.nota.count({
    where: { id: notaId, ativo: true, atividade: { ativo: true, turma: { ativo: true, usuarioId } } },
  });
  return count > 0;
}

async function canAccessNotaItem(usuarioId: number, notaItemId: number) {
  const count = await prisma.notaItem.count({
    where: {
      id: notaItemId,
      ativo: true,
      nota: { ativo: true, atividade: { ativo: true, turma: { ativo: true, usuarioId } } },
    },
  });
  return count > 0;
}

export function requireTurmaAccessByParam(field = "id") {
  return makeOwnershipGuard({
    source: "params",
    field,
    fieldLabel: "Id da turma",
    resourceName: "turma",
    canAccess: canAccessTurma,
  });
}

export function requireTurmaAccessByBody(field = "turmaId") {
  return makeOwnershipGuard({
    source: "body",
    field,
    fieldLabel: "Id da turma",
    resourceName: "turma",
    canAccess: canAccessTurma,
  });
}

export function requireAlunoAccessByParam(field = "id") {
  return makeOwnershipGuard({
    source: "params",
    field,
    fieldLabel: "Id do aluno",
    resourceName: "aluno",
    canAccess: canAccessAluno,
  });
}

export function requireAtividadeAccessByParam(field = "id") {
  return makeOwnershipGuard({
    source: "params",
    field,
    fieldLabel: "Id da atividade",
    resourceName: "atividade",
    canAccess: canAccessAtividade,
  });
}

export function requireAtividadeAccessByBody(field = "atividadeId") {
  return makeOwnershipGuard({
    source: "body",
    field,
    fieldLabel: "Id da atividade",
    resourceName: "atividade",
    canAccess: canAccessAtividade,
  });
}

export function requireAtividadeAccessByBodyArray(field = "itens", idField = "atividadeId") {
  return makeBodyArrayOwnershipGuard(
    field,
    idField,
    "Lista de itens",
    "atividade",
    canAccessAtividade
  );
}

export function requireAtividadeItemAccessByParam(field = "id") {
  return makeOwnershipGuard({
    source: "params",
    field,
    fieldLabel: "Id do item de atividade",
    resourceName: "item de atividade",
    canAccess: canAccessAtividadeItem,
  });
}

export function requireNotaAccessByParam(field = "id") {
  return makeOwnershipGuard({
    source: "params",
    field,
    fieldLabel: "Id da nota",
    resourceName: "nota",
    canAccess: canAccessNota,
  });
}

export function requireNotaItemAccessByParam(field = "id") {
  return makeOwnershipGuard({
    source: "params",
    field,
    fieldLabel: "Id do item de nota",
    resourceName: "item de nota",
    canAccess: canAccessNotaItem,
  });
}