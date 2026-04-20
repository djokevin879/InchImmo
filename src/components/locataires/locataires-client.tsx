"use client";

import { useState } from "react";
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
  Pencil, 
  LogOut, 
  Search,
  User,
  Phone,
  FileText
} from "lucide-react";
import { 
  createLocataire, 
  updateLocataire, 
  marquerCommeParti 
} from "@/app/actions/locataires";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { AnimatedTableRow } from "@/components/animations/motion-components";
import { IconButton } from "@/components/ui/icon-button";
import {
  exporterLocatairesPDF,
  exporterLocatairesExcel,
} from '@/lib/exports'
import { FileDown, Sheet } from 'lucide-react'
import { genererContratBailPDF } from '@/lib/contrat-bail'
import { BadgeScoreRisque } from '@/components/badge-score-risque'
import { getScoreRisqueLocataire } from '@/app/actions/locataires'
import { ScannerCNI } from '@/components/scanner-cni'
import { DonneesCNI } from '@/lib/ocr-cni'
import { useEffect } from 'react'

export function LocatairesClient({ 
  initialData, 
  appartements 
}: { 
  initialData: any[], 
  appartements: any[] 
}) {
  const [data, setData] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isDepartOpen, setIsDepartOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedLocataire, setSelectedLocataire] = useState<any>(null);
  const [motifDepart, setMotifDepart] = useState("");

  const [formData, setFormData] = useState({
    nom: "",
    fonction: "",
    typePiece: "CNI",
    numPiece: "",
    nationalite: "Ivoirienne",
    telephone: "",
    loyer: 0,
    arriere: 0,
    observation: "",
    dateEntree: format(new Date(), "yyyy-MM-dd"),
    appartementId: "",
  });

  const filteredData = data.filter(l => 
    l.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.telephone?.includes(searchTerm)
  );

  const handleEdit = (l: any) => {
    setEditingId(l.id);
    setFormData({
      nom: l.nom,
      fonction: l.fonction || "",
      typePiece: l.typePiece || "CNI",
      numPiece: l.numPiece || "",
      nationalite: l.nationalite || "Ivoirienne",
      telephone: l.telephone || "",
      loyer: l.loyer,
      arriere: l.arriere,
      observation: l.observation || "",
      dateEntree: format(new Date(l.dateEntree), "yyyy-MM-dd"),
      appartementId: l.appartementId,
    });
    setIsOpen(true);
  };

  const handleCreate = () => {
    setEditingId(null);
    setFormData({
      nom: "",
      fonction: "",
      typePiece: "CNI",
      numPiece: "",
      nationalite: "Ivoirienne",
      telephone: "",
      loyer: 0,
      arriere: 0,
      observation: "",
      dateEntree: format(new Date(), "yyyy-MM-dd"),
      appartementId: appartements.find(a => a.statut === "LIBRE")?.id || "",
    });
    setIsOpen(true);
  };

  const remplirDepuisCNI = (donnees: DonneesCNI) => {
    setFormData(prev => ({
      ...prev,
      nom: donnees.nomComplet || (donnees.nom + ' ' + donnees.prenom),
      nationalite: donnees.nationalite || prev.nationalite,
      numPiece: donnees.numeroCNI || prev.numPiece,
    }))
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateLocataire(editingId, formData);
        toast.success("Locataire mis à jour");
      } else {
        await createLocataire(formData);
        toast.success("Locataire ajouté");
      }
      setIsOpen(false);
      window.location.reload(); 
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const handleDepart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocataire) return;
    try {
      await marquerCommeParti(selectedLocataire.id, motifDepart);
      toast.success("Locataire marqué comme parti");
      setIsDepartOpen(false);
      window.location.reload();
    } catch (error) {
      toast.error("Erreur lors de l'opération");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col">
          <h2 className="text-3xl font-bold tracking-tight text-secondary">Locataires</h2>
          <p className="text-muted-foreground">Gérez vos locataires actifs et l'historique des départs.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exporterLocatairesPDF(filteredData)}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors bg-white shadow-sm"
          >
            <FileDown className="w-4 h-4 text-red-500" />
            Export PDF
          </button>
          <button
            onClick={() => exporterLocatairesExcel(filteredData)}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors bg-white shadow-sm"
          >
            <Sheet className="w-4 h-4 text-green-600" />
            Export Excel
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher par nom ou téléphone..." 
            className="pl-8" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={handleCreate} className="bg-primary">
          <Plus className="mr-2 h-4 w-4" /> Ajouter un Locataire
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Modifier le locataire" : "Nouveau locataire"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            {!editingId && (
              <div className="col-span-2 space-y-2">
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Scan automatique de pièce d'identité (Optionnel)
                </Label>
                <ScannerCNI onSuccess={remplirDepuisCNI} />
              </div>
            )}
            <div className="space-y-2 col-span-2">
              <Label htmlFor="nom">Nom Complet</Label>
              <Input 
                id="nom" 
                value={formData.nom} 
                onChange={(e) => setFormData({...formData, nom: e.target.value})} 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label>Appartement (Libres)</Label>
              <Select 
                value={formData.appartementId} 
                onValueChange={(v) => {
                  const app = appartements.find(a => a.id === v);
                  setFormData({...formData, appartementId: v || "", loyer: app?.loyer || 0});
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un appartement" />
                </SelectTrigger>
                <SelectContent>
                  {appartements.filter(a => a.statut === "LIBRE" || a.id === formData.appartementId).map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.residence.quartier} - {a.libelle}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateEntree">Date d'entrée</Label>
              <Input 
                id="dateEntree" 
                type="date"
                value={formData.dateEntree} 
                onChange={(e) => setFormData({...formData, dateEntree: e.target.value})} 
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone</Label>
              <Input 
                id="telephone" 
                value={formData.telephone} 
                onChange={(e) => setFormData({...formData, telephone: e.target.value})} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fonction">Fonction / Profession</Label>
              <Input 
                id="fonction" 
                value={formData.fonction} 
                onChange={(e) => setFormData({...formData, fonction: e.target.value})} 
              />
            </div>

            <div className="space-y-2">
              <Label>Type de Pièce</Label>
              <Select value={formData.typePiece} onValueChange={(v) => setFormData({...formData, typePiece: v || ""})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CNI">CNI</SelectItem>
                  <SelectItem value="PASSEPORT">Passeport</SelectItem>
                  <SelectItem value="ATTESTATION">Attestation</SelectItem>
                  <SelectItem value="AUTRE">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="numPiece">Numéro de Pièce</Label>
              <Input 
                id="numPiece" 
                value={formData.numPiece} 
                onChange={(e) => setFormData({...formData, numPiece: e.target.value})} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="loyer">Loyer Mensuel (FCFA)</Label>
              <Input 
                id="loyer" 
                type="number"
                value={formData.loyer} 
                onChange={(e) => setFormData({...formData, loyer: parseInt(e.target.value)})} 
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="arriere">Arriérés Initiaux (FCFA)</Label>
              <Input 
                id="arriere" 
                type="number"
                value={formData.arriere} 
                onChange={(e) => setFormData({...formData, arriere: parseInt(e.target.value)})} 
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="observation">Observation</Label>
              <Input 
                id="observation" 
                value={formData.observation} 
                onChange={(e) => setFormData({...formData, observation: e.target.value})} 
              />
            </div>

            <DialogFooter className="col-span-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Annuler</Button>
              <Button type="submit">Enregistrer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDepartOpen} onOpenChange={setIsDepartOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Départ du locataire</DialogTitle></DialogHeader>
          <form onSubmit={handleDepart} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Voulez-vous marquer <strong>{selectedLocataire?.nom}</strong> comme étant parti ?
              L'appartement ({selectedLocataire?.appartement.libelle}) sera libéré.
            </p>
            <div className="space-y-2">
              <Label htmlFor="motif">Motif du départ</Label>
              <Input 
                id="motif" 
                value={motifDepart} 
                onChange={(e) => setMotifDepart(e.target.value)} 
                placeholder="Ex: Fin de contrat, Déménagement..."
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDepartOpen(false)}>Annuler</Button>
              <Button type="submit" variant="destructive">Confirmer le départ</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Locataire</TableHead>
              <TableHead>Appartement</TableHead>
              <TableHead>Loyer</TableHead>
              <TableHead>Arriérés</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Aucun locataire trouvé.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((l, index) => (
                <AnimatedTableRow key={l.id} index={index} className={l.statut === "PARTI" ? "opacity-60 bg-gray-50 border-b" : "border-b"}>
                  <TableCell className="font-semibold text-secondary">
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4 text-primary" />
                      <div className="flex flex-col">
                        <span>{l.nom}</span>
                        <LocataireScore locataireId={l.id} />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-bold text-muted-foreground">{l.appartement.residence.quartier}</div>
                    <div>{l.appartement.libelle}</div>
                  </TableCell>
                  <TableCell className="font-bold">{l.loyer.toLocaleString()} FCFA</TableCell>
                  <TableCell>
                    {l.arriere > 0 ? (
                      <span className="text-destructive font-bold">{l.arriere.toLocaleString()} FCFA</span>
                    ) : (
                      <span className="text-green-600 font-medium whitespace-nowrap">À jour</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <Phone className="mr-1 h-3 w-3" /> {l.telephone || "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={l.statut === "ACTIF" ? "default" : "outline"}>
                      {l.statut}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-2">
                      <button
                        onClick={() => genererContratBailPDF({
                          locataireNom: l.nom,
                          locataireFonction: l.fonction || '',
                          locataireNationalite: l.nationalite || 'Ivoirienne',
                          locataireTypePiece: l.typePiece || 'CNI',
                          locataireNumPiece: l.numPiece || '',
                          locataireTelephone: l.telephone || '',
                          appartementLibelle: l.appartement?.libelle || '',
                          appartementNbrePieces: l.appartement?.nbrePieces || 1,
                          appartementLoyer: l.loyer,
                          residenceQuartier: l.appartement?.residence?.quartier || '',
                          residenceVille: l.appartement?.residence?.ville || 'Bouaké',
                          residenceLocalisation: l.appartement?.residence?.localisation || '',
                          proprietaireNom: l.appartement?.residence?.proprietaire?.nom || '',
                          proprietaireTelephone: l.appartement?.residence?.proprietaire?.telephone || '',
                          dateEntree: new Date(l.dateEntree),
                          dureeContrat: 12,
                          cautionMois: 2,
                        })}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Contrat de bail
                      </button>
                      <IconButton 
                        variant="ghost" 
                        size="sm"
                        icon={<Pencil />} 
                        onClick={() => handleEdit(l)} 
                        title="Modifier"
                      />
                      {l.statut === "ACTIF" && (
                        <IconButton 
                          variant="ghost" 
                          size="sm"
                          className="text-orange-600 hover:text-orange-700"
                          icon={<LogOut />} 
                          onClick={() => {
                            setSelectedLocataire(l);
                            setIsDepartOpen(true);
                          }}
                          title="Marquer comme parti"
                        />
                      )}
                    </div>
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

function LocataireScore({ locataireId }: { locataireId: string }) {
  const [score, setScore] = useState<any>(null);

  useEffect(() => {
    getScoreRisqueLocataire(locataireId).then(setScore);
  }, [locataireId]);

  if (!score) return <div className="h-4 w-12 bg-gray-100 animate-pulse rounded mt-1" />;

  return (
    <div className="mt-1">
      <BadgeScoreRisque score={score} />
    </div>
  );
}
