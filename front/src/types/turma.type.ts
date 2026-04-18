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
