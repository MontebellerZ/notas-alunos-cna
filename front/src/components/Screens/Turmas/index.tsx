import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { IoPencilOutline, IoTrashOutline, IoAddOutline } from "react-icons/io5";
import TurmaService from "../../../services/turma.service";
import type { TTurma, TTurmaCreate } from "../../../types/turma.type";
import Button from "../../Shared/Button";
import Modal from "../../Shared/Modal";
import styles from "./styles.module.scss";

const ITEMS_POR_PAGINA = 12;

type TurmaFormState = TTurmaCreate;

const formVazio: TurmaFormState = {
  nome: "",
  sala: "",
  situacao: "",
  inicio: "",
  fim: "",
};

type ModalState =
  | { tipo: "fechado" }
  | { tipo: "criar" }
  | { tipo: "editar"; turma: TTurma }
  | { tipo: "excluir"; turma: TTurma };

function Turmas() {
  const [turmas, setTurmas] = useState<TTurma[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [modal, setModal] = useState<ModalState>({ tipo: "fechado" });
  const [form, setForm] = useState<TurmaFormState>(formVazio);

  const recarregar = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    let cancelled = false;

    TurmaService.getPaginated(page, ITEMS_POR_PAGINA)
      .then((res) => {
        if (cancelled) return;
        setTurmas(res.items);
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
    setModal({ tipo: "criar" });
  };

  const abrirEditar = (turma: TTurma) => {
    setForm({
      nome: turma.nome,
      sala: turma.sala ?? "",
      situacao: turma.situacao ?? "",
      inicio: turma.inicio ?? "",
      fim: turma.fim ?? "",
    });
    setModal({ tipo: "editar", turma });
  };

  const abrirExcluir = (turma: TTurma) => {
    setModal({ tipo: "excluir", turma });
  };

  const fecharModal = () => {
    if (isSaving) return;
    setModal({ tipo: "fechado" });
  };

  const handleFormChange = (field: keyof TurmaFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSalvar = async () => {
    if (!form.nome.trim()) {
      toast.warn("O nome da turma é obrigatório.");
      return;
    }

    setIsSaving(true);

    const payload: TTurmaCreate = {
      nome: form.nome.trim(),
      sala: form.sala?.trim() || null,
      situacao: form.situacao?.trim() || null,
      inicio: form.inicio?.trim() || null,
      fim: form.fim?.trim() || null,
    };

    if (modal.tipo === "criar") {
      TurmaService.create(payload)
        .then(() => {
          toast.success("Turma cadastrada com sucesso!");
          fecharModal();
          recarregar();
        })
        .catch((err) => toast.error(String(err?.message ?? err)))
        .finally(() => setIsSaving(false));
    } else if (modal.tipo === "editar") {
      TurmaService.update(modal.turma.id, payload)
        .then(() => {
          toast.success("Turma atualizada com sucesso!");
          fecharModal();
          recarregar();
        })
        .catch((err) => toast.error(String(err?.message ?? err)))
        .finally(() => setIsSaving(false));
    }
  };

  const handleExcluir = async () => {
    if (modal.tipo !== "excluir") return;
    setIsSaving(true);
    TurmaService.remove(modal.turma.id)
      .then(() => {
        toast.success("Turma excluída com sucesso!");
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
        <h2 className={styles.title}>Turmas</h2>
        <Button variant="primary" size="md" onClick={abrirCriar}>
          <IoAddOutline />
          Nova turma
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

      {!isLoading && turmas.length === 0 && (
        <p className={styles.empty}>Nenhuma turma encontrada.</p>
      )}

      {!isLoading && turmas.length > 0 && (
        <div className={styles.grid}>
          {turmas.map((turma) => (
            <div key={turma.id} className={styles.card}>
              <div className={styles.cardBody}>
                <span className={styles.cardNome}>{turma.nome}</span>
                {turma.sala && (
                  <span className={styles.cardInfo}>Sala: {turma.sala}</span>
                )}
                {turma.situacao && (
                  <span
                    className={`${styles.badge} ${styles[`badge-${turma.situacao.toLowerCase().replace(" ", "-")}`]}`}
                  >
                    {turma.situacao}
                  </span>
                )}
              </div>
              <div className={styles.cardActions}>
                <Button
                  variant="icon"
                  title="Editar"
                  aria-label="Editar turma"
                  onClick={() => abrirEditar(turma)}
                >
                  <IoPencilOutline />
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  title="Excluir"
                  aria-label="Excluir turma"
                  onClick={() => abrirExcluir(turma)}
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
          <Button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
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
        title={modal.tipo === "criar" ? "Nova turma" : "Editar turma"}
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
        <div className={styles.form}>
          <label className={styles.label} htmlFor="turma-nome">
            Nome *
          </label>
          <input
            id="turma-nome"
            className={styles.input}
            type="text"
            placeholder="Ex: Intermediário B"
            value={form.nome}
            onChange={(e) => handleFormChange("nome", e.target.value)}
            disabled={isSaving}
          />

          <label className={styles.label} htmlFor="turma-sala">
            Sala
          </label>
          <input
            id="turma-sala"
            className={styles.input}
            type="text"
            placeholder="Ex: Sala 3"
            value={form.sala ?? ""}
            onChange={(e) => handleFormChange("sala", e.target.value)}
            disabled={isSaving}
          />

          <label className={styles.label} htmlFor="turma-situacao">
            Situação
          </label>
          <select
            id="turma-situacao"
            className={styles.input}
            value={form.situacao ?? ""}
            onChange={(e) => handleFormChange("situacao", e.target.value)}
            disabled={isSaving}
          >
            <option value="">Selecione...</option>
            <option value="Futura">Futura</option>
            <option value="Em andamento">Em andamento</option>
            <option value="Encerrada">Encerrada</option>
          </select>

          <label className={styles.label} htmlFor="turma-inicio">
            Início
          </label>
          <input
            id="turma-inicio"
            className={styles.input}
            type="date"
            value={form.inicio ?? ""}
            onChange={(e) => handleFormChange("inicio", e.target.value)}
            disabled={isSaving}
          />

          <label className={styles.label} htmlFor="turma-fim">
            Fim
          </label>
          <input
            id="turma-fim"
            className={styles.input}
            type="date"
            value={form.fim ?? ""}
            onChange={(e) => handleFormChange("fim", e.target.value)}
            disabled={isSaving}
          />
        </div>
      </Modal>

      {/* Modal: confirmar exclusão */}
      <Modal
        isOpen={modal.tipo === "excluir"}
        onRequestClose={fecharModal}
        title="Excluir turma"
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
            Tem certeza que deseja excluir a turma{" "}
            <strong>{modal.turma.nome}</strong>?
          </p>
        )}
      </Modal>
    </div>
  );
}

export default Turmas;
