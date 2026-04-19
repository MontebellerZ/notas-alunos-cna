import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  IoSchoolOutline,
  IoPeopleOutline,
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
  IoBookOutline,
  IoFilterOutline,
} from "react-icons/io5";
import DashboardService from "../../../services/dashboard.service";
import type { TDashboard, TTurmaDashboard } from "../../../types/dashboard.type";
import styles from "./styles.module.scss";

function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<TDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apenasEmAndamento, setApenasEmAndamento] = useState(true);

  useEffect(() => {
    let cancelled = false;
    DashboardService.getDashboard()
      .then((d) => { if (!cancelled) setData(d); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const progresso: TTurmaDashboard[] = data
    ? apenasEmAndamento
      ? data.progresso.filter((t) => t.situacao === "Em andamento")
      : data.progresso
    : [];

  // Turmas ordenadas por pendentes desc (para "com mais pendências")
  const turmasRanking: TTurmaDashboard[] = [...progresso]
    .sort((a, b) => b.pendentes - a.pendentes)
    .filter((t) => t.pendentes > 0);

  // Atividades pendentes: da turma mais pendente para menos
  const atividadesPendentes = progresso
    .flatMap((t) =>
      t.atividades
        .filter((a) => a.pendentes > 0)
        .map((a) => ({ ...a, turmaId: t.id, turmaNome: t.nome })),
    )
    .sort((a, b) => b.pendentes - a.pendentes);

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.skeletonCards} />
        <div className={styles.skeletonSection} />
        <div className={styles.skeletonSection} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.page}>
        <p className={styles.empty}>Não foi possível carregar o dashboard.</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* ── Cards de resumo ──────────────────────────────── */}
      <div className={styles.cards}>
        <div className={styles.card}>
          <IoSchoolOutline className={styles.cardIcon} />
          <span className={styles.cardValue}>{data.totais.turmas}</span>
          <span className={styles.cardLabel}>Turmas ativas</span>
        </div>
        <div className={styles.card}>
          <IoPeopleOutline className={styles.cardIcon} />
          <span className={styles.cardValue}>{data.totais.alunos}</span>
          <span className={styles.cardLabel}>Alunos</span>
        </div>
        <div className={styles.card}>
          <IoBookOutline className={styles.cardIcon} />
          <span className={styles.cardValue}>{data.totais.atividades}</span>
          <span className={styles.cardLabel}>Atividades</span>
        </div>
        <div className={`${styles.card} ${data.totais.pendentes > 0 ? styles.cardAlert : styles.cardOk}`}>
          {data.totais.pendentes > 0
            ? <IoAlertCircleOutline className={styles.cardIcon} />
            : <IoCheckmarkCircleOutline className={styles.cardIcon} />}
          <span className={styles.cardValue}>{data.totais.pendentes}</span>
          <span className={styles.cardLabel}>Avaliações pendentes</span>
        </div>
      </div>

      {/* ── Filtro de situação ────────────────────────────── */}
      <div className={styles.filtroBar}>
        <IoFilterOutline className={styles.filtroIcon} />
        <span className={styles.filtroLabel}>Exibir turmas:</span>
        <button
          className={`${styles.filtroBt} ${apenasEmAndamento ? styles.filtroBtAtivo : ""}`}
          onClick={() => setApenasEmAndamento(true)}
        >
          Em andamento
        </button>
        <button
          className={`${styles.filtroBt} ${!apenasEmAndamento ? styles.filtroBtAtivo : ""}`}
          onClick={() => setApenasEmAndamento(false)}
        >
          Todas
        </button>
      </div>

      <div className={styles.grid}>
        {/* ── Avaliações pendentes ──────────────────────── */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <IoAlertCircleOutline className={styles.sectionIcon} />
            Avaliações pendentes
          </h3>
          {atividadesPendentes.length === 0 ? (
            <p className={styles.emptySection}>
              <IoCheckmarkCircleOutline className={styles.emptyIcon} /> Tudo avaliado!
            </p>
          ) : (
            <ul className={styles.pendList}>
              {atividadesPendentes.map((atv) => (
                <li
                  key={`${atv.turmaId}-${atv.id}`}
                  className={styles.pendItem}
                  onClick={() => navigate(`/main/atividades/${atv.id}/avaliacao`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && navigate(`/main/atividades/${atv.id}/avaliacao`)}
                >
                  <div className={styles.pendInfo}>
                    <span className={styles.pendAtv}>{atv.capitulo}</span>
                    <span className={styles.pendTurma}>{atv.turmaNome}</span>
                  </div>
                  <span className={styles.pendBadge}>{atv.pendentes} pendente{atv.pendentes !== 1 ? "s" : ""}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ── Turmas com mais pendências ────────────────── */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <IoSchoolOutline className={styles.sectionIcon} />
            Turmas com mais pendências
          </h3>
          {turmasRanking.length === 0 ? (
            <p className={styles.emptySection}>
              <IoCheckmarkCircleOutline className={styles.emptyIcon} /> Nenhuma pendência!
            </p>
          ) : (
            <ul className={styles.rankList}>
              {turmasRanking.map((t) => (
                <li key={t.id} className={styles.rankItem} onClick={() => navigate(`/main/turmas/${t.id}/notas`)} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && navigate(`/main/turmas/${t.id}/notas`)}>
                  <span className={styles.rankNome}>{t.nome}</span>
                  <span className={styles.rankPendentes}>{t.pendentes} pendente{t.pendentes !== 1 ? "s" : ""}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* ── Progresso por turma ───────────────────────────── */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <IoCheckmarkCircleOutline className={styles.sectionIcon} />
          Progresso por turma
        </h3>
        {progresso.length === 0 ? (
          <p className={styles.emptySection}>Nenhuma turma{apenasEmAndamento ? " em andamento" : ""} cadastrada.</p>
        ) : (
          <ul className={styles.progressList}>
            {progresso.map((t) => {
              const pct = t.total > 0 ? Math.round((t.avaliadas / t.total) * 100) : 0;
              return (
                <li key={t.id} className={styles.progressItem} onClick={() => navigate(`/main/turmas/${t.id}/notas`)} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && navigate(`/main/turmas/${t.id}/notas`)}>
                  <div className={styles.progressHeader}>
                    <span className={styles.progressNome}>{t.nome}</span>
                    <div className={styles.progressMeta}>
                      {t.media !== null && (
                        <span className={styles.progressMedia}>Média: {t.media.toFixed(1)}</span>
                      )}
                      <span className={styles.progressPct}>{pct}%</span>
                    </div>
                  </div>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${pct}%` }} />
                  </div>
                  <span className={styles.progressInfo}>{t.avaliadas} de {t.total} avaliações</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

export default Dashboard;

