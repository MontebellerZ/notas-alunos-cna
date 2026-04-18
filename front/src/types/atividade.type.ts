export type TAtividade = {
  id: number;
  capitulo: string;
  peso?: number | null;
  turmaId: number;
  ativo: boolean;
};

export type TAtividadeCreate = Omit<TAtividade, "id" | "ativo">;
