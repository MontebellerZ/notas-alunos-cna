import BaseStorage from "./base.store";
import type { StorageMap } from "../storageMap";

type TPreferencias = StorageMap["PreferenciasStorage"];

export default class PreferenciasStorage extends BaseStorage {
  static readonly mapKey = "PreferenciasStorage";

  static get(): TPreferencias {
    return this.localGet() ?? { avaliacaoAutoSalvar: false };
  }

  static save(prefs: TPreferencias) {
    return this.localSave(prefs);
  }

  static patch(partial: Partial<TPreferencias>) {
    this.save({ ...this.get(), ...partial });
  }
}
