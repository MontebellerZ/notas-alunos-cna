import type { TUsuario } from "../types/usuario.type";

export type StorageMap = {
  UsuarioStorage: TUsuario;
  TabelaStorage: Record<string, string[]>;
};
