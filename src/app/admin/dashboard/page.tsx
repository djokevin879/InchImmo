import { getDashboardStats, getBilanMensuel } from "@/app/actions/dashboard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Building2, 
  Home, 
  Users, 
  CreditCard, 
  AlertCircle, 
  ArrowUpRight 
} from "lucide-react";
import { PaymentsChart } from "@/components/dashboard/payments-chart";
import { GeminiDashboardAdvice } from "@/components/dashboard/gemini-advice";
import { BilanMensuel } from "@/components/dashboard/bilan-mensuel";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { StaggerContainer, StaggerItem } from "@/components/animations/motion-components";

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const maintenant = new Date();
  const bilan = await getBilanMensuel(
    maintenant.getMonth() + 1,
    maintenant.getFullYear()
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-secondary">Bonjour, Admin</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Voici l'état actuel de votre parc immobilier à Bouaké.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-xl border shadow-sm self-start">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold">
            AD
          </div>
          <div className="text-sm">
            <p className="font-bold text-secondary leading-none">Admin Principal</p>
            <p className="text-xs text-muted-foreground mt-1">Gérant Agence</p>
          </div>
        </div>
      </header>

      <GeminiDashboardAdvice stats={stats} />

      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StaggerItem>
          <Card className="border-none shadow-sm shadow-gray-200/50">
            <CardContent className="p-6">
              <div className="text-[10px] uppercase tracking-widest font-black text-muted-foreground mb-3">Résidences</div>
              <div className="text-3xl font-black text-secondary">{stats.totalResidences}</div>
              <div className="text-[11px] text-primary font-bold mt-2 flex items-center">
                Gestion active à Bouaké
              </div>
            </CardContent>
          </Card>
        </StaggerItem>

        <StaggerItem>
          <Card className="border-none shadow-sm shadow-gray-200/50">
            <CardContent className="p-6">
              <div className="text-[10px] uppercase tracking-widest font-black text-muted-foreground mb-3">Taux d'occupation</div>
              <div className="text-3xl font-black text-secondary">
                {Math.round((stats.occupiedAppartements / (stats.totalAppartements || 1)) * 100)}%
              </div>
              <div className="text-[11px] text-primary font-bold mt-2">
                {stats.occupiedAppartements} / {stats.totalAppartements} Unités
              </div>
            </CardContent>
          </Card>
        </StaggerItem>

        <StaggerItem>
          <Card className="border-none shadow-sm shadow-gray-200/50">
            <CardContent className="p-6">
              <div className="text-[10px] uppercase tracking-widest font-black text-muted-foreground mb-3">Recettes Mensuelles</div>
              <div className="text-3xl font-black text-secondary">{stats.totalPaiementsMois.toLocaleString()} FCFA</div>
              <div className="text-[11px] text-primary font-bold mt-2">
                Chiffre d'affaires {format(new Date(), "MMMM yyyy", { locale: fr })}
              </div>
            </CardContent>
          </Card>
        </StaggerItem>

        <StaggerItem>
          <Card className="border-none shadow-sm shadow-gray-200/50 bg-destructive/5">
            <CardContent className="p-6">
              <div className="text-[10px] uppercase tracking-widest font-black text-destructive/70 mb-3">Locataires en Arriérés</div>
              <div className="text-3xl font-black text-destructive">{stats.locatairesArrieres}</div>
              <div className="text-[11px] text-destructive font-bold mt-2">
                Attention: suivi requis
              </div>
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerContainer>

      <StaggerItem className="w-full">
        <BilanMensuel bilan={bilan} />
      </StaggerItem>

      <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-7" delay={0.15}>
        <StaggerItem className="col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Aperçu des Paiements (6 derniers mois)</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <PaymentsChart data={stats.chartData} />
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem className="col-span-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Alertes Arriérés</CardTitle>
                <CardDescription>Locataires n'ayant pas soldé</CardDescription>
              </div>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center h-[200px] space-y-2">
                <div className="text-4xl font-bold text-destructive">{stats.locatairesArrieres}</div>
                <p className="text-sm text-center text-muted-foreground">
                  locataires ont des arriérés de paiement.
                </p>
                {stats.locatairesArrieres > 0 && (
                  <button className="text-sm text-primary font-semibold flex items-center hover:underline mt-4">
                    Voir la liste <ArrowUpRight className="ml-1 h-3 w-3" />
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerContainer>

      <Card>
        <CardHeader>
          <CardTitle>Derniers Paiements Enregistrés</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Locataire</TableHead>
                <TableHead>Mois</TableHead>
                <TableHead className="text-right">Montant</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.lastPaiements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                    Aucun paiement enregistré pour le moment.
                  </TableCell>
                </TableRow>
              ) : (
                stats.lastPaiements.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{format(new Date(p.date), "dd/MM/yyyy HH:mm")}</TableCell>
                    <TableCell className="font-medium text-secondary">{p.locataire}</TableCell>
                    <TableCell>{p.mois}</TableCell>
                    <TableCell className="text-right font-bold text-primary">
                      {p.montant.toLocaleString()} FCFA
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
