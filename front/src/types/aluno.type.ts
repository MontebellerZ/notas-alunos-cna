import type { TTurma } from "./turma.type";

export type TAluno = {
  id: number;
  nome: string;
  idade?: number | null;
  ativo: boolean;
};

export type TAlunoCreate = Omit<TAluno, "id" | "ativo">;

export type TAlunoDetalhe = TAluno & {
  turmas: Array<{ turmaId: number; alunoId: number; ativo: boolean; turma: TTurma }>;
};

