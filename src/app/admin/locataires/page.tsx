import { getLocataires } from "@/app/actions/locataires";
import { getAppartements } from "@/app/actions/appartements";
import { LocatairesClient } from "@/components/locataires/locataires-client";

export default async function LocatairesPage() {
  const [initialData, appartements] = await Promise.all([
    getLocataires(),
    getAppartements(),
  ]);

  return (
    <div className="space-y-6">
      <LocatairesClient 
        initialData={initialData as any} 
        appartements={appartements as any} 
      />
    </div>
  );
}
