import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import gerarCaminhoBanco from "./gerarCaminhoBanco";

const { dbUrl } = gerarCaminhoBanco();

const adapter = new PrismaBetterSqlite3({ url: dbUrl });

const prisma = new PrismaClient({ adapter });

export default prisma;
