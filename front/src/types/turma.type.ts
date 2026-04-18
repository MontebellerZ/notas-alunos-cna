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
