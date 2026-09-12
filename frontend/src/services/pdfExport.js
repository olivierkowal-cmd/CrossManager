// =====================================================
// EXPORTS PDF - CROSSMANAGER
// =====================================================


// =====================================================
// CHARGEMENT DE PDFMAKE
// =====================================================

async function getPdfMake() {
  const pdfMakeModule = await import("pdfmake/build/pdfmake")
  const pdfFontsModule = await import("pdfmake/build/vfs_fonts")

  const pdfMake = pdfMakeModule.default
  const pdfFonts = pdfFontsModule.default

  pdfMake.vfs = pdfFonts.vfs

  return pdfMake
}


// =====================================================
// FORMAT DU TEMPS
// =====================================================

function formatTime(ms = 0) {
  const total = Math.max(
    0,
    Math.floor(ms / 1000)
  )

  const h = String(
    Math.floor(total / 3600)
  ).padStart(2, "0")

  const m = String(
    Math.floor((total % 3600) / 60)
  ).padStart(2, "0")

  const s = String(
    total % 60
  ).padStart(2, "0")

  return `${h}:${m}:${s}`
}


// =====================================================
// COULEUR D'UN DOSSARD
// =====================================================

function getDossardColor(classe) {
  const niveau = String(classe ?? "").charAt(0)

  switch (niveau) {
    case "1":
      return "#3B82F6"

    case "2":
      return "#10B981"

    case "3":
      return "#F97316"

    case "4":
      return "#EF4444"

    case "5":
      return "#8B5CF6"

    case "6":
      return "#334155"

    default:
      return "#64748B"
  }
}


// =====================================================
// EXPORT DES RÉSULTATS EN PDF
// =====================================================

export async function exportResultsToPDF(
  races,
  settings
) {
  const pdfMake = await getPdfMake()

  const content = []

  const dateExport = new Date().toLocaleString(
    "fr-BE"
  )

  let firstRace = true

  races.forEach((race) => {

    // -------------------------------------------------
    // Ignorer les courses sans résultats
    // -------------------------------------------------

    if (
      !Array.isArray(race.results) ||
      race.results.length === 0
    ) {
      return
    }


    // -------------------------------------------------
    // Nouvelle page pour chaque course
    // -------------------------------------------------

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

    const podium = race.results
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

        const nom =
          result.participant?.nom ?? ""

        const prenom =
          result.participant?.prenom ?? ""

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
              text: `${nom} ${prenom}`,
              bold: true,
            },

            {
              width: 90,
              alignment: "right",
              text: formatTime(
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
            text: String(
              result.participant?.dossard ?? ""
            ),
            alignment: "center",
          },

          result.participant?.nom ?? "",

          result.participant?.prenom ?? "",

          {
            text: formatTime(
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


  // ===================================================
  // DOCUMENT PDF
  // ===================================================

  const docDefinition = {

    pageSize: "A4",

    pageMargins: [
      40,
      70,
      40,
      50,
    ],


    // =================================================
    // EN-TÊTE
    // =================================================

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


    // =================================================
    // PIED DE PAGE
    // =================================================

    footer: function (
      currentPage,
      pageCount
    ) {
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


    // =================================================
    // CONTENU
    // =================================================

    content,


    // =================================================
    // STYLES
    // =================================================

    styles: {

      raceTitle: {
        fontSize: 18,
        bold: true,
        color: "#0284c7",
      },

    },
  }


  // ===================================================
  // TÉLÉCHARGEMENT
  // ===================================================

  pdfMake
    .createPdf(docDefinition)
    .download(
      "Resultats_Cross.pdf"
    )
}


// =====================================================
// EXPORT DES DOSSARDS EN PDF
// =====================================================

export async function exportDossardsToPDF(
  participants,
  settings
) {

  const pdfMake = await getPdfMake()

  // ---------------------------------------------------
  // Chargement du générateur QR
  // ---------------------------------------------------

  const QRCode = await import("qrcode")

  const qrGenerator =
    QRCode.default ?? QRCode


  // ---------------------------------------------------
  // Date
  // ---------------------------------------------------

  const dateExport =
    new Date().toLocaleString("fr-BE")


  // ---------------------------------------------------
  // Vérification
  // ---------------------------------------------------

  if (
    !Array.isArray(participants) ||
    participants.length === 0
  ) {
    alert(
      "Aucun participant à exporter."
    )

    return
  }


  // ---------------------------------------------------
  // Préparation des dossards
  // ---------------------------------------------------

  const cards = []

  for (const participant of participants) {

    let qrImage = ""

    // -----------------------------------------------
    // Génération du QR
    // -----------------------------------------------

    if (participant.qr) {

      try {

        qrImage =
          await qrGenerator.toDataURL(
            String(participant.qr),
            {
              width: 220,
              margin: 1,
              errorCorrectionLevel: "H",
            }
          )

      } catch (error) {

        console.error(
          "Erreur génération QR :",
          error
        )

      }
    }


    // -----------------------------------------------
    // Couleur
    // -----------------------------------------------

    const couleur =
      getDossardColor(
        participant.classe
      )


    // -----------------------------------------------
    // Dossard
    // -----------------------------------------------

    cards.push({
      stack: [

        // ===========================================
        // LOGO
        // ===========================================

        {
          stack: [
            {
              text: "ISM",
              fontSize: 22,
              bold: true,
              characterSpacing: 5,
              color: "#0284c7",
              alignment: "center",
              margin: [0, 2, 0, 0],
            },

            {
              text: "RÈVES",
              fontSize: 11,
              color: "#475569",
              alignment: "center",
              margin: [0, 0, 0, 5],
            },
          ],
        },


        // ===========================================
        // NUMÉRO
        // ===========================================

        {
          text: String(
            participant.dossard ?? ""
          ),

          fontSize: 42,
          bold: true,
          alignment: "center",
          margin: [0, 2, 0, 4],
        },


        // ===========================================
        // QR CODE
        // ===========================================

        qrImage
          ? {
              image: qrImage,
              width: 105,
              height: 105,
              alignment: "center",
              margin: [0, 2, 0, 5],
            }
          : {
              text: "QR indisponible",
              alignment: "center",
              color: "#dc2626",
              margin: [0, 20, 0, 20],
            },


        // ===========================================
        // NOM
        // ===========================================

        {
          text: String(
            participant.nom ?? ""
          ).toUpperCase(),

          fontSize: 17,
          bold: true,
          alignment: "center",
          margin: [0, 3, 0, 0],
          noWrap: false,
        },


        // ===========================================
        // PRÉNOM
        // ===========================================

        {
          text: String(
            participant.prenom ?? ""
          ),

          fontSize: 14,
          alignment: "center",
          margin: [0, 2, 0, 0],
        },


        // ===========================================
        // CLASSE
        // ===========================================

        {
          text:
            `Classe ${participant.classe ?? ""}`,

          fontSize: 12,
          alignment: "center",
          color: "#475569",
          margin: [0, 4, 0, 5],
        },


        // ===========================================
        // BANDE COULEUR
        // ===========================================

        {
          canvas: [
            {
              type: "rect",
              x: 0,
              y: 0,
              w: 225,
              h: 8,
              color: couleur,
            },
          ],

          margin: [0, 2, 0, 0],
        },

      ],
    })
  }


  // ===================================================
  // CONSTRUCTION DES PAGES
  // ===================================================

  const pages = []


  for (
    let i = 0;
    i < cards.length;
    i += 4
  ) {

    const group =
      cards.slice(i, i + 4)


    // -----------------------------------------------
    // Compléter la page avec des cellules vides
    // -----------------------------------------------

    while (group.length < 4) {
      group.push({
        text: "",
      })
    }


    // -----------------------------------------------
    // Page 2 × 2
    // -----------------------------------------------

    pages.push({

      table: {

        widths: [
          "*",
          "*",
        ],

        heights: [
          350,
          350,
        ],

        body: [
          [
            {
              ...group[0],
              margin: [8, 8, 8, 8],
            },

            {
              ...group[1],
              margin: [8, 8, 8, 8],
            },
          ],

          [
            {
              ...group[2],
              margin: [8, 8, 8, 8],
            },

            {
              ...group[3],
              margin: [8, 8, 8, 8],
            },
          ],
        ],
      },

      layout: {

        // ---------------------------------------------
        // Bordure extérieure et intérieure
        // ---------------------------------------------

        hLineWidth: () => 0.8,
        vLineWidth: () => 0.8,

        hLineColor: () => "#cbd5e1",
        vLineColor: () => "#cbd5e1",

        paddingLeft: () => 0,
        paddingRight: () => 0,
        paddingTop: () => 0,
        paddingBottom: () => 0,
      },

      // ---------------------------------------------
      // Chaque groupe de 4 = une page
      // ---------------------------------------------

      ...(i > 0
        ? {
            pageBreak: "before",
          }
        : {}),
    })
  }


  // ===================================================
  // DOCUMENT DOSSARDS
  // ===================================================

  const docDefinition = {

    pageSize: "A4",

    pageMargins: [
      25,
      35,
      25,
      35,
    ],


    // =================================================
    // EN-TÊTE
    // =================================================

    header: {
      margin: [
        25,
        12,
        25,
        5,
      ],

      columns: [

        {
          text:
            settings?.schoolName ??
            "ISM RÈVES",

          fontSize: 10,
          bold: true,
          color: "#0f172a",
        },

        {
          text:
            settings?.eventName ??
            "Cross scolaire 2026",

          fontSize: 9,
          alignment: "right",
          color: "#64748b",
        },

      ],
    },


    // =================================================
    // PIED DE PAGE
    // =================================================

    footer: function (
      currentPage,
      pageCount
    ) {

      return {

        margin: [
          25,
          8,
        ],

        columns: [

          {
            text:
              `Exporté le ${dateExport}`,

            fontSize: 7,
            color: "#64748b",
          },

          {
            text:
              `CrossManager 1.0 - Page ${currentPage} / ${pageCount}`,

            alignment: "right",
            fontSize: 7,
            color: "#64748b",
          },

        ],
      }
    },


    // =================================================
    // CONTENU
    // =================================================

    content: pages,
  }


  // ===================================================
  // TÉLÉCHARGEMENT
  // ===================================================

  pdfMake
    .createPdf(docDefinition)
    .download(
      "Dossards_Cross.pdf"
    )
}