import { Outlet } from "react-router";
import styles from "./styles.module.scss";

function Conteudo() {
  return (
    <section className={styles.content}>
      <Outlet />
    </section>
  );
}

export default Conteudo;