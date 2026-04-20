"use server";

import prisma from "@/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";

export async function getAgentDashboardStats(agentId: string) {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  // Get assigned residences
  const residences = await prisma.residence.findMany({
    where: { agentId },
    include: {
      _count: {
        select: { appartements: true }
      }
    }
  });

  const residenceIds = residences.map(r => r.id);

  const [
    totalAppartements,
    occupiedAppartements,
    locataires,
    totalPaiementsMois,
    locatairesArrieres
  ] = await Promise.all([
    prisma.appartement.count({ where: { residenceId: { in: residenceIds } } }),
    prisma.appartement.count({ where: { residenceId: { in: residenceIds }, statut: "OCCUPE" } }),
    prisma.locataire.findMany({
      where: {
        statut: "ACTIF",
        appartement: { residenceId: { in: residenceIds } }
      },
      include: {
        appartement: { include: { residence: true } }
      }
    }),
    prisma.paiement.aggregate({
      where: {
        agentId,
        datePaiement: { gte: monthStart, lte: monthEnd },
      },
      _sum: { montant: true },
    }),
    prisma.locataire.count({
      where: {
        statut: "ACTIF",
        arriere: { gt: 0 },
        appartement: { residenceId: { in: residenceIds } }
      },
    }),
  ]);

  return {
    residences,
    totalAppartements,
    occupiedAppartements,
    locataires,
    totalPaiementsMois: totalPaiementsMois._sum.montant || 0,
    locatairesArrieres,
  };
}
