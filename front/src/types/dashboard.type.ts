export type TAtividadeDashboard = {
  id: number;
  capitulo: string;
  avaliadas: number;
  total: number;
  pendentes: number;
};

export type TTurmaDashboard = {
  id: number;
  nome: string;
  situacao: string | null;
  avaliadas: number;
  total: number;
  pendentes: number;
  media: number | null;
  atividades: TAtividadeDashboard[];
};

export type TDashboard = {
  totais: {
    turmas: number;
    alunos: number;
    atividades: number;
    pendentes: number;
  };
  progresso: TTurmaDashboard[];
};
