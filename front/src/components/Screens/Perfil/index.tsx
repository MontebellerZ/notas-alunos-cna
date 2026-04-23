import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { toast } from "react-toastify";
import Button from "../../Shared/Button";
import UsuarioService from "../../../services/usuario.service";
import TokenStorage from "../../../stores/store/token.store";
import UsuarioStorage from "../../../stores/store/usuario.store";
import defaultUserAvatar from "../../../assets/default-user.svg";
import styles from "./styles.module.scss";

const MAX_FILE_SIZE_MB = 8;

function Perfil() {
  const fotoPreviewUrlRef = useRef<string | null>(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [fotoAtual, setFotoAtual] = useState<string | null>(null);
  const [fotoArquivo, setFotoArquivo] = useState<File | null>(null);
  const [removerFoto, setRemoverFoto] = useState(false);

  const clearPreviewObjectUrl = () => {
    if (!fotoPreviewUrlRef.current) {
      return;
    }

    URL.revokeObjectURL(fotoPreviewUrlRef.current);
    fotoPreviewUrlRef.current = null;
  };

  useEffect(() => {
    UsuarioService.getMe()
      .then((usuario) => {
        clearPreviewObjectUrl();
        setNome(usuario.nome ?? "");
        setEmail(usuario.email);
        setIsAdmin(usuario.admin);
        setFotoAtual(usuario.foto);
        UsuarioStorage.save(usuario);
      })
      .catch((err) => toast.error(err?.toString?.() ?? "Erro ao carregar perfil."))
      .finally(() => setIsLoading(false));

    return () => {
      clearPreviewObjectUrl();
    };
  }, []);

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.warn(`A imagem deve ter no máximo ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    clearPreviewObjectUrl();
    const previewUrl = URL.createObjectURL(file);
    fotoPreviewUrlRef.current = previewUrl;

    setFotoArquivo(file);
    setRemoverFoto(false);
    setFotoAtual(previewUrl);
    event.target.value = "";
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("nome", nome.trim());

    if (isAdmin) {
      formData.append("email", email.trim());
    }

    if (fotoArquivo) {
      formData.append("foto", fotoArquivo);
    } else if (removerFoto) {
      formData.append("removerFoto", "true");
    }

    if (isAdmin && senha) {
      formData.append("senha", senha);
    }

    setIsSaving(true);

    UsuarioService.updateMe(formData)
      .then(({ usuario, token }) => {
        clearPreviewObjectUrl();
        TokenStorage.save(token);
        UsuarioStorage.save(usuario);
        setNome(usuario.nome ?? "");
        setEmail(usuario.email);
        setIsAdmin(usuario.admin);
        setFotoAtual(usuario.foto);
        setFotoArquivo(null);
        setRemoverFoto(false);
        setSenha("");
        toast.success("Perfil atualizado com sucesso.");
      })
      .catch((err) => toast.error(err?.toString?.() ?? "Erro ao salvar perfil."))
      .finally(() => setIsSaving(false));
  };

  if (isLoading) {
    return <p className={styles.loading}>Carregando perfil...</p>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h2>Meu Perfil</h2>
        <p className={styles.subtitle}>
          {isAdmin
            ? "Atualize seus dados pessoais, email e senha de acesso."
            : "Atualize seus dados pessoais e foto de perfil."}
        </p>

        <form onSubmit={submit} className={styles.form}>
          <div className={styles.avatarBlock}>
            <img
              src={fotoAtual || defaultUserAvatar}
              alt="Foto do usuário"
              className={styles.avatar}
              onError={() => setFotoAtual(null)}
            />
            <div className={styles.avatarActions}>
              <label className={styles.fileButton}>
                Alterar foto
                <input type="file" accept="image/*" onChange={handleImageUpload} />
              </label>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  clearPreviewObjectUrl();
                  setFotoAtual(null);
                  setFotoArquivo(null);
                  setRemoverFoto(true);
                }}
                disabled={!fotoAtual}
              >
                Remover foto
              </Button>
            </div>
          </div>

          <label htmlFor="nome">Nome</label>
          <input
            id="nome"
            type="text"
            value={nome}
            onChange={(event) => setNome(event.target.value)}
            placeholder="Seu nome"
            disabled={isSaving}
          />

          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={!isAdmin || isSaving}
          />
          {!isAdmin && (
            <small className={styles.hint}>Apenas administradores podem alterar o email.</small>
          )}

          {isAdmin && (
            <>
              <label htmlFor="senha">Nova senha</label>
              <input
                id="senha"
                type="password"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                placeholder="Deixe em branco para manter a senha atual"
                disabled={isSaving}
              />
            </>
          )}

          <div className={styles.footer}>
            <Button type="submit" variant="primary" size="lg" disabled={isSaving}>
              {isSaving ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Perfil;
