// Middlewares genéricos de validação com zod. Em caso de erro, respondem
// 400 com a lista de problemas (nunca deixam dado inválido chegar ao
// controller) e NUNCA passam adiante.

export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Dados inválidos.",
        issues: result.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      });
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({
        error: "Parâmetros inválidos.",
        issues: result.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      });
    }
    req.query = result.data;
    next();
  };
}

export function validateParams(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return res.status(400).json({
        error: "Parâmetros de rota inválidos.",
        issues: result.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      });
    }
    req.params = result.data;
    next();
  };
}
