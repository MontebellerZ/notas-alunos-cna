import { TAulaAutomacao } from "./aulaAutomacao.type";

export type TTurmaAutomacao = {
  nome: string;
  sala: string;
  situacao: string;
  inicio: string;
  fim: string;
  aulas: TAulaAutomacao[];
  link: string;
};
