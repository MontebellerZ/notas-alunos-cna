import type { TAula } from "./aula.type";
import type { TAluno } from "./aluno.type";
import type { TAtividade } from "./atividade.type";

export type TTurma = {
  id: number;
  nome: string;
  sala?: string | null;
  situacao?: string | null;
  inicio?: string | null;
  fim?: string | null;
  ativo: boolean;
};

export type TTurmaCreate = Omit<TTurma, "id" | "ativo">;

export type TTurmaDetalhe = TTurma & {
  aulas: TAula[];
  alunos: Array<{ turmaId: number; alunoId: number; ativo: boolean; aluno: TAluno }>;
  atividades: TAtividade[];
};

export type TAgendaTurma = {
  turmaId: number;
  nome: string;
  sala?: string | null;
  situacao?: string | null;
  aulas: TAula[];
};

export type TAtividadeResumida = {
  id: number;
  capitulo: string;
  peso?: number | null;
};

export type TAlunoNotas = {
  id: number;
  nome: string;
  notas: Array<{
    atividadeId: number;
    valor: number | null;
    avaliada: boolean;
    itensPendentes: boolean;
  }>;
};

export type TTurmaNotas = {
  id: number;
  nome: string;
  atividades: TAtividadeResumida[];
  alunos: TAlunoNotas[];
};

