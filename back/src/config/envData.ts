import "dotenv/config";

const getEnv = {
  CNA_URL: process.env.CNA_URL,
  API_PORT: process.env.API_PORT,
  WEB_PORT: process.env.WEB_PORT,
  PROJECT_NAME: process.env.PROJECT_NAME,
};

const naoEncontrados = Object.entries(getEnv)
  .filter(([_, v]) => !v)
  .map(([k, _]) => k);

if (naoEncontrados.length) {
  throw new Error(`Valores não definidos no .env: ${naoEncontrados.join(", ")}`);
}

const envData = {
  cnaUrl: getEnv.CNA_URL!,
  apiPort: getEnv.API_PORT!,
  webPort: getEnv.WEB_PORT!,
  projectName: getEnv.PROJECT_NAME!,
};

export default envData;
