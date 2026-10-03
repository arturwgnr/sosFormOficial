import "./Button.css";
import Spinner from "./Spinner";

export default function Button({
  variant = "primary",
  size,
  block,
  iconOnly,
  loading,
  disabled,
  icon,
  children,
  className = "",
  type = "button",
  ...props
}) {
  const classes = [
    "btn",
    `btn--${variant}`,
    size && `btn--${size}`,
    block && "btn--block",
    iconOnly && "btn--icon-only",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classes} disabled={disabled || loading} {...props}>
      {loading ? (
        <Spinner size={16} />
      ) : icon ? (
        <span className="material-symbols-outlined" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {children}
    </button>
  );
}
