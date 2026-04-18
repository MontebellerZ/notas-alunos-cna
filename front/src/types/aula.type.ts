export type TAula = {
  id: string;
  dia: string;
  horario: string;
};

export type TAulaCreate = Omit<TAula, "id">;

