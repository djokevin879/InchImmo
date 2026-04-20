'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, CheckCircle, Sparkles, Loader2 } from 'lucide-react'
import { SuggestionPrix } from '@/lib/suggestion-prix'

interface Props {
  appartementId: string
  loyerActuel: number
}

const STYLES: Record<string, { bg: string; text: string; icon: any }> = {
  BIEN_POSITIONNE: { bg: 'bg-green-50 border-green-200', text: 'text-green-700', icon: CheckCircle },
  SOUS_EVALUE: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', icon: TrendingUp },
  SUREVALUE: { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-600', icon: TrendingDown },
}

export function SuggestionPrixLoyer({ appartementId, loyerActuel }: Props) {
  const [suggestion, setSuggestion] = useState<SuggestionPrix | null>(null)
  const [chargement, setChargement] = useState(false)

  async function analyser() {
    setChargement(true)
    try {
      const res = await fetch(`/api/suggestions-prix?appartementId=${appartementId}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setSuggestion(data.suggestion)
    } catch (error) {
      console.error(error)
    } finally {
      setChargement(false)
    }
  }

  if (!suggestion) {
    return (
      <button
        type="button"
        onClick={analyser}
        disabled={chargement}
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        {chargement
          ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyse...</>
          : <><Sparkles className="w-3.5 h-3.5 text-[#1D9E75]" /> Analyse IA du prix</>
        }
      </button>
    )
  }

  const style = STYLES[suggestion.statut]
  const Icone = style.icon

  return (
    <div className={`border rounded-xl p-3 ${style.bg} mt-2`}>
      <div className={`flex items-center gap-2 mb-1.5 ${style.text}`}>
        <Icone className="w-4 h-4" />
        <span className="text-sm font-medium">{suggestion.label}</span>
        {suggestion.ecartPourcentage !== 0 && (
          <span className="text-xs ml-auto font-bold text-gray-900 bg-white/50 px-1 rounded">
            {suggestion.ecartPourcentage > 0 ? '+' : ''}{suggestion.ecartPourcentage}%
          </span>
        )}
      </div>
      <p className="text-xs text-gray-600">{suggestion.explication}</p>
      {suggestion.loyerSuggere && (
        <p className="text-xs font-medium mt-1 text-gray-700">
          Prix suggéré : {suggestion.loyerSuggere.toLocaleString('fr-FR')} FCFA/mois
        </p>
      )}
      <p className="text-xs text-gray-400 mt-1 italic">{suggestion.contexte}</p>
    </div>
  )
}
