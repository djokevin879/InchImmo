"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { enregistrerAction } from "@/lib/audit";
import { auth } from "@/auth";
import { notifierNouveauPaiement } from "@/lib/notifications";

export async function getPaiements(filters?: {
  mois?: number;
  annee?: number;
  residenceId?: string;
}) {
  const where: any = {};
  if (filters?.mois) where.mois = filters.mois;
  if (filters?.annee) where.annee = filters.annee;
  if (filters?.residenceId) {
    where.locataire = {
      appartement: {
        residenceId: filters.residenceId,
      },
    };
  }

  return await prisma.paiement.findMany({
    where,
    include: {
      locataire: {
        include: {
          appartement: {
            include: { residence: true },
          },
        },
      },
      agent: true,
    },
    orderBy: { datePaiement: "desc" },
  });
}

export async function createPaiement(data: {
  locataireId: string;
  agentId: string;
  montant: number;
  mois: number;
  moisLibelle: string;
  annee: number;
  motif: string;
  observation1?: string;
  observation2?: string;
}) {
  const session = await auth();
  const p = await prisma.$transaction(async (tx) => {
    // Get locataire to check arriere and loyer
    const locataire = await tx.locataire.findUnique({
      where: { id: data.locataireId },
    });

    if (!locataire) throw new Error("Locataire non trouvé");

    // Calculate rest
    // A payment for a specific month usually covers the loyer of that month
    // If montant < loyer, the difference goes to "reste" or locataire's "arriere"
    const reste = locataire.loyer - data.montant;

    const paiement = await tx.paiement.create({
      data: {
        locataireId: data.locataireId,
        agentId: data.agentId,
        montant: data.montant,
        mois: data.mois,
        moisLibelle: data.moisLibelle,
        annee: data.annee,
        motif: data.motif,
        reste: reste,
        observation1: data.observation1,
        observation2: data.observation2,
      },
      include: {
        locataire: {
          include: {
            appartement: {
              include: { residence: true }
            }
          }
        }
      }
    });

    // Update locataire's arriere if there's a rest
    if (reste > 0) {
      await tx.locataire.update({
        where: { id: data.locataireId },
        data: {
          arriere: {
            increment: reste
          }
        }
      });
    } else if (reste < 0) {
        // Overpayment reduces backlogs
        await tx.locataire.update({
            where: { id: data.locataireId },
            data: {
                arriere: {
                    decrement: Math.abs(reste)
                }
            }
        });
    }

    return paiement;
  });

  if (session?.user?.id) {
    await enregistrerAction({
      userId: session.user.id,
      action: "PAIEMENT_ENREGISTRE",
      entite: "Paiement",
      entiteId: p.id,
      entiteNom: `${(p as any).locataire?.nom} - ${p.moisLibelle} ${p.annee}`,
      details: `${p.montant} FCFA`,
    });

    // Notify admins if an agent made the payment
    if (session.user.role === 'AGENT') {
      const loc = (p as any).locataire;
      await notifierNouveauPaiement({
        agentNom: `${session.user.name}`,
        locataireNom: loc.nom,
        montant: p.montant,
        residence: loc.appartement?.residence?.quartier || 'Inconnue'
      });
    }
  }

  revalidatePath("/admin/paiements");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/locataires");
  return p;
}

export async function getPaiementById(id: string) {
  return await prisma.paiement.findUnique({
    where: { id },
    include: {
      locataire: {
        include: {
          appartement: {
            include: { residence: true },
          },
        },
      },
      agent: true,
    },
  });
}
