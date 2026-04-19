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

export type TAlunoHistoricoAtividade = {
  atividadeId: number;
  capitulo: string;
  avaliada: boolean;
  valor: number | null;
};

export type TAlunoHistoricoTurma = {
  turmaId: number;
  turmaNome: string;
  atividades: TAlunoHistoricoAtividade[];
  media: number | null;
};

