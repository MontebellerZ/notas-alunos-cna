/*
  Warnings:

  - Made the column `usuarioId` on table `Turma` required. This step will fail if there are existing NULL values in that column.

*/
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
    "aulas_json" TEXT NOT NULL DEFAULT '[]',
    "usuarioId" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Turma_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Turma" ("ativo", "aulas_json", "fim", "id", "inicio", "nome", "sala", "situacao", "usuarioId") SELECT "ativo", "aulas_json", "fim", "id", "inicio", "nome", "sala", "situacao", "usuarioId" FROM "Turma";
DROP TABLE "Turma";
ALTER TABLE "new_Turma" RENAME TO "Turma";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
