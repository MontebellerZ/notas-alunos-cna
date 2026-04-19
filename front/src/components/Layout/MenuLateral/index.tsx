import { useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router";
import styles from "./styles.module.scss";
import { IoLogOutOutline } from "react-icons/io5";
import TokenStorage from "../../../stores/store/token.store";
import UsuarioStorage from "../../../stores/store/usuario.store";

type MenuLateralProps = {
  isOpen: boolean;
  onClose: () => void;
};

const menuItems = [
  { label: "Turmas", to: "/main/turmas" },
  { label: "Agenda", to: "/main/agenda" },
  { label: "Alunos", to: "/main/alunos" },
  { label: "Dashboard", to: "/main/dashboard" },
];

function MenuLateral({ isOpen, onClose }: MenuLateralProps) {
  const drawerRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();

  function handleLogout() {
    TokenStorage.delete();
    UsuarioStorage.delete();
    onClose();
    navigate("/");
  }

  useEffect(() => {
    if (isOpen) {
      drawerRef.current?.focus();
    }
  }, [isOpen]);

  return (
    <>
      <button
        className={`${styles.backdrop} ${isOpen ? styles.backdropVisible : ""}`}
        onClick={onClose}
        aria-hidden={!isOpen}
        tabIndex={-1}
        type="button"
      />

      <aside
        ref={drawerRef}
        className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ""}`}
        tabIndex={isOpen ? 0 : -1}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            onClose();
          }
        }}
      >
        <header className={styles.header}>
          <h2 className={styles.title}>Navegação</h2>
          <button type="button" className={styles.closeButton} onClick={onClose}>
            x
          </button>
        </header>

        <nav className={styles.nav}>
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/main"}
              className={({ isActive }) => `${styles.link} ${isActive ? styles.linkActive : ""}`}
              onClick={onClose}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <footer className={styles.footer}>
          <button type="button" className={styles.logoutButton} onClick={handleLogout}>
            <IoLogOutOutline size={18} />
            <span>Sair</span>
          </button>
        </footer>
      </aside>
    </>
  );
}

export default MenuLateral;
