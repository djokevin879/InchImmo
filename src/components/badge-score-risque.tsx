'use client'

import { useState } from 'react'
import { Shield, Info } from 'lucide-react'
import { ScoreRisque } from '@/lib/score-risque'

interface Props {
  score: ScoreRisque
}

const STYLES: Record<string, string> = {
  VERT: 'bg-green-50 text-green-700 border-green-200',
  ORANGE: 'bg-orange-50 text-orange-600 border-orange-200',
  ROUGE: 'bg-red-50 text-red-600 border-red-200',
}

const BARRE: Record<string, string> = {
  VERT: 'bg-green-500',
  ORANGE: 'bg-orange-400',
  ROUGE: 'bg-red-500',
}

export function BadgeScoreRisque({ score }: Props) {
  const [tooltip, setTooltip] = useState(false)

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setTooltip(!tooltip)}
        className={`
          flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium
          border rounded-full transition-colors
          ${STYLES[score.score]}
        `}
      >
        <Shield className="w-3 h-3" />
        {score.label}
        <span className="font-bold">{score.pourcentage}%</span>
        <Info className="w-3 h-3 opacity-60" />
      </button>

      {tooltip && (
        <div className="
          absolute bottom-full left-0 mb-2 w-64 z-50
          bg-white border border-gray-100 rounded-xl shadow-lg p-3
        ">
          <div className="mb-2">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Score de fiabilité</span>
              <span className="font-medium">{score.pourcentage}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${BARRE[score.score]}`}
                style={{ width: `${score.pourcentage}%` }}
              />
            </div>
          </div>

          <p className="text-xs text-gray-600 mb-1.5">
            <strong>Analyse :</strong> {score.explication}
          </p>
          <p className="text-xs text-gray-500 italic">
            <strong>Action :</strong> {score.recommandation}
          </p>

          <p className="text-xs text-gray-300 mt-2 text-right">
            Analysé par Gemini IA
          </p>
        </div>
      )}
    </div>
  )
}
