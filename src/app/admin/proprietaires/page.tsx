import { getProprietaires } from "@/app/actions/proprietaires";
import { ProprietairesClient } from "@/components/proprietaires/proprietaires-client";

export default async function ProprietairesPage() {
  const initialData = await getProprietaires();

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h2 className="text-3xl font-bold tracking-tight text-secondary">Propriétaires</h2>
        <p className="text-muted-foreground">Gérez la liste des propriétaires de vos résidences.</p>
      </div>

      <ProprietairesClient initialData={initialData} />
    </div>
  );
}
