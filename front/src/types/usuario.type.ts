export type TUsuario = {
  email: string;
  senha: string;
};

export type TUsuarioDb = {
  id: number;
  email: string;
  nome: string | null;
  admin: boolean;
};

export type TLoginResponse = {
  usuario: TUsuarioDb;
  token: string;
};
