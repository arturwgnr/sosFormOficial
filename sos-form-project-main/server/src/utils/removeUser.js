// Remove um usuário do banco SEM apagar os relatórios dele (são registros
// da empresa): o vínculo vira null pelo onDelete: SetNull e o nome do
// técnico continua em Report.authorName. Sessões caem em cascata.
// Usado pela rota de admin e pelo script de limpeza de admins.
export async function removeUserKeepingReports(prisma, user) {
  return prisma.$transaction(async (tx) => {
    // Garante o nome no relatório antes de soltar o vínculo (relatórios
    // criados antes da coluna existir já foram preenchidos na migração).
    await tx.report.updateMany({
      where: { authorId: user.id, authorName: "" },
      data: { authorName: user.name },
    });
    const keptReports = await tx.report.count({ where: { authorId: user.id } });
    await tx.user.delete({ where: { id: user.id } });
    return keptReports;
  });
}
