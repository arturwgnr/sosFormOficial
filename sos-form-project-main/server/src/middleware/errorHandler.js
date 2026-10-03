// Handler de erro central: qualquer exceção não tratada nas rotas (síncrona
// ou de uma Promise rejeitada, via o wrapper `asyncHandler`) cai aqui em
// vez de derrubar o processo ou vazar stack trace pro cliente.
export function errorHandler(err, req, res, _next) {
  console.error(err);

  if (res.headersSent) return;

  const status = err.status || 500;
  const message = status === 500 ? "Erro interno do servidor." : err.message;

  res.status(status).json({ error: message });
}

export function notFoundHandler(req, res) {
  res.status(404).json({ error: "Rota não encontrada." });
}

// Evita precisar de try/catch em cada controller async: qualquer rejeição
// é encaminhada automaticamente pro errorHandler.
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
