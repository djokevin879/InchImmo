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
  Trash2, 
  Search,
  Home
} from "lucide-react";
import { 
  createAppartement, 
  updateAppartement, 
  deleteAppartement 
} from "@/app/actions/appartements";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AnimatedTableRow } from "@/components/animations/motion-components";
import { IconButton } from "@/components/ui/icon-button";
import { SuggestionPrixLoyer } from '@/components/suggestion-prix-loyer'

interface Appartement {
  id: string;
  libelle: string;
  nbrePieces: number;
  loyer: number;
  taux: number;
  statut: "LIBRE" | "OCCUPE";
  residenceId: string;
  residence: { quartier: string };
}

export function AppartementsClient({ 
  initialData, 
  residences 
}: { 
  initialData: Appartement[], 
  residences: { id: string, quartier: string }[] 
}) {
  const [data, setData] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [residenceFilter, setResidenceFilter] = useState<string | null>("all");
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    libelle: "",
    nbrePieces: 1,
    loyer: 0,
    taux: 10,
    residenceId: "",
  });

  const filteredData = data.filter(a => {
    const matchesSearch = a.libelle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesResidence = residenceFilter === "all" || a.residenceId === residenceFilter;
    return matchesSearch && matchesResidence;
  });

  const handleEdit = (a: Appartement) => {
    setEditingId(a.id);
    setFormData({
      libelle: a.libelle,
      nbrePieces: a.nbrePieces,
      loyer: a.loyer,
      taux: a.taux,
      residenceId: a.residenceId,
    });
    setIsOpen(true);
  };

  const handleCreate = () => {
    setEditingId(null);
    setFormData({
      libelle: "",
      nbrePieces: 1,
      loyer: 0,
      taux: 10,
      residenceId: residences[0]?.id || "",
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateAppartement(editingId, formData);
        toast.success("Appartement mis à jour");
      } else {
        await createAppartement(formData);
        toast.success("Appartement ajouté");
      }
      setIsOpen(false);
      window.location.reload(); 
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet appartement ?")) return;
    try {
      await deleteAppartement(id);
      toast.success("Appartement supprimé");
      window.location.reload();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-4 min-w-[300px]">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Rechercher par libellé..." 
              className="pl-8" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={residenceFilter} onValueChange={(v) => setResidenceFilter(v)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrer par résidence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les résidences</SelectItem>
              {residences.map(r => (
                <SelectItem key={r.id} value={r.id}>{r.quartier}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleCreate} className="bg-primary">
          <Plus className="mr-2 h-4 w-4" /> Ajouter un Appartement
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Modifier l'appartement" : "Nouvel appartement"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="libelle">Libellé (Porte / Numéro)</Label>
              <Input 
                id="libelle" 
                value={formData.libelle} 
                onChange={(e) => setFormData({...formData, libelle: e.target.value})} 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label>Résidence</Label>
              <Select 
                value={formData.residenceId} 
                onValueChange={(v) => setFormData({...formData, residenceId: v || ""})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une résidence" />
                </SelectTrigger>
                <SelectContent>
                  {residences.map(r => (
                    <SelectItem key={r.id} value={r.id}>{r.quartier}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="loyer">Loyer (FCFA)</Label>
                <Input 
                  id="loyer" 
                  type="number"
                  value={formData.loyer} 
                  onChange={(e) => setFormData({...formData, loyer: parseInt(e.target.value)})} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nbrePieces">Nombre de Pièces</Label>
                <Input 
                  id="nbrePieces" 
                  type="number"
                  value={formData.nbrePieces} 
                  onChange={(e) => setFormData({...formData, nbrePieces: parseInt(e.target.value)})} 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="taux">Taux Commission (%)</Label>
              <Input 
                id="taux" 
                type="number"
                value={formData.taux} 
                onChange={(e) => setFormData({...formData, taux: parseInt(e.target.value)})} 
                required 
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Annuler</Button>
              <Button type="submit">Enregistrer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Libellé</TableHead>
              <TableHead>Résidence</TableHead>
              <TableHead>Loyer</TableHead>
              <TableHead>Pièces</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Aucun appartement trouvé.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((a, index) => (
                <AnimatedTableRow key={a.id} index={index} className="border-b">
                  <TableCell className="font-semibold text-secondary">
                    <div className="flex items-center">
                      <Home className="mr-2 h-4 w-4 text-primary" />
                      {a.libelle}
                    </div>
                  </TableCell>
                  <TableCell>{a.residence.quartier}</TableCell>
                  <TableCell className="font-bold">
                    {a.loyer.toLocaleString()} FCFA
                    <SuggestionPrixLoyer appartementId={a.id} loyerActuel={a.loyer} />
                  </TableCell>
                  <TableCell>{a.nbrePieces}</TableCell>
                  <TableCell>
                    <Badge variant={a.statut === "LIBRE" ? "default" : "destructive"}>
                      {a.statut}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <IconButton 
                        variant="ghost" 
                        size="sm"
                        icon={<Pencil />} 
                        onClick={() => handleEdit(a)} 
                        title="Modifier"
                      />
                      <IconButton 
                        variant="ghost" 
                        size="sm"
                        className="text-destructive hover:text-destructive/90"
                        icon={<Trash2 />} 
                        onClick={() => handleDelete(a.id)} 
                        title="Supprimer"
                      />
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
