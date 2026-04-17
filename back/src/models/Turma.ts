import { Aula } from "./Aula";

export interface Turma {
  turma: string;
  sala: string;
  alunos: number;
  aulas: Aula[];
  situacao: string;
  inicio: string;
  fim: string;
  link: string;
}
