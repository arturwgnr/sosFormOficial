import { useEffect, useRef } from "react";
import "./Modal.css";

// Modal sobre o <dialog> nativo: foco preso dentro, Esc fecha e o resto
// da página fica inerte sem precisar de lib. `onClose` é chamado em Esc,
// clique no fundo e no botão de fechar; quem decide fechar é o pai
// (via `open`), então dá pra bloquear o fechamento durante um envio.
export default function Modal({ open, onClose, title, icon, tone = "default", children, footer }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function handleCancel(e) {
    e.preventDefault(); // Esc: deixa o pai decidir
    onClose?.();
  }

  function handleBackdropClick(e) {
    if (e.target === ref.current) onClose?.();
  }

  return (
    <dialog
      ref={ref}
      className={`modal modal--${tone}`}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      aria-labelledby="modal-title"
    >
      {open && (
        <div className="modal__panel">
          <header className="modal__header">
            {icon && (
              <span className="modal__icon material-symbols-outlined" aria-hidden="true">
                {icon}
              </span>
            )}
            <h2 id="modal-title" className="modal__title">
              {title}
            </h2>
            <button type="button" className="modal__close" onClick={onClose} aria-label="Fechar">
              <span className="material-symbols-outlined" aria-hidden="true">
                close
              </span>
            </button>
          </header>
          <div className="modal__body">{children}</div>
          {footer && <footer className="modal__footer">{footer}</footer>}
        </div>
      )}
    </dialog>
  );
}
