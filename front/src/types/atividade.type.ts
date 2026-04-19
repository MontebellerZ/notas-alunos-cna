import type { TAtividadeItem } from "./atividadeItem.type";

export type TAtividade = {
  id: number;
  capitulo: string;
  peso?: number | null;
  turmaId: number;
  ativo: boolean;
};

export type TAtividadeCreate = Omit<TAtividade, "id" | "ativo">;

export type TAtividadeDetalhe = TAtividade & {
  turma: { id: number; nome: string };
  atividadeItens: TAtividadeItem[];
};

export type TNotaItem = {
  id: number;
  valor: number | null;
  notaId: number;
  atividadeItemId: number;
};

export type TNotaAvaliacao = {
  id: number;
  alunoId: number;
  atividadeId: number;
  valor: number | null;
  notaItens: TNotaItem[];
};

export type TAlunoAvaliacao = {
  id: number;
  nome: string;
};

export type TAvaliacaoData = TAtividade & {
  turma: {
    id: number;
    nome: string;
    alunos: { aluno: TAlunoAvaliacao }[];
  };
  atividadeItens: TAtividadeItem[];
  notas: TNotaAvaliacao[];
};

export type TAtividadeRelatorio = {
  atividadeId: number;
  capitulo: string;
  turmaId: number;
  turmaNome: string;
  total: number;
  avaliados: number;
  pendentes: number;
  media: number | null;
  min: number | null;
  max: number | null;
  faixas: { label: string; count: number }[];
};
