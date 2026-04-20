import { getActivites } from '@/app/actions/activites'
import { getUsers } from '@/app/actions/utilisateurs'

const ICONES_ACTION: Record<string, string> = {
  CONNEXION: '🔑',
  DECONNEXION: '🚪',
  CREATION: '➕',
  MODIFICATION: '✏️',
  SUPPRESSION: '🗑️',
  PAIEMENT_ENREGISTRE: '💰',
  LOCATAIRE_PARTI: '📦',
  EXPORT_PDF: '📄',
  EXPORT_EXCEL: '📊',
}

const COULEURS_ACTION: Record<string, string> = {
  CONNEXION: 'bg-blue-50 text-blue-700',
  CREATION: 'bg-green-50 text-green-700',
  MODIFICATION: 'bg-orange-50 text-orange-600',
  SUPPRESSION: 'bg-red-50 text-red-600',
  PAIEMENT_ENREGISTRE: 'bg-green-50 text-green-700',
  LOCATAIRE_PARTI: 'bg-gray-100 text-gray-600',
  EXPORT_PDF: 'bg-purple-50 text-purple-700',
  EXPORT_EXCEL: 'bg-teal-50 text-teal-700',
}

export default async function ActivitesPage() {
  const [activites, utilisateurs] = await Promise.all([
    getActivites(),
    getUsers(),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Journal d'activité
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Historique complet de toutes les actions effectuées
          </p>
        </div>
        <div className="text-sm text-gray-400">
          {activites.length} entrées
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-3 flex-wrap">
        <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white outline-none focus:border-[#1D9E75]">
          <option value="">Tous les agents</option>
          {utilisateurs.map(u => (
            <option key={u.id} value={u.id}>
              {u.nom} {u.prenom}
            </option>
          ))}
        </select>
        <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white outline-none focus:border-[#1D9E75]">
          <option value="">Toutes les entités</option>
          <option>Locataire</option>
          <option>Résidence</option>
          <option>Appartement</option>
          <option>Paiement</option>
          <option>Utilisateur</option>
        </select>
        <input
          type="date"
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white outline-none focus:border-[#1D9E75]"
        />
      </div>

      {/* Timeline */}
      <div className="space-y-1">
        {activites.map((log) => {
          const date = new Date(log.createdAt)
          const dateStr = date.toLocaleDateString('fr-FR', {
            day: '2-digit', month: 'long', year: 'numeric'
          })
          const heureStr = date.toLocaleTimeString('fr-FR', {
            hour: '2-digit', minute: '2-digit'
          })
          const couleur = COULEURS_ACTION[log.action] || 'bg-gray-100 text-gray-600'
          const icone = ICONES_ACTION[log.action] || '•'

          return (
            <div
              key={log.id}
              className="flex items-start gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:border-gray-200 transition-colors"
            >
              {/* Icône action */}
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${couleur}`}>
                {icone}
              </div>

              {/* Contenu */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-gray-900 text-sm">
                    {log.user.nom} {log.user.prenom}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${couleur}`}>
                    {log.action.replace(/_/g, ' ')}
                  </span>
                  {log.entiteNom && (
                    <span className="text-sm text-gray-600 font-medium">
                      — <strong>{log.entiteNom}</strong>
                    </span>
                  )}
                </div>
                {log.details && (
                  <p className="text-xs text-gray-400 mt-1">{log.details}</p>
                )}
                <div className="text-[10px] text-gray-400 mt-1 font-medium bg-gray-50 inline-block px-1.5 py-0.5 rounded border border-gray-100">
                   IP: {log.ipAddress} · ID: {log.entiteId}
                </div>
              </div>

              {/* Date/heure */}
              <div className="text-right flex-shrink-0">
                <div className="text-xs font-bold text-secondary">{heureStr}</div>
                <div className="text-[10px] text-muted-foreground uppercase font-black">{dateStr}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
