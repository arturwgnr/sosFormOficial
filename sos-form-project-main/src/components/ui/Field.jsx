import "./Field.css";

export default function Field({ label, error, hint, children, required }) {
  return (
    <label className="field">
      <span className="field__label">
        {label}
        {required && <span className="field__required"> *</span>}
      </span>
      {children}
      {hint && !error && <span className="field__hint">{hint}</span>}
      {error && <span className="field__error">{error}</span>}
    </label>
  );
}
