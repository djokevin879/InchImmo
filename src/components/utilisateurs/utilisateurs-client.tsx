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
  UserCircle 
} from "lucide-react";
import { 
  createUser, 
  updateUser, 
  deleteUser 
} from "@/app/actions/utilisateurs";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export function UtilisateursClient({ initialData, currentUserId }: { initialData: any[], currentUserId: string }) {
  const [data, setData] = useState(initialData);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    role: "AGENT",
    isActive: true,
  });

  const handleEdit = (u: any) => {
    setEditingId(u.id);
    setFormData({
      nom: u.nom,
      prenom: u.prenom,
      email: u.email,
      password: "", // Don't show password
      role: u.role,
      isActive: u.isActive,
    });
    setIsOpen(true);
  };

  const handleCreate = () => {
    setEditingId(null);
    setFormData({
      nom: "",
      prenom: "",
      email: "",
      password: "",
      role: "AGENT",
      isActive: true,
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateUser(editingId, formData);
        toast.success("Utilisateur mis à jour");
      } else {
        if (!formData.password) {
            toast.error("Mot de passe requis pour un nouvel utilisateur");
            return;
        }
        await createUser(formData);
        toast.success("Utilisateur créé");
      }
      setIsOpen(false);
      window.location.reload(); 
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = async (id: string) => {
    if (id === currentUserId) {
        toast.error("Vous ne pouvez pas supprimer votre propre compte");
        return;
    }
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) return;
    try {
      await deleteUser(id);
      toast.success("Utilisateur supprimé");
      window.location.reload();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleCreate} className="bg-primary">
          <Plus className="mr-2 h-4 w-4" /> Nouvel Utilisateur
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Modifier l'utilisateur" : "Nouvel utilisateur"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prenom">Prénom</Label>
                <Input 
                  id="prenom" 
                  value={formData.prenom} 
                  onChange={(e) => setFormData({...formData, prenom: e.target.value})} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nom">Nom</Label>
                <Input 
                  id="nom" 
                  value={formData.nom} 
                  onChange={(e) => setFormData({...formData, nom: e.target.value})} 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email"
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe {editingId && "(Laisser vide pour ne pas changer)"}</Label>
              <Input 
                id="password" 
                type="password"
                value={formData.password} 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                required={!editingId}
              />
            </div>

            <div className="space-y-2">
              <Label>Rôle</Label>
              <Select value={formData.role} onValueChange={(v) => setFormData({...formData, role: v || "AGENT"})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                  <SelectItem value="AGENT">AGENT</SelectItem>
                  <SelectItem value="COMPTABLE">COMPTABLE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 border p-3 rounded-md">
              <Label htmlFor="active">Compte Actif</Label>
              <div className="flex-1" />
              <Switch 
                id="active" 
                checked={formData.isActive} 
                onCheckedChange={(v) => setFormData({...formData, isActive: v})}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Annuler</Button>
              <Button type="submit">Enregistrer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-semibold text-secondary">
                  <div className="flex items-center">
                    <div className="bg-gray-100 rounded-full p-2 mr-3">
                        <UserCircle className="h-4 w-4 text-gray-400" />
                    </div>
                    {u.prenom} {u.nom}
                  </div>
                </TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Badge variant={u.role === "ADMIN" ? "destructive" : u.role === "COMPTABLE" ? "default" : "secondary"}>
                    {u.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  {u.isActive ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none">ACTIF</Badge>
                  ) : (
                    <Badge variant="outline" className="text-gray-400">INACTIF</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(u)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(u.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
