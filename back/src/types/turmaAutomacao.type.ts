import { TAulaAutomacao } from "./aulaAutomacao.type";

export type TTurmaAutomacao = {
  nome: string;
  sala: string;
  alunos: number;
  situacao: string;
  inicio: string;
  fim: string;
  aulas: TAulaAutomacao[];
  link: string;
};
