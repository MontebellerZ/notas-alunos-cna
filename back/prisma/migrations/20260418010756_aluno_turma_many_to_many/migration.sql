/*
  Warnings:

  - You are about to drop the column `turmaId` on the `Aluno` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "TurmaAluno" (
    "turmaId" INTEGER NOT NULL,
    "alunoId" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY ("turmaId", "alunoId"),
    CONSTRAINT "TurmaAluno_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TurmaAluno_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Aluno" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "idade" INTEGER,
    "ativo" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_Aluno" ("ativo", "id", "idade", "nome") SELECT "ativo", "id", "idade", "nome" FROM "Aluno";
DROP TABLE "Aluno";
ALTER TABLE "new_Aluno" RENAME TO "Aluno";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
