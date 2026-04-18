-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Aluno" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "idade" INTEGER,
    "turmaId" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Aluno_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Aluno" ("id", "idade", "nome", "turmaId") SELECT "id", "idade", "nome", "turmaId" FROM "Aluno";
DROP TABLE "Aluno";
ALTER TABLE "new_Aluno" RENAME TO "Aluno";
CREATE TABLE "new_Atividade" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "capitulo" TEXT NOT NULL,
    "peso" REAL,
    "turmaId" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Atividade_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Atividade" ("capitulo", "id", "peso", "turmaId") SELECT "capitulo", "id", "peso", "turmaId" FROM "Atividade";
DROP TABLE "Atividade";
ALTER TABLE "new_Atividade" RENAME TO "Atividade";
CREATE TABLE "new_AtividadeItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "peso" REAL NOT NULL DEFAULT 1,
    "atividadeId" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "AtividadeItem_atividadeId_fkey" FOREIGN KEY ("atividadeId") REFERENCES "Atividade" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_AtividadeItem" ("atividadeId", "id", "nome", "peso") SELECT "atividadeId", "id", "nome", "peso" FROM "AtividadeItem";
DROP TABLE "AtividadeItem";
ALTER TABLE "new_AtividadeItem" RENAME TO "AtividadeItem";
CREATE TABLE "new_Aula" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dia" TEXT NOT NULL,
    "horario" TEXT NOT NULL,
    "turmaId" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Aula_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Aula" ("dia", "horario", "id", "turmaId") SELECT "dia", "horario", "id", "turmaId" FROM "Aula";
DROP TABLE "Aula";
ALTER TABLE "new_Aula" RENAME TO "Aula";
CREATE TABLE "new_Nota" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "valor" REAL,
    "alunoId" INTEGER NOT NULL,
    "atividadeId" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Nota_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Nota_atividadeId_fkey" FOREIGN KEY ("atividadeId") REFERENCES "Atividade" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Nota" ("alunoId", "atividadeId", "id", "valor") SELECT "alunoId", "atividadeId", "id", "valor" FROM "Nota";
DROP TABLE "Nota";
ALTER TABLE "new_Nota" RENAME TO "Nota";
CREATE TABLE "new_NotaItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "valor" REAL,
    "notaId" INTEGER NOT NULL,
    "atividadeItemId" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "NotaItem_notaId_fkey" FOREIGN KEY ("notaId") REFERENCES "Nota" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "NotaItem_atividadeItemId_fkey" FOREIGN KEY ("atividadeItemId") REFERENCES "AtividadeItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_NotaItem" ("atividadeItemId", "id", "notaId", "valor") SELECT "atividadeItemId", "id", "notaId", "valor" FROM "NotaItem";
DROP TABLE "NotaItem";
ALTER TABLE "new_NotaItem" RENAME TO "NotaItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
