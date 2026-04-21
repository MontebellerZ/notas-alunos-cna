import type { UserCtx } from "../middleware/auth.middleware";

function ownerFilter(ctx?: UserCtx) {
  return ctx && !ctx.isAdmin ? { usuarioId: ctx.usuarioId } : {};
}

export function activeTurmaWhere(ctx?: UserCtx) {
  return { ativo: true, ...ownerFilter(ctx) };
}

export function activeAlunoWhere(ctx?: UserCtx) {
  return ctx && !ctx.isAdmin
    ? {
        ativo: true,
        turmas: {
          some: {
            ativo: true,
            turma: activeTurmaWhere(ctx),
          },
        },
      }
    : { ativo: true };
}

export function activeAtividadeWhere(ctx?: UserCtx) {
  return {
    ativo: true,
    turma: activeTurmaWhere(ctx),
  };
}

export function activeAtividadeItemWhere(ctx?: UserCtx) {
  return {
    ativo: true,
    atividade: activeAtividadeWhere(ctx),
  };
}

export function activeNotaWhere(ctx?: UserCtx) {
  return {
    ativo: true,
    aluno: { ativo: true },
    atividade: activeAtividadeWhere(ctx),
  };
}

export function activeNotaItemWhere(ctx?: UserCtx) {
  return {
    ativo: true,
    nota: activeNotaWhere(ctx),
    atividadeItem: activeAtividadeItemWhere(ctx),
  };
}