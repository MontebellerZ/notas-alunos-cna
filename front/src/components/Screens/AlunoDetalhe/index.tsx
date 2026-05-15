import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useGoBack } from "../../../hooks/useGoBack";
import { toast } from "react-toastify";
import { IoArrowBack, IoPencilOutline, IoSchoolOutline, IoStatsChartOutline } from "react-icons/io5";
import AlunoService from "../../../services/aluno.service";
import type { TAlunoDetalhe, TAlunoHistoricoTurma } from "../../../types/aluno.type";
import type { TAlunoCreate } from "../../../types/aluno.type";
import Button from "../../Shared/Button";
import Modal from "../../Shared/Modal";
import styles from "./styles.module.scss";

type ModalState =
  | { tipo: "fechado" }
  | { tipo: "editar" };

function AlunoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const goBack = useGoBack();

  const [aluno, setAluno] = useState<TAlunoDetalhe | null>(null);
  const [historico, setHistorico] = useState<TAlunoHistoricoTurma[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [modal, setModal] = useState<ModalState>({ tipo: "fechado" });
  const [form, setForm] = useState<TAlunoCreate>({ nome: "", idade: null });

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    Promise.all([
      AlunoService.getByIdWithDetails(Number(id)),
      AlunoService.getHistoricoNotas(Number(id)),
    ])
      .then(([alunoData, historicoData]) => {
        if (cancelled) return;
        setAluno(alunoData);
        setHistorico(historicoData);
        setIsLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        toast.error(String(err?.message ?? err));
        setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [id]);

  const abrirEditar = () => {
    if (!aluno) return;
    setForm({ nome: aluno.nome, idade: aluno.idade ?? null });
    setModal({ tipo: "editar" });
  };

  const fecharModal = () => {
    if (isSaving) return;
    setModal({ tipo: "fechado" });
  };

  const handleSalvar = () => {
    if (!aluno) return;
    if (!form.nome.trim()) {
      toast.warn("O nome do aluno é obrigatório.");
      return;
    }

    setIsSaving(true);

    AlunoService.update(aluno.id, {
      nome: form.nome.trim(),
      idade: form.idade ? Number(form.idade) : null,
    })
      .then(() => {
        toast.success("Aluno atualizado com sucesso!");
        fecharModal();
        setAluno((prev) =>
          prev
            ? { ...prev, nome: form.nome.trim(), idade: form.idade ? Number(form.idade) : null }
            : prev
        );
      })
      .catch((err) => toast.error(String(err?.message ?? err)))
      .finally(() => setIsSaving(false));
  };

  const getNotaClass = (valor: number | null, valorTotal: number) => {
    if (valor === null || valorTotal <= 0) return styles.historicoNotaBaixo;
    const percentual = valor / valorTotal;
    if (percentual >= 0.7) return styles.historicoNotaOk;
    if (percentual >= 0.5) return styles.historicoNotaMedio;
    return styles.historicoNotaBaixo;
  };

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.skeleton} />
        <div className={styles.skeletonCard} />
      </div>
    );
  }

  if (!aluno) {
    return (
      <div className={styles.page}>
        <p className={styles.empty}>Aluno não encontrado.</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Cabeçalho */}
      <div className={styles.header}>
        <Button variant="icon" title="Voltar" onClick={() => goBack("/main/alunos")}>
          <IoArrowBack />
        </Button>
        <div className={styles.headerInfo}>
          <h2 className={styles.title}>{aluno.nome}</h2>
          {aluno.idade != null && (
            <span className={styles.subtitulo}>{aluno.idade} anos</span>
          )}
        </div>
        <div className={styles.headerActions}>
          <Button variant="icon" title="Editar aluno" onClick={abrirEditar}>
            <IoPencilOutline />
          </Button>
        </div>
      </div>

      {/* Turmas vinculadas */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <IoSchoolOutline />
          Turmas vinculadas
        </h3>

        {aluno.turmas.length === 0 ? (
          <p className={styles.empty}>Este aluno não está vinculado a nenhuma turma.</p>
        ) : (
          <div className={styles.turmasList}>
            {aluno.turmas.map(({ turma }) => (
              <div key={turma.id} className={styles.turmaCard}>
                <div className={styles.turmaInfo}>
                  <span className={styles.turmaNome}>{turma.nome}</span>
                  {turma.sala && (
                    <span className={styles.turmaMeta}>Sala: {turma.sala}</span>
                  )}
                  {turma.situacao && (
                    <span
                      className={`${styles.badge} ${
                        styles[`badge-${turma.situacao.toLowerCase().replace(" ", "-")}`]
                      }`}
                    >
                      {turma.situacao}
                    </span>
                  )}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/main/turmas/${turma.id}`)}
                  title="Ver turma"
                >
                  Ver turma
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Histórico de notas */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <IoStatsChartOutline />
          Histórico de notas
        </h3>

        {historico.length === 0 ? (
          <p className={styles.empty}>Nenhuma nota registrada ainda.</p>
        ) : (
          <div className={styles.historicoList}>
            {historico.map((turma) => (
              <div key={turma.turmaId} className={styles.historicoTurma}>
                <div className={styles.historicoTurmaHeader}>
                  <span className={styles.historicoTurmaNome}>{turma.turmaNome}</span>
                  {turma.media !== null && (
                    <span className={styles.historicoMedia}>
                      Média: {turma.media.toFixed(2)}
                    </span>
                  )}
                </div>
                <div className={styles.historicoAtividades}>
                  {turma.atividades.map((atv) => (
                    <div
                      key={atv.atividadeId}
                      className={`${styles.historicoAtv} ${!atv.avaliada ? styles.historicoAtvPendente : ""}`}
                    >
                      <span className={styles.historicoAtvNome}>{atv.capitulo}</span>
                      {atv.avaliada ? (
                        <span
                          className={`${styles.historicoNota} ${getNotaClass(atv.valor, atv.valorTotal)}`}
                        >
                          {atv.valor !== null
                            ? `${atv.valor.toFixed(2)} / ${atv.valorTotal.toFixed(2)}`
                            : "—"}
                        </span>
                      ) : (
                        <span className={styles.historicoPendente}>Pendente</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal editar */}
      <Modal
        isOpen={modal.tipo === "editar"}
        onRequestClose={fecharModal}
        title="Editar aluno"
        width="sm"
        actions={
          <>
            <Button variant="secondary" onClick={fecharModal} disabled={isSaving}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSalvar} disabled={isSaving}>
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </>
        }
      >
        <div className={styles.formGroup}>
          <label htmlFor="aluno-detalhe-nome">Nome *</label>
          <input
            id="aluno-detalhe-nome"
            type="text"
            value={form.nome}
            onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
            placeholder="Nome do aluno"
            autoFocus
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="aluno-detalhe-idade">Idade</label>
          <input
            id="aluno-detalhe-idade"
            type="number"
            min={1}
            max={120}
            value={form.idade ?? ""}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                idade: e.target.value ? Number(e.target.value) : null,
              }))
            }
            placeholder="Idade (opcional)"
          />
        </div>
      </Modal>
    </div>
  );
}

export default AlunoDetalhe;
