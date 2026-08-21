import pdfMake from "pdfmake/build/pdfmake"
import pdfFonts from "pdfmake/build/vfs_fonts"

pdfMake.vfs = pdfFonts.vfs


// =====================================================
// EXPORT DES RÉSULTATS EN PDF
// =====================================================

export function exportResultsToPDF(races, settings) {

  const content = []

  const dateExport =
    new Date().toLocaleString("fr-BE")

  let firstRace = true


  races.forEach((race) => {

    // -----------------------------------------------
    // Ignorer les courses sans résultats
    // -----------------------------------------------

    if (
      !Array.isArray(race.results) ||
      race.results.length === 0
    ) {
      return
    }


    // -----------------------------------------------
    // Nouvelle page pour chaque course
    // -----------------------------------------------

    if (!firstRace) {

      content.push({
        text: "",
        pageBreak: "before",
      })

    }

    firstRace = false


    // =================================================
    // TITRE DE LA COURSE
    // =================================================

    content.push({

      text: race.label,

      style: "raceTitle",

      margin: [0, 0, 0, 10],

    })


    // =================================================
    // PODIUM
    // =================================================

    const podium =
      race.results
        .slice()
        .sort(
          (a, b) =>
            (a.position ?? 999) -
            (b.position ?? 999)
        )
        .slice(0, 3)


    if (podium.length > 0) {

      content.push({

        text: "PODIUM",

        fontSize: 15,

        bold: true,

        color: "#d97706",

        margin: [0, 0, 0, 8],

      })


      podium.forEach((result) => {

        const position =
          result.position ?? ""


        content.push({

          columns: [

            {
              width: 40,

              text: String(position),

              fontSize: 16,

              bold: true,

              alignment: "center",

              color: "#d97706",
            },

            {
              width: "*",

              text:
                `${result.participant?.nom ?? ""} ` +
                `${result.participant?.prenom ?? ""}`,

              bold: true,
            },

            {
              width: 90,

              alignment: "right",

              text:
                formatTime(
                  result.elapsedTime
                ),
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


    // =================================================
    // STATISTIQUES
    // =================================================

    content.push({

      columns: [

        {
          text:
            `Participants : ${race.participants ?? 0}`,
        },

        {
          text:
            `Arrivées : ${race.arrivals ?? 0}`,

          alignment: "right",
        },

      ],

      margin: [0, 0, 0, 15],

    })


    // =================================================
    // TABLEAU DES RÉSULTATS
    // =================================================

    const body = [

      [

        {
          text: "Place",

          color: "white",

          bold: true,

          alignment: "center",
        },

        {
          text: "Dossard",

          color: "white",

          bold: true,

          alignment: "center",
        },

        {
          text: "Nom",

          color: "white",

          bold: true,
        },

        {
          text: "Prénom",

          color: "white",

          bold: true,
        },

        {
          text: "Temps",

          color: "white",

          bold: true,

          alignment: "right",
        },

      ],

    ]


    race.results
      .slice()
      .sort(
        (a, b) =>
          (a.position ?? 999) -
          (b.position ?? 999)
      )
      .forEach((result) => {

        const place =
          result.position ?? ""


        body.push([

          {
            text: String(place),

            alignment: "center",

            bold: true,
          },

          {
            text:
              String(
                result.participant?.dossard ?? ""
              ),

            alignment: "center",
          },

          result.participant?.nom ?? "",

          result.participant?.prenom ?? "",

          {
            text:
              formatTime(
                result.elapsedTime
              ),

            alignment: "right",
          },

        ])

      })


    content.push({

      table: {

        headerRows: 1,

        widths: [
          50,
          70,
          "*",
          "*",
          80,
        ],

        body,

      },


      layout: {

        // ---------------------------------------------
        // Couleur des lignes
        // ---------------------------------------------

        fillColor: (row) => {

          if (row === 0) {

            return "#0284c7"

          }

          return row % 2 === 0
            ? "#f8fafc"
            : null

        },


        // ---------------------------------------------
        // Bordures
        // ---------------------------------------------

        hLineWidth: () => 0.5,

        vLineWidth: () => 0.5,

        hLineColor: () => "#cbd5e1",

        vLineColor: () => "#cbd5e1",


        // ---------------------------------------------
        // Espacement
        // ---------------------------------------------

        paddingLeft: () => 8,

        paddingRight: () => 8,

        paddingTop: () => 6,

        paddingBottom: () => 6,

      },

    })

  })


  // =====================================================
  // DOCUMENT PDF
  // =====================================================

  const docDefinition = {

    pageSize: "A4",

    pageMargins: [
      40,
      70,
      40,
      50,
    ],


    // ===================================================
    // EN-TÊTE
    // ===================================================

    header: {

      margin: [
        40,
        20,
        40,
        10,
      ],

      columns: [

        {

          text:
            settings?.schoolName ??
            "ISM Rèves",

          fontSize: 20,

          bold: true,

          color: "#0f172a",

        },

        {

          text:
            settings?.eventName ??
            "Cross scolaire 2026",

          alignment: "right",

          fontSize: 14,

          color: "#64748b",

        },

      ],

    },


    // ===================================================
    // PIED DE PAGE
    // ===================================================

    footer(currentPage, pageCount) {

      return {

        margin: [
          40,
          10,
        ],

        columns: [

          {

            text:
              `Exporté le ${dateExport}`,

            color: "#64748b",

            fontSize: 9,

          },

          {

            text:
              `CrossManager 1.0   -   Page ${currentPage} / ${pageCount}`,

            alignment: "right",

            color: "#64748b",

            fontSize: 9,

          },

        ],

      }

    },


    // ===================================================
    // CONTENU
    // ===================================================

    content,


    // ===================================================
    // STYLES
    // ===================================================

    styles: {

      raceTitle: {

        fontSize: 18,

        bold: true,

        color: "#0284c7",

      },

    },

  }


  // =====================================================
  // TÉLÉCHARGEMENT
  // =====================================================

  pdfMake
    .createPdf(docDefinition)
    .download("Resultats_Cross.pdf")

}


// =====================================================
// FORMAT DU TEMPS
// =====================================================

function formatTime(ms = 0) {

  const total =
    Math.max(
      0,
      Math.floor(ms / 1000)
    )


  const h =
    String(
      Math.floor(total / 3600)
    ).padStart(2, "0")


  const m =
    String(
      Math.floor(
        (total % 3600) / 60
      )
    ).padStart(2, "0")


  const s =
    String(
      total % 60
    ).padStart(2, "0")


  return `${h}:${m}:${s}`

}