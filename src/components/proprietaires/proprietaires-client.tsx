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
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Search 
} from "lucide-react";
import { 
  createProprietaire, 
  updateProprietaire, 
  deleteProprietaire 
} from "@/app/actions/proprietaires";
import { toast } from "sonner";

interface Proprietaire {
  id: string;
  nom: string;
  telephone: string;
  ville: string;
  observation: string | null;
  _count: {
    residences: number;
  };
}

export function ProprietairesClient({ initialData }: { initialData: Proprietaire[] }) {
  const [data, setData] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nom: "",
    telephone: "",
    ville: "BOUAKE",
    observation: "",
  });

  const filteredData = data.filter(p => 
    p.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.telephone.includes(searchTerm)
  );

  const handleEdit = (p: Proprietaire) => {
    setEditingId(p.id);
    setFormData({
      nom: p.nom,
      telephone: p.telephone,
      ville: p.ville,
      observation: p.observation || "",
    });
    setIsOpen(true);
  };

  const handleCreate = () => {
    setEditingId(null);
    setFormData({
      nom: "",
      telephone: "",
      ville: "BOUAKE",
      observation: "",
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateProprietaire(editingId, formData);
        toast.success("Propriétaire mis à jour");
      } else {
        await createProprietaire(formData);
        toast.success("Propriétaire ajouté");
      }
      setIsOpen(false);
      // Data will be updated via Server Action's revalidatePath if we use Server Component route
      // But for better UX we could refresh manually or use optimistic UI
      window.location.reload(); 
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce propriétaire ? Cela supprimera également ses résidences.")) return;
    try {
      await deleteProprietaire(id);
      toast.success("Propriétaire supprimé");
      window.location.reload();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher un propriétaire..." 
            className="pl-8" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={handleCreate} className="bg-primary">
          <Plus className="mr-2 h-4 w-4" /> Ajouter un Propriétaire
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Modifier le propriétaire" : "Nouveau propriétaire"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom Complet</Label>
              <Input 
                id="nom" 
                value={formData.nom} 
                onChange={(e) => setFormData({...formData, nom: e.target.value})} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone</Label>
              <Input 
                id="telephone" 
                value={formData.telephone} 
                onChange={(e) => setFormData({...formData, telephone: e.target.value})} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ville">Ville</Label>
              <Input 
                id="ville" 
                value={formData.ville} 
                onChange={(e) => setFormData({...formData, ville: e.target.value})} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="observation">Observation</Label>
              <Input 
                id="observation" 
                value={formData.observation} 
                onChange={(e) => setFormData({...formData, observation: e.target.value})} 
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
              <TableHead>Nom</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Ville</TableHead>
              <TableHead>Résidences</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Aucun propriétaire trouvé.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium text-secondary">{p.nom}</TableCell>
                  <TableCell>{p.telephone}</TableCell>
                  <TableCell>{p.ville}</TableCell>
                  <TableCell>
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-bold">
                      {p._count.residences}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(p)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(p.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
