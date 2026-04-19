-- CreateTable
CREATE TABLE "Usuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "nome" TEXT,
    "admin" BOOLEAN NOT NULL DEFAULT false
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
    "aulas_json" TEXT NOT NULL DEFAULT '[]',
    "usuarioId" INTEGER,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Turma_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Turma" ("ativo", "aulas_json", "fim", "id", "inicio", "nome", "sala", "situacao") SELECT "ativo", "aulas_json", "fim", "id", "inicio", "nome", "sala", "situacao" FROM "Turma";
DROP TABLE "Turma";
ALTER TABLE "new_Turma" RENAME TO "Turma";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");
