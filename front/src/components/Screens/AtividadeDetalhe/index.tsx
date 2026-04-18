import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import {
  IoArrowBackOutline,
  IoAddOutline,
  IoTrashOutline,
  IoPencilOutline,
  IoListOutline,
  IoLayersOutline,
  IoCheckmarkDoneOutline,
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
  | { tipo: "remover-item"; itemId: number }
  | { tipo: "lote" };

type Intervalo = { id: number; inicio: string; fim: string };

function gerarNomesIntervalo(inicio: string, fim: string): string[] | null {
  const trimI = inicio.trim();
  const trimF = fim.trim();
  if (!trimI || !trimF) return null;

  const partsI = trimI.split(".");
  const partsF = trimF.split(".");
  if (partsI.length !== partsF.length) return null;

  const prefixI = partsI.slice(0, -1).join(".");
  const prefixF = partsF.slice(0, -1).join(".");
  if (prefixI !== prefixF) return null;

  const numI = parseInt(partsI[partsI.length - 1], 10);
  const numF = parseInt(partsF[partsF.length - 1], 10);
  if (isNaN(numI) || isNaN(numF) || numF < numI) return null;

  const prefix = partsI.length > 1 ? prefixI + "." : "";
  return Array.from({ length: numF - numI + 1 }, (_, k) => `${prefix}${numI + k}`);
}

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

  const [loteForm, setLoteForm] = useState<{ peso: string; intervalos: Intervalo[] }>({
    peso: "",
    intervalos: [{ id: 1, inicio: "", fim: "" }],
  });
  const loteIntervalIdRef = useRef(1);

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

    return () => {
      cancelled = true;
    };
  }, [atividadeId, navigate]);

  const fecharModal = () => {
    if (isSaving) return;
    setModal({ tipo: "fechado" });
  };

  const abrirNovoItem = () => {
    setItemForm({ nome: "", peso: "" });
    setModal({ tipo: "novo-item" });
  };

  const abrirLote = () => {
    loteIntervalIdRef.current = 1;
    setLoteForm({ peso: "", intervalos: [{ id: 1, inicio: "", fim: "" }] });
    setModal({ tipo: "lote" });
  };

  const adicionarIntervalo = () => {
    loteIntervalIdRef.current += 1;
    setLoteForm((f) => ({
      ...f,
      intervalos: [...f.intervalos, { id: loteIntervalIdRef.current, inicio: "", fim: "" }],
    }));
  };

  const removerIntervalo = (id: number) => {
    setLoteForm((f) => ({
      ...f,
      intervalos: f.intervalos.filter((i) => i.id !== id),
    }));
  };

  const atualizarIntervalo = (id: number, campo: "inicio" | "fim", valor: string) => {
    setLoteForm((f) => ({
      ...f,
      intervalos: f.intervalos.map((i) => (i.id === id ? { ...i, [campo]: valor } : i)),
    }));
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
          prev ? { ...prev, atividadeItens: [...prev.atividadeItens, novoItem] } : prev,
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
                  i.id === atualizado.id ? atualizado : i,
                ),
              }
            : prev,
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
            : prev,
        );
        fecharModal();
      })
      .catch((err) => toast.error(String(err?.message ?? err)))
      .finally(() => setIsSaving(false));
  };

  const nomesLotePreview: string[] = loteForm.intervalos.flatMap((iv) => {
    const nomes = gerarNomesIntervalo(iv.inicio, iv.fim);
    return nomes ?? [];
  });

  const loteValido =
    loteForm.intervalos.length > 0 &&
    loteForm.intervalos.every((iv) => gerarNomesIntervalo(iv.inicio, iv.fim) !== null) &&
    nomesLotePreview.length > 0;

  const handleCriarLote = () => {
    if (!loteValido) {
      toast.warn("Verifique os intervalos informados.");
      return;
    }
    const peso = loteForm.peso ? Number(loteForm.peso) : 1;
    if (!Number.isFinite(peso) || peso <= 0) {
      toast.warn("Peso inválido.");
      return;
    }
    setIsSaving(true);
    AtividadeItemService.createBulk(nomesLotePreview.map((nome) => ({ nome, peso, atividadeId })))
      .then((criados) => {
        toast.success(
          `${criados.length} ${criados.length === 1 ? "item criado" : "itens criados"}!`,
        );
        setAtividade((prev) =>
          prev ? { ...prev, atividadeItens: [...prev.atividadeItens, ...criados] } : prev,
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
        {atividade.peso != null && <span className={styles.pesoTag}>Peso: {atividade.peso}</span>}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate(`/main/atividades/${atividadeId}/avaliacao`)}
          title="Avaliar alunos"
        >
          <IoCheckmarkDoneOutline /> Avaliar
        </Button>
      </div>

      {/* ── Itens de avaliação ──────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>
            <IoListOutline />
            Itens de avaliação
          </h3>
          <div className={styles.sectionActions}>
            <Button variant="secondary" size="sm" onClick={abrirLote}>
              <IoLayersOutline /> Criar em lote
            </Button>
            <Button variant="primary" size="sm" onClick={abrirNovoItem}>
              <IoAddOutline /> Novo item
            </Button>
          </div>
        </div>

        {atividade.atividadeItens.length === 0 ? (
          <p className={styles.empty}>Nenhum item cadastrado ainda.</p>
        ) : (
          <ul className={styles.itemList}>
            {atividade.atividadeItens.map((item) => (
              <li key={item.id} className={styles.item}>
                <span className={styles.itemNome}>{item.nome}</span>
                <span className={styles.itemPeso}>Peso: {item.peso}</span>
                <Button variant="icon" title="Editar item" onClick={() => abrirEditarItem(item)}>
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
          <label className={styles.label} htmlFor="item-nome">
            Nome *
          </label>
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
          <label className={styles.label} htmlFor="item-peso">
            Peso
          </label>
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
          <label className={styles.label} htmlFor="item-edit-nome">
            Nome *
          </label>
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
          <label className={styles.label} htmlFor="item-edit-peso">
            Peso
          </label>
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

      {/* ── Modal: Criar em lote ─────────────────────────────── */}
      <Modal
        isOpen={modal.tipo === "lote"}
        onRequestClose={fecharModal}
        title="Criar itens em lote"
        width="md"
        actions={
          <>
            <Button variant="secondary" onClick={fecharModal} disabled={isSaving}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleCriarLote} disabled={isSaving || !loteValido}>
              {isSaving
                ? "Criando..."
                : `Criar ${nomesLotePreview.length > 0 ? `(${nomesLotePreview.length})` : ""}`}
            </Button>
          </>
        }
      >
        <div className={styles.form}>
          <label className={styles.label}>Peso padrão</label>
          <input
            className={styles.input}
            type="number"
            placeholder="1"
            value={loteForm.peso}
            onChange={(e) => setLoteForm((f) => ({ ...f, peso: e.target.value }))}
            disabled={isSaving}
          />
        </div>

        <div className={styles.intervalosSection}>
          <label className={styles.label}>Intervalos</label>
          {loteForm.intervalos.map((iv) => {
            const nomes = gerarNomesIntervalo(iv.inicio, iv.fim);
            const invalido = (iv.inicio.trim() || iv.fim.trim()) && nomes === null;
            return (
              <div key={iv.id} className={styles.intervaloRow}>
                <div className={styles.intervaloInputs}>
                  <input
                    className={`${styles.input} ${invalido ? styles.inputError : ""}`}
                    placeholder="De (ex: 1.1)"
                    value={iv.inicio}
                    onChange={(e) => atualizarIntervalo(iv.id, "inicio", e.target.value)}
                    disabled={isSaving}
                  />
                  <span className={styles.intervaloSep}>até</span>
                  <input
                    className={`${styles.input} ${invalido ? styles.inputError : ""}`}
                    placeholder="Até (ex: 1.4)"
                    value={iv.fim}
                    onChange={(e) => atualizarIntervalo(iv.id, "fim", e.target.value)}
                    disabled={isSaving}
                  />
                </div>
                {loteForm.intervalos.length > 1 && (
                  <button
                    className={styles.removerIntervaloBtn}
                    onClick={() => removerIntervalo(iv.id)}
                    disabled={isSaving}
                    type="button"
                    title="Remover intervalo"
                  >
                    <IoTrashOutline />
                  </button>
                )}
              </div>
            );
          })}
          <button
            className={styles.addIntervaloBtn}
            onClick={adicionarIntervalo}
            disabled={isSaving}
            type="button"
          >
            <IoAddOutline /> Adicionar intervalo
          </button>
        </div>

        {nomesLotePreview.length > 0 && (
          <div className={styles.preview}>
            <label className={styles.label}>
              Pré-visualização ({nomesLotePreview.length} itens)
            </label>
            <div className={styles.previewChips}>
              {nomesLotePreview.map((nome) => (
                <span key={nome} className={styles.previewChip}>
                  {nome}
                </span>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default AtividadeDetalhe;
