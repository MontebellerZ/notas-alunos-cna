export type TUsuarioCredencial = {
  email: string;
  senha: string;
};

export type TUsuario = {
  id: number;
  email: string;
  nome: string | null;
  admin: boolean;
  foto: string | null;
};

export type TLoginResponse = {
  usuario: TUsuario;
  token: string;
};

export type TPerfilUpdateBody = {
  nome?: string | null;
  foto?: string | null;
  senha?: string;
  email?: string;
};