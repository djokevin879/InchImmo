'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  getPaiementsEnAttente,
  marquerSynchronise,
  compterPaiementsEnAttente
} from '@/lib/offline-storage'
import { createPaiement } from '@/app/actions/paiements'

export function useSync() {
  const [estEnLigne, setEstEnLigne] = useState(true)
  const [enAttente, setEnAttente] = useState(0)
  const [synchronisation, setSynchronisation] = useState(false)

  useEffect(() => {
    // Initial state
    if (typeof window !== 'undefined') {
      setEstEnLigne(navigator.onLine)
    }

    const handleOnline = () => {
      setEstEnLigne(true)
      synchroniser()
    }
    const handleOffline = () => setEstEnLigne(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Vérifier au démarrage
    compterPaiementsEnAttente().then(setEnAttente)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const synchroniser = useCallback(async () => {
    if (synchronisation) return
    setSynchronisation(true)

    try {
      const paiements = await getPaiementsEnAttente()
      for (const p of paiements) {
        try {
          // Note: added missing mapping to match the action signature
          await createPaiement({
            locataireId: p.locataireId,
            montant: p.montant,
            mois: p.mois,
            moisLibelle: p.moisLibelle,
            annee: p.annee,
            motif: p.motif,
            observation1: p.observation1,
            agentId: p.agentId,
          })
          await marquerSynchronise(p.id)
        } catch (e) {
          console.error('Erreur sync paiement:', p.id, e)
        }
      }
      const restants = await compterPaiementsEnAttente()
      setEnAttente(restants)
    } finally {
      setSynchronisation(false)
    }
  }, [synchronisation])

  return { estEnLigne, enAttente, synchronisation, synchroniser }
}
