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
