import { useState } from "react";
import Cabecalho from "./Cabecalho";
import Conteudo from "./Conteudo";
import MenuLateral from "./MenuLateral";
import Rodape from "./Rodape";
import styles from "./styles.module.scss";

function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className={`${styles.holder} ${isMenuOpen ? styles.lockScroll : ""}`}>
      <MenuLateral isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <Cabecalho onOpenMenu={() => setIsMenuOpen(true)} />
      <hr />
      <Conteudo />
      <hr />
      <Rodape />
    </div>
  );
}

export default Layout;
