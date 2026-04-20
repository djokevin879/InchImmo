"use server";

import prisma from "@/lib/prisma";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

export async function getDashboardStats() {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [
    totalResidences,
    totalAppartements,
    occupiedAppartements,
    totalLocataires,
    totalPaiementsMois,
    locatairesArrieres
  ] = await Promise.all([
    prisma.residence.count(),
    prisma.appartement.count(),
    prisma.appartement.count({ where: { statut: "OCCUPE" } }),
    prisma.locataire.count({ where: { statut: "ACTIF" } }),
    prisma.paiement.aggregate({
      where: {
        datePaiement: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      _sum: {
        montant: true,
      },
    }),
    prisma.locataire.count({
      where: {
        statut: "ACTIF",
        arriere: { gt: 0 },
      },
    }),
  ]);

  // Fetch last 6 months payments for chart
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = subMonths(now, i);
    const start = startOfMonth(d);
    const end = endOfMonth(d);

    const sum = await prisma.paiement.aggregate({
      where: {
        datePaiement: { gte: start, lte: end },
      },
      _sum: { montant: true },
    });

    months.push({
      name: format(d, "MMM"),
      total: sum._sum.montant || 0,
    });
  }

  // Last 5 payments
  const lastPaiements = await prisma.paiement.findMany({
    take: 5,
    orderBy: { datePaiement: "desc" },
    include: {
      locataire: true,
    },
  });

  return {
    totalResidences,
    totalAppartements,
    occupiedAppartements,
    totalLocataires,
    totalPaiementsMois: totalPaiementsMois._sum.montant || 0,
    locatairesArrieres,
    chartData: months,
    lastPaiements: lastPaiements.map(p => ({
      id: p.id,
      date: p.datePaiement,
      locataire: p.locataire.nom,
      montant: p.montant,
      mois: p.moisLibelle
    }))
  };
}

export async function getBilanMensuel(mois: number, annee: number) {
  // Mois précédent
  const moisPrecedent = mois === 1 ? 12 : mois - 1
  const anneePrecedente = mois === 1 ? annee - 1 : annee

  // Total loyers attendus ce mois
  // = somme des loyers de tous les locataires ACTIFS
  const locatairesActifs = await prisma.locataire.findMany({
    where: { statut: 'ACTIF' },
    select: { loyer: true }
  })
  const totalAttendu = locatairesActifs.reduce((sum, l) => sum + l.loyer, 0)

  // Total encaissé ce mois
  const paiementsMois = await prisma.paiement.findMany({
    where: { mois, annee },
    select: { montant: true }
  })
  const totalEncaisse = paiementsMois.reduce((sum, p) => sum + p.montant, 0)

  // Total encaissé mois précédent
  const paiementsMoisPrecedent = await prisma.paiement.findMany({
    where: { mois: moisPrecedent, annee: anneePrecedente },
    select: { montant: true }
  })
  const totalEncaissePrecedent = paiementsMoisPrecedent.reduce(
    (sum, p) => sum + p.montant, 0
  )

  // Taux de recouvrement
  const tauxRecouvrement = totalAttendu > 0
    ? Math.round((totalEncaisse / totalAttendu) * 100)
    : 0

  // Variation vs mois précédent
  const variation = totalEncaissePrecedent > 0
    ? Math.round(((totalEncaisse - totalEncaissePrecedent) / totalEncaissePrecedent) * 100)
    : 0

  // Total arriérés global
  const arrieres = await prisma.locataire.aggregate({
    where: { statut: 'ACTIF' },
    _sum: { arriere: true }
  })

  return {
    mois,
    annee,
    totalAttendu,
    totalEncaisse,
    totalNonEncaisse: totalAttendu - totalEncaisse,
    tauxRecouvrement,
    totalEncaissePrecedent,
    variation,
    totalArrieres: arrieres._sum.arriere || 0,
    nbLocatairesActifs: locatairesActifs.length,
    nbPaiementsMois: paiementsMois.length,
  }
}
