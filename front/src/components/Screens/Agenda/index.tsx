import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { IoCalendarOutline, IoSchoolOutline, IoTimeOutline } from "react-icons/io5";
import TurmaService from "../../../services/turma.service";
import type { TAgendaTurma } from "../../../types/turma.type";
import styles from "./styles.module.scss";

const DIAS_SEMANA = [
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
  "Domingo",
] as const;

type DiaSemana = (typeof DIAS_SEMANA)[number];

const DIAS_ABREV: Record<DiaSemana, string> = {
  Segunda: "Seg",
  Terça: "Ter",
  Quarta: "Qua",
  Quinta: "Qui",
  Sexta: "Sex",
  Sábado: "Sáb",
  Domingo: "Dom",
};

/** Retorna o nome do dia de hoje no formato usado pelo sistema */
function diaDeHoje(): string {
  const map: Record<number, DiaSemana> = {
    1: "Segunda",
    2: "Terça",
    3: "Quarta",
    4: "Quinta",
    5: "Sexta",
    6: "Sábado",
    0: "Domingo",
  };
  return map[new Date().getDay()] ?? "";
}

/** Normaliza variações de nome de dia para o formato canônico */
const DIA_ALIAS: Record<string, DiaSemana> = {
  "segunda-feira": "Segunda",
  "segunda": "Segunda",
  "terça-feira": "Terça",
  "terca-feira": "Terça",
  "terça": "Terça",
  "terca": "Terça",
  "quarta-feira": "Quarta",
  "quarta": "Quarta",
  "quinta-feira": "Quinta",
  "quinta": "Quinta",
  "sexta-feira": "Sexta",
  "sexta": "Sexta",
  "sábado": "Sábado",
  "sabado": "Sábado",
  "sab": "Sábado",
  "sáb": "Sábado",
  "domingo": "Domingo",
  "dom": "Domingo",
};

function normalizarDia(dia: string): DiaSemana | null {
  return DIA_ALIAS[dia.toLowerCase().trim()] ?? null;
}

type AulaAgenda = {
  turmaId: number;
  turmaNome: string;
  sala?: string | null;
  situacao?: string | null;
  horario: string;
};

type AgendaPorDia = Record<string, AulaAgenda[]>;

function ordenarPorHorario(aulas: AulaAgenda[]): AulaAgenda[] {
  return [...aulas].sort((a, b) => a.horario.localeCompare(b.horario));
}

function Agenda() {
  const navigate = useNavigate();
  const [turmas, setTurmas] = useState<TAgendaTurma[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const hoje = diaDeHoje();

  useEffect(() => {
    TurmaService.getAgenda()
      .then((data) => {
        setTurmas(data);
        setIsLoading(false);
      })
      .catch((err) => {
        toast.error(String(err?.message ?? err));
        setIsLoading(false);
      });
  }, []);

  const agendaPorDia = useMemo<AgendaPorDia>(() => {
    const mapa: AgendaPorDia = {};

    for (const dia of DIAS_SEMANA) {
      mapa[dia] = [];
    }

    for (const turma of turmas) {
      for (const aula of turma.aulas) {
        const diaCanônico = normalizarDia(aula.dia);
        if (!diaCanônico) continue;
        mapa[diaCanônico].push({
          turmaId: turma.turmaId,
          turmaNome: turma.nome,
          sala: turma.sala,
          situacao: turma.situacao,
          horario: aula.horario,
        });
      }
    }

    for (const dia of DIAS_SEMANA) {
      mapa[dia] = ordenarPorHorario(mapa[dia]);
    }

    return mapa;
  }, [turmas]);

  const diasComAulas = DIAS_SEMANA.filter((d) => agendaPorDia[d].length > 0);
  const totalAulas = turmas.reduce((acc, t) => acc + t.aulas.length, 0);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <IoCalendarOutline className={styles.headerIcon} />
        <h2 className={styles.title}>Agenda</h2>
        {!isLoading && (
          <span className={styles.resumo}>
            {totalAulas} aula{totalAulas !== 1 ? "s" : ""} em {diasComAulas.length} dia
            {diasComAulas.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className={styles.grid}>
          {DIAS_SEMANA.slice(0, 5).map((d) => (
            <div key={d} className={styles.coluna}>
              <div className={styles.colunaHeader}>
                <span className={styles.skeletonDia} />
              </div>
              <div className={styles.colunaBody}>
                {[1, 2].map((i) => (
                  <div key={i} className={styles.cardSkeleton} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.grid}>
          {DIAS_SEMANA.map((dia) => {
            const aulas = agendaPorDia[dia];
            const isHoje = dia === hoje;

            return (
              <div
                key={dia}
                className={`${styles.coluna} ${isHoje ? styles.colunaHoje : ""} ${
                  aulas.length === 0 ? styles.colunaVazia : ""
                }`}
              >
                <div className={`${styles.colunaHeader} ${isHoje ? styles.colunaHeaderHoje : ""}`}>
                  <span className={styles.diaNome}>{dia}</span>
                  <span className={styles.diaAbrev}>{DIAS_ABREV[dia]}</span>
                  {isHoje && <span className={styles.hojeTag}>Hoje</span>}
                  <span className={styles.contagem}>
                    {aulas.length > 0 ? `${aulas.length} aula${aulas.length !== 1 ? "s" : ""}` : "—"}
                  </span>
                </div>

                <div className={styles.colunaBody}>
                  {aulas.length === 0 ? (
                    <p className={styles.semAulas}>Sem aulas</p>
                  ) : (
                    aulas.map((aula, i) => (
                      <button
                        key={`${aula.turmaId}-${aula.horario}-${i}`}
                        type="button"
                        className={`${styles.card} ${isHoje ? styles.cardHoje : ""}`}
                        onClick={() => navigate(`/main/turmas/${aula.turmaId}`)}
                        title={`Ir para ${aula.turmaNome}`}
                      >
                        <div className={styles.cardHorario}>
                          <IoTimeOutline />
                          <span>{aula.horario}</span>
                        </div>
                        <div className={styles.cardTurma}>
                          <IoSchoolOutline />
                          <span className={styles.cardNome}>{aula.turmaNome}</span>
                        </div>
                        {aula.sala && (
                          <div className={styles.cardSala}>Sala: {aula.sala}</div>
                        )}
                        {aula.situacao && (
                          <span
                            className={`${styles.badge} ${
                              styles[`badge-${aula.situacao.toLowerCase().replace(" ", "-")}`]
                            }`}
                          >
                            {aula.situacao}
                          </span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Agenda;
