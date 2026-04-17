import BaseStorage from "./base.store";

export default class TabelaStorage extends BaseStorage {
  static readonly mapKey = "TabelaStorage";

  static get() {
    return this.localGet() || {};
  }

  static save(value: Record<string, string[]>) {
    return this.localSave(value);
  }

  static getByTabela(tabela: string) {
    const dados = this.get();
    return dados[tabela];
  }

  static saveByTabela(tabela: string, colunas: string[]) {
    const dados = this.get();
    dados[tabela] = colunas;
    return this.save(dados);
  }
}
