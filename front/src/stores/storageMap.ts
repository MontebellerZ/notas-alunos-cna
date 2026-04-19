import type { TUsuario } from "../types/usuario.type";

export type StorageMap = {
  UsuarioStorage: TUsuario;
  TokenStorage: string;
  TabelaStorage: Record<string, string[]>;
};
