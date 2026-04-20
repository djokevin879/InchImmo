import { getResidences, getAgents } from "@/app/actions/residences";
import { getProprietaires } from "@/app/actions/proprietaires";
import { ResidencesClient } from "@/components/residences/residences-client";

export default async function ResidencesPage() {
  const [initialData, proprietaires, agents] = await Promise.all([
    getResidences(),
    getProprietaires(),
    getAgents(),
  ]);

  return (
    <div className="space-y-6">
      <ResidencesClient 
        initialData={initialData as any} 
        proprietaires={proprietaires}
        agents={agents}
      />
    </div>
  );
}
