import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASEURL;
if (!baseURL) throw new Error("VITE_API_BASEURL deve estar configurado no .env");

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

function normalizeAxiosError(err: unknown): never {
  if (axios.isAxiosError(err)) {
    throw err.response?.data ?? err;
  }

  throw err;
}

async function requestData<T>(request: Promise<{ data: T }>): Promise<T> {
  return await request.then((res) => res.data).catch(normalizeAxiosError);
}

export default abstract class BaseService {
  protected static async get<T>(...args: Parameters<typeof api.get>): Promise<T> {
    return await requestData(api.get<T>(...args));
  }

  protected static async post<T>(...args: Parameters<typeof api.post>): Promise<T> {
    return await requestData(api.post<T>(...args));
  }

  protected static async put<T>(...args: Parameters<typeof api.put>): Promise<T> {
    return await requestData(api.put<T>(...args));
  }

  protected static async patch<T>(...args: Parameters<typeof api.patch>): Promise<T> {
    return await requestData(api.patch<T>(...args));
  }

  protected static async delete<T>(...args: Parameters<typeof api.delete>): Promise<T> {
    return await requestData(api.delete<T>(...args));
  }
}
