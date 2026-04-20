import { getAppartements } from "@/app/actions/appartements";
import { getResidences } from "@/app/actions/residences";
import { AppartementsClient } from "@/components/appartements/appartements-client";

export default async function AppartementsPage() {
  const [initialData, residences] = await Promise.all([
    getAppartements(),
    getResidences(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h2 className="text-3xl font-bold tracking-tight text-secondary">Appartements</h2>
        <p className="text-muted-foreground">Gérez l'état et le loyer de vos appartements par résidence.</p>
      </div>

      <AppartementsClient 
        initialData={initialData as any} 
        residences={residences as any} 
      />
    </div>
  );
}
