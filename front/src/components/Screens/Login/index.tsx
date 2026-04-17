import { useState } from "react";
import styles from "./styles.module.scss";
import UsuarioService from "../../../services/usuario.service";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import Button from "../../Shared/Button";
import UsuarioStorage from "../../../stores/store/usuario.store";

function Login() {
  const navigate = useNavigate();

  const usuarioSalvo = UsuarioStorage.get();

  const [email, setEmail] = useState(usuarioSalvo?.email ?? "");
  const [senha, setSenha] = useState(usuarioSalvo?.senha ?? "");
  const [manter, setManter] = useState(!!usuarioSalvo);
  const [isLoading, setIsLoading] = useState(false);

  const submitLogin = async (event?: React.SubmitEvent<HTMLFormElement>) => {
    event?.preventDefault();

    if (!email || !senha) {
      toast.warn("Email e senha obrigatórios");
      return;
    }

    setIsLoading(true);

    UsuarioService.Login(email.trim(), senha)
      .then(() => {
        toast.success(`Login realizado com sucesso!`);
        if (manter) UsuarioStorage.save({ email, senha });
        else UsuarioStorage.delete();
        navigate("/main");
      })
      .catch((err) => toast.error(err.toString()))
      .finally(() => setIsLoading(false));
  };

  return (
    <div className={styles.login}>
      <div className={styles.card}>
        <h1 className={styles.title}>Acessar sistema</h1>

        <p className={styles.subtitle}>Faça login para continuar</p>

        <form className={styles.form} onSubmit={submitLogin}>
          <label htmlFor="email" className={styles.label}>
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="seu@email.com"
            className={styles.input}
            disabled={isLoading}
          />

          <label htmlFor="senha" className={styles.label}>
            Senha
          </label>
          <input
            id="senha"
            type="password"
            autoComplete="current-password"
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
            placeholder="Digite sua senha"
            className={styles.input}
            disabled={isLoading}
          />

          <label htmlFor="manterConectado" className={styles.labelCheckbox}>
            <input
              id="manterConectado"
              type="checkbox"
              checked={manter}
              onChange={(event) => setManter(event.target.checked)}
              disabled={isLoading}
            />
            Manter conectado?
          </label>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={isLoading}
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default Login;
