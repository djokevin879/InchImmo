import { getPaiements } from "@/app/actions/paiements";
import { getLocataires } from "@/app/actions/locataires";
import { getResidences } from "@/app/actions/residences";
import { PaiementsClient } from "@/components/paiements/paiements-client";
import { auth } from "@/auth";

export default async function PaiementsPage() {
  const [session, initialData, locataires, residences] = await Promise.all([
    auth(),
    getPaiements(),
    getLocataires(),
    getResidences(),
  ]);

  return (
    <div className="space-y-6">
      <PaiementsClient 
        initialData={initialData as any} 
        locataires={locataires}
        residences={residences}
        currentUserId={session?.user?.id || ""}
      />
    </div>
  );
}
