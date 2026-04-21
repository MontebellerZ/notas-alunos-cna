import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useGoBack } from "../../../hooks/useGoBack";
import { toast } from "react-toastify";
import {
  IoArrowBackOutline,
  IoCheckmarkCircleOutline,
  IoEllipseOutline,
  IoAlertCircleOutline,
  IoOpenOutline,
} from "react-icons/io5";
import TurmaService from "../../../services/turma.service";
import type { TTurmaNotas } from "../../../types/turma.type";
import Button from "../../Shared/Button";
import styles from "./styles.module.scss";

// ── helpers ──────────────────────────────────────────────────────────────────

function valorDisplay(valor: number | null): string {
  if (valor === null) return "—";
  return String(Math.round(valor * 100) / 100);
}

function cellClass(avaliada: boolean, valor: number | null, itensPendentes: boolean): string {
  if (!avaliada) return styles.cellPendente;
  if (itensPendentes) return styles.cellNotaPendente;
  if (valor === null || valor === 0) return styles.cellZero;
  return styles.cellOk;
}

function pendentesCount(notas: TTurmaNotas["alunos"][number]["notas"]): number {
  return notas.filter((n) => !n.avaliada || n.itensPendentes).length;
}

// ── componente ────────────────────────────────────────────────────────────────

export default function TurmaNotas() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const goBack = useGoBack();
  const turmaId = Number(id);

  const [data, setData] = useState<TTurmaNotas | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!Number.isFinite(turmaId)) {
      navigate("/main/turmas");
      return;
    }
    let cancelled = false;
    TurmaService.getTurmaNotas(turmaId)
      .then((res) => {
        if (cancelled) return;
        setData(res);
        setIsLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        toast.error(String(err?.message ?? err));
        setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [turmaId, navigate]);

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.skeletonHeader} />
        <div className={styles.skeletonCard} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.page}>
        <p className={styles.empty}>Turma não encontrada.</p>
        <Button onClick={() => goBack("/main/turmas")}>
          <IoArrowBackOutline /> Voltar
        </Button>
      </div>
    );
  }

  const totalAtividades = data.atividades.length;
  const totalAlunos = data.alunos.length;

  // total de pares aluno × atividade pendentes
  const totalPendentes = data.alunos.reduce((acc, aluno) => acc + pendentesCount(aluno.notas), 0);
  const totalPossivel = totalAlunos * totalAtividades;
  const totalAvaliadas = totalPossivel - totalPendentes;

  return (
    <div className={styles.page}>
      {/* ── Header ──────────────────────────────────────── */}
      <div className={styles.header}>
        <Button variant="icon" title="Voltar" onClick={() => goBack(`/main/turmas/${turmaId}`)}>
          <IoArrowBackOutline />
        </Button>
        <div className={styles.headerInfo}>
          <h2 className={styles.title}>{data.nome}</h2>
          <span className={styles.subtitulo}>Acompanhamento de notas</span>
        </div>
      </div>

      {/* ── Chips de resumo ─────────────────────────────── */}
      {totalAtividades > 0 && (
        <div className={styles.chips}>
          <span className={styles.chip}>
            <IoCheckmarkCircleOutline className={styles.chipIconOk} />
            {totalAvaliadas} avaliada{totalAvaliadas !== 1 ? "s" : ""}
          </span>
          <span className={`${styles.chip} ${totalPendentes > 0 ? styles.chipWarn : ""}`}>
            <IoAlertCircleOutline className={styles.chipIconWarn} />
            {totalPendentes} pendente{totalPendentes !== 1 ? "s" : ""}
          </span>
          <span className={styles.chip}>
            <IoEllipseOutline className={styles.chipIconNeutral} />
            {totalAlunos} aluno{totalAlunos !== 1 ? "s" : ""}
            {" · "}
            {totalAtividades} atividade{totalAtividades !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* ── Tabela ──────────────────────────────────────── */}
      {totalAtividades === 0 || totalAlunos === 0 ? (
        <p className={styles.empty}>
          {totalAtividades === 0
            ? "Nenhuma atividade cadastrada nesta turma."
            : "Nenhum aluno matriculado nesta turma."}
        </p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={`${styles.th} ${styles.thAluno}`}>Aluno</th>
                {data.atividades.map((atv) => (
                  <th key={atv.id} className={`${styles.th} ${styles.thAtv}`}>
                    <button
                      className={styles.atvLink}
                      title={`Avaliar: ${atv.capitulo}`}
                      onClick={() => navigate(`/main/atividades/${atv.id}/avaliacao`)}
                    >
                      {atv.capitulo}
                      {atv.peso != null && <span className={styles.pesoTag}>p{atv.peso}</span>}
                      <IoOpenOutline className={styles.atvIcon} />
                    </button>
                  </th>
                ))}
                <th className={`${styles.th} ${styles.thPendentes}`}>Pendentes</th>
              </tr>
            </thead>
            <tbody>
              {data.alunos.map((aluno) => {
                const pendentes = pendentesCount(aluno.notas);
                return (
                  <tr key={aluno.id} className={styles.tr}>
                    <td
                      className={`${styles.td} ${styles.tdAluno}`}
                      onClick={() => navigate(`/main/alunos/${aluno.id}`)}
                      title="Ver perfil do aluno"
                    >
                      {aluno.nome}
                    </td>
                    {aluno.notas.map((nota) => (
                      <td
                        key={nota.atividadeId}
                        className={`${styles.td} ${cellClass(nota.avaliada, nota.valor, nota.itensPendentes)}`}
                        title={
                          !nota.avaliada
                            ? "Pendente"
                            : nota.itensPendentes
                              ? `Nota: ${valorDisplay(nota.valor)} — existem itens pendentes de avaliação`
                              : `Nota: ${valorDisplay(nota.valor)}`
                        }
                      >
                        {nota.avaliada ? (
                          <span className={styles.cellValorWrapper}>
                            {valorDisplay(nota.valor)}
                            {nota.itensPendentes && (
                              <IoAlertCircleOutline
                                className={styles.cellAlertIcon}
                                title="Existem itens pendentes de avaliação"
                              />
                            )}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                    ))}
                    <td
                      className={`${styles.td} ${styles.tdPendentes} ${pendentes > 0 ? styles.tdPendentesWarn : styles.tdPendentesOk}`}
                    >
                      {pendentes > 0
                        ? `${pendentes} pendente${pendentes !== 1 ? "s" : ""}`
                        : "✓ ok"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Legenda ─────────────────────────────────────── */}
      {totalAtividades > 0 && totalAlunos > 0 && (
        <div className={styles.legenda}>
          <span className={`${styles.legendaItem} ${styles.legendaOk}`}>Com nota</span>
          <span className={`${styles.legendaItem} ${styles.legendaZero}`}>Nota zero</span>
          <span className={`${styles.legendaItem} ${styles.legendaPendente}`}>Pendente</span>
          <span className={styles.legendaHint}>
            Clique no cabeçalho da atividade para abrir a avaliação.
          </span>
        </div>
      )}
    </div>
  );
}
