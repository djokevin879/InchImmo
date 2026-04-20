'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, X, CheckCheck } from 'lucide-react'

interface Notification {
  id: string
  titre: string
  message: string
  type: string
  lien?: string
  lue: boolean
  createdAt: string
}

const COULEURS_TYPE: Record<string, string> = {
  ARRIERE_CRITIQUE: 'border-l-red-500 bg-red-50',
  BAIL_EXPIRANT: 'border-l-orange-400 bg-orange-50',
  PAIEMENT_RECU: 'border-l-green-500 bg-green-50',
  NOUVEAU_LOCATAIRE: 'border-l-blue-500 bg-blue-50',
  ALERTE_SYSTEME: 'border-l-gray-400 bg-gray-50',
}

const ICONES_TYPE: Record<string, string> = {
  ARRIERE_CRITIQUE: '🔴',
  BAIL_EXPIRANT: '⚠️',
  PAIEMENT_RECU: '✅',
  NOUVEAU_LOCATAIRE: '👤',
  ALERTE_SYSTEME: '🔔',
}

export function ClocheNotifications() {
  const router = useRouter()
  const [ouvert, setOuvert] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [nonLues, setNonLues] = useState(0)
  const panelRef = useRef<HTMLDivElement>(null)

  // Charger les notifications
  async function charger() {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
        setNonLues(data.nonLues || 0)
      }
    } catch (err) {
      console.error("Erreur lors du chargement des notifications", err)
    }
  }

  useEffect(() => {
    charger()
    // Rafraîchir toutes les 60 secondes
    const interval = setInterval(charger, 60000)
    return () => clearInterval(interval)
  }, [])

  // Fermer en cliquant dehors
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOuvert(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Marquer toutes comme lues
  async function toutMarquerLu() {
    await fetch('/api/notifications', { method: 'PATCH' })
    setNonLues(0)
    setNotifications(prev => prev.map(n => ({ ...n, lue: true })))
  }

  // Cliquer sur une notification
  async function cliquerNotification(notif: Notification) {
    if (!notif.lue) {
      await fetch(`/api/notifications/${notif.id}`, { method: 'PATCH' })
      setNonLues(prev => Math.max(0, prev - 1))
      setNotifications(prev =>
        prev.map(n => n.id === notif.id ? { ...n, lue: true } : n)
      )
    }
    setOuvert(false)
    if (notif.lien) router.push(notif.lien)
  }

  function tempsRelatif(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime()
    const min = Math.floor(diff / 60000)
    const h = Math.floor(min / 60)
    const j = Math.floor(h / 24)
    if (min < 1) return 'À l\'instant'
    if (min < 60) return `Il y a ${min} min`
    if (h < 24) return `Il y a ${h}h`
    return `Il y a ${j}j`
  }

  return (
    <div className="relative" ref={panelRef}>

      {/* Bouton cloche */}
      <button
        onClick={() => setOuvert(!ouvert)}
        className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {nonLues > 0 && (
          <span className="
            absolute -top-0.5 -right-0.5 w-5 h-5
            bg-red-500 text-white text-xs font-bold
            rounded-full flex items-center justify-center
            animate-pulse
          ">
            {nonLues > 9 ? '9+' : nonLues}
          </span>
        )}
      </button>

      {/* Panel notifications */}
      {ouvert && (
        <div className="
          absolute right-0 top-full mt-2 w-80 sm:w-96 z-50
          bg-white border border-gray-100 rounded-2xl shadow-xl
          overflow-hidden
        ">
          {/* En-tête */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
              {nonLues > 0 && (
                <p className="text-xs text-gray-400">{nonLues} non lue{nonLues > 1 ? 's' : ''}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {nonLues > 0 && (
                <button
                  onClick={toutMarquerLu}
                  className="flex items-center gap-1 text-xs text-[#1D9E75] hover:text-[#085041] transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Tout lire
                </button>
              )}
              <button
                onClick={() => setOuvert(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Liste */}
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Aucune notification</p>
              </div>
            ) : (
              notifications.map(notif => (
                <button
                  key={notif.id}
                  onClick={() => cliquerNotification(notif)}
                  className={`
                    w-full text-left p-4 border-l-4 transition-colors
                    hover:brightness-95
                    ${COULEURS_TYPE[notif.type] || 'border-l-gray-300 bg-white'}
                    ${!notif.lue ? 'opacity-100' : 'opacity-60'}
                  `}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-base flex-shrink-0 mt-0.5">
                      {ICONES_TYPE[notif.type] || '🔔'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-gray-900 truncate">
                          {notif.titre}
                        </p>
                        {!notif.lue && (
                          <span className="w-1.5 h-1.5 bg-[#1D9E75] rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {tempsRelatif(notif.createdAt)}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Pied */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => { setOuvert(false); router.push('/admin/activites') }}
                className="text-xs text-[#1D9E75] hover:text-[#085041] transition-colors"
              >
                Voir tout le journal d'activité →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
