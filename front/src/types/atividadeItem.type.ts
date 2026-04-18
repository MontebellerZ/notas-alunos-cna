export type TAtividadeItem = {
  id: number;
  nome: string;
  peso: number;
  atividadeId: number;
  ativo: boolean;
};

export type TAtividadeItemCreate = {
  nome: string;
  peso?: number;
  atividadeId: number;
};
