import BaseStorage from "./base.store";
import type { StorageMap } from "../storageMap";

type TPreferencias = StorageMap["PreferenciasStorage"];

const DEFAULT_PREFERENCIAS: TPreferencias = {
  avaliacaoAutoSalvar: false,
  turmaDetalheSecoesAbertas: {
    alunos: true,
    atividades: true,
  },
};

export default class PreferenciasStorage extends BaseStorage {
  static readonly mapKey = "PreferenciasStorage";

  static get(): TPreferencias {
    const preferenciasSalvas = this.localGet();

    if (!preferenciasSalvas) return DEFAULT_PREFERENCIAS;

    return {
      ...DEFAULT_PREFERENCIAS,
      ...preferenciasSalvas,
      turmaDetalheSecoesAbertas: {
        ...DEFAULT_PREFERENCIAS.turmaDetalheSecoesAbertas,
        ...preferenciasSalvas.turmaDetalheSecoesAbertas,
      },
    };
  }

  static save(prefs: TPreferencias) {
    return this.localSave(prefs);
  }

  static patch(partial: Partial<TPreferencias>) {
    this.save({ ...this.get(), ...partial });
  }
}
