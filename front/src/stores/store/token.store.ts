import BaseStorage from "./base.store";

export default class TokenStorage extends BaseStorage {
  static readonly mapKey = "TokenStorage";

  static get(): string | undefined {
    return this.localGet();
  }

  static save(token: string) {
    return this.localSave(token);
  }

  static delete() {
    return this.localDelete();
  }
}
