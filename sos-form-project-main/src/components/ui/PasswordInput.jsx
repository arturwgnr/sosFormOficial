import { useState } from "react";
import "./PasswordInput.css";

// Campo de senha com botão de mostrar/ocultar. Repassa todas as props pro
// <input> (value, onChange, autoComplete, disabled...).
export default function PasswordInput({ className = "", ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <span className={`password-input ${className}`}>
      <input {...props} type={visible ? "text" : "password"} />
      <button
        type="button"
        className="password-input__toggle"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
        aria-pressed={visible}
        title={visible ? "Ocultar senha" : "Mostrar senha"}
        disabled={props.disabled}
      >
        <span className="material-symbols-outlined" aria-hidden="true">
          {visible ? "visibility_off" : "visibility"}
        </span>
      </button>
    </span>
  );
}
