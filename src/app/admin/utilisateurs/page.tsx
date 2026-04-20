import { getUsers } from "@/app/actions/utilisateurs";
import { UtilisateursClient } from "@/components/utilisateurs/utilisateurs-client";
import { auth } from "@/auth";

export default async function UtilisateursPage() {
  const [initialData, session] = await Promise.all([
    getUsers(),
    auth()
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h2 className="text-3xl font-bold tracking-tight text-secondary">Utilisateurs</h2>
        <p className="text-muted-foreground">Gérez les comptes d'accès pour les agents et comptables.</p>
      </div>

      <UtilisateursClient 
        initialData={initialData as any} 
        currentUserId={session?.user?.id || ""}
      />
    </div>
  );
}
