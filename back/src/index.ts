import express from "express";
import envData from "./config/envData";
import routes from "./api/routes";
import cors from "cors";
import "../prisma";

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(routes);

app.listen(envData.apiPort, () => console.info(`Rodando na porta ${envData.apiPort}`));
