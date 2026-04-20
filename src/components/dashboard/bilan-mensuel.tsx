'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface BilanMensuelProps {
  bilan: {
    mois: number
    annee: number
    totalAttendu: number
    totalEncaisse: number
    totalNonEncaisse: number
    tauxRecouvrement: number
    totalEncaissePrecedent: number
    variation: number
    totalArrieres: number
    nbLocatairesActifs: number
    nbPaiementsMois: number
  }
}

const MOIS_LABELS = [
  '', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
]

function formatFCFA(montant: number): string {
  return new Intl.NumberFormat('fr-FR').format(montant) + ' FCFA'
}

export function BilanMensuel({ bilan }: BilanMensuelProps) {
  const donneesDonut = [
    { name: 'Encaissé', value: bilan.totalEncaisse, color: '#1D9E75' },
    { name: 'Non encaissé', value: Math.max(0, bilan.totalNonEncaisse), color: '#FEE2E2' },
  ]

  const VariationIcon = bilan.variation > 0
    ? TrendingUp
    : bilan.variation < 0
    ? TrendingDown
    : Minus

  const variationColor = bilan.variation > 0
    ? 'text-green-600'
    : bilan.variation < 0
    ? 'text-red-500'
    : 'text-gray-400'

  const tauxColor = bilan.tauxRecouvrement >= 80
    ? '#1D9E75'
    : bilan.tauxRecouvrement >= 60
    ? '#F59E0B'
    : '#EF4444'

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">

      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Bilan mensuel
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {MOIS_LABELS[bilan.mois]} {bilan.annee}
          </p>
        </div>
        <div
          className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full"
          style={{
            background: bilan.tauxRecouvrement >= 80
              ? '#E1F5EE'
              : bilan.tauxRecouvrement >= 60
              ? '#FEF3C7'
              : '#FEE2E2',
            color: tauxColor
          }}
        >
          <VariationIcon className="w-4 h-4" />
          Taux : {bilan.tauxRecouvrement}%
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Graphique Donut */}
        <div className="flex flex-col items-center">
          <div className="relative w-full" style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donneesDonut}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {donneesDonut.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [formatFCFA(Number(value || 0)), '']}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span className="text-xs text-gray-600">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Label central */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span
                className="text-2xl font-bold"
                style={{ color: tauxColor }}
              >
                {bilan.tauxRecouvrement}%
              </span>
              <span className="text-xs text-gray-400">recouvré</span>
            </div>
          </div>
        </div>

        {/* Chiffres clés */}
        <div className="flex flex-col gap-3">

          {/* Attendu */}
          <div className="flex justify-between items-center py-3 border-b border-gray-50">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">
                Total attendu
              </p>
              <p className="text-base font-semibold text-gray-900 mt-0.5">
                {formatFCFA(bilan.totalAttendu)}
              </p>
            </div>
            <div className="text-xs text-gray-400">
              {bilan.nbLocatairesActifs} locataires
            </div>
          </div>

          {/* Encaissé */}
          <div className="flex justify-between items-center py-3 border-b border-gray-50">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">
                Encaissé
              </p>
              <p className="text-base font-semibold mt-0.5" style={{ color: '#1D9E75' }}>
                {formatFCFA(bilan.totalEncaisse)}
              </p>
            </div>
            <div className="text-xs text-gray-400">
              {bilan.nbPaiementsMois} paiements
            </div>
          </div>

          {/* Non encaissé */}
          <div className="flex justify-between items-center py-3 border-b border-gray-50">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">
                Non encaissé
              </p>
              <p className="text-base font-semibold text-red-500 mt-0.5">
                {formatFCFA(Math.max(0, bilan.totalNonEncaisse))}
              </p>
            </div>
          </div>

          {/* Comparaison mois précédent */}
          <div className="flex justify-between items-center py-3 border-b border-gray-50">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">
                Mois précédent
              </p>
              <p className="text-base font-semibold text-gray-700 mt-0.5">
                {formatFCFA(bilan.totalEncaissePrecedent)}
              </p>
            </div>
            <div className={`flex items-center gap-1 text-sm font-medium ${variationColor}`}>
              <VariationIcon className="w-4 h-4" />
              {bilan.variation > 0 ? '+' : ''}{bilan.variation}%
            </div>
          </div>

          {/* Arriérés cumulés */}
          <div className="flex justify-between items-center py-3">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">
                Arriérés cumulés
              </p>
              <p className="text-base font-semibold text-red-500 mt-0.5">
                {formatFCFA(bilan.totalArrieres)}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
