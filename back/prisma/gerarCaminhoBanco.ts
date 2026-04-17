import os from "os";
import path from "path";
import fs from "fs";
import envData from "../src/config/envData";

function gerarCaminhoBanco() {
  const appDir = path.join(os.homedir(), "AppData", "Roaming", envData.projectName);

  if (!fs.existsSync(appDir)) {
    fs.mkdirSync(appDir, { recursive: true });
  }

  const dbPath = path.join(appDir, "database.db");

  const dbUrl = `file:${dbPath}`;

  return { dbPath, dbUrl };
}

export default gerarCaminhoBanco;
