import pdfMake from "pdfmake/build/pdfmake"
import pdfFonts from "pdfmake/build/vfs_fonts"

pdfMake.vfs = pdfFonts.vfs

export function exportResultsToPDF(races, settings) {

  const content = []

  const dateExport = new Date().toLocaleString("fr-BE")

  races.forEach((race, index) => {

    if (race.results.length === 0) return

    if (index > 0) {
      content.push({
        text: "",
        pageBreak: "before",
      })
    }

    content.push({
      text: race.label,
      style: "raceTitle",
      margin: [0, 0, 0, 10],
    })

    const podium = race.results.slice(0, 3)

if (podium.length > 0) {

  content.push({
    text: "🏆 PODIUM",
    fontSize: 15,
    bold: true,
    color: "#d97706",
    margin: [0, 0, 0, 8],
  })

  podium.forEach((r) => {

    let medal = "🏅"

    if (r.position === 1) medal = "🥇"
    if (r.position === 2) medal = "🥈"
    if (r.position === 3) medal = "🥉"

    content.push({
      columns: [
        {
          width: 40,
          text: medal,
          fontSize: 18,
        },
        {
          width: "*",
          text: `${r.participant.nom} ${r.participant.prenom}`,
          bold: true,
        },
        {
          width: 90,
          alignment: "right",
          text: formatTime(r.elapsedTime),
        },
      ],
      margin: [15, 2],
    })

  })

  content.push({
    text: "",
    margin: [0, 10],
  })

}

    content.push({
      columns: [
        {
          text: `Participants : ${race.participants}`,
        },
        {
          text: `Arrivées : ${race.arrivals}`,
          alignment: "right",
        },
      ],
      margin: [0, 0, 0, 15],
    })

   const body = [[

  {
    text: "Place",
    color: "white",
    bold: true,
    alignment: "center"
  },

  {
    text: "Dossard",
    color: "white",
    bold: true,
    alignment: "center"
  },

  {
    text: "Nom",
    color: "white",
    bold: true
  },

  {
    text: "Prénom",
    color: "white",
    bold: true
  },

  {
    text: "Temps",
    color: "white",
    bold: true,
    alignment: "right"
  }

]]

    race.results.forEach((r) => {

      let place = r.position

      if (place === 1) place = "🥇"
      else if (place === 2) place = "🥈"
      else if (place === 3) place = "🥉"

 body.push([

  {
    text: place,
    alignment: "center"
  },

  {
    text: r.participant.dossard,
    alignment: "center"
  },

  r.participant.nom,

  r.participant.prenom,

  {
    text: formatTime(r.elapsedTime),
    alignment: "right"
  }

])

    })

    content.push({

      table: {

        headerRows: 1,

        widths: [50, 70, "*", "*", 80],

        body,

      },

    layout: {

  fillColor: (row) => {

    if (row === 0) return "#0284c7"

    return row % 2 === 0 ? "#f8fafc" : null

  },

  hLineWidth: () => 0.5,

  vLineWidth: () => 0.5,

  hLineColor: () => "#cbd5e1",

  vLineColor: () => "#cbd5e1",

  paddingLeft: () => 8,

  paddingRight: () => 8,

  paddingTop: () => 6,

  paddingBottom: () => 6,

}

    })

  })

  const docDefinition = {

    pageSize: "A4",

    pageMargins: [40, 70, 40, 50],

    header: {

      margin: [40, 20, 40, 10],

      columns: [

        {

          text: settings.schoolName,

          fontSize: 20,

          bold: true,

          color: "#0f172a",

        },

        {

          text: settings.eventName,

          alignment: "right",

          fontSize: 14,

          color: "#64748b",

        },

      ],

    },

    footer(currentPage, pageCount) {

      return {

        margin: [40, 10],

        columns: [

          {

            text: `Exporté le ${dateExport}`,

            color: "#64748b",

            fontSize: 9,

          },

          {

            text: `CrossManager 1.0   -   Page ${currentPage} / ${pageCount}`,

            alignment: "right",

            color: "#64748b",

            fontSize: 9,

          },

        ],

      }

    },

    content,

    styles: {

      raceTitle: {

        fontSize: 18,

        bold: true,

        color: "#0284c7",

      },

    },

  }

  pdfMake.createPdf(docDefinition).download("Resultats_Cross.pdf")

}

function formatTime(ms) {

  const total = Math.floor(ms / 1000)

  const h = String(Math.floor(total / 3600)).padStart(2, "0")
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0")
  const s = String(total % 60).padStart(2, "0")

  return `${h}:${m}:${s}`

}