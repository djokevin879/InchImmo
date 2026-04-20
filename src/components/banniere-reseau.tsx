'use client'

import { useSync } from '@/hooks/use-sync'
import { Wifi, WifiOff, RefreshCw } from 'lucide-react'

export function BanniereReseau() {
  const { estEnLigne, enAttente, synchronisation, synchroniser } = useSync()

  if (estEnLigne && enAttente === 0) return null

  return (
    <div className={`
      flex items-center gap-3 px-4 py-2.5 text-sm font-medium
      ${estEnLigne
        ? 'bg-orange-50 border-b border-orange-100 text-orange-700'
        : 'bg-red-50 border-b border-red-100 text-red-700'
      }
    `}>
      {estEnLigne ? (
        <Wifi className="w-4 h-4" />
      ) : (
        <WifiOff className="w-4 h-4" />
      )}

      {!estEnLigne && (
        <span>Mode hors ligne — Les paiements seront synchronisés à la reconnexion</span>
      )}

      {estEnLigne && enAttente > 0 && (
        <>
          <span>
            {enAttente} paiement{enAttente > 1 ? 's' : ''} en attente de synchronisation
          </span>
          <button
            onClick={synchroniser}
            disabled={synchronisation}
            className="flex items-center gap-1.5 ml-auto px-3 py-1 bg-orange-100 rounded-lg hover:bg-orange-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${synchronisation ? 'animate-spin' : ''}`} />
            {synchronisation ? 'Synchronisation...' : 'Synchroniser maintenant'}
          </button>
        </>
      )}
    </div>
  )
}
