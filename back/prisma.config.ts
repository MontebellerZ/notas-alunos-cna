import { defineConfig } from "prisma/config";
import gerarCaminhoBanco from "./prisma/gerarCaminhoBanco";

const { dbUrl } = gerarCaminhoBanco();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: dbUrl,
  },
});
