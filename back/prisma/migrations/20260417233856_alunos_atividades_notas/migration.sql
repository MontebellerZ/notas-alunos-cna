/*
  Warnings:

  - You are about to drop the column `alunos` on the `Turma` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Aluno" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "idade" INTEGER,
    "turmaId" INTEGER NOT NULL,
    CONSTRAINT "Aluno_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Atividade" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "capitulo" TEXT NOT NULL,
    "peso" REAL,
    "turmaId" INTEGER NOT NULL,
    CONSTRAINT "Atividade_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AtividadeItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "peso" REAL NOT NULL DEFAULT 1,
    "atividadeId" INTEGER NOT NULL,
    CONSTRAINT "AtividadeItem_atividadeId_fkey" FOREIGN KEY ("atividadeId") REFERENCES "Atividade" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Nota" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "valor" REAL,
    "alunoId" INTEGER NOT NULL,
    "atividadeId" INTEGER NOT NULL,
    CONSTRAINT "Nota_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Nota_atividadeId_fkey" FOREIGN KEY ("atividadeId") REFERENCES "Atividade" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NotaItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "valor" REAL,
    "notaId" INTEGER NOT NULL,
    "atividadeItemId" INTEGER NOT NULL,
    CONSTRAINT "NotaItem_notaId_fkey" FOREIGN KEY ("notaId") REFERENCES "Nota" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "NotaItem_atividadeItemId_fkey" FOREIGN KEY ("atividadeItemId") REFERENCES "AtividadeItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Turma" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "sala" TEXT,
    "situacao" TEXT,
    "inicio" TEXT,
    "fim" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_Turma" ("ativo", "fim", "id", "inicio", "nome", "sala", "situacao") SELECT "ativo", "fim", "id", "inicio", "nome", "sala", "situacao" FROM "Turma";
DROP TABLE "Turma";
ALTER TABLE "new_Turma" RENAME TO "Turma";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
