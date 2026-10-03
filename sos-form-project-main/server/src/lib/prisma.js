// Instância única do PrismaClient, reaproveitada em toda a aplicação
// (evita abrir uma conexão nova por request).
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
