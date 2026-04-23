import type { TUsuario } from "../../types/usuario.type";
import BaseStorage from "./base.store";

export default class UsuarioStorage extends BaseStorage {
  static readonly mapKey = "UsuarioStorage";
  static readonly changedEvent = "usuario-sessao-atualizado";

  static get(): TUsuario | undefined {
    return this.localGet();
  }

  static save(usuario: TUsuario) {
    this.localSave(usuario);
    window.dispatchEvent(new Event(this.changedEvent));
  }

  static delete() {
    this.localDelete();
    window.dispatchEvent(new Event(this.changedEvent));
  }
}
