-- Adiciona coluna aulas_json na tabela Turma
ALTER TABLE "Turma" ADD COLUMN "aulas_json" TEXT NOT NULL DEFAULT '[]';

-- Migra os dados existentes da tabela Aula para JSON dentro de Turma
UPDATE "Turma"
SET "aulas_json" = COALESCE(
  (
    SELECT json_group_array(
      json_object('id', CAST(a."id" AS TEXT), 'dia', a."dia", 'horario', a."horario")
    )
    FROM "Aula" a
    WHERE a."turmaId" = "Turma"."id" AND a."ativo" = 1
  ),
  '[]'
);

-- Remove a tabela Aula
DROP TABLE "Aula";
