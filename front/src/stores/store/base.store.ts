import defineStorage from "../defineStorage";
import type { StorageMap } from "../storageMap";

const useStorage = defineStorage();

type TStorageClass<K extends keyof StorageMap = keyof StorageMap> = {
  readonly mapKey: K;
  readonly name: string;
};

export default abstract class BaseStorage {
  protected static localSave<K extends keyof StorageMap>(
    this: TStorageClass<K>,
    value: StorageMap[K],
  ): void {
    useStorage.setItem(this.name, JSON.stringify(value));
  }

  protected static localGet<K extends keyof StorageMap>(
    this: TStorageClass<K>,
  ): StorageMap[K] | undefined {
    const value = useStorage.getItem(this.name);
    if (!value) return;

    try {
      return JSON.parse(value) as StorageMap[K];
    } catch {
      console.warn(`Erro ao fazer parse da chave ${this.name}`);
      return;
    }
  }

  protected static localDelete<K extends keyof StorageMap>(this: TStorageClass<K>) {
    useStorage.removeItem(this.name);
  }
}
