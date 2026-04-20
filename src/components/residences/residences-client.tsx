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
  Building
} from "lucide-react";
import { 
  createResidence, 
  updateResidence, 
  deleteResidence 
} from "@/app/actions/residences";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AnimatedTableRow } from "@/components/animations/motion-components";
import { IconButton } from "@/components/ui/icon-button";
import {
  exporterResidencesPDF,
  exporterResidencesExcel,
} from '@/lib/exports'
import { FileDown, Sheet } from 'lucide-react'

interface Residence {
  id: string;
  quartier: string;
  ville: string;
  ilot: string | null;
  localisation: string | null;
  observation: string | null;
  proprietaireId: string;
  proprietaire: { nom: string };
  agentId: string | null;
  agent: { nom: string, prenom: string } | null;
  _count: { appartements: number };
}

export function ResidencesClient({ 
  initialData, 
  proprietaires,
  agents 
}: { 
  initialData: Residence[], 
  proprietaires: { id: string, nom: string }[],
  agents: { id: string, nom: string, prenom: string }[]
}) {
  const [data, setData] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    quartier: "",
    ville: "BOUAKE",
    ilot: "",
    localisation: "",
    observation: "",
    proprietaireId: "",
    agentId: "",
  });

  const filteredData = data.filter(r => 
    r.quartier.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.proprietaire.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (r: Residence) => {
    setEditingId(r.id);
    setFormData({
      quartier: r.quartier,
      ville: r.ville,
      ilot: r.ilot || "",
      localisation: r.localisation || "",
      observation: r.observation || "",
      proprietaireId: r.proprietaireId,
      agentId: r.agentId || "unassigned",
    });
    setIsOpen(true);
  };

  const handleCreate = () => {
    setEditingId(null);
    setFormData({
      quartier: "",
      ville: "BOUAKE",
      ilot: "",
      localisation: "",
      observation: "",
      proprietaireId: proprietaires[0]?.id || "",
      agentId: "unassigned",
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submissionData = {
        ...formData,
        agentId: formData.agentId === "unassigned" ? undefined : formData.agentId
      };

      if (editingId) {
        await updateResidence(editingId, submissionData as any);
        toast.success("Résidence mise à jour");
      } else {
        await createResidence(submissionData as any);
        toast.success("Résidence ajoutée");
      }
      setIsOpen(false);
      window.location.reload(); 
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette résidence ?")) return;
    try {
      await deleteResidence(id);
      toast.success("Résidence supprimée");
      window.location.reload();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col">
          <h2 className="text-3xl font-bold tracking-tight text-secondary">Résidences</h2>
          <p className="text-muted-foreground">Gérez vos résidences et assignez des agents.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exporterResidencesPDF(filteredData)}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors bg-white shadow-sm"
          >
            <FileDown className="w-4 h-4 text-red-500" />
            Export PDF
          </button>
          <button
            onClick={() => exporterResidencesExcel(filteredData)}
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
            placeholder="Rechercher par quartier ou propriétaire..." 
            className="pl-8" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={handleCreate} className="bg-primary">
          <Plus className="mr-2 h-4 w-4" /> Ajouter une Résidence
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Modifier la résidence" : "Nouvelle résidence"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quartier">Quartier</Label>
                <Input 
                  id="quartier" 
                  value={formData.quartier} 
                  onChange={(e) => setFormData({...formData, quartier: e.target.value})} 
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
            </div>
            
            <div className="space-y-2">
              <Label>Propriétaire</Label>
              <Select 
                value={formData.proprietaireId} 
                onValueChange={(v) => setFormData({...formData, proprietaireId: v || ""})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un propriétaire" />
                </SelectTrigger>
                <SelectContent>
                  {proprietaires.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Agent Assigné</Label>
              <Select 
                value={formData.agentId} 
                onValueChange={(v) => setFormData({...formData, agentId: v || ""})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un agent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Non assigné</SelectItem>
                  {agents.map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.prenom} {a.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ilot">Ilot</Label>
                <Input 
                  id="ilot" 
                  value={formData.ilot} 
                  onChange={(e) => setFormData({...formData, ilot: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="localisation">Localisation</Label>
                <Input 
                  id="localisation" 
                  value={formData.localisation} 
                  onChange={(e) => setFormData({...formData, localisation: e.target.value})} 
                />
              </div>
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
              <TableHead>Quartier</TableHead>
              <TableHead>Propriétaire</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Appartements</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Aucune résidence trouvée.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((r, index) => (
                <AnimatedTableRow key={r.id} index={index} className="border-b">
                  <TableCell className="font-semibold text-secondary">
                    <div className="flex items-center">
                      <Building className="mr-2 h-4 w-4 text-primary" />
                      {r.quartier}
                    </div>
                  </TableCell>
                  <TableCell>{r.proprietaire.nom}</TableCell>
                  <TableCell>
                    {r.agent ? (
                      <span className="text-sm font-medium">{r.agent.prenom} {r.agent.nom}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Non assigné</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="bg-secondary/10 text-secondary px-2 py-1 rounded-full text-xs font-bold">
                      {r._count.appartements} appartts.
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <IconButton 
                        variant="ghost" 
                        size="sm"
                        icon={<Pencil />} 
                        onClick={() => handleEdit(r)} 
                        title="Modifier"
                      />
                      <IconButton 
                        variant="ghost" 
                        size="sm"
                        className="text-destructive hover:text-destructive/90"
                        icon={<Trash2 />} 
                        onClick={() => handleDelete(r.id)} 
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
