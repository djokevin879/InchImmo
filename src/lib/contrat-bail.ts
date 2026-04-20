import jsPDF from 'jspdf'

interface DonneesContrat {
  // Locataire
  locataireNom: string
  locataireFonction: string
  locataireNationalite: string
  locataireTypePiece: string
  locataireNumPiece: string
  locataireTelephone: string

  // Appartement
  appartementLibelle: string
  appartementNbrePieces: number
  appartementLoyer: number

  // Résidence
  residenceQuartier: string
  residenceVille: string
  residenceLocalisation: string

  // Propriétaire
  proprietaireNom: string
  proprietaireTelephone: string

  // Bail
  dateEntree: Date
  dureeContrat: number // en mois
  cautionMois: number // ex: 2 mois de caution
}

function formaterFCFA(montant: number): string {
  return new Intl.NumberFormat('fr-FR').format(montant) + ' FCFA'
}

function nombreEnLettres(n: number): string {
  const unites = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six',
    'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize',
    'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf']
  const dizaines = ['', '', 'vingt', 'trente', 'quarante', 'cinquante',
    'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix']
  if (n === 0) return 'zéro'
  if (n < 20) return unites[n]
  if (n < 100) return dizaines[Math.floor(n / 10)] + (n % 10 ? '-' + unites[n % 10] : '')
  if (n < 1000) return unites[Math.floor(n / 100)] + ' cent' + (n % 100 ? ' ' + nombreEnLettres(n % 100) : '')
  if (n < 1000000) {
    const milliers = Math.floor(n / 1000)
    return (milliers === 1 ? 'mille' : nombreEnLettres(milliers) + ' mille') +
      (n % 1000 ? ' ' + nombreEnLettres(n % 1000) : '')
  }
  return n.toString()
}

export function genererContratBailPDF(data: DonneesContrat): void {
  const doc = new jsPDF({ orientation: 'portrait', format: 'a4' })
  const pageW = 210
  const marge = 20
  let y = 20

  // ── EN-TÊTE ──────────────────────────────────────────────
  doc.setFillColor(29, 158, 117)
  doc.rect(0, 0, pageW, 32, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text("INCH'ALLAH IMMOBILIER", pageW / 2, 13, { align: 'center' })

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Agence Immobilière — ${data.residenceVille}, Côte d'Ivoire`, pageW / 2, 21, { align: 'center' })
  doc.text(`Tél. Agence : +225 XX XX XX XX XX`, pageW / 2, 27, { align: 'center' })

  y = 45

  // ── TITRE CONTRAT ────────────────────────────────────────
  doc.setTextColor(8, 80, 65)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('CONTRAT DE BAIL D\'HABITATION', pageW / 2, y, { align: 'center' })

  y += 6
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(107, 114, 128)
  const dateStr = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
  doc.text(`Établi le ${dateStr} à ${data.residenceVille}`, pageW / 2, y, { align: 'center' })

  y += 10

  // Ligne séparatrice
  doc.setDrawColor(29, 158, 117)
  doc.setLineWidth(0.5)
  doc.line(marge, y, pageW - marge, y)
  y += 8

  // ── ENTRE LES SOUSSIGNÉS ─────────────────────────────────
  doc.setTextColor(17, 24, 39)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('ENTRE LES SOUSSIGNÉS', marge, y)
  y += 7

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)

  // Bailleur
  doc.setFont('helvetica', 'bold')
  doc.text('LE BAILLEUR :', marge, y)
  doc.setFont('helvetica', 'normal')
  y += 6
  const textBailleur = `M. / Mme ${data.proprietaireNom}, propriétaire, représenté(e) par l'agence INCH'ALLAH IMMOBILIER, joignable au ${data.proprietaireTelephone}, ci-après désigné(e) « LE BAILLEUR ».`
  const lignesBailleur = doc.splitTextToSize(textBailleur, pageW - 2 * marge)
  doc.text(lignesBailleur, marge, y)
  y += lignesBailleur.length * 5.5 + 4

  // Preneur
  doc.setFont('helvetica', 'bold')
  doc.text('LE PRENEUR :', marge, y)
  doc.setFont('helvetica', 'normal')
  y += 6
  const textPreneur = `M. / Mme ${data.locataireNom}, ${data.locataireFonction || 'sans profession déclarée'}, de nationalité ${data.locataireNationalite || 'ivoirienne'}, titulaire de la pièce d'identité ${data.locataireTypePiece || 'CNI'} n° ${data.locataireNumPiece || '—'}, joignable au ${data.locataireTelephone || '—'}, ci-après désigné(e) « LE PRENEUR ».`
  const lignesPreneur = doc.splitTextToSize(textPreneur, pageW - 2 * marge)
  doc.text(lignesPreneur, marge, y)
  y += lignesPreneur.length * 5.5 + 6

  doc.setDrawColor(220, 220, 220)
  doc.setLineWidth(0.3)
  doc.line(marge, y, pageW - marge, y)
  y += 8

  // ── ARTICLE 1 — OBJET ────────────────────────────────────
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(8, 80, 65)
  doc.text('ARTICLE 1 — OBJET DU CONTRAT', marge, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(17, 24, 39)
  doc.setFontSize(9.5)
  const textObjet = `Le Bailleur donne en location au Preneur, qui accepte, un appartement de ${data.appartementNbrePieces} pièce(s) dénommé « ${data.appartementLibelle} », situé à ${data.residenceLocalisation || data.residenceQuartier}, Quartier ${data.residenceQuartier}, ${data.residenceVille}, Côte d'Ivoire. Le logement est destiné exclusivement à usage d'habitation.`
  const lignesObjet = doc.splitTextToSize(textObjet, pageW - 2 * marge)
  doc.text(lignesObjet, marge, y)
  y += lignesObjet.length * 5.5 + 6

  // ── ARTICLE 2 — DURÉE ────────────────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(8, 80, 65)
  doc.text('ARTICLE 2 — DURÉE DU BAIL', marge, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(17, 24, 39)
  const dateEntreeStr = data.dateEntree.toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
  const dateFin = new Date(data.dateEntree)
  dateFin.setMonth(dateFin.getMonth() + data.dureeContrat)
  const dateFinStr = dateFin.toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
  const textDuree = `Le présent bail est consenti pour une durée de ${data.dureeContrat} mois, prenant effet le ${dateEntreeStr} et se terminant le ${dateFinStr}. À l'expiration de cette période, le bail sera renouvelable par tacite reconduction, sauf préavis d'un (1) mois notifié par l'une ou l'autre des parties.`
  const lignesDuree = doc.splitTextToSize(textDuree, pageW - 2 * marge)
  doc.text(lignesDuree, marge, y)
  y += lignesDuree.length * 5.5 + 6

  // ── ARTICLE 3 — LOYER ────────────────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(8, 80, 65)
  doc.text('ARTICLE 3 — LOYER ET CONDITIONS DE PAIEMENT', marge, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(17, 24, 39)
  const loyerLettres = nombreEnLettres(data.appartementLoyer)
  const textLoyer = `Le loyer mensuel est fixé à ${formaterFCFA(data.appartementLoyer)} (${loyerLettres} francs CFA), payable d'avance, au plus tard le premier (1er) jour de chaque mois. Le paiement s'effectue directement auprès de l'agence INCH'ALLAH IMMOBILIER ou de son agent mandaté, contre remise d'un reçu de paiement officiel.`
  const lignesLoyer = doc.splitTextToSize(textLoyer, pageW - 2 * marge)
  doc.text(lignesLoyer, marge, y)
  y += lignesLoyer.length * 5.5 + 6

  // ── ARTICLE 4 — CAUTION ──────────────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(8, 80, 65)
  doc.text('ARTICLE 4 — DÉPÔT DE GARANTIE', marge, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(17, 24, 39)
  const caution = data.appartementLoyer * data.cautionMois
  const textCaution = `À la signature du présent contrat, le Preneur verse un dépôt de garantie équivalent à ${data.cautionMois} mois de loyer, soit ${formaterFCFA(caution)}. Ce dépôt sera restitué dans un délai d'un (1) mois suivant la restitution des clés, déduction faite des éventuelles réparations dues aux dégradations constatées.`
  const lignesCaution = doc.splitTextToSize(textCaution, pageW - 2 * marge)
  doc.text(lignesCaution, marge, y)
  y += lignesCaution.length * 5.5 + 6

  // ── ARTICLE 5 — OBLIGATIONS ──────────────────────────────
  // Nouvelle page si nécessaire
  if (y > 230) { doc.addPage(); y = 20 }

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(8, 80, 65)
  doc.text('ARTICLE 5 — OBLIGATIONS DES PARTIES', marge, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(17, 24, 39)

  doc.setFont('helvetica', 'italic')
  doc.text('Le Preneur s\'engage à :', marge, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  const obligations = [
    '• Payer le loyer aux dates convenues sans relance préalable.',
    '• Occuper les lieux en bon père de famille et ne pas les sous-louer sans accord écrit.',
    '• Prévenir immédiatement l\'agence de tout dommage ou sinistre.',
    '• Restituer le logement en bon état à la fin du bail.',
    '• Ne pas effectuer de travaux sans autorisation écrite du Bailleur.',
  ]
  obligations.forEach(o => {
    doc.text(o, marge + 3, y)
    y += 5
  })

  y += 3
  doc.setFont('helvetica', 'italic')
  doc.text('Le Bailleur s\'engage à :', marge, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  const obligBailleur = [
    '• Garantir au Preneur la jouissance paisible des lieux loués.',
    '• Assurer les réparations qui ne sont pas à la charge du locataire.',
    '• Remettre le logement en bon état d\'usage et de réparation.',
  ]
  obligBailleur.forEach(o => {
    doc.text(o, marge + 3, y)
    y += 5
  })

  // ── ARTICLE 6 — RÉSILIATION ──────────────────────────────
  y += 4
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(8, 80, 65)
  doc.text('ARTICLE 6 — RÉSILIATION', marge, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(17, 24, 39)
  const textResil = `En cas de non-paiement du loyer après mise en demeure restée sans effet pendant quinze (15) jours, ou en cas de violation grave des obligations contractuelles, le présent bail pourra être résilié de plein droit. Chaque partie peut mettre fin au bail avec un préavis d'un (1) mois notifié par écrit.`
  const lignesResil = doc.splitTextToSize(textResil, pageW - 2 * marge)
  doc.text(lignesResil, marge, y)
  y += lignesResil.length * 5.5 + 10

  // ── SIGNATURES ───────────────────────────────────────────
  if (y > 240) { doc.addPage(); y = 20 }

  doc.setDrawColor(220, 220, 220)
  doc.setLineWidth(0.3)
  doc.line(marge, y, pageW - marge, y)
  y += 8

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(17, 24, 39)
  doc.setFontSize(10)
  doc.text(
    `Fait à ${data.residenceVille}, le ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`,
    pageW / 2, y, { align: 'center' }
  )
  y += 12

  // Deux colonnes signatures
  doc.setFontSize(9)
  doc.text('Le Bailleur / L\'Agence', marge + 20, y, { align: 'center' })
  doc.text('Le Preneur', pageW - marge - 20, y, { align: 'center' })
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(107, 114, 128)
  doc.text('(Signature et cachet)', marge + 20, y, { align: 'center' })
  doc.text('(Signature précédée de « Lu et approuvé »)', pageW - marge - 20, y, { align: 'center' })
  y += 25

  // Zones de signature
  doc.setDrawColor(200, 200, 200)
  doc.rect(marge, y, 70, 25)
  doc.rect(pageW - marge - 70, y, 70, 25)

  // ── PIED DE PAGE ─────────────────────────────────────────
  doc.setFillColor(29, 158, 117)
  doc.rect(0, 285, pageW, 12, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8)
  doc.text(
    `INCH'ALLAH IMMOBILIER — ${data.residenceVille}, Côte d'Ivoire — Document généré automatiquement`,
    pageW / 2, 292, { align: 'center' }
  )

  doc.save(`contrat-bail-${data.locataireNom.replace(/\s+/g, '-').toLowerCase()}.pdf`)
}
