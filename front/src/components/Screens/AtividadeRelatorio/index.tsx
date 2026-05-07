import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useGoBack } from "../../../hooks/useGoBack";
import {
  IoArrowBack,
  IoBarChartOutline,
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
  IoPeopleOutline,
} from "react-icons/io5";
import AtividadeService from "../../../services/atividade.service";
import type { TAtividadeRelatorio } from "../../../types/atividade.type";
import Button from "../../Shared/Button";
import styles from "./styles.module.scss";

function AtividadeRelatorio() {
  const { id } = useParams<{ id: string }>();
  const goBack = useGoBack();
  const atividadeId = Number(id);
  const idValido = Number.isFinite(atividadeId);

  const [relatorio, setRelatorio] = useState<TAtividadeRelatorio | null>(null);
  const [isLoading, setIsLoading] = useState(idValido);
  const [erro, setErro] = useState(!idValido);

  useEffect(() => {
    if (!idValido) return;

    let cancelled = false;

    AtividadeService.getRelatorio(atividadeId)
      .then((data) => {
        if (cancelled) return;
        setRelatorio(data);
        setIsLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setErro(true);
        setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [atividadeId, idValido]);

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.skeleton} />
        <div className={styles.skeletonCard} />
      </div>
    );
  }

  if (erro || !relatorio) {
    return (
      <div className={styles.page}>
        <p className={styles.empty}>Não foi possível carregar o relatório.</p>
      </div>
    );
  }

  const maxCount = Math.max(...relatorio.faixas.map((f) => f.count), 1);
  const notaReferenciaAlta = relatorio.valorTotal * 0.7;
  const notaReferenciaMedia = relatorio.valorTotal * 0.5;

  return (
    <div className={styles.page}>
      {/* Cabeçalho */}
      <div className={styles.header}>
        <Button
          variant="icon"
          title="Voltar"
          onClick={() => goBack(`/main/atividades/${atividadeId}`)}
        >
          <IoArrowBack />
        </Button>
        <div className={styles.headerInfo}>
          <h2 className={styles.title}>{relatorio.capitulo}</h2>
          <span className={styles.subtitulo}>{relatorio.turmaNome} · total {relatorio.valorTotal}</span>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className={styles.cards}>
        <div className={styles.card}>
          <IoPeopleOutline className={styles.cardIcon} />
          <span className={styles.cardValue}>{relatorio.total}</span>
          <span className={styles.cardLabel}>Total de alunos</span>
        </div>
        <div className={`${styles.card} ${styles.cardOk}`}>
          <IoCheckmarkCircleOutline className={styles.cardIcon} />
          <span className={styles.cardValue}>{relatorio.avaliados}</span>
          <span className={styles.cardLabel}>Avaliados</span>
        </div>
        <div className={`${styles.card} ${relatorio.pendentes > 0 ? styles.cardAlert : styles.cardOk}`}>
          {relatorio.pendentes > 0
            ? <IoAlertCircleOutline className={styles.cardIcon} />
            : <IoCheckmarkCircleOutline className={styles.cardIcon} />}
          <span className={styles.cardValue}>{relatorio.pendentes}</span>
          <span className={styles.cardLabel}>Pendentes</span>
        </div>
      </div>

      {relatorio.avaliados === 0 ? (
        <section className={styles.section}>
          <p className={styles.empty}>Nenhum aluno avaliado ainda.</p>
        </section>
      ) : (
        <>
          {/* Estatísticas */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <IoBarChartOutline className={styles.sectionIcon} />
              Estatísticas
            </h3>
            <div className={styles.estatsList}>
              <div className={styles.estat}>
                <span className={styles.estatLabel}>Média</span>
                <span className={`${styles.estatValor} ${
                  relatorio.media !== null && relatorio.media >= notaReferenciaAlta
                    ? styles.estatOk
                    : relatorio.media !== null && relatorio.media >= notaReferenciaMedia
                    ? styles.estatMedio
                    : styles.estatBaixo
                }`}>
                  {relatorio.media !== null ? relatorio.media.toFixed(2) : "—"}
                </span>
              </div>
              <div className={styles.estat}>
                <span className={styles.estatLabel}>Maior nota</span>
                <span className={styles.estatValor}>{relatorio.max !== null ? relatorio.max.toFixed(2) : "—"}</span>
              </div>
              <div className={styles.estat}>
                <span className={styles.estatLabel}>Menor nota</span>
                <span className={styles.estatValor}>{relatorio.min !== null ? relatorio.min.toFixed(2) : "—"}</span>
              </div>
            </div>
          </section>

          {/* Distribuição */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <IoBarChartOutline className={styles.sectionIcon} />
              Distribuição de notas
            </h3>
            <div className={styles.faixasList}>
              {relatorio.faixas.map((faixa) => {
                const pct = Math.round((faixa.count / maxCount) * 100);
                return (
                  <div key={faixa.label} className={styles.faixaRow}>
                    <span className={styles.faixaLabel}>{faixa.label}</span>
                    <div className={styles.faixaBarWrap}>
                      <div
                        className={styles.faixaBar}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className={styles.faixaCount}>{faixa.count}</span>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default AtividadeRelatorio;
