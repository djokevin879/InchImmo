'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Users, Building2, Home, CreditCard, Loader2 } from 'lucide-react'
import { rechercheGlobale, ResultatRecherche } from '@/app/actions/recherche'

const ICONES: Record<string, any> = {
  locataire: Users,
  residence: Building2,
  appartement: Home,
  paiement: CreditCard,
}

const LABELS: Record<string, string> = {
  locataire: 'Locataire',
  residence: 'Résidence',
  appartement: 'Appartement',
  paiement: 'Paiement',
}

const BADGE_STYLES: Record<string, string> = {
  green: 'bg-green-50 text-green-700',
  red: 'bg-red-50 text-red-600',
  orange: 'bg-orange-50 text-orange-600',
  gray: 'bg-gray-100 text-gray-500',
}

export function RechercheGlobale() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [resultats, setResultats] = useState<ResultatRecherche[]>([])
  const [ouvert, setOuvert] = useState(false)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout>(null)

  // Recherche avec debounce 300ms
  useEffect(() => {
    if (query.trim().length < 2) {
      setResultats([])
      setOuvert(false)
      return
    }
    
    if (timerRef.current) {
        clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {
      startTransition(async () => {
        const res = await rechercheGlobale(query)
        setResultats(res)
        setOuvert(res.length > 0)
      })
    }, 300)
    
    return () => {
        if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [query])

  // Fermer en cliquant dehors
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setOuvert(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Raccourci clavier Ctrl+K
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape') {
        setOuvert(false)
        setQuery('')
        inputRef.current?.blur()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  function naviguer(url: string) {
    setOuvert(false)
    setQuery('')
    router.push(url)
  }

  // Grouper résultats par type
  const grouped = resultats.reduce((acc, r) => {
    if (!acc[r.type]) acc[r.type] = []
    acc[r.type].push(r)
    return acc
  }, {} as Record<string, ResultatRecherche[]>)

  return (
    <div className="relative w-full" ref={dropdownRef}>

      {/* Barre de recherche */}
      <div className={`
        flex items-center gap-2 px-3 py-1.5
        bg-white border rounded-xl transition-all duration-200
        ${ouvert || query
          ? 'border-primary ring-2 ring-primary/10'
          : 'border-gray-200 hover:border-gray-300'
        }
      `}>
        {isPending
          ? <Loader2 className="w-4 h-4 text-primary animate-spin flex-shrink-0" />
          : <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
        }
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => {
              if (resultats.length > 0) setOuvert(true)
          }}
          placeholder="Rechercher locataire, résidence, paiement..."
          className="flex-1 text-sm bg-transparent outline-none text-gray-900 placeholder:text-gray-400 min-w-0"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResultats([]); setOuvert(false) }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold text-gray-400 bg-gray-100 rounded border border-gray-200">
          ⌘K
        </kbd>
      </div>

      {/* Dropdown résultats */}
      {ouvert && resultats.length > 0 && (
        <div className="
          absolute top-full left-0 right-0 mt-2 z-50
          bg-white border border-gray-100 rounded-xl shadow-lg
          overflow-hidden max-h-[420px] overflow-y-auto
        ">
          {Object.entries(grouped).map(([type, items]) => {
            const Icone = ICONES[type]
            return (
              <div key={type}>
                {/* Titre de groupe */}
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100">
                  <Icone className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    {LABELS[type]}s
                  </span>
                  <span className="ml-auto text-[10px] text-gray-400 font-bold">
                    {items.length} RÉSULTAT{items.length > 1 ? 'S' : ''}
                  </span>
                </div>

                {/* Items */}
                {items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => naviguer(item.url)}
                    className="
                      w-full flex items-center gap-3 px-4 py-3
                      hover:bg-primary/5 transition-colors text-left
                      border-b border-gray-50 last:border-0
                    "
                  >
                    <div className="
                      w-8 h-8 rounded-lg flex items-center justify-center
                      flex-shrink-0 bg-gray-50
                    ">
                      <Icone className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-secondary truncate">
                        {item.titre}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5 font-medium">
                        {item.sousTitre}
                      </p>
                    </div>
                    {item.badge && (
                      <span className={`
                        flex-shrink-0 text-[10px] px-2 py-0.5 rounded-full font-black uppercase
                        ${BADGE_STYLES[item.badgeColor || 'gray']}
                      `}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )
          })}

          {/* Footer */}
          <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
              {resultats.length} RÉSULTAT{resultats.length > 1 ? 'S' : ''} TROUVÉ{resultats.length > 1 ? 'S' : ''}
            </span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              <kbd className="px-1 py-0.5 bg-white border border-gray-200 rounded text-[10px]">ÉCHAP</kbd> POUR FERMER
            </span>
          </div>
        </div>
      )}

      {/* Aucun résultat */}
      {ouvert && resultats.length === 0 && query.length >= 2 && !isPending && (
        <div className="
          absolute top-full left-0 right-0 mt-2 z-50
          bg-white border border-gray-100 rounded-xl shadow-lg p-6
          text-center
        ">
          <Search className="w-8 h-8 text-gray-200 mx-auto mb-2" />
          <p className="text-sm font-bold text-secondary">
            Aucun résultat pour <span className="text-primary italic">"{query}"</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            Essayez avec un nom, un téléphone ou un quartier
          </p>
        </div>
      )}
    </div>
  )
}
