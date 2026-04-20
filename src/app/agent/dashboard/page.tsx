import { getAgentDashboardStats } from "@/app/actions/agent";
import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Building2, 
  Home, 
  Users, 
  CreditCard, 
  AlertCircle,
  Plus
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AgentDashboard() {
  const session = await auth();
  const stats = await getAgentDashboardStats(session?.user?.id || "");

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-secondary">Mon Espace Agent</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Bonjour {session?.user.name}, voici l'état de vos résidences à Bouaké.
          </p>
        </div>
        <div className="flex items-center gap-4 self-start">
          <Button asChild className="bg-primary font-bold shadow-sm">
            <Link href="/agent/paiements/nouveau">
              <Plus className="mr-2 h-4 w-4" /> Nouveau Paiement
            </Link>
          </Button>
          <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-xl border shadow-sm">
            <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xs uppercase">
              {session?.user.name?.substring(0, 2)}
            </div>
            <div className="text-sm">
              <p className="font-bold text-secondary leading-none">{session?.user.name}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Agent de Terrain</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm shadow-gray-200/50">
          <CardContent className="p-6">
            <div className="text-[10px] uppercase tracking-widest font-black text-muted-foreground mb-3">Mes Résidences</div>
            <div className="text-3xl font-black text-secondary">{stats.residences.length}</div>
            <div className="text-[11px] text-primary font-bold mt-2 flex items-center">
              Sites assignés
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm shadow-gray-200/50">
          <CardContent className="p-6">
            <div className="text-[10px] uppercase tracking-widest font-black text-muted-foreground mb-3">Locataires Actifs</div>
            <div className="text-3xl font-black text-secondary">{stats.locataires.length}</div>
            <div className="text-[11px] text-primary font-bold mt-2">
              Suivi personnalisé
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm shadow-gray-200/50">
          <CardContent className="p-6">
            <div className="text-[10px] uppercase tracking-widest font-black text-muted-foreground mb-3">Paiements (Mois)</div>
            <div className="text-3xl font-black text-secondary">{stats.totalPaiementsMois.toLocaleString()} FCFA</div>
            <div className="text-[11px] text-primary font-bold mt-2 flex items-center">
              Recouvrement actuel
            </div>
          </CardContent>
        </Card>
      </div>

      {stats.locatairesArrieres > 0 && (
        <div className="bg-destructive/5 border-l-4 border-destructive p-4 rounded-r-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div>
              <p className="font-bold text-destructive">Alerte Arriérés</p>
              <p className="text-sm text-destructive/80">
                {stats.locatairesArrieres} locataires ont des paiements en retard dans vos résidences.
              </p>
            </div>
          </div>
        </div>
      )}

      <Card className="border-none shadow-sm shadow-gray-200/50">
        <CardHeader className="px-6 py-6 border-b border-gray-50">
          <CardTitle className="text-lg font-black text-secondary">Mes Locataires</CardTitle>
          <CardDescription>Liste exhaustive des résidents sous votre gestion.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead className="pl-6">Locataire</TableHead>
                <TableHead>Quartier / Résidence</TableHead>
                <TableHead>Logement</TableHead>
                <TableHead>Statut financier</TableHead>
                <TableHead className="text-right pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.locataires.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    Aucun locataire assigné pour le moment.
                  </TableCell>
                </TableRow>
              ) : (
                stats.locataires.map((l) => (
                  <TableRow key={l.id} className="hover:bg-gray-50/50">
                    <TableCell className="pl-6 py-4 font-bold text-secondary">{l.nom}</TableCell>
                    <TableCell className="text-muted-foreground text-xs uppercase font-medium">
                      {l.appartement.residence.quartier} - {l.appartement.residence.ville}
                    </TableCell>
                    <TableCell className="font-medium text-gray-600">{l.appartement.libelle}</TableCell>
                    <TableCell>
                      {l.arriere > 0 ? (
                        <span className="sleek-badge-alert">
                          {l.arriere.toLocaleString()} FCFA
                        </span>
                      ) : (
                        <span className="sleek-badge">À JOUR</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-6 py-4">
                       <Button asChild size="sm" variant="outline" className="font-bold border-primary text-primary hover:bg-primary/5 rounded-full px-4">
                         <Link href="/agent/paiements/nouveau">Encaisser</Link>
                       </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
