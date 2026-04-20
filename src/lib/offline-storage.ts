const DB_NAME = 'inchallah-offline'
const DB_VERSION = 1
const STORE_PAIEMENTS = 'paiements-en-attente'

function ouvrirDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_PAIEMENTS)) {
        const store = db.createObjectStore(STORE_PAIEMENTS, {
          keyPath: 'id'
        })
        store.createIndex('synced', 'synced', { unique: false })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export interface PaiementHorsLigne {
  id: string // UUID local
  locataireId: string
  locataireNom: string
  montant: number
  mois: number
  moisLibelle: string
  annee: number
  motif: string
  reste: number
  observation1?: string
  agentId: string
  createdAt: string
  synced: boolean
}

// Sauvegarder un paiement hors ligne
export async function sauvegarderPaiementHorsLigne(
  paiement: Omit<PaiementHorsLigne, 'id' | 'synced' | 'createdAt'>
): Promise<string> {
  const db = await ouvrirDB()
  const id = `offline-${Date.now()}-${Math.random().toString(36).slice(2)}`
  const entry: PaiementHorsLigne = {
    ...paiement,
    id,
    synced: false,
    createdAt: new Date().toISOString(),
  }
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PAIEMENTS, 'readwrite')
    tx.objectStore(STORE_PAIEMENTS).add(entry)
    tx.oncomplete = () => resolve(id)
    tx.onerror = () => reject(tx.error)
  })
}

// Récupérer les paiements non synchronisés
export async function getPaiementsEnAttente(): Promise<PaiementHorsLigne[]> {
  const db = await ouvrirDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PAIEMENTS, 'readonly')
    // Corrected index query to get unsynced only
    // In the prompt it wasIDBKeyRange.only(0) but synced is boolean. 
    // Usually boolean in IDB should be tracked as such.
    const req = tx.objectStore(STORE_PAIEMENTS)
      .index('synced').getAll(IDBKeyRange.only(false))
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

// Marquer un paiement comme synchronisé
export async function marquerSynchronise(id: string): Promise<void> {
  const db = await ouvrirDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PAIEMENTS, 'readwrite')
    const store = tx.objectStore(STORE_PAIEMENTS)
    const req = store.get(id)
    req.onsuccess = () => {
      const entry = req.result
      if (entry) {
        entry.synced = true
        store.put(entry)
      }
    }
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

// Compter les paiements en attente
export async function compterPaiementsEnAttente(): Promise<number> {
  const en_attente = await getPaiementsEnAttente()
  return en_attente.length
}
