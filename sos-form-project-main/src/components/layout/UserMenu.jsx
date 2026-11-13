import { useEffect, useId, useRef, useState } from "react";

// Avatar clicável que abre o menu da conta. `placement`: "up" (sidebar,
// rodapé da tela) ou "down" (topbar do celular). Fecha em clique fora,
// Esc e ao escolher uma opção.
export default function UserMenu({ user, placement = "down", onChangePassword, onLogout, children }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return undefined;
    function onPointer(e) {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") {
        setOpen(false);
        rootRef.current?.querySelector("[aria-haspopup]")?.focus();
      }
    }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function choose(action) {
    setOpen(false);
    action?.();
  }

  const initial = user?.name?.trim()?.[0]?.toUpperCase() || "?";

  return (
    <div className={`user-menu user-menu--${placement}`} ref={rootRef}>
      <button
        type="button"
        className="user-menu__trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        title="Minha conta"
      >
        <span className="app-shell__avatar">{initial}</span>
        {children}
      </button>

      {open && (
        <div className="user-menu__panel" role="menu" id={menuId}>
          <div className="user-menu__head">
            <strong>{user?.name}</strong>
            <span>{user?.email}</span>
          </div>
          <button type="button" role="menuitem" className="user-menu__item" onClick={() => choose(onChangePassword)}>
            <span className="material-symbols-outlined" aria-hidden="true">
              lock_reset
            </span>
            Alterar senha
          </button>
          <button
            type="button"
            role="menuitem"
            className="user-menu__item user-menu__item--danger"
            onClick={() => choose(onLogout)}
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              logout
            </span>
            Sair
          </button>
        </div>
      )}
    </div>
  );
}
