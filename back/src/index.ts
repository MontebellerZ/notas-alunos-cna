import express from "express";
import envData from "./config/envData";
import routes from "./api/routes";
import cors from "cors";
import "../prisma";
import StoragePaths from "./config/storagePaths";

const app = express();

app.use(cors());

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(StoragePaths.uploadsRoute, express.static(StoragePaths.getUploadsRootDir()));

app.use(routes);

app.listen(envData.apiPort, () => console.info(`Rodando na porta ${envData.apiPort}`));
