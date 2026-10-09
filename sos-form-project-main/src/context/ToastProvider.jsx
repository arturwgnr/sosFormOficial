import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ToastContext } from "./toastContextInstance";
import { playSound } from "../utils/sounds";
import "../components/ui/Toast.css";

const ICON_BY_TONE = {
  success: "check_circle",
  error: "error",
  warning: "warning",
  info: "info",
};

const DEFAULT_DURATION = 4500;
const EXIT_DURATION = 220; // igual à animação de saída no Toast.css
const MAX_VISIBLE = 4;

let nextId = 1;

function ToastItem({ toast, onDismiss }) {
  const timerRef = useRef(null);
  const remainingRef = useRef(toast.duration);
  const startedAtRef = useRef(0);

  const start = useCallback(() => {
    startedAtRef.current = Date.now();
    timerRef.current = setTimeout(() => onDismiss(toast.id), remainingRef.current);
  }, [onDismiss, toast.id]);

  // Pausa o tempo enquanto o mouse está em cima (dá tempo de ler).
  const pause = useCallback(() => {
    clearTimeout(timerRef.current);
    remainingRef.current -= Date.now() - startedAtRef.current;
  }, []);

  useEffect(() => {
    start();
    return () => clearTimeout(timerRef.current);
  }, [start]);

  return (
    <div
      className={`toast toast--${toast.tone} ${toast.leaving ? "is-leaving" : ""}`}
      role={toast.tone === "error" ? "alert" : "status"}
      onMouseEnter={pause}
      onMouseLeave={start}
      style={{ "--toast-duration": `${toast.duration}ms` }}
    >
      <span className="toast__icon material-symbols-outlined" aria-hidden="true">
        {ICON_BY_TONE[toast.tone]}
      </span>
      <div className="toast__body">
        <strong>{toast.title}</strong>
        {toast.description && <p>{toast.description}</p>}
      </div>
      <button type="button" className="toast__close" aria-label="Fechar notificação" onClick={() => onDismiss(toast.id)}>
        <span className="material-symbols-outlined" aria-hidden="true">
          close
        </span>
      </button>
      <span className="toast__progress" aria-hidden="true" />
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), EXIT_DURATION);
  }, []);

  const show = useCallback(({ tone = "info", title, description, sound, duration = DEFAULT_DURATION }) => {
    const id = nextId++;
    if (sound) playSound(sound);
    setToasts((prev) => [...prev, { id, tone, title, description, duration }].slice(-MAX_VISIBLE));
    return id;
  }, []);

  const api = useMemo(
    () => ({
      show,
      dismiss,
      success: (title, opts) => show({ ...opts, tone: "success", title }),
      error: (title, opts) => show({ ...opts, tone: "error", title }),
      warning: (title, opts) => show({ ...opts, tone: "warning", title }),
      info: (title, opts) => show({ ...opts, tone: "info", title }),
    }),
    [show, dismiss],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-viewport" aria-live="polite">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
