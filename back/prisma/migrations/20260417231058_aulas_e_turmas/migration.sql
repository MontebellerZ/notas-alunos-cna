-- CreateTable
CREATE TABLE "Turma" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "sala" TEXT NOT NULL,
    "alunos" INTEGER NOT NULL,
    "situacao" TEXT NOT NULL,
    "inicio" TEXT NOT NULL,
    "fim" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "Aula" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dia" TEXT NOT NULL,
    "horario" TEXT NOT NULL,
    "turmaId" INTEGER NOT NULL,
    CONSTRAINT "Aula_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
