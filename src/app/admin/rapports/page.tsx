'use client'

import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'

const MOIS = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

export default function RapportsPage() {
  const [mois, setMois] = useState(new Date().getMonth() || 12)
  const [annee, setAnnee] = useState(new Date().getFullYear())
  const [rapport, setRapport] = useState<any>(null)
  const [chargement, setChargement] = useState(false)

  async function generer() {
    setChargement(true)
    try {
      const res = await fetch(`/api/rapports?mois=${mois}&annee=${annee}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setRapport(data.rapport)
    } catch (err) {
      console.error(err)
    } finally {
      setChargement(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Sparkles className="w-6 h-6 text-[#1D9E75]" />
        <h1 className="text-2xl font-semibold">Rapports IA Gemini</h1>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={mois}
          onChange={e => setMois(Number(e.target.value))}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
        >
          {MOIS.slice(1).map((m, i) => (
            <option key={i + 1} value={i + 1}>{m}</option>
          ))}
        </select>
        <select
          value={annee}
          onChange={e => setAnnee(Number(e.target.value))}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
        >
          {[2023, 2024, 2025, 2026].map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <button
          onClick={generer}
          disabled={chargement}
          className="flex items-center gap-2 px-4 py-2 bg-[#1D9E75] text-white text-sm rounded-lg hover:bg-[#085041] transition-colors disabled:opacity-50"
        >
          {chargement
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Gemini analyse...</>
            : <><Sparkles className="w-4 h-4" /> Générer le rapport</>
          }
        </button>
      </div>

      {rapport && (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-[#1D9E75] px-6 py-4 text-white">
            <h2 className="text-lg font-semibold">
              Rapport — {MOIS[rapport.mois]} {rapport.annee}
            </h2>
            <div className="flex gap-6 mt-2 text-sm text-green-100">
              <span>Recouvrement : {rapport.tauxRecouvrement}%</span>
              <span>Occupation : {rapport.tauxOccupation}%</span>
              <span>
                Variation : {rapport.variation > 0 ? '+' : ''}{rapport.variation}%
              </span>
            </div>
          </div>

          <div className="px-6 py-5">
            <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed">
              {rapport.contenu}
            </pre>
          </div>

          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
            <span className="text-xs text-gray-400">
              Généré par Gemini IA le {new Date(rapport.genereA).toLocaleString('fr-FR')}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
