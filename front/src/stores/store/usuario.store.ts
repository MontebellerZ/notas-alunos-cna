import type { TUsuario } from "../../types/usuario.type";
import BaseStorage from "./base.store";

export default class UsuarioStorage extends BaseStorage {
  static readonly mapKey = "UsuarioStorage";

  static get() {
    return this.localGet();
  }

  static save(usuario: TUsuario) {
    return this.localSave(usuario);
  }

  static delete() {
    return this.localDelete();
  }
}
