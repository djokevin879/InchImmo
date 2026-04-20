'use client'

import { useState, useRef } from 'react'
import { Camera, Upload, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react'
import { DonneesCNI } from '@/lib/ocr-cni'

interface Props {
  onSuccess: (donnees: DonneesCNI) => void
}

export function ScannerCNI({ onSuccess }: Props) {
  const [etape, setEtape] = useState<'initial' | 'apercu' | 'scan' | 'succes' | 'erreur'>('initial')
  const [apercu, setApercu] = useState<string>('')
  const [fichier, setFichier] = useState<File | null>(null)
  const [donnees, setDonnees] = useState<DonneesCNI | null>(null)
  const [erreur, setErreur] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFichier(file: File) {
    if (!file.type.startsWith('image/')) {
      setErreur('Veuillez sélectionner une image')
      return
    }
    setFichier(file)
    const reader = new FileReader()
    reader.onload = (e) => setApercu(e.target?.result as string)
    reader.readAsDataURL(file)
    setEtape('apercu')
    setErreur('')
  }

  async function scanner() {
    if (!fichier) return
    setEtape('scan')

    try {
      const formData = new FormData()
      formData.append('image', fichier)

      const res = await fetch('/api/ocr-cni', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setDonnees(data.donnees)
      setEtape('succes')
    } catch (err: any) {
      setErreur(err.message || 'Erreur lors de la lecture')
      setEtape('erreur')
    }
  }

  function appliquer() {
    if (donnees) onSuccess(donnees)
  }

  function reinitialiser() {
    setEtape('initial')
    setApercu('')
    setFichier(null)
    setDonnees(null)
    setErreur('')
  }

  return (
    <div className="border border-dashed border-[#1D9E75] rounded-xl p-4 bg-green-50/30">

      {/* État initial */}
      {etape === 'initial' && (
        <div className="text-center">
          <Camera className="w-8 h-8 text-[#1D9E75] mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700 mb-1">
            Scanner la pièce d'identité
          </p>
          <p className="text-xs text-gray-400 mb-3">
            Gemini IA extrait automatiquement les informations
          </p>
          <div className="flex gap-2 justify-center">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 text-sm bg-[#1D9E75] text-white rounded-lg hover:bg-[#085041] transition-colors"
            >
              <Upload className="w-4 h-4" />
              Choisir une photo
            </button>
            <button
              type="button"
              onClick={() => {
                if (inputRef.current) {
                  inputRef.current.setAttribute('capture', 'environment')
                  inputRef.current.click()
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-sm border border-[#1D9E75] text-[#1D9E75] rounded-lg hover:bg-green-50 transition-colors"
            >
              <Camera className="w-4 h-4" />
              Prendre une photo
            </button>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => e.target.files?.[0] && handleFichier(e.target.files[0])}
          />
        </div>
      )}

      {/* Aperçu image */}
      {etape === 'apercu' && (
        <div>
          <img
            src={apercu}
            alt="CNI"
            className="w-full max-h-40 object-cover rounded-lg mb-3"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={scanner}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm bg-[#1D9E75] text-white rounded-lg hover:bg-[#085041] transition-colors"
            >
              Analyser avec Gemini IA
            </button>
            <button type="button" onClick={reinitialiser} className="p-2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* En cours */}
      {etape === 'scan' && (
        <div className="text-center py-4">
          <Loader2 className="w-8 h-8 text-[#1D9E75] animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-600">Gemini analyse le document...</p>
          <p className="text-xs text-gray-400 mt-1">Extraction des données en cours</p>
        </div>
      )}

      {/* Succès */}
      {etape === 'succes' && donnees && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">
              Données extraites ({donnees.confidence}% de confiance)
            </span>
          </div>
          <div className="bg-white rounded-lg p-3 space-y-1.5 mb-3 border border-gray-100">
            {donnees.nomComplet && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Nom complet</span>
                <span className="font-medium">{donnees.nomComplet}</span>
              </div>
            )}
            {donnees.dateNaissance && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Date de naissance</span>
                <span className="font-medium">{donnees.dateNaissance}</span>
              </div>
            )}
            {donnees.numeroCNI && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">N° pièce</span>
                <span className="font-medium font-mono">{donnees.numeroCNI}</span>
              </div>
            )}
            {donnees.nationalite && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Nationalité</span>
                <span className="font-medium">{donnees.nationalite}</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={appliquer}
              className="flex-1 px-3 py-2 text-sm bg-[#1D9E75] text-white rounded-lg hover:bg-[#085041] transition-colors"
            >
              Remplir le formulaire
            </button>
            <button type="button" onClick={reinitialiser} className="px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50">
              Refaire
            </button>
          </div>
        </div>
      )}

      {/* Erreur */}
      {etape === 'erreur' && (
        <div>
          <div className="flex items-center gap-2 mb-2 text-red-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Lecture impossible</span>
          </div>
          <p className="text-xs text-gray-500 mb-3">{erreur}</p>
          <button
            type="button"
            onClick={reinitialiser}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            Réessayer avec une autre photo
          </button>
        </div>
      )}
    </div>
  )
}
