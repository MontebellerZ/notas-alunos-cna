import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import {
  IoArrowBackOutline,
  IoAddOutline,
  IoTrashOutline,
  IoPencilOutline,
  IoListOutline,
} from "react-icons/io5";
import AtividadeService from "../../../services/atividade.service";
import AtividadeItemService from "../../../services/atividadeItem.service";
import type { TAtividadeDetalhe } from "../../../types/atividade.type";
import type { TAtividadeItem } from "../../../types/atividadeItem.type";
import Button from "../../Shared/Button";
import Modal from "../../Shared/Modal";
import styles from "./styles.module.scss";

type ModalState =
  | { tipo: "fechado" }
  | { tipo: "novo-item" }
  | { tipo: "editar-item"; item: TAtividadeItem }
  | { tipo: "remover-item"; itemId: number };

function AtividadeDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const atividadeId = Number(id);

  const [atividade, setAtividade] = useState<TAtividadeDetalhe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [modal, setModal] = useState<ModalState>({ tipo: "fechado" });

  const [itemForm, setItemForm] = useState({ nome: "", peso: "" });
  const [itemEditForm, setItemEditForm] = useState({ nome: "", peso: "" });

  useEffect(() => {
    if (!Number.isFinite(atividadeId)) {
      navigate("/main/turmas");
      return;
    }

    let cancelled = false;

    AtividadeService.getByIdWithDetails(atividadeId)
      .then((data) => {
        if (cancelled) return;
        setAtividade(data);
        setIsLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        toast.error(String(err?.message ?? err));
        setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [atividadeId]);

  const fecharModal = () => {
    if (isSaving) return;
    setModal({ tipo: "fechado" });
  };

  const abrirNovoItem = () => {
    setItemForm({ nome: "", peso: "" });
    setModal({ tipo: "novo-item" });
  };

  const abrirEditarItem = (item: TAtividadeItem) => {
    setItemEditForm({ nome: item.nome, peso: String(item.peso) });
    setModal({ tipo: "editar-item", item });
  };

  const handleSalvarItem = () => {
    if (!itemForm.nome.trim()) {
      toast.warn("O nome do item é obrigatório.");
      return;
    }
    const peso = itemForm.peso ? Number(itemForm.peso) : 1;
    if (!Number.isFinite(peso) || peso <= 0) {
      toast.warn("Peso inválido.");
      return;
    }
    setIsSaving(true);
    AtividadeItemService.create({
      nome: itemForm.nome.trim(),
      peso,
      atividadeId,
    })
      .then((novoItem) => {
        toast.success("Item adicionado!");
        setAtividade((prev) =>
          prev ? { ...prev, atividadeItens: [...prev.atividadeItens, novoItem] } : prev
        );
        fecharModal();
      })
      .catch((err) => toast.error(String(err?.message ?? err)))
      .finally(() => setIsSaving(false));
  };

  const handleSalvarEdicaoItem = () => {
    if (modal.tipo !== "editar-item") return;
    if (!itemEditForm.nome.trim()) {
      toast.warn("O nome do item é obrigatório.");
      return;
    }
    const peso = itemEditForm.peso ? Number(itemEditForm.peso) : 1;
    if (!Number.isFinite(peso) || peso <= 0) {
      toast.warn("Peso inválido.");
      return;
    }
    setIsSaving(true);
    AtividadeItemService.update(modal.item.id, {
      nome: itemEditForm.nome.trim(),
      peso,
    })
      .then((atualizado) => {
        toast.success("Item atualizado!");
        setAtividade((prev) =>
          prev
            ? {
                ...prev,
                atividadeItens: prev.atividadeItens.map((i) =>
                  i.id === atualizado.id ? atualizado : i
                ),
              }
            : prev
        );
        fecharModal();
      })
      .catch((err) => toast.error(String(err?.message ?? err)))
      .finally(() => setIsSaving(false));
  };

  const handleRemoverItem = () => {
    if (modal.tipo !== "remover-item") return;
    setIsSaving(true);
    AtividadeItemService.remove(modal.itemId)
      .then(() => {
        toast.success("Item removido.");
        setAtividade((prev) =>
          prev
            ? { ...prev, atividadeItens: prev.atividadeItens.filter((i) => i.id !== modal.itemId) }
            : prev
        );
        fecharModal();
      })
      .catch((err) => toast.error(String(err?.message ?? err)))
      .finally(() => setIsSaving(false));
  };

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.skeletonHeader} />
        <div className={styles.skeletonCard} />
        <div className={styles.skeletonSection} />
      </div>
    );
  }

  if (!atividade) {
    return (
      <div className={styles.page}>
        <p className={styles.empty}>Atividade não encontrada.</p>
        <Button onClick={() => navigate("/main/turmas")}>
          <IoArrowBackOutline /> Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* ── Cabeçalho ──────────────────────────────────────── */}
      <div className={styles.header}>
        <Button
          variant="icon"
          title="Voltar para turma"
          onClick={() => navigate(`/main/turmas/${atividade.turmaId}`)}
        >
          <IoArrowBackOutline />
        </Button>
        <div className={styles.headerInfo}>
          <h2 className={styles.title}>{atividade.capitulo}</h2>
          <span className={styles.subtitulo}>{atividade.turma.nome}</span>
        </div>
        {atividade.peso != null && (
          <span className={styles.pesoTag}>Peso: {atividade.peso}</span>
        )}
      </div>

      {/* ── Itens de avaliação ──────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>
            <IoListOutline />
            Itens de avaliação
          </h3>
          <Button variant="primary" size="sm" onClick={abrirNovoItem}>
            <IoAddOutline /> Novo item
          </Button>
        </div>

        {atividade.atividadeItens.length === 0 ? (
          <p className={styles.empty}>Nenhum item cadastrado ainda.</p>
        ) : (
          <ul className={styles.itemList}>
            {atividade.atividadeItens.map((item) => (
              <li key={item.id} className={styles.item}>
                <span className={styles.itemNome}>{item.nome}</span>
                <span className={styles.itemPeso}>Peso: {item.peso}</span>
                <Button
                  variant="icon"
                  title="Editar item"
                  onClick={() => abrirEditarItem(item)}
                >
                  <IoPencilOutline />
                </Button>
                <Button
                  variant="icon-danger"
                  title="Remover item"
                  onClick={() => setModal({ tipo: "remover-item", itemId: item.id })}
                >
                  <IoTrashOutline />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Modal: Novo item ────────────────────────────────── */}
      <Modal
        isOpen={modal.tipo === "novo-item"}
        onRequestClose={fecharModal}
        title="Novo item de avaliação"
        width="sm"
        actions={
          <>
            <Button variant="secondary" onClick={fecharModal} disabled={isSaving}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSalvarItem} disabled={isSaving}>
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </>
        }
      >
        <div className={styles.form}>
          <label className={styles.label} htmlFor="item-nome">Nome *</label>
          <input
            id="item-nome"
            className={styles.input}
            type="text"
            placeholder="Ex: Leitura, Vocabulário, Gramática..."
            value={itemForm.nome}
            onChange={(e) => setItemForm((f) => ({ ...f, nome: e.target.value }))}
            disabled={isSaving}
            autoFocus
          />
          <label className={styles.label} htmlFor="item-peso">Peso</label>
          <input
            id="item-peso"
            className={styles.input}
            type="number"
            placeholder="Padrão: 1"
            min={0.1}
            step={0.1}
            value={itemForm.peso}
            onChange={(e) => setItemForm((f) => ({ ...f, peso: e.target.value }))}
            disabled={isSaving}
          />
        </div>
      </Modal>

      {/* ── Modal: Editar item ──────────────────────────────── */}
      <Modal
        isOpen={modal.tipo === "editar-item"}
        onRequestClose={fecharModal}
        title="Editar item"
        width="sm"
        actions={
          <>
            <Button variant="secondary" onClick={fecharModal} disabled={isSaving}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSalvarEdicaoItem} disabled={isSaving}>
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </>
        }
      >
        <div className={styles.form}>
          <label className={styles.label} htmlFor="item-edit-nome">Nome *</label>
          <input
            id="item-edit-nome"
            className={styles.input}
            type="text"
            placeholder="Ex: Leitura, Vocabulário, Gramática..."
            value={itemEditForm.nome}
            onChange={(e) => setItemEditForm((f) => ({ ...f, nome: e.target.value }))}
            disabled={isSaving}
            autoFocus
          />
          <label className={styles.label} htmlFor="item-edit-peso">Peso</label>
          <input
            id="item-edit-peso"
            className={styles.input}
            type="number"
            placeholder="Padrão: 1"
            min={0.1}
            step={0.1}
            value={itemEditForm.peso}
            onChange={(e) => setItemEditForm((f) => ({ ...f, peso: e.target.value }))}
            disabled={isSaving}
          />
        </div>
      </Modal>

      {/* ── Modal: Confirmar remoção ────────────────────────── */}
      <Modal
        isOpen={modal.tipo === "remover-item"}
        onRequestClose={fecharModal}
        title="Remover item"
        width="sm"
        actions={
          <>
            <Button variant="secondary" onClick={fecharModal} disabled={isSaving}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleRemoverItem} disabled={isSaving}>
              {isSaving ? "Removendo..." : "Remover"}
            </Button>
          </>
        }
      >
        <p>Tem certeza que deseja remover este item?</p>
      </Modal>
    </div>
  );
}

export default AtividadeDetalhe;
