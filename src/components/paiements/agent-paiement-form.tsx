"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { createPaiement } from "@/app/actions/paiements";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSync } from "@/hooks/use-sync";
import { sauvegarderPaiementHorsLigne } from "@/lib/offline-storage";
import { WifiOff } from "lucide-react";

const months = [
  { value: 1, label: "Janvier" },
  { value: 2, label: "Février" },
  { value: 3, label: "Mars" },
  { value: 4, label: "Avril" },
  { value: 5, label: "Mai" },
  { value: 6, label: "Juin" },
  { value: 7, label: "Juillet" },
  { value: 8, label: "Août" },
  { value: 9, label: "Septembre" },
  { value: 10, label: "Octobre" },
  { value: 11, label: "Novembre" },
  { value: 12, label: "Décembre" },
];

export function AgentPaiementForm({ locataires, currentUserId }: { locataires: any[], currentUserId: string }) {
  const router = useRouter();
  const { estEnLigne } = useSync();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    locataireId: "",
    montant: 0,
    mois: new Date().getMonth() + 1,
    annee: new Date().getFullYear(),
    motif: "Loyer",
  });

  const [selectedLocataire, setSelectedLocataire] = useState<any>(null);

  const handleLocataireChange = (id: string) => {
    const loc = locataires.find(l => l.id === id);
    setSelectedLocataire(loc);
    setFormData({
      ...formData,
      locataireId: id,
      montant: loc?.loyer || 0
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const monthLabel = months.find(m => m.value === formData.mois)?.label || "";
      const baseData = {
        ...formData,
        agentId: currentUserId,
        moisLibelle: monthLabel
      };

      if (estEnLigne) {
        const result = await createPaiement(baseData);
        toast.success("Paiement enregistré avec succès");
        // Auto-open receipt
        window.open(`/paiements/recu/${result.id}`, "_blank");
        router.push("/agent/dashboard");
      } else {
        await sauvegarderPaiementHorsLigne({
          ...baseData,
          locataireNom: selectedLocataire?.nom || "",
          reste: (selectedLocataire?.loyer || 0) - formData.montant,
        });
        toast.success("Paiement sauvegardé localement (Hors ligne)");
        router.push("/agent/dashboard");
      }
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {!estEnLigne && (
        <div className="flex items-center gap-2 mb-4 px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl text-orange-700 text-sm">
          <WifiOff className="w-4 h-4 flex-shrink-0" />
          <span>Vous êtes hors ligne. Le paiement sera sauvegardé et envoyé à la reconnexion.</span>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Locataire</Label>
        <Select 
          value={formData.locataireId} 
          onValueChange={(v) => handleLocataireChange(v || "")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choisir un locataire" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {locataires.map(l => (
              <SelectItem key={l.id} value={l.id}>
                {l.nom} ({l.appartement.libelle})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedLocataire && (
        <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 space-y-2">
            <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Loyer Mensuel :</span>
                <span className="font-bold text-secondary">{selectedLocataire.loyer.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Arriérés :</span>
                <span className="font-bold text-destructive">{selectedLocataire.arriere.toLocaleString()} FCFA</span>
            </div>
            <div className="pt-2 border-t text-xs italic text-muted-foreground">
                Logement: {selectedLocataire.appartement.residence.quartier} - {selectedLocataire.appartement.libelle}
            </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Mois Concerné</Label>
          <Select 
            value={formData.mois.toString()} 
            onValueChange={(v) => setFormData({...formData, mois: parseInt(v || "1")})}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {months.map(m => (
                <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Année</Label>
          <Input 
            type="number" 
            value={formData.annee} 
            onChange={(e) => setFormData({...formData, annee: parseInt(e.target.value)})} 
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="montant">Montant Payé (FCFA)</Label>
        <Input 
          id="montant" 
          type="number"
          value={formData.montant} 
          onChange={(e) => setFormData({...formData, montant: parseInt(e.target.value)})} 
          required 
          className="text-lg font-bold text-primary"
        />
      </div>

      <div className="pt-4">
        <Button type="submit" className="w-full h-12 text-lg font-bold bg-primary hover:bg-primary/90" disabled={isLoading || !formData.locataireId}>
          {isLoading ? "Traitement..." : estEnLigne ? "Confirmer & Imprimer le Reçu" : "Sauvegarder Hors Ligne"}
        </Button>
      </div>
    </form>
    </div>
  );
}
