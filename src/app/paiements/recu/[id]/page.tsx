import { getPaiementById } from "@/app/actions/paiements";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { numberToFrench } from "@/lib/utils";
import { Printer } from "lucide-react";

export default async function RecuPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await getPaiementById(id);

  if (!p) return notFound();

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex justify-center">
      <div className="bg-white w-[210mm] min-h-[148mm] p-10 shadow-lg relative print:shadow-none print:m-0">
        
        {/* Header */}
        <div className="border-b-2 border-primary pb-6 mb-8 flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-primary tracking-tighter">INCH'ALLAH IMMOBILIER</h1>
            <p className="text-sm font-bold text-secondary">Gestion Immobilière & Services</p>
            <p className="text-xs text-muted-foreground">Bouaké, Côte d'Ivoire</p>
            <p className="text-xs text-muted-foreground">Tél: (+225) XX XX XX XX XX</p>
          </div>
          <div className="text-right space-y-1">
            <div className="bg-primary text-white px-4 py-2 font-bold text-lg rounded-sm inline-block">
              REÇU DE PAIEMENT
            </div>
            <p className="text-sm font-mono mt-2 uppercase">N° {p.id.slice(-8).toUpperCase()}</p>
            <p className="text-sm">Date: {format(new Date(p.datePaiement), "dd/MM/yyyy")}</p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6 text-sm leading-relaxed">
          <p>
            Reçu de M./Mme <strong className="text-lg underline underline-offset-4">{p.locataire.nom}</strong>
          </p>
          
          <p>
            La somme de : <strong className="text-lg underline underline-offset-4">{numberToFrench(p.montant)} Francs CFA</strong>
          </p>

          <div className="grid grid-cols-2 gap-8 py-4">
            <div className="space-y-4">
              <p>Pour le paiement de : <strong className="bg-gray-50 px-2 py-1 border">{p.motif}</strong></p>
              <p>Période : <strong className="bg-gray-50 px-2 py-1 border">{p.moisLibelle} {p.annee}</strong></p>
            </div>
            <div className="space-y-4">
              <p>Résidence : <strong>{p.locataire.appartement.residence.quartier}</strong></p>
              <p>Logement : <strong>{p.locataire.appartement.libelle}</strong></p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 border-2 border-double border-gray-200 flex justify-between items-center text-xl font-black">
            <span>TOTAL VERSÉ :</span>
            <span className="text-primary">{p.montant.toLocaleString()} FCFA</span>
          </div>

          {p.reste > 0 && (
            <div className="text-destructive font-bold text-right pt-2">
              RESTE À PAYER : {p.reste.toLocaleString()} FCFA
            </div>
          )}

          {p.observation1 && (
            <div className="mt-4 p-2 border-l-4 border-gray-300 bg-gray-50 italic text-xs">
              Note: {p.observation1}
            </div>
          )}
        </div>

        {/* Footer / Signatures */}
        <div className="mt-16 grid grid-cols-2 gap-20 text-center uppercase tracking-widest text-[10px] font-bold">
          <div>
            <p className="mb-20">Le Locataire</p>
            <div className="border-t border-dotted border-gray-400"></div>
          </div>
          <div>
            <p className="mb-4 font-normal normal-case italic text-muted-foreground">Fait à Bouaké, le {format(new Date(), "dd/MM/yyyy")}</p>
            <p className="mb-20">P/ L'Agence (Agent: {p.agent.nom})</p>
            <div className="border-t border-dotted border-gray-400"></div>
          </div>
        </div>

        {/* Print Button - hidden in print */}
        <div className="fixed bottom-8 right-8 print:hidden">
          <button 
            onClick={() => window.print()}
            className="bg-secondary text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform active:scale-95 flex items-center gap-2 font-bold"
          >
            <Printer className="h-6 w-6" /> Imprimer le reçu
          </button>
        </div>

      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background-color: white !important; }
          .fixed { display: none !important; }
          @page { margin: 1cm; }
        }
      `}} />
    </div>
  );
}
