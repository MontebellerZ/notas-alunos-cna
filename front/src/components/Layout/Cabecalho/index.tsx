import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import styles from "./styles.module.scss";
import { IoMenu } from "react-icons/io5";
import defaultUserAvatar from "../../../assets/default-user.svg";
import UsuarioStorage from "../../../stores/store/usuario.store";

type ICabecalho = {
  onOpenMenu: () => void;
};

function Cabecalho(props: ICabecalho) {
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState(() => UsuarioStorage.get()?.foto ?? defaultUserAvatar);

  useEffect(() => {
    const syncAvatar = () => {
      setAvatar(UsuarioStorage.get()?.foto ?? defaultUserAvatar);
    };

    window.addEventListener(UsuarioStorage.changedEvent, syncAvatar);
    return () => window.removeEventListener(UsuarioStorage.changedEvent, syncAvatar);
  }, []);

  return (
    <section className={styles.header}>
      <div>
        <button type="button" className={styles.menuButton} onClick={props.onOpenMenu}>
          <IoMenu size={18} />
          <span>Menu</span>
        </button>
      </div>

      <div>
        <h1>Aulas CNA</h1>
      </div>

      <div>
        <button
          type="button"
          className={styles.profileButton}
          onClick={() => navigate("/main/perfil")}
          aria-label="Abrir perfil"
          title="Perfil"
        >
          <img
            src={avatar}
            alt="Foto do perfil"
            className={styles.profileAvatar}
            onError={() => setAvatar(defaultUserAvatar)}
          />
        </button>
      </div>
    </section>
  );
}

export default Cabecalho;
