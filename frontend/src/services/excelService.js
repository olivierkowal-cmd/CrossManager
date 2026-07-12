import * as XLSX from 'xlsx'

// Normalise les en-têtes de colonnes pour accepter différentes variantes.
function normalizeHeader(value) {
  return String(value ?? '')
    .trim()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

// Normalise le sexe pour garantir un format cohérent.
function normalizeSexe(value) {
  const rawValue = String(value ?? '').trim().toUpperCase()

  if (rawValue === 'F' || rawValue === 'G') {
    return rawValue
  }

  if (rawValue.startsWith('F')) {
    return 'F'
  }

  if (rawValue.startsWith('G')) {
    return 'G'
  }

  return 'F'
}

// Extrait le niveau de la classe (par exemple 1A -> 1, 6C -> 6).
function extractNiveau(classeValue) {
  const cleanClasse = String(classeValue ?? '').trim().toUpperCase()
  const match = cleanClasse.match(/^(\d+)/)
  return match ? match[1] : ''
}

// Construit un participant à partir d'une ligne Excel.
function buildParticipant(row, index, baseDossard) {
  const nom = String(row.nom ?? row['nom'] ?? '').trim()
  const prenom = String(row.prenom ?? row['prenom'] ?? row['prénom'] ?? '').trim()
  const classeRaw = String(row.classe ?? row['classe'] ?? '').trim().toUpperCase()
  const sexe = normalizeSexe(row.sexe ?? row['sexe'])
  const niveau = extractNiveau(classeRaw)
  const classe = classeRaw || `${niveau}${sexe}`
  const categorie = `${niveau}${sexe}`
  const dossard = baseDossard + index

  return {
    dossard,
    nom,
    prenom,
    sexe,
    niveau,
    classe,
    categorie,
    present: false,
    qr: `QR-${String(dossard).padStart(3, '0')}`,
  }
}

// Lit un fichier Excel et retourne une liste de participants prêts à être ajoutés.
export async function importExcel(file, startDossard = 1) {
  if (!(file instanceof File)) {
    throw new Error('Aucun fichier Excel valide n’a été fourni.')
  }

  const arrayBuffer = await file.arrayBuffer()
  const workbook = XLSX.read(arrayBuffer, { type: 'array' })
  const firstSheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[firstSheetName]

  // Conversion de la feuille en tableau d’objets JavaScript.
  const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: false, blankrows: false })

  if (!rows.length) {
    return []
  }

  // Les en-têtes Excel sont normalisés pour supporter Nom / Prénom / Classe / Sexe.
  const normalizedRows = rows.map((row) => {
    const normalizedRow = {}

    Object.entries(row).forEach(([key, value]) => {
      normalizedRow[normalizeHeader(key)] = value
    })

    return normalizedRow
  })

  return normalizedRows
    .filter((row) => row.nom || row.prenom || row.classe || row.sexe)
    .map((row, index) => buildParticipant(row, index, startDossard))
}
