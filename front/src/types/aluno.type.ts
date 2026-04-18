export type TAluno = {
  id: number;
  nome: string;
  idade?: number | null;
  ativo: boolean;
};

export type TAlunoCreate = Omit<TAluno, "id" | "ativo">;
