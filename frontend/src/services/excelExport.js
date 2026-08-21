import ExcelJS from "exceljs"
import { saveAs } from "file-saver"

/*
==================================================
CrossManager
Service d'export Excel (ExcelJS)
==================================================
*/

const BLUE = "FF1F4E78"
const WHITE = "FFFFFFFF"

function formatTime(milliseconds) {

  if (!milliseconds)
    return "00:00"

  const total = Math.floor(milliseconds / 1000)

  const minutes = Math.floor(total / 60)
  const seconds = total % 60

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`

}

function formatClock(timestamp) {

  if (!timestamp)
    return ""

  return new Date(timestamp).toLocaleTimeString()

}

function addTitle(sheet, subtitle) {

  sheet.insertRow(1, [])
  sheet.insertRow(2, [])
  sheet.insertRow(3, [])

  sheet.mergeCells("A1:H1")
  sheet.mergeCells("A2:H2")

  const title = sheet.getCell("A1")

  title.value = "CrossManager - ISM RÊVES"

  title.font = {
    size: 18,
    bold: true,
    color: { argb: BLUE }
  }

  title.alignment = {
    horizontal: "center",
    vertical: "middle"
  }

  const sub = sheet.getCell("A2")

  sub.value = subtitle

  sub.font = {
    size: 13,
    bold: true
  }

  sub.alignment = {
    horizontal: "center",
    vertical: "middle"
  }

  sheet.getRow(1).height = 28
  sheet.getRow(2).height = 22

}

function styleHeader(row) {

  row.height = 22

  row.font = {
    bold: true,
    color: { argb: WHITE },
    size: 11
  }

  row.alignment = {
    horizontal: "center",
    vertical: "middle"
  }

  row.eachCell(cell => {

    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: {
        argb: BLUE
      }
    }

    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
      bottom: { style: "thin" }
    }

  })

}

function styleCells(sheet) {

  sheet.eachRow((row, index) => {

    if (index <= 4)
      return

    row.eachCell(cell => {

      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
        bottom: { style: "thin" }
      }

      cell.alignment = {
        horizontal: "left",
        vertical: "middle"
      }

    })

  })

}

function autoWidth(sheet) {

  sheet.columns.forEach(column => {

    let max = 10

    column.eachCell(
      { includeEmpty: true },
      cell => {

        const length =
          String(cell.value ?? "").length

        if (length > max)
          max = length

      }
    )

    column.width = max + 2

  })

}

function createSummary(workbook, races) {

  const sheet = workbook.addWorksheet("Résumé")

  addTitle(sheet, "Résumé général des courses")

  const header = sheet.addRow([
    "Course",
    "Participants",
    "Arrivées",
    "% Arrivées",
    "Statut"
  ])

  styleHeader(header)

  let totalParticipants = 0
  let totalArrivals = 0

  races.forEach(race => {

    const participants = race.participants
    const arrivals = race.arrivals

    totalParticipants += participants
    totalArrivals += arrivals

    const percent =
      participants === 0
        ? 0
        : arrivals / participants

    const row = sheet.addRow([
      race.label,
      participants,
      arrivals,
      percent,
      race.status
    ])

    row.getCell(2).alignment = {
      horizontal: "center",
      vertical: "middle"
    }

    row.getCell(3).alignment = {
      horizontal: "center",
      vertical: "middle"
    }

    row.getCell(4).alignment = {
      horizontal: "center",
      vertical: "middle"
    }

    row.getCell(4).numFmt = "0.0%"

  })

  sheet.addRow([])

  const totalRow = sheet.addRow([
    "TOTAL",
    totalParticipants,
    totalArrivals,
    totalParticipants === 0
      ? 0
      : totalArrivals / totalParticipants,
    ""
  ])

  styleHeader(totalRow)

  totalRow.getCell(4).numFmt = "0.0%"

  styleCells(sheet)

  sheet.views = [{
    state: "frozen",
    ySplit: 4
  }]

  sheet.autoFilter = {
    from: "A4",
    to: "E4"
  }

  autoWidth(sheet)

}

function createRaceSheet(workbook, race) {

  const sheet = workbook.addWorksheet(race.label)

  addTitle(sheet, `Résultats - ${race.label}`)

  const header = sheet.addRow([
    "Position",
    "Dossard",
    "Nom",
    "Prénom",
    "Classe",
    "Temps",
    "Heure",
    "Scanner"
  ])

  styleHeader(header)

  race.results
    .slice()
    .sort((a, b) => a.position - b.position)
    .forEach(result => {

      const row = sheet.addRow([

        result.position,

        String(result.participant.dossard).padStart(4, "0"),

        result.participant.nom,

        result.participant.prenom,

        result.participant.classe,

        formatTime(result.elapsedTime),

        formatClock(result.arrivalTime),

        result.scanner

      ])

      row.getCell(1).alignment = {
        horizontal: "center",
        vertical: "middle"
      }

      row.getCell(2).numFmt = "@"

      row.getCell(2).alignment = {
        horizontal: "center",
        vertical: "middle"
      }

      row.getCell(6).alignment = {
        horizontal: "center",
        vertical: "middle"
      }

      row.getCell(7).alignment = {
        horizontal: "center",
        vertical: "middle"
      }

      row.getCell(8).alignment = {
        horizontal: "center",
        vertical: "middle"
      }

    })

  styleCells(sheet)

  sheet.views = [{
    state: "frozen",
    ySplit: 4
  }]

  sheet.autoFilter = {
    from: "A4",
    to: "H4"
  }

  autoWidth(sheet)

}

/*
==================================================
Fonction principale
==================================================
*/

export async function exportResultsToExcel(races) {

  const workbook = new ExcelJS.Workbook()

  workbook.creator = "CrossManager"
  workbook.company = "ISM RÊVES"
  workbook.subject = "Résultats du Cross"
  workbook.title = "CrossManager"
  workbook.created = new Date()
  workbook.modified = new Date()

  createSummary(workbook, races)

  races.forEach(race => {
    createRaceSheet(workbook, race)
  })

  workbook.eachSheet(sheet => {

    sheet.pageSetup = {

      paperSize: 9,
      orientation: "landscape",

      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,

      horizontalCentered: true,

      margins: {
        left: 0.3,
        right: 0.3,
        top: 0.5,
        bottom: 0.5,
        header: 0.2,
        footer: 0.2
      },

      printTitlesRow: "4:4"

    }

    sheet.headerFooter = {

      oddHeader: "&C&16&BCrossManager - ISM RÊVES",

      oddFooter:
        "&L&D  &T&CPage &P / &N&RExport Excel"

    }

  })

  const now = new Date()

  const filename =
    `CrossManager_${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}-${String(
      now.getDate()
    ).padStart(2, "0")}.xlsx`

  const buffer = await workbook.xlsx.writeBuffer()

  saveAs(
    new Blob(
      [buffer],
      {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      }
    ),
    filename
  )

}

