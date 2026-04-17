import styles from "./styles.module.scss";
import { IoMenu } from "react-icons/io5";

type ICabecalho = {
  onOpenMenu: () => void;
};

function Cabecalho(props: ICabecalho) {
  return (
    <section className={styles.header}>
      <div>
        <button type="button" className={styles.menuButton} onClick={props.onOpenMenu}>
          <IoMenu size={18} />
          <span>Menu</span>
        </button>
      </div>

      <div>
        <h1>Gaiden Operações</h1>
      </div>

      <div></div>
    </section>
  );
}

export default Cabecalho;
