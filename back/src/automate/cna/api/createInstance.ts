import { AxiosInstance, create } from "axios";
import envData from "../../../config/envData";
import { CookieJar } from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";

function createInstance() {
  const instance = create({ baseURL: envData.cnaUrl, withCredentials: true });

  const api: AxiosInstance = wrapper(instance as any);

  (api.defaults as any).jar = new CookieJar();

  return api;
}

export default createInstance;
