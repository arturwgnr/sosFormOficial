import { useContext } from "react";
import { ToastContext } from "./toastContextInstance";

// Uso: const toast = useToast();
//      toast.success("Usuário aprovado", { description: "...", sound: "approve" });
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast precisa estar dentro de <ToastProvider>");
  return ctx;
}
