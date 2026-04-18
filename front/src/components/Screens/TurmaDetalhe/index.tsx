import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import {
  IoArrowBackOutline,
  IoAddOutline,
  IoTrashOutline,
  IoPersonAddOutline,
  IoSearchOutline,
  IoPencilOutline,
  IoOpenOutline,
} from "react-icons/io5";
import TurmaService from "../../../services/turma.service";
import AulaService from "../../../services/aula.service";
import AlunoService from "../../../services/aluno.service";
import AtividadeService from "../../../services/atividade.service";
import type { TTurmaDetalhe, TTurmaCreate } from "../../../types/turma.type";
import type { TAluno } from "../../../types/aluno.type";
import type { TAtividade } from "../../../types/atividade.type";
import Button from "../../Shared/Button";
import Modal from "../../Shared/Modal";
import styles from "./styles.module.scss";

const DIAS_SEMANA = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
  "Domingo",
];

type ModalState =
  | { tipo: "fechado" }
  | { tipo: "editar-turma" }
  | { tipo: "excluir-turma" }
  | { tipo: "nova-aula" }
  | { tipo: "editar-aula"; aulaId: string }
  | { tipo: "vincular-aluno" }
  | { tipo: "nova-atividade" }
  | { tipo: "editar-atividade"; atividade: TAtividade }
  | { tipo: "remover-aula"; aulaId: string }
  | { tipo: "remover-aluno"; alunoId: number; nome: string }
  | { tipo: "remover-atividade"; atividadeId: number };

const formVazio: TTurmaCreate = {
  nome: "",
  sala: "",
  situacao: "",
  inicio: "",
  fim: "",
};

function formatarData(data?: string | null) {
  if (!data) return null;
  const [ano, mes, dia] = data.split("-");
  if (!ano || !mes || !dia) return data;
  return `${dia}/${mes}/${ano}`;
}

function TurmaDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const turmaId = Number(id);

  const [turma, setTurma] = useState<TTurmaDetalhe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [modal, setModal] = useState<ModalState>({ tipo: "fechado" });

  // Formulário: editar turma
  const [turmaForm, setTurmaForm] = useState<TTurmaCreate>(formVazio);

  // Formulário: nova aula / editar aula
  const [aulaForm, setAulaForm] = useState({ dia: "", horario: "" });
  const [aulaEditForm, setAulaEditForm] = useState({ dia: "", horario: "" });

  // Formulário: vincular aluno
  const [searchNome, setSearchNome] = useState("");
  const [searchResults, setSearchResults] = useState<TAluno[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [novoAlunoForm, setNovoAlunoForm] = useState({ nome: "", idade: "" });
  const [modoVincular, setModoVincular] = useState<"buscar" | "novo">("buscar");

  // Formulário: nova atividade
  const [atividadeForm, setAtividadeForm] = useState({ capitulo: "", peso: "" });

  // Formulário: editar atividade
  const [atividadeEditForm, setAtividadeEditForm] = useState({ capitulo: "", peso: "" });

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const recarregar = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    if (!Number.isFinite(turmaId)) {
      navigate("/main/turmas");
      return;
    }

    let cancelled = false;

    TurmaService.getByIdWithDetails(turmaId)
      .then((res) => {
        if (cancelled) return;
        setTurma(res);
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
  }, [turmaId, reloadKey, navigate]);

  const fecharModal = () => {
    if (isSaving) return;
    setModal({ tipo: "fechado" });
    setAulaForm({ dia: "", horario: "" });
    setAulaEditForm({ dia: "", horario: "" });
    setAtividadeForm({ capitulo: "", peso: "" });
    setSearchNome("");
    setSearchResults([]);
    setNovoAlunoForm({ nome: "", idade: "" });
    setModoVincular("buscar");
  };

  const abrirEditarTurma = () => {
    if (!turma) return;
    setTurmaForm({
      nome: turma.nome,
      sala: turma.sala ?? "",
      situacao: turma.situacao ?? "",
      inicio: turma.inicio ?? "",
      fim: turma.fim ?? "",
    });
    setModal({ tipo: "editar-turma" });
  };

  const handleSalvarTurma = () => {
    if (!turmaForm.nome.trim()) {
      toast.warn("O nome da turma é obrigatório.");
      return;
    }
    setIsSaving(true);
    const payload: TTurmaCreate = {
      nome: turmaForm.nome.trim(),
      sala: turmaForm.sala?.trim() || null,
      situacao: turmaForm.situacao?.trim() || null,
      inicio: turmaForm.inicio?.trim() || null,
      fim: turmaForm.fim?.trim() || null,
    };
    TurmaService.update(turmaId, payload)
      .then(() => {
        toast.success("Turma atualizada com sucesso!");
        fecharModal();
        recarregar();
      })
      .catch((err) => toast.error(String(err?.message ?? err)))
      .finally(() => setIsSaving(false));
  };

  const handleExcluirTurma = () => {
    setIsSaving(true);
    TurmaService.remove(turmaId)
      .then(() => {
        toast.success("Turma excluída com sucesso!");
        navigate("/main/turmas");
      })
      .catch((err) => toast.error(String(err?.message ?? err)))
      .finally(() => setIsSaving(false));
  };

  // ── Busca de alunos com debounce ──────────────────────────────────────
  const handleSearchNomeChange = (valor: string) => {
    setSearchNome(valor);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (!valor.trim()) {
      setSearchResults([]);
      return;
    }
    searchDebounceRef.current = setTimeout(() => {
      setIsSearching(true);
      AlunoService.search(valor.trim())
        .then((res) => {
          // Filtrar alunos que já estão na turma
          const alunosNaTurma = new Set(
            turma?.alunos.map((a) => a.alunoId) ?? []
          );
          setSearchResults(res.filter((a) => !alunosNaTurma.has(a.id)));
        })
        .catch(() => setSearchResults([]))
        .finally(() => setIsSearching(false));
    }, 350);
  };

  // ── Ações: Aulas ─────────────────────────────────────────────────────
  const handleSalvarAula = () => {
    if (!aulaForm.dia) {
      toast.warn("Selecione o dia da semana.");
      return;
    }
    if (!aulaForm.horario.trim()) {
      toast.warn("Informe o horário da aula.");
      return;
    }
    setIsSaving(true);
    AulaService.create(turmaId, { dia: aulaForm.dia, horario: aulaForm.horario.trim() })
      .then(() => {
        toast.success("Aula adicionada com sucesso!");
        fecharModal();
        recarregar();
      })
      .catch((err) => toast.error(String(err?.message ?? err)))
      .finally(() => setIsSaving(false));
  };

  const abrirEditarAula = (aula: { id: string; dia: string; horario: string }) => {
    setAulaEditForm({ dia: aula.dia, horario: aula.horario });
    setModal({ tipo: "editar-aula", aulaId: aula.id });
  };

  const handleSalvarEdicaoAula = () => {
    if (modal.tipo !== "editar-aula") return;
    if (!aulaEditForm.dia) {
      toast.warn("Selecione o dia da semana.");
      return;
    }
    if (!aulaEditForm.horario.trim()) {
      toast.warn("Informe o horário da aula.");
      return;
    }
    setIsSaving(true);
    AulaService.update(turmaId, modal.aulaId, {
      dia: aulaEditForm.dia,
      horario: aulaEditForm.horario.trim(),
    })
      .then(() => {
        toast.success("Aula atualizada!");
        fecharModal();
        recarregar();
      })
      .catch((err) => toast.error(String(err?.message ?? err)))
      .finally(() => setIsSaving(false));
  };

  const handleRemoverAula = () => {
    if (modal.tipo !== "remover-aula") return;
    setIsSaving(true);
    AulaService.remove(turmaId, modal.aulaId)
      .then(() => {
        toast.success("Aula removida.");
        fecharModal();
        recarregar();
      })
      .catch((err) => toast.error(String(err?.message ?? err)))
      .finally(() => setIsSaving(false));
  };

  // ── Ações: Alunos ─────────────────────────────────────────────────────
  const handleVincularAluno = (alunoId: number) => {
    setIsSaving(true);
    TurmaService.vincularAluno(turmaId, alunoId)
      .then(() => {
        toast.success("Aluno vinculado à turma!");
        fecharModal();
        recarregar();
      })
      .catch((err) => toast.error(String(err?.message ?? err)))
      .finally(() => setIsSaving(false));
  };

  const handleCriarEVincularAluno = () => {
    if (!novoAlunoForm.nome.trim()) {
      toast.warn("O nome do aluno é obrigatório.");
      return;
    }
    const idadeNum = novoAlunoForm.idade ? Number(novoAlunoForm.idade) : undefined;
    if (novoAlunoForm.idade && !Number.isFinite(idadeNum)) {
      toast.warn("Idade inválida.");
      return;
    }
    setIsSaving(true);
    AlunoService.create({ nome: novoAlunoForm.nome.trim(), idade: idadeNum ?? null })
      .then((aluno) => TurmaService.vincularAluno(turmaId, aluno.id))
      .then(() => {
        toast.success("Aluno criado e vinculado à turma!");
        fecharModal();
        recarregar();
      })
      .catch((err) => toast.error(String(err?.message ?? err)))
      .finally(() => setIsSaving(false));
  };

  const handleDesvincularAluno = () => {
    if (modal.tipo !== "remover-aluno") return;
    setIsSaving(true);
    TurmaService.desvincularAluno(turmaId, modal.alunoId)
      .then(() => {
        toast.success("Aluno removido da turma.");
        fecharModal();
        recarregar();
      })
      .catch((err) => toast.error(String(err?.message ?? err)))
      .finally(() => setIsSaving(false));
  };

  // ── Ações: Atividades ─────────────────────────────────────────────────
  const handleSalvarAtividade = () => {
    if (!atividadeForm.capitulo.trim()) {
      toast.warn("O capítulo é obrigatório.");
      return;
    }
    const peso = atividadeForm.peso ? Number(atividadeForm.peso) : undefined;
    if (atividadeForm.peso && !Number.isFinite(peso)) {
      toast.warn("Peso inválido.");
      return;
    }
    setIsSaving(true);
    AtividadeService.create({
      capitulo: atividadeForm.capitulo.trim(),
      peso: peso ?? null,
      turmaId,
    })
      .then(() => {
        toast.success("Atividade adicionada!");
        fecharModal();
        recarregar();
      })
      .catch((err) => toast.error(String(err?.message ?? err)))
      .finally(() => setIsSaving(false));
  };

  const abrirEditarAtividade = (atividade: TAtividade) => {
    setAtividadeEditForm({
      capitulo: atividade.capitulo,
      peso: atividade.peso != null ? String(atividade.peso) : "",
    });
    setModal({ tipo: "editar-atividade", atividade });
  };

  const handleSalvarEdicaoAtividade = () => {
    if (modal.tipo !== "editar-atividade") return;
    if (!atividadeEditForm.capitulo.trim()) {
      toast.warn("O capítulo é obrigatório.");
      return;
    }
    const peso = atividadeEditForm.peso ? Number(atividadeEditForm.peso) : undefined;
    if (atividadeEditForm.peso && !Number.isFinite(peso)) {
      toast.warn("Peso inválido.");
      return;
    }
    setIsSaving(true);
    AtividadeService.update(modal.atividade.id, {
      capitulo: atividadeEditForm.capitulo.trim(),
      peso: peso ?? null,
    })
      .then(() => {
        toast.success("Atividade atualizada!");
        fecharModal();
        recarregar();
      })
      .catch((err) => toast.error(String(err?.message ?? err)))
      .finally(() => setIsSaving(false));
  };

  const handleRemoverAtividade = () => {
    if (modal.tipo !== "remover-atividade") return;
    setIsSaving(true);
    AtividadeService.remove(modal.atividadeId)
      .then(() => {
        toast.success("Atividade removida.");
        fecharModal();
        recarregar();
      })
      .catch((err) => toast.error(String(err?.message ?? err)))
      .finally(() => setIsSaving(false));
  };

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.skeletonHeader} />
        <div className={styles.skeletonInfo} />
        <div className={styles.skeletonSection} />
      </div>
    );
  }

  if (!turma) {
    return (
      <div className={styles.page}>
        <p className={styles.empty}>Turma não encontrada.</p>
        <Button onClick={() => navigate("/main/turmas")}>
          <IoArrowBackOutline /> Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* ── Cabeçalho ──────────────────────────────────────── */}
      <div className={styles.detalheHeader}>
        <Button variant="icon" title="Voltar" onClick={() => navigate("/main/turmas")}>
          <IoArrowBackOutline />
        </Button>
        <div className={styles.detalheHeaderInfo}>
          <h2 className={styles.title}>{turma.nome}</h2>
          {turma.situacao && (
            <span
              className={`${styles.badge} ${styles[`badge-${turma.situacao.toLowerCase().replace(" ", "-")}`]}`}
            >
              {turma.situacao}
            </span>
          )}
        </div>
        <div className={styles.detalheHeaderActions}>
          <Button variant="icon" title="Editar turma" onClick={abrirEditarTurma}>
            <IoPencilOutline />
          </Button>
          <Button variant="icon-danger" title="Excluir turma" onClick={() => setModal({ tipo: "excluir-turma" })}>
            <IoTrashOutline />
          </Button>
        </div>
      </div>

      {/* ── Info card ──────────────────────────────────────── */}
      <div className={styles.infoCard}>
        {turma.sala && (
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Sala</span>
            <span className={styles.infoValue}>{turma.sala}</span>
          </div>
        )}
        {(turma.inicio || turma.fim) && (
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Período</span>
            <span className={styles.infoValue}>
              {turma.inicio ? formatarData(turma.inicio) : "—"}
              {" → "}
              {turma.fim ? formatarData(turma.fim) : "—"}
            </span>
          </div>
        )}
      </div>

      {/* ── Seções ─────────────────────────────────────────── */}
      <div className={styles.sections}>

        {/* ── Aulas ─────────────────────────────────────── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Aulas</h3>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setModal({ tipo: "nova-aula" })}
            >
              <IoAddOutline /> Nova aula
            </Button>
          </div>
          {turma.aulas.length === 0 ? (
            <p className={styles.empty}>Nenhuma aula cadastrada.</p>
          ) : (
            <ul className={styles.itemList}>
              {turma.aulas.map((aula) => (
                <li key={aula.id} className={styles.item}>
                  <span className={styles.itemMain}>{aula.dia}</span>
                  <span className={styles.itemSub}>{aula.horario}</span>
                  <Button
                    variant="icon"
                    title="Editar aula"
                    onClick={() => abrirEditarAula(aula)}
                  >
                    <IoPencilOutline />
                  </Button>
                  <Button
                    variant="icon-danger"
                    title="Remover aula"
                    onClick={() => setModal({ tipo: "remover-aula", aulaId: aula.id })}
                  >
                    <IoTrashOutline />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ── Alunos ─────────────────────────────────────── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Alunos</h3>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setModal({ tipo: "vincular-aluno" })}
            >
              <IoPersonAddOutline /> Vincular aluno
            </Button>
          </div>
          {turma.alunos.length === 0 ? (
            <p className={styles.empty}>Nenhum aluno nesta turma.</p>
          ) : (
            <ul className={styles.itemList}>
              {turma.alunos.map(({ aluno }) => (
                <li key={aluno.id} className={styles.item}>
                  <span className={styles.itemMain}>{aluno.nome}</span>
                  {aluno.idade && (
                    <span className={styles.itemSub}>{aluno.idade} anos</span>
                  )}
                  <Button
                    variant="danger"
                    size="sm"
                    title="Remover aluno da turma"
                    onClick={() =>
                      setModal({
                        tipo: "remover-aluno",
                        alunoId: aluno.id,
                        nome: aluno.nome,
                      })
                    }
                  >
                    <IoTrashOutline />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ── Atividades ─────────────────────────────────── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Atividades</h3>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setModal({ tipo: "nova-atividade" })}
            >
              <IoAddOutline /> Nova atividade
            </Button>
          </div>
          {turma.atividades.length === 0 ? (
            <p className={styles.empty}>Nenhuma atividade cadastrada.</p>
          ) : (
            <ul className={styles.itemList}>
              {turma.atividades.map((atividade) => (
                <li key={atividade.id} className={styles.item}>
                  <span className={styles.itemMain}>{atividade.capitulo}</span>
                  {atividade.peso != null && (
                    <span className={styles.itemSub}>Peso: {atividade.peso}</span>
                  )}
                  <Button
                    variant="icon"
                    title="Ver detalhes"
                    onClick={() => navigate(`/main/atividades/${atividade.id}`)}
                  >
                    <IoOpenOutline />
                  </Button>
                  <Button
                    variant="icon"
                    title="Editar atividade"
                    onClick={() => abrirEditarAtividade(atividade)}
                  >
                    <IoPencilOutline />
                  </Button>
                  <Button
                    variant="icon-danger"
                    title="Remover atividade"
                    onClick={() =>
                      setModal({
                        tipo: "remover-atividade",
                        atividadeId: atividade.id,
                      })
                    }
                  >
                    <IoTrashOutline />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* ── Modal: Nova aula ──────────────────────────────── */}
      <Modal
        isOpen={modal.tipo === "nova-aula"}
        onRequestClose={fecharModal}
        title="Nova aula"
        width="sm"
        actions={
          <>
            <Button variant="secondary" onClick={fecharModal} disabled={isSaving}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSalvarAula} disabled={isSaving}>
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </>
        }
      >
        <div className={styles.form}>
          <label className={styles.label} htmlFor="aula-dia">Dia da semana *</label>
          <select
            id="aula-dia"
            className={styles.input}
            value={aulaForm.dia}
            onChange={(e) => setAulaForm((f) => ({ ...f, dia: e.target.value }))}
            disabled={isSaving}
          >
            <option value="">Selecione...</option>
            {DIAS_SEMANA.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <label className={styles.label} htmlFor="aula-horario">Horário *</label>
          <input
            id="aula-horario"
            className={styles.input}
            type="text"
            placeholder="Ex: 08:00 até 09:00"
            value={aulaForm.horario}
            onChange={(e) => setAulaForm((f) => ({ ...f, horario: e.target.value }))}
            disabled={isSaving}
          />
        </div>
      </Modal>

      {/* ── Modal: Editar aula ────────────────────────────── */}
      <Modal
        isOpen={modal.tipo === "editar-aula"}
        onRequestClose={fecharModal}
        title="Editar aula"
        width="sm"
        actions={
          <>
            <Button variant="secondary" onClick={fecharModal} disabled={isSaving}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSalvarEdicaoAula} disabled={isSaving}>
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </>
        }
      >
        <div className={styles.form}>
          <label className={styles.label} htmlFor="aula-edit-dia">Dia da semana *</label>
          <select
            id="aula-edit-dia"
            className={styles.input}
            value={aulaEditForm.dia}
            onChange={(e) => setAulaEditForm((f) => ({ ...f, dia: e.target.value }))}
            disabled={isSaving}
          >
            <option value="">Selecione...</option>
            {DIAS_SEMANA.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <label className={styles.label} htmlFor="aula-edit-horario">Horário *</label>
          <input
            id="aula-edit-horario"
            className={styles.input}
            type="text"
            placeholder="Ex: 08:00 até 09:00"
            value={aulaEditForm.horario}
            onChange={(e) => setAulaEditForm((f) => ({ ...f, horario: e.target.value }))}
            disabled={isSaving}
          />
        </div>
      </Modal>

      {/* ── Modal: Vincular aluno ──────────────────────────── */}
      <Modal
        isOpen={modal.tipo === "vincular-aluno"}
        onRequestClose={fecharModal}
        title="Vincular aluno"
        width="sm"
        actions={
          modoVincular === "novo" ? (
            <>
              <Button variant="secondary" onClick={() => setModoVincular("buscar")} disabled={isSaving}>
                Voltar
              </Button>
              <Button variant="primary" onClick={handleCriarEVincularAluno} disabled={isSaving}>
                {isSaving ? "Salvando..." : "Criar e vincular"}
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={fecharModal} disabled={isSaving}>
              Fechar
            </Button>
          )
        }
      >
        {modoVincular === "buscar" ? (
          <div className={styles.form}>
            <label className={styles.label} htmlFor="aluno-search">Buscar aluno existente</label>
            <div className={styles.searchWrapper}>
              <IoSearchOutline className={styles.searchIcon} />
              <input
                id="aluno-search"
                className={styles.inputSearch}
                type="text"
                placeholder="Digite o nome..."
                value={searchNome}
                onChange={(e) => handleSearchNomeChange(e.target.value)}
                autoFocus
              />
            </div>

            {isSearching && <p className={styles.searchHint}>Buscando...</p>}

            {!isSearching && searchNome && searchResults.length === 0 && (
              <p className={styles.searchHint}>Nenhum aluno encontrado.</p>
            )}

            {searchResults.length > 0 && (
              <ul className={styles.searchList}>
                {searchResults.map((a) => (
                  <li key={a.id} className={styles.searchItem}>
                    <span>{a.nome}{a.idade ? ` (${a.idade} anos)` : ""}</span>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleVincularAluno(a.id)}
                      disabled={isSaving}
                    >
                      Vincular
                    </Button>
                  </li>
                ))}
              </ul>
            )}

            <div className={styles.divider} />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setModoVincular("novo")}
            >
              <IoPersonAddOutline /> Criar novo aluno
            </Button>
          </div>
        ) : (
          <div className={styles.form}>
            <label className={styles.label} htmlFor="novo-aluno-nome">Nome *</label>
            <input
              id="novo-aluno-nome"
              className={styles.input}
              type="text"
              placeholder="Nome completo"
              value={novoAlunoForm.nome}
              onChange={(e) => setNovoAlunoForm((f) => ({ ...f, nome: e.target.value }))}
              disabled={isSaving}
              autoFocus
            />

            <label className={styles.label} htmlFor="novo-aluno-idade">Idade</label>
            <input
              id="novo-aluno-idade"
              className={styles.input}
              type="number"
              placeholder="Ex: 14"
              min={1}
              value={novoAlunoForm.idade}
              onChange={(e) => setNovoAlunoForm((f) => ({ ...f, idade: e.target.value }))}
              disabled={isSaving}
            />
          </div>
        )}
      </Modal>

      {/* ── Modal: Nova atividade ──────────────────────────── */}
      <Modal
        isOpen={modal.tipo === "nova-atividade"}
        onRequestClose={fecharModal}
        title="Nova atividade"
        width="sm"
        actions={
          <>
            <Button variant="secondary" onClick={fecharModal} disabled={isSaving}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSalvarAtividade} disabled={isSaving}>
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </>
        }
      >
        <div className={styles.form}>
          <label className={styles.label} htmlFor="atividade-capitulo">Capítulo *</label>
          <input
            id="atividade-capitulo"
            className={styles.input}
            type="text"
            placeholder="Ex: Chapter 3"
            value={atividadeForm.capitulo}
            onChange={(e) => setAtividadeForm((f) => ({ ...f, capitulo: e.target.value }))}
            disabled={isSaving}
          />

          <label className={styles.label} htmlFor="atividade-peso">Peso</label>
          <input
            id="atividade-peso"
            className={styles.input}
            type="number"
            placeholder="Ex: 2"
            min={0}
            step={0.1}
            value={atividadeForm.peso}
            onChange={(e) => setAtividadeForm((f) => ({ ...f, peso: e.target.value }))}
            disabled={isSaving}
          />
        </div>
      </Modal>

      {/* ── Modal: Editar atividade ───────────────────────── */}
      <Modal
        isOpen={modal.tipo === "editar-atividade"}
        onRequestClose={fecharModal}
        title="Editar atividade"
        width="sm"
        actions={
          <>
            <Button variant="secondary" onClick={fecharModal} disabled={isSaving}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSalvarEdicaoAtividade} disabled={isSaving}>
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </>
        }
      >
        <div className={styles.form}>
          <label className={styles.label} htmlFor="atividade-edit-capitulo">Capítulo *</label>
          <input
            id="atividade-edit-capitulo"
            className={styles.input}
            type="text"
            placeholder="Ex: Chapter 3"
            value={atividadeEditForm.capitulo}
            onChange={(e) => setAtividadeEditForm((f) => ({ ...f, capitulo: e.target.value }))}
            disabled={isSaving}
          />

          <label className={styles.label} htmlFor="atividade-edit-peso">Peso</label>
          <input
            id="atividade-edit-peso"
            className={styles.input}
            type="number"
            placeholder="Ex: 2"
            min={0}
            step={0.1}
            value={atividadeEditForm.peso}
            onChange={(e) => setAtividadeEditForm((f) => ({ ...f, peso: e.target.value }))}
            disabled={isSaving}
          />
        </div>
      </Modal>

      {/* ── Modal: Confirmar remoção de aula ──────────────── */}
      <Modal
        isOpen={modal.tipo === "remover-aula"}
        onRequestClose={fecharModal}
        title="Remover aula"
        width="sm"
        actions={
          <>
            <Button variant="secondary" onClick={fecharModal} disabled={isSaving}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleRemoverAula} disabled={isSaving}>
              {isSaving ? "Removendo..." : "Remover"}
            </Button>
          </>
        }
      >
        <p>Tem certeza que deseja remover esta aula?</p>
      </Modal>

      {/* ── Modal: Confirmar remoção de aluno ─────────────── */}
      <Modal
        isOpen={modal.tipo === "remover-aluno"}
        onRequestClose={fecharModal}
        title="Remover aluno da turma"
        width="sm"
        actions={
          <>
            <Button variant="secondary" onClick={fecharModal} disabled={isSaving}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDesvincularAluno} disabled={isSaving}>
              {isSaving ? "Removendo..." : "Remover"}
            </Button>
          </>
        }
      >
        {modal.tipo === "remover-aluno" && (
          <p>
            Remover <strong>{modal.nome}</strong> desta turma?
          </p>
        )}
      </Modal>

      {/* ── Modal: Confirmar remoção de atividade ─────────── */}
      <Modal
        isOpen={modal.tipo === "remover-atividade"}
        onRequestClose={fecharModal}
        title="Remover atividade"
        width="sm"
        actions={
          <>
            <Button variant="secondary" onClick={fecharModal} disabled={isSaving}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleRemoverAtividade} disabled={isSaving}>
              {isSaving ? "Removendo..." : "Remover"}
            </Button>
          </>
        }
      >
        <p>Tem certeza que deseja remover esta atividade?</p>
      </Modal>

      {/* ── Modal: Editar turma ───────────────────────────── */}
      <Modal
        isOpen={modal.tipo === "editar-turma"}
        onRequestClose={fecharModal}
        title="Editar turma"
        width="sm"
        actions={
          <>
            <Button variant="secondary" onClick={fecharModal} disabled={isSaving}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSalvarTurma} disabled={isSaving}>
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </>
        }
      >
        <div className={styles.form}>
          <label className={styles.label} htmlFor="turma-edit-nome">Nome *</label>
          <input
            id="turma-edit-nome"
            className={styles.input}
            type="text"
            placeholder="Ex: Intermediário B"
            value={turmaForm.nome}
            onChange={(e) => setTurmaForm((f) => ({ ...f, nome: e.target.value }))}
            disabled={isSaving}
          />

          <label className={styles.label} htmlFor="turma-edit-sala">Sala</label>
          <input
            id="turma-edit-sala"
            className={styles.input}
            type="text"
            placeholder="Ex: Sala 3"
            value={turmaForm.sala ?? ""}
            onChange={(e) => setTurmaForm((f) => ({ ...f, sala: e.target.value }))}
            disabled={isSaving}
          />

          <label className={styles.label} htmlFor="turma-edit-situacao">Situação</label>
          <select
            id="turma-edit-situacao"
            className={styles.input}
            value={turmaForm.situacao ?? ""}
            onChange={(e) => setTurmaForm((f) => ({ ...f, situacao: e.target.value }))}
            disabled={isSaving}
          >
            <option value="">Selecione...</option>
            <option value="Futura">Futura</option>
            <option value="Em andamento">Em andamento</option>
            <option value="Encerrada">Encerrada</option>
          </select>

          <label className={styles.label} htmlFor="turma-edit-inicio">Início</label>
          <input
            id="turma-edit-inicio"
            className={styles.input}
            type="date"
            value={turmaForm.inicio ?? ""}
            onChange={(e) => setTurmaForm((f) => ({ ...f, inicio: e.target.value }))}
            disabled={isSaving}
          />

          <label className={styles.label} htmlFor="turma-edit-fim">Fim</label>
          <input
            id="turma-edit-fim"
            className={styles.input}
            type="date"
            value={turmaForm.fim ?? ""}
            onChange={(e) => setTurmaForm((f) => ({ ...f, fim: e.target.value }))}
            disabled={isSaving}
          />
        </div>
      </Modal>

      {/* ── Modal: Excluir turma ──────────────────────────── */}
      <Modal
        isOpen={modal.tipo === "excluir-turma"}
        onRequestClose={fecharModal}
        title="Excluir turma"
        width="sm"
        actions={
          <>
            <Button variant="secondary" onClick={fecharModal} disabled={isSaving}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleExcluirTurma} disabled={isSaving}>
              {isSaving ? "Excluindo..." : "Excluir"}
            </Button>
          </>
        }
      >
        <p>
          Tem certeza que deseja excluir a turma{" "}
          <strong>{turma.nome}</strong>? Esta ação não pode ser desfeita.
        </p>
      </Modal>
    </div>
  );
}

export default TurmaDetalhe;
