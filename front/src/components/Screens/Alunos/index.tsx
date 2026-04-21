import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import {
  IoPencilOutline,
  IoTrashOutline,
  IoAddOutline,
  IoPersonOutline,
} from "react-icons/io5";
import AlunoService from "../../../services/aluno.service";
import TurmaService from "../../../services/turma.service";
import type { TAluno, TAlunoCreate } from "../../../types/aluno.type";
import type { TTurma } from "../../../types/turma.type";
import TokenStorage from "../../../stores/store/token.store";
import Button from "../../Shared/Button";
import Modal from "../../Shared/Modal";
import styles from "./styles.module.scss";

function getIsAdmin(): boolean {
  const token = TokenStorage.get();
  if (!token) return false;
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64)) as { admin?: boolean };
    return payload.admin === true;
  } catch {
    return false;
  }
}

const ITEMS_POR_PAGINA = 40;

type AlunoFormState = TAlunoCreate;

const formVazio: AlunoFormState = {
  nome: "",
  idade: null,
};

type ModalState =
  | { tipo: "fechado" }
  | { tipo: "criar" }
  | { tipo: "editar"; aluno: TAluno }
  | { tipo: "excluir"; aluno: TAluno };

function Alunos() {
  const navigate = useNavigate();
  const [alunos, setAlunos] = useState<TAluno[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [modal, setModal] = useState<ModalState>({ tipo: "fechado" });
  const [form, setForm] = useState<AlunoFormState>(formVazio);
  const [turmas, setTurmas] = useState<TTurma[]>([]);
  const [selectedTurmaIds, setSelectedTurmaIds] = useState<number[]>([]);
  const [isLoadingTurmas, setIsLoadingTurmas] = useState(false);
  const isAdmin = getIsAdmin();

  const recarregar = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    let cancelled = false;

    AlunoService.getPaginated(page, ITEMS_POR_PAGINA)
      .then((res) => {
        if (cancelled) return;
        setAlunos(res.items);
        setTotal(res.total);
        setIsLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        toast.error(String(err?.message ?? err));
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
      setIsLoading(true);
    };
  }, [page, reloadKey]);

  const abrirCriar = () => {
    setForm(formVazio);
    setSelectedTurmaIds([]);
    setModal({ tipo: "criar" });
    setIsLoadingTurmas(true);
    TurmaService.getPaginated(1, 999)
      .then((res) => setTurmas(res.items))
      .catch(() => setTurmas([]))
      .finally(() => setIsLoadingTurmas(false));
  };

  const abrirEditar = (aluno: TAluno) => {
    setForm({ nome: aluno.nome, idade: aluno.idade ?? null });
    setModal({ tipo: "editar", aluno });
  };

  const abrirExcluir = (aluno: TAluno) => {
    setModal({ tipo: "excluir", aluno });
  };

  const fecharModal = () => {
    if (isSaving) return;
    setModal({ tipo: "fechado" });
    setSelectedTurmaIds([]);
  };

  const toggleTurma = (id: number) => {
    setSelectedTurmaIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleSalvar = async () => {
    if (!form.nome.trim()) {
      toast.warn("O nome do aluno é obrigatório.");
      return;
    }

    if (modal.tipo === "criar" && !isAdmin && selectedTurmaIds.length === 0) {
      toast.warn("Selecione pelo menos uma turma para vincular o aluno.");
      return;
    }

    setIsSaving(true);

    const payload: TAlunoCreate = {
      nome: form.nome.trim(),
      idade: form.idade ? Number(form.idade) : null,
    };

    if (modal.tipo === "criar") {
      AlunoService.create(payload)
        .then((aluno) => {
          const vinculos = selectedTurmaIds.map((turmaId) =>
            TurmaService.vincularAluno(turmaId, aluno.id)
          );
          return Promise.all(vinculos);
        })
        .then(() => {
          toast.success("Aluno cadastrado com sucesso!");
          fecharModal();
          recarregar();
        })
        .catch((err) => toast.error(String(err?.message ?? err)))
        .finally(() => setIsSaving(false));
    } else if (modal.tipo === "editar") {
      AlunoService.update(modal.aluno.id, payload)
        .then(() => {
          toast.success("Aluno atualizado com sucesso!");
          fecharModal();
          recarregar();
        })
        .catch((err) => toast.error(String(err?.message ?? err)))
        .finally(() => setIsSaving(false));
    }
  };

  const handleExcluir = () => {
    if (modal.tipo !== "excluir") return;
    setIsSaving(true);
    AlunoService.remove(modal.aluno.id)
      .then(() => {
        toast.success("Aluno excluído com sucesso!");
        fecharModal();
        recarregar();
      })
      .catch((err) => toast.error(String(err?.message ?? err)))
      .finally(() => setIsSaving(false));
  };

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_POR_PAGINA));
  const isFormModal = modal.tipo === "criar" || modal.tipo === "editar";

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>Alunos</h2>
        <Button variant="primary" size="md" onClick={abrirCriar}>
          <IoAddOutline />
          Novo aluno
        </Button>
      </div>

      {isLoading && (
        <div className={styles.grid}>
          {Array.from({ length: ITEMS_POR_PAGINA }).map((_, i) => (
            <div key={i} className={`${styles.card} ${styles.cardSkeleton}`}>
              <span className={styles.skeletonLine} />
              <span className={styles.skeletonLineShort} />
            </div>
          ))}
        </div>
      )}

      {!isLoading && alunos.length === 0 && (
        <p className={styles.empty}>Nenhum aluno encontrado.</p>
      )}

      {!isLoading && alunos.length > 0 && (
        <div className={styles.grid}>
          {alunos.map((aluno) => (
            <div
              key={aluno.id}
              className={styles.card}
              onClick={() => navigate(`/main/alunos/${aluno.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && navigate(`/main/alunos/${aluno.id}`)}
            >
              <div className={styles.cardBody}>
                <div className={styles.cardAvatar}>
                  <IoPersonOutline />
                </div>
                <div className={styles.cardInfo}>
                  <span className={styles.cardNome}>{aluno.nome}</span>
                  {aluno.idade != null && (
                    <span className={styles.cardIdade}>{aluno.idade} anos</span>
                  )}
                </div>
              </div>
              <div className={styles.cardActions}>
                <Button
                  variant="icon"
                  title="Editar aluno"
                  aria-label="Editar aluno"
                  onClick={(e) => { e.stopPropagation(); abrirEditar(aluno); }}
                >
                  <IoPencilOutline />
                </Button>
                <Button
                  variant="icon-danger"
                  title="Excluir aluno"
                  aria-label="Excluir aluno"
                  onClick={(e) => { e.stopPropagation(); abrirExcluir(aluno); }}
                >
                  <IoTrashOutline />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {total > ITEMS_POR_PAGINA && (
        <div className={styles.pagination}>
          <Button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            Anterior
          </Button>
          <span className={styles.paginationInfo}>
            Página {page} de {totalPages}
          </span>
          <Button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Próxima
          </Button>
        </div>
      )}

      {/* Modal: criar / editar */}
      <Modal
        isOpen={isFormModal}
        onRequestClose={fecharModal}
        title={modal.tipo === "criar" ? "Novo aluno" : "Editar aluno"}
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
          <label htmlFor="aluno-nome">Nome *</label>
          <input
            id="aluno-nome"
            type="text"
            value={form.nome}
            onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
            placeholder="Nome do aluno"
            autoFocus
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="aluno-idade">Idade</label>
          <input
            id="aluno-idade"
            type="number"
            min={1}
            max={120}
            value={form.idade ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, idade: e.target.value ? Number(e.target.value) : null }))
            }
            placeholder="Idade (opcional)"
          />
        </div>
        {modal.tipo === "criar" && (
          <div className={styles.formGroup}>
            <label>Turmas{isAdmin ? " (opcional)" : " *"}</label>
            {isLoadingTurmas ? (
              <p className={styles.turmaHint}>Carregando turmas...</p>
            ) : turmas.length === 0 ? (
              <p className={styles.turmaHint}>Nenhuma turma disponível.</p>
            ) : (
              <div className={styles.turmaList}>
                {turmas.map((t) => (
                  <label key={t.id} className={styles.turmaItem}>
                    <input
                      type="checkbox"
                      checked={selectedTurmaIds.includes(t.id)}
                      onChange={() => toggleTurma(t.id)}
                    />
                    {t.nome}{t.sala ? ` — ${t.sala}` : ""}
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal: excluir */}
      <Modal
        isOpen={modal.tipo === "excluir"}
        onRequestClose={fecharModal}
        title="Excluir aluno"
        width="sm"
        actions={
          <>
            <Button variant="secondary" onClick={fecharModal} disabled={isSaving}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleExcluir} disabled={isSaving}>
              {isSaving ? "Excluindo..." : "Excluir"}
            </Button>
          </>
        }
      >
        {modal.tipo === "excluir" && (
          <p>
            Tem certeza que deseja excluir o aluno{" "}
            <strong>{modal.aluno.nome}</strong>?
          </p>
        )}
      </Modal>
    </div>
  );
}

export default Alunos;
