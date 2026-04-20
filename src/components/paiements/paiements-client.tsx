"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Plus, 
  Search,
  Printer,
  FileText,
  Filter
} from "lucide-react";
import { 
  createPaiement 
} from "@/app/actions/paiements";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import Link from "next/link";
import { AnimatedTableRow } from "@/components/animations/motion-components";
import {
  exporterPaiementsPDF,
  exporterPaiementsExcel,
} from '@/lib/exports'
import { FileDown, Sheet } from 'lucide-react'

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

export function PaiementsClient({ 
  initialData, 
  locataires,
  residences,
  currentUserId
}: { 
  initialData: any[], 
  locataires: any[],
  residences: any[],
  currentUserId: string
}) {
  const [data, setData] = useState(initialData);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filters
  const [filterMonth, setFilterMonth] = useState<string | null>("all");
  const [filterYear, setFilterYear] = useState<string | null>(new Date().getFullYear().toString());
  const [filterResidence, setFilterResidence] = useState<string | null>("all");

  const [formData, setFormData] = useState({
    locataireId: "",
    montant: 0,
    mois: new Date().getMonth() + 1,
    annee: new Date().getFullYear(),
    motif: "Loyer",
    observation1: "",
    observation2: "",
  });

  const [selectedLocataire, setSelectedLocataire] = useState<any>(null);

  const filteredData = data.filter(p => {
    const matchesMonth = filterMonth === "all" || p.mois === parseInt(filterMonth || "0");
    const matchesYear = filterYear === "all" || p.annee === parseInt(filterYear || "0");
    const matchesResidence = filterResidence === "all" || p.locataire.appartement.residenceId === filterResidence;
    return matchesMonth && matchesYear && matchesResidence;
  });

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
      await createPaiement({
        ...formData,
        agentId: currentUserId,
        moisLibelle: monthLabel
      });
      toast.success("Paiement enregistré");
      setIsOpen(false);
      window.location.reload(); 
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col">
          <h2 className="text-3xl font-bold tracking-tight text-secondary">Paiements</h2>
          <p className="text-muted-foreground">Historique et enregistrement des paiements locatifs.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exporterPaiementsPDF(filteredData)}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors bg-white shadow-sm"
          >
            <FileDown className="w-4 h-4 text-red-500" />
            Export PDF
          </button>
          <button
            onClick={() => exporterPaiementsExcel(filteredData)}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors bg-white shadow-sm"
          >
            <Sheet className="w-4 h-4 text-green-600" />
            Export Excel
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border flex flex-wrap items-end gap-4 shadow-sm">
        <div className="space-y-1.5 flex-1 min-w-[150px]">
          <Label className="text-xs uppercase font-bold text-muted-foreground flex items-center">
            <Filter className="mr-1 h-3 w-3" /> Résidence
          </Label>
          <Select value={filterResidence} onValueChange={(v) => setFilterResidence(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              {residences.map(r => (
                <SelectItem key={r.id} value={r.id}>{r.quartier}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5 w-[140px]">
          <Label className="text-xs uppercase font-bold text-muted-foreground">Mois</Label>
          <Select value={filterMonth} onValueChange={(v) => setFilterMonth(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              {months.map(m => (
                <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5 w-[100px]">
          <Label className="text-xs uppercase font-bold text-muted-foreground">Année</Label>
          <Select value={filterYear} onValueChange={(v) => setFilterYear(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2024, 2025, 2026, 2027].map(y => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => setIsOpen(true)} className="bg-primary">
          <Plus className="mr-2 h-4 w-4" /> Enregistrer un Paiement
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Nouveau Paiement</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  {locataires.filter(l => l.statut === "ACTIF").map(l => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.nom} ({l.appartement.residence.quartier} - {l.appartement.libelle})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedLocataire && (
              <div className="bg-primary/5 p-3 rounded-md border border-primary/20 flex justify-between items-center">
                <div>
                  <div className="text-xs text-muted-foreground uppercase">Loyer Mensuel</div>
                  <div className="font-bold text-primary">{selectedLocataire.loyer.toLocaleString()} FCFA</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground uppercase">Arriérés actuels</div>
                  <div className="font-bold text-destructive">{selectedLocataire.arriere.toLocaleString()} FCFA</div>
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="obs1">Observation 1 (Ex: Chèque numéro...)</Label>
              <Input 
                id="obs1" 
                value={formData.observation1} 
                onChange={(e) => setFormData({...formData, observation1: e.target.value})} 
              />
            </div>

            <div className="bg-gray-50 p-3 rounded-md border text-sm">
              <span className="text-muted-foreground italic">
                Note: Si le montant est inférieur au loyer, la différence sera ajoutée aux arriérés du locataire.
              </span>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Enregistrement..." : "Valider le paiement"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Locataire / Résidence</TableHead>
              <TableHead>Période</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Reste</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  Aucun paiement trouvé pour ces critères.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((p, index) => (
                <AnimatedTableRow key={p.id} index={index} className="hover:bg-gray-50 transition-colors border-b">
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(p.datePaiement), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-secondary">{p.locataire.nom}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.locataire.appartement.residence.quartier} - {p.locataire.appartement.libelle}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="sleek-badge">
                      {p.moisLibelle} {p.annee}
                    </span>
                  </TableCell>
                  <TableCell className="font-bold text-primary">
                    {p.montant.toLocaleString()} FCFA
                  </TableCell>
                  <TableCell>
                    {p.reste > 0 ? (
                      <span className="sleek-badge-alert">{p.reste.toLocaleString()} FCFA</span>
                    ) : (
                      <span className="sleek-badge">Soldé</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="outline" className="h-8 gap-1.5">
                      <Link href={`/paiements/recu/${p.id}`} target="_blank">
                        <FileText className="h-3.5 w-3.5" /> Reçu
                      </Link>
                    </Button>
                  </TableCell>
                </AnimatedTableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
