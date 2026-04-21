import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useGoBack } from "../../../hooks/useGoBack";
import { toast } from "react-toastify";
import {
  IoArrowBackOutline,
  IoCheckmarkCircleOutline,
  IoRemoveCircleOutline,
  IoCloseCircleOutline,
  IoSaveOutline,
  IoTrashOutline,
} from "react-icons/io5";
import AtividadeService from "../../../services/atividade.service";
import type { TAvaliacaoData } from "../../../types/atividade.type";
import type { TAtividadeItem } from "../../../types/atividadeItem.type";
import Button from "../../Shared/Button";
import PreferenciasStorage from "../../../stores/store/preferencias.store";
import styles from "./styles.module.scss";

// 1 = certo | 0.5 = meio certo | 0 = errado | null = não avaliado
type ValorNota = 1 | 0.5 | 0 | null;

// chave: `${alunoId}-${atividadeItemId}`
type GradeMap = Record<string, ValorNota>;

function buildInitialGrade(data: TAvaliacaoData): GradeMap {
  const map: GradeMap = {};
  for (const nota of data.notas) {
    for (const ni of nota.notaItens) {
      map[`${nota.alunoId}-${ni.atividadeItemId}`] = ni.valor as ValorNota;
    }
  }
  return map;
}

function calcTotal(alunoId: number, itens: TAtividadeItem[], grade: GradeMap): number {
  const pesoTotal = itens.reduce((acc, item) => acc + item.peso, 0);
  if (pesoTotal === 0) return 0;
  const soma = itens.reduce((acc, item) => {
    const val = grade[`${alunoId}-${item.id}`];
    return acc + (val ?? 0) * item.peso;
  }, 0);
  return (soma / pesoTotal) * 10;
}

type PopoverState = { alunoId: number; itemId: number } | null;

function ValorIcon({ valor }: { valor: ValorNota }) {
  if (valor === 1)
    return <IoCheckmarkCircleOutline className={`${styles.cellIcon} ${styles.certo}`} />;
  if (valor === 0.5)
    return <IoRemoveCircleOutline className={`${styles.cellIcon} ${styles.meio}`} />;
  if (valor === 0)
    return <IoCloseCircleOutline className={`${styles.cellIcon} ${styles.errado}`} />;
  return <span className={styles.cellVazio}>—</span>;
}

function Avaliacao() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const goBack = useGoBack();
  const atividadeId = Number(id);

  const [data, setData] = useState<TAvaliacaoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [grade, setGrade] = useState<GradeMap>({});
  const [savedGrade, setSavedGrade] = useState<GradeMap>({});
  const [autoSalvar, setAutoSalvar] = useState<boolean>(
    () => PreferenciasStorage.get().avaliacaoAutoSalvar,
  );
  const [popover, setPopover] = useState<PopoverState>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [restantesPopover, setRestantesPopover] = useState<number | null>(null);
  const restantesPopoverRef = useRef<HTMLDivElement>(null);
  const [confirmSair, setConfirmSair] = useState(false);

  const isDirty = JSON.stringify(grade) !== JSON.stringify(savedGrade);

  useEffect(() => {
    if (!Number.isFinite(atividadeId)) {
      navigate("/main/turmas");
      return;
    }

    AtividadeService.getAvaliacaoData(atividadeId)
      .then((d) => {
        const initial = buildInitialGrade(d);
        setData(d);
        setGrade(initial);
        setSavedGrade(initial);
        setIsLoading(false);
      })
      .catch((err) => {
        toast.error(String(err?.message ?? err));
        setIsLoading(false);
      });
  }, [atividadeId, navigate]);

  // Fechar popover ao clicar fora
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPopover(null);
      }
    }
    if (popover) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [popover]);

  // Fechar popover de restantes ao clicar fora
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (restantesPopoverRef.current && !restantesPopoverRef.current.contains(e.target as Node)) {
        setRestantesPopover(null);
      }
    }
    if (restantesPopover !== null) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [restantesPopover]);

  const togglePopover = (alunoId: number, itemId: number) => {
    setPopover((prev) =>
      prev?.alunoId === alunoId && prev?.itemId === itemId ? null : { alunoId, itemId },
    );
  };

  const toggleRestantesPopover = (alunoId: number) => {
    setRestantesPopover((prev) => (prev === alunoId ? null : alunoId));
  };

  const setRestantesValor = (alunoId: number, valor: ValorNota) => {
    if (valor === null || !data) return;
    userChanged.current = true;
    setGrade((g) => {
      const updated = { ...g };
      for (const item of data.atividadeItens) {
        const key = `${alunoId}-${item.id}`;
        if (updated[key] === null || updated[key] === undefined) {
          updated[key] = valor;
        }
      }
      return updated;
    });
    setRestantesPopover(null);
  };

  const setValor = (alunoId: number, itemId: number, valor: ValorNota) => {
    userChanged.current = true;
    const key = `${alunoId}-${itemId}`;
    setGrade((g) => ({ ...g, [key]: valor }));
    setPopover(null);
  };

  const handleSalvar = useCallback(() => {
    if (!data) return;
    const entradas: { alunoId: number; atividadeItemId: number; valor: number }[] = [];

    for (const [key, valor] of Object.entries(grade)) {
      if (valor === null) continue;
      const [alunoIdStr, itemIdStr] = key.split("-");
      entradas.push({
        alunoId: Number(alunoIdStr),
        atividadeItemId: Number(itemIdStr),
        valor,
      });
    }

    const deletar: { alunoId: number; atividadeItemId: number }[] = [];
    for (const [key, savedValor] of Object.entries(savedGrade)) {
      if (savedValor !== null && grade[key] === null) {
        const [alunoIdStr, itemIdStr] = key.split("-");
        deletar.push({
          alunoId: Number(alunoIdStr),
          atividadeItemId: Number(itemIdStr),
        });
      }
    }

    setIsSaving(true);
    AtividadeService.salvarAvaliacao(atividadeId, entradas, deletar)
      .then(() => {
        setSavedGrade({ ...grade });
        toast.success("Avaliação salva!");
      })
      .catch((err) => toast.error(String(err?.message ?? err)))
      .finally(() => setIsSaving(false));
  }, [atividadeId, data, grade, savedGrade]);

  // Auto-salvar quando grade muda e autoSalvar está ativo (debounce 2s)
  const userChanged = useRef(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!userChanged.current || !autoSalvar) return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      if (!userChanged.current) return;
      userChanged.current = false;
      handleSalvar();
    }, 3000);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [grade, handleSalvar, autoSalvar]);

  const handleVoltar = () => {
    if (isDirty) {
      setConfirmSair(true);
    } else {
      goBack(`/main/atividades/${atividadeId}`);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.page}>
        <p className={styles.loading}>Carregando...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.page}>
        <p className={styles.loading}>Atividade não encontrada.</p>
      </div>
    );
  }

  const alunos = data.turma.alunos.map((ta) => ta.aluno);
  const itens = data.atividadeItens;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <Button variant="icon" onClick={handleVoltar} title="Voltar">
          <IoArrowBackOutline />
        </Button>
        <div className={styles.headerInfo}>
          <h2 className={styles.title}>{data.capitulo}</h2>
          <span className={styles.subtitulo}>{data.turma.nome}</span>
        </div>
        <label className={styles.autoSalvarLabel}>
          <span className={styles.autoSalvarTexto}>Salvar automaticamente</span>
          <span className={styles.switchTrack}>
            <input
              type="checkbox"
              className={styles.switchInput}
              checked={autoSalvar}
              onChange={(e) => {
                const val = e.target.checked;
                setAutoSalvar(val);
                PreferenciasStorage.patch({ avaliacaoAutoSalvar: val });
              }}
            />
            <span className={styles.switchThumb} />
          </span>
        </label>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSalvar}
          disabled={isSaving || !isDirty || autoSalvar}
        >
          <IoSaveOutline />
          {isSaving ? "Salvando..." : "Salvar"}
        </Button>
      </div>

      {/* Grid */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={`${styles.th} ${styles.thAluno}`}>Aluno</th>
              {itens.map((item) => (
                <th key={item.id} className={styles.th}>
                  <span className={styles.itemNome}>{item.nome}</span>
                  <span className={styles.itemPeso}>peso {item.peso}</span>
                </th>
              ))}
              <th className={`${styles.th} ${styles.thRestantes}`}>Restantes</th>
              <th className={`${styles.th} ${styles.thTotal}`}>Total</th>
            </tr>
          </thead>
          <tbody>
            {alunos.map((aluno) => (
              <tr key={aluno.id} className={styles.tr}>
                <td className={`${styles.td} ${styles.tdAluno}`}>{aluno.nome}</td>
                {itens.map((item) => {
                  const key = `${aluno.id}-${item.id}`;
                  const valor = grade[key] ?? null;
                  const isOpen = popover?.alunoId === aluno.id && popover?.itemId === item.id;
                  return (
                    <td key={item.id} className={styles.td}>
                      <div className={styles.cellWrapper}>
                        <button
                          className={`${styles.cellBtn} ${valor !== null ? styles[`cell-${valor === 0.5 ? "meio" : valor === 1 ? "certo" : "errado"}`] : ""}`}
                          onClick={() => togglePopover(aluno.id, item.id)}
                          title="Clique para avaliar"
                        >
                          <ValorIcon valor={valor} />
                        </button>
                        {isOpen && (
                          <div className={styles.popover} ref={popoverRef}>
                            <button
                              className={`${styles.popBtn} ${styles.popCerto}`}
                              onClick={() => setValor(aluno.id, item.id, 1)}
                              title="Certo (1)"
                            >
                              <IoCheckmarkCircleOutline />
                            </button>
                            <button
                              className={`${styles.popBtn} ${styles.popMeio}`}
                              onClick={() => setValor(aluno.id, item.id, 0.5)}
                              title="Meio certo (0,5)"
                            >
                              <IoRemoveCircleOutline />
                            </button>
                            <button
                              className={`${styles.popBtn} ${styles.popErrado}`}
                              onClick={() => setValor(aluno.id, item.id, 0)}
                              title="Errado (0)"
                            >
                              <IoCloseCircleOutline />
                            </button>
                            <button
                              className={`${styles.popBtn} ${styles.popLimpar}`}
                              onClick={() => setValor(aluno.id, item.id, null)}
                              title="Remover avaliação"
                            >
                              <IoTrashOutline />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
                <td className={`${styles.td} ${styles.tdRestantes}`}>
                  <div className={styles.cellWrapper}>
                    <button
                      className={styles.restantesBtn}
                      onClick={() => toggleRestantesPopover(aluno.id)}
                      title="Marcar itens não avaliados"
                    >
                      Restantes
                    </button>
                    {restantesPopover === aluno.id && (
                      <div className={styles.popover} ref={restantesPopoverRef}>
                        <button
                          className={`${styles.popBtn} ${styles.popCerto}`}
                          onClick={() => setRestantesValor(aluno.id, 1)}
                          title="Certo (1)"
                        >
                          <IoCheckmarkCircleOutline />
                        </button>
                        <button
                          className={`${styles.popBtn} ${styles.popMeio}`}
                          onClick={() => setRestantesValor(aluno.id, 0.5)}
                          title="Meio certo (0,5)"
                        >
                          <IoRemoveCircleOutline />
                        </button>
                        <button
                          className={`${styles.popBtn} ${styles.popErrado}`}
                          onClick={() => setRestantesValor(aluno.id, 0)}
                          title="Errado (0)"
                        >
                          <IoCloseCircleOutline />
                        </button>
                      </div>
                    )}
                  </div>
                </td>
                <td className={`${styles.td} ${styles.tdTotal}`}>
                  {calcTotal(aluno.id, itens, grade).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal: confirmar saída sem salvar */}
      {confirmSair && (
        <div className={styles.overlay}>
          <div className={styles.confirmBox}>
            <p className={styles.confirmText}>Há alterações não salvas. Deseja sair sem salvar?</p>
            <div className={styles.confirmActions}>
              <Button variant="secondary" onClick={() => setConfirmSair(false)}>
                Cancelar
              </Button>
              <Button variant="danger" onClick={() => goBack(`/main/atividades/${atividadeId}`)}>
                Sair sem salvar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Avaliacao;
