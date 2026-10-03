// Usar depois de requireAuth. Bloqueia a rota por papel (ex: ADMIN).
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Sem permissão para esta ação." });
    }
    next();
  };
}
