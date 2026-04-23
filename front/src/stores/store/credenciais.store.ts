import type { TUsuarioCredencial } from "../../types/usuario.type";
import BaseStorage from "./base.store";

export default class CredenciaisStorage extends BaseStorage {
  static readonly mapKey = "CredenciaisStorage";

  static get() {
    return this.localGet();
  }

  static save(usuario: TUsuarioCredencial) {
    return this.localSave(usuario);
  }

  static delete() {
    return this.localDelete();
  }
}
