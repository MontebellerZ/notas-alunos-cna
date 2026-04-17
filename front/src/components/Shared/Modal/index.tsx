import { IoCloseOutline } from "react-icons/io5";
import type { ReactNode } from "react";
import styles from "./styles.module.scss";

type ModalProps = {
  isOpen: boolean;
  onRequestClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  width?: "sm" | "md" | "lg";
  closeOnBackdrop?: boolean;
  showCloseButton?: boolean;
};

function Modal({
  isOpen,
  onRequestClose,
  title,
  children,
  actions,
  width = "md",
  closeOnBackdrop = true,
  showCloseButton = true,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      onClick={(event) => {
        if (!closeOnBackdrop) return;
        if (event.target !== event.currentTarget) return;
        onRequestClose();
      }}
    >
      <div className={`${styles.modal} ${styles[`width-${width}`]}`}>
        {(title || showCloseButton) && (
          <div className={styles.header}>
            {title ? <h3>{title}</h3> : <span />}
            {showCloseButton && (
              <button type="button" className={styles.closeButton} onClick={onRequestClose}>
                <IoCloseOutline />
              </button>
            )}
          </div>
        )}

        <div className={styles.body}>{children}</div>

        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </div>
  );
}

export default Modal;
