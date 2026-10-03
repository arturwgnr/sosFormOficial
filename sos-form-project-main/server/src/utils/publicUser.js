// Nunca devolver passwordHash (nem nada interno de sessão) nas respostas.
export function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    canViewAllReports: user.canViewAllReports,
    createdAt: user.createdAt,
  };
}
