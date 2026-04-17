import { CnaApi } from "./CnaApi";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { HttpError } from "./errors";

const app = express();
const client = new CnaApi();

app.use(express.json());
app.use(express.urlencoded());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.post("/login", async (req, res) => {
  const { email, senha } = req.body;
  await client.login(email, senha);
  res.send({ email });
});

app.get("/sincronizar", async (_, res) => {
  const data = await client.buscarTurmas();
  res.send(data);
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) {
    res.status(err.code).send(err.message);
    return;
  }

  console.error(err);
  res.status(500).send("Erro inesperado");
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Running on http://localhost:${PORT}`);
});
