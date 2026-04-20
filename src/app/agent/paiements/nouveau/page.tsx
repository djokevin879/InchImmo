import { getAgentDashboardStats } from "@/app/actions/agent";
import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AgentPaiementForm } from "@/components/paiements/agent-paiement-form";

export default async function AgentNewPaiementPage() {
  const session = await auth();
  const stats = await getAgentDashboardStats(session?.user?.id || "");

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="text-center md:text-left">
        <h2 className="text-2xl font-bold text-secondary">Encaisser un loyer</h2>
        <p className="text-sm text-muted-foreground">Sélectionnez un locataire pour enregistrer son paiement.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nouveau Paiement</CardTitle>
          <CardDescription>Remplissez les informations ci-dessous.</CardDescription>
        </CardHeader>
        <CardContent>
          <AgentPaiementForm 
            locataires={stats.locataires} 
            currentUserId={session?.user?.id || ""} 
          />
        </CardContent>
      </Card>
    </div>
  );
}
