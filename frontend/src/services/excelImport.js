import * as XLSX from 'xlsx'

export function importExcel(file) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!(file instanceof File)) {
        throw new Error('Le fichier fourni n’est pas un fichier Excel valide.')
      }

      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      const firstSheetName = workbook.SheetNames[0]

      if (!firstSheetName) {
        resolve([])
        return
      }

      const worksheet = workbook.Sheets[firstSheetName]
      const rows = XLSX.utils.sheet_to_json(worksheet, {
        defval: '',
        raw: false,
        blankrows: false,
      })

      resolve(rows)
    } catch (error) {
      reject(error)
    }
  })
}
