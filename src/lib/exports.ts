import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

// ─── EN-TÊTE PDF COMMUN ───────────────────────────────────────────
function ajouterEntetePDF(doc: jsPDF, titre: string) {
  // Bande verte en haut
  doc.setFillColor(29, 158, 117) // #1D9E75
  doc.rect(0, 0, 210, 28, 'F')

  // Nom de l'agence
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text("INCH'ALLAH IMMOBILIER", 14, 12)

  // Sous-titre agence
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Agence Immobilière — Bouaké, Côte d\'Ivoire', 14, 19)

  // Date de génération à droite
  const dateStr = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric'
  })
  doc.text(`Généré le : ${dateStr}`, 196, 19, { align: 'right' })

  // Titre du rapport
  doc.setTextColor(8, 80, 65) // #085041
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text(titre, 14, 38)

  // Ligne séparatrice
  doc.setDrawColor(29, 158, 117)
  doc.setLineWidth(0.5)
  doc.line(14, 41, 196, 41)

  // Remettre couleur texte par défaut
  doc.setTextColor(17, 24, 39)
}

// ─── EXPORT PDF PAIEMENTS ─────────────────────────────────────────
export function exporterPaiementsPDF(paiements: any[]) {
  const doc = new jsPDF({ orientation: 'landscape' })
  ajouterEntetePDF(doc, 'Rapport des Paiements')

  const lignes = paiements.map(p => [
    new Date(p.datePaiement).toLocaleDateString('fr-FR'),
    p.locataire?.nom || '—',
    p.locataire?.appartement?.residence?.quartier || '—',
    p.moisLibelle + ' ' + p.annee,
    p.montant.toLocaleString('fr-FR') + ' FCFA',
    p.reste > 0
      ? p.reste.toLocaleString('fr-FR') + ' FCFA'
      : 'Soldé',
    p.agent?.nom + ' ' + (p.agent?.prenom || ''),
  ])

  autoTable(doc, {
    startY: 46,
    head: [['Date', 'Locataire', 'Résidence', 'Période', 'Montant', 'Reste', 'Agent']],
    body: lignes,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: {
      fillColor: [29, 158, 117],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: { fillColor: [240, 253, 248] },
    foot: [[
      '', '', '', 'TOTAL',
      paiements.reduce((s, p) => s + p.montant, 0).toLocaleString('fr-FR') + ' FCFA',
      '', ''
    ]],
    footStyles: { fillColor: [8, 80, 65], textColor: 255, fontStyle: 'bold' },
  })

  doc.save(`paiements_${new Date().toISOString().slice(0, 10)}.pdf`)
}

// ─── EXPORT EXCEL PAIEMENTS ───────────────────────────────────────
export function exporterPaiementsExcel(paiements: any[]) {
  const donnees = paiements.map(p => ({
    'Date': new Date(p.datePaiement).toLocaleDateString('fr-FR'),
    'Locataire': p.locataire?.nom || '—',
    'Résidence': p.locataire?.appartement?.residence?.quartier || '—',
    'Appartement': p.locataire?.appartement?.libelle || '—',
    'Période': p.moisLibelle + ' ' + p.annee,
    'Montant (FCFA)': p.montant,
    'Reste (FCFA)': p.reste,
    'Statut': p.reste > 0 ? 'Reliquat' : 'Soldé',
    'Agent': p.agent?.nom + ' ' + (p.agent?.prenom || ''),
    'Motif': p.motif,
  }))

  const ws = XLSX.utils.json_to_sheet(donnees)
  ws['!cols'] = [
    { wch: 12 }, { wch: 25 }, { wch: 20 }, { wch: 20 },
    { wch: 18 }, { wch: 15 }, { wch: 15 }, { wch: 10 },
    { wch: 20 }, { wch: 15 },
  ]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Paiements')
  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([buffer]), `paiements_${new Date().toISOString().slice(0, 10)}.xlsx`)
}

// ─── EXPORT PDF LOCATAIRES ────────────────────────────────────────
export function exporterLocatairesPDF(locataires: any[]) {
  const doc = new jsPDF({ orientation: 'landscape' })
  ajouterEntetePDF(doc, 'Liste des Locataires')

  const lignes = locataires.map(l => [
    l.nom,
    l.telephone || '—',
    l.appartement?.libelle || '—',
    l.appartement?.residence?.quartier || '—',
    l.loyer.toLocaleString('fr-FR') + ' FCFA',
    l.arriere > 0
      ? l.arriere.toLocaleString('fr-FR') + ' FCFA'
      : '0 FCFA',
    l.statut === 'ACTIF' ? 'Actif' : 'Parti',
    new Date(l.dateEntree).toLocaleDateString('fr-FR'),
  ])

  autoTable(doc, {
    startY: 46,
    head: [['Nom', 'Téléphone', 'Appartement', 'Résidence', 'Loyer', 'Arriérés', 'Statut', 'Entrée']],
    body: lignes,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: {
      fillColor: [29, 158, 117],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: { fillColor: [240, 253, 248] },
    didParseCell: (data) => {
      // Arriérés en rouge si > 0
      if (data.column.index === 5 && data.cell.raw !== '0 FCFA') {
        data.cell.styles.textColor = [239, 68, 68]
        data.cell.styles.fontStyle = 'bold'
      }
    },
  })

  doc.save(`locataires_${new Date().toISOString().slice(0, 10)}.pdf`)
}

// ─── EXPORT EXCEL LOCATAIRES ──────────────────────────────────────
export function exporterLocatairesExcel(locataires: any[]) {
  const donnees = locataires.map(l => ({
    'Nom complet': l.nom,
    'Téléphone': l.telephone || '—',
    'Nationalité': l.nationalite || '—',
    'Type pièce': l.typePiece || '—',
    'N° pièce': l.numPiece || '—',
    'Appartement': l.appartement?.libelle || '—',
    'Résidence': l.appartement?.residence?.quartier || '—',
    'Loyer (FCFA)': l.loyer,
    'Arriérés (FCFA)': l.arriere,
    'Statut': l.statut === 'ACTIF' ? 'Actif' : 'Parti',
    'Date entrée': new Date(l.dateEntree).toLocaleDateString('fr-FR'),
    'Date départ': l.dateDepart
      ? new Date(l.dateDepart).toLocaleDateString('fr-FR')
      : '—',
  }))

  const ws = XLSX.utils.json_to_sheet(donnees)
  ws['!cols'] = [
    { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 12 },
    { wch: 18 }, { wch: 18 }, { wch: 20 }, { wch: 14 },
    { wch: 14 }, { wch: 10 }, { wch: 14 }, { wch: 14 },
  ]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Locataires')
  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([buffer]), `locataires_${new Date().toISOString().slice(0, 10)}.xlsx`)
}

// ─── EXPORT PDF RÉSIDENCES ────────────────────────────────────────
export function exporterResidencesPDF(residences: any[]) {
  const doc = new jsPDF()
  ajouterEntetePDF(doc, 'Liste des Résidences')

  const lignes = residences.map(r => [
    r.quartier,
    r.ville,
    r.proprietaire?.nom || '—',
    r.proprietaire?.telephone || '—',
    r.appartements?.length || 0,
    r.appartements?.filter((a: any) => a.statut === 'OCCUPE').length || 0,
    r.agent?.nom
      ? r.agent.nom + ' ' + (r.agent.prenom || '')
      : 'Non assigné',
  ])

  autoTable(doc, {
    startY: 46,
    head: [['Quartier', 'Ville', 'Propriétaire', 'Tél. Propriétaire', 'Apparts', 'Occupés', 'Agent']],
    body: lignes,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: {
      fillColor: [29, 158, 117],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: { fillColor: [240, 253, 248] },
  })

  doc.save(`residences_${new Date().toISOString().slice(0, 10)}.pdf`)
}

// ─── EXPORT EXCEL RÉSIDENCES ──────────────────────────────────────
export function exporterResidencesExcel(residences: any[]) {
  const donnees = residences.map(r => ({
    'Quartier': r.quartier,
    'Ville': r.ville,
    'Ilot': r.ilot || '—',
    'Localisation': r.localisation || '—',
    'Propriétaire': r.proprietaire?.nom || '—',
    'Tél. Propriétaire': r.proprietaire?.telephone || '—',
    'Nb Appartements': r.appartements?.length || 0,
    'Occupés': r.appartements?.filter((a: any) => a.statut === 'OCCUPE').length || 0,
    'Libres': r.appartements?.filter((a: any) => a.statut === 'LIBRE').length || 0,
    'Agent assigné': r.agent?.nom
      ? r.agent.nom + ' ' + (r.agent.prenom || '')
      : 'Non assigné',
    'Observation': r.observation || '—',
  }))

  const ws = XLSX.utils.json_to_sheet(donnees)
  ws['!cols'] = [
    { wch: 18 }, { wch: 12 }, { wch: 10 }, { wch: 20 },
    { wch: 22 }, { wch: 18 }, { wch: 14 }, { wch: 10 },
    { wch: 10 }, { wch: 22 }, { wch: 25 },
  ]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Résidences')
  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([buffer]), `residences_${new Date().toISOString().slice(0, 10)}.xlsx`)
}
