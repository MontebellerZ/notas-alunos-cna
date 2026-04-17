import { useEffect, useRef } from "react";
import { NavLink } from "react-router";
import styles from "./styles.module.scss";

type MenuLateralProps = {
  isOpen: boolean;
  onClose: () => void;
};

const menuItems = [
  { label: "Dashboard", to: "/main" },
  { label: "Operações", to: "/main/operacoes" },
];

function MenuLateral({ isOpen, onClose }: MenuLateralProps) {
  const drawerRef = useRef<HTMLElement>(null);

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
      </aside>
    </>
  );
}

export default MenuLateral;
