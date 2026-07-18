import pdfMake from "pdfmake/build/pdfmake"
import pdfFonts from "pdfmake/build/vfs_fonts"
import QRCode from "qrcode"

pdfMake.vfs = pdfFonts.vfs

/*
==================================================
CrossManager
Export PDF des dossards
==================================================
*/

export async function exportBibsToPDF(
  participants,
  settings,
  options = {}
) {

  if (!participants || participants.length === 0) {
    alert("Aucun participant à exporter.")
    return
  }

  // ==========================
  // Options
  // ==========================

  const config = {

    layout: options.layout ?? 4,

    color:
      options.color ?? "#0284c7",

    qrSize:
      options.qrSize ?? "medium",

    showLogo:
      options.showLogo ?? true,

    showName:
      options.showName ?? true,

    showClass:
      options.showClass ?? true,

    showCategory:
      options.showCategory ?? false,

    showQR:
      options.showQR ?? true,

  }

  // ==========================
  // Configuration disposition
  // ==========================

  const layoutConfig =
    getLayoutConfig(config.layout)

  // ==========================
  // Création des dossards
  // ==========================

  const cards = []

  for (const participant of participants) {

    let qr = null

    if (config.showQR) {

      const qrValue =
        participant.qr ??
        `CM-${String(
          participant.dossard
        ).padStart(4, "0")}`

      qr = await QRCode.toDataURL(
        qrValue,
        {
          width: 600,
          margin: 1,
          errorCorrectionLevel: "H",
        }
      )

    }

    cards.push(
      createBib(
        participant,
        settings,
        config,
        layoutConfig,
        qr
      )
    )

  }

  // ==========================
  // Création des pages
  // ==========================

  const content = []

  const perPage =
    layoutConfig.perPage

  for (
    let i = 0;
    i < cards.length;
    i += perPage
  ) {

    const pageCards =
      cards.slice(
        i,
        i + perPage
      )

    const body = []

    for (
      let row = 0;
      row < layoutConfig.rows;
      row++
    ) {

      const rowContent = []

      for (
        let col = 0;
        col < layoutConfig.columns;
        col++
      ) {

        const index =
          row *
          layoutConfig.columns +
          col

        rowContent.push(
          pageCards[index] ??
          emptyCell()
        )

      }

      body.push(rowContent)

    }

    content.push({

      table: {

        widths:
          Array(
            layoutConfig.columns
          ).fill("*"),

        body,

        dontBreakRows: true,

      },

      layout: {

        hLineWidth: () => 0.5,

        vLineWidth: () => 0.5,

        hLineColor:
          () => "#cbd5e1",

        vLineColor:
          () => "#cbd5e1",

        paddingTop:
          () => layoutConfig.padding,

        paddingBottom:
          () => layoutConfig.padding,

        paddingLeft:
          () => layoutConfig.padding,

        paddingRight:
          () => layoutConfig.padding,

      },

      pageBreak:
        i + perPage <
        cards.length
          ? "after"
          : undefined,

    })

  }

  // ==========================
  // Document PDF
  // ==========================

  const documentDefinition = {

    pageSize: "A4",

    pageOrientation:
      layoutConfig.orientation,

    pageMargins:
      layoutConfig.pageMargins,

    content,

    defaultStyle: {
      fontSize: 10,
    },

    info: {

      title:
        "Dossards CrossManager",

      author:
        settings.schoolName ??
        "CrossManager",

      subject:
        settings.eventName ??
        "Dossards",

    },

  }

  // ==========================
  // Nom du fichier
  // ==========================

  const now = new Date()

  const date =
    `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}-${String(
      now.getDate()
    ).padStart(2, "0")}`

  const eventName =
    String(
      settings.eventName ??
      "Cross"
    )
      .replace(/\s+/g, "_")
      .replace(
        /[^a-zA-Z0-9_-]/g,
        ""
      )

  const filename =
    `${eventName}_Dossards_${date}.pdf`

  pdfMake
    .createPdf(
      documentDefinition
    )
    .download(filename)

}


/*
==================================================
Configuration 1 / 2 / 4 / 8 par page
==================================================
*/

function getLayoutConfig(layout) {

  switch (Number(layout)) {

    case 1:

      return {

        perPage: 1,

        columns: 1,

        rows: 1,

        orientation: "portrait",

        pageMargins:
          [25, 25, 25, 25],

        padding: 10,

        numberSize: 100,

        qrSize: {
          small: 150,
          medium: 200,
          large: 240,
        },

        schoolSize: 22,

        nameSize: 24,

        classSize: 18,

      }


    case 2:

      return {

        perPage: 2,

        columns: 1,

        rows: 2,

        orientation: "portrait",

        pageMargins:
          [20, 20, 20, 20],

        padding: 8,

        numberSize: 70,

        qrSize: {
          small: 100,
          medium: 130,
          large: 155,
        },

        schoolSize: 17,

        nameSize: 19,

        classSize: 14,

      }


    case 8:

      return {

        perPage: 8,

        columns: 2,

        rows: 4,

        orientation: "portrait",

        pageMargins:
          [10, 10, 10, 10],

        padding: 3,

        numberSize: 28,

        qrSize: {
          small: 45,
          medium: 55,
          large: 65,
        },

        schoolSize: 9,

        nameSize: 10,

        classSize: 8,

      }


    case 4:
    default:

      return {

        perPage: 4,

        columns: 2,

        rows: 2,

        orientation: "portrait",

        pageMargins:
          [15, 15, 15, 15],

        padding: 6,

        numberSize: 48,

        qrSize: {
          small: 80,
          medium: 105,
          large: 125,
        },

        schoolSize: 13,

        nameSize: 15,

        classSize: 11,

      }

  }

}


/*
==================================================
Création d'un dossard
==================================================
*/

function createBib(
  participant,
  settings,
  config,
  layoutConfig,
  qr
) {

  const stack = []

  // ==========================
  // Bandeau établissement
  // ==========================

  const headerColumns = []

  // Logo
  if (
    config.showLogo &&
    settings.logo
  ) {

    headerColumns.push({

      image: settings.logo,

      width:
        config.layout === 1
          ? 60
          : config.layout === 8
            ? 20
            : 35,

      margin: [0, 0, 8, 0],

    })

  }

  // Nom établissement
  headerColumns.push({

    text:
      settings.schoolName ??
      "CrossManager",

    color: "white",

    bold: true,

    fontSize:
      layoutConfig.schoolSize,

    alignment: "center",

  })

  stack.push({

    table: {

      widths: ["*"],

      body: [[

        {

          columns:
            headerColumns,

          columnGap: 5,

          alignment:
            "center",

          fillColor:
            config.color,

          margin:
            [8, 7, 8, 7],

        },

      ]],

    },

    layout: "noBorders",

  })


  // ==========================
  // Numéro
  // ==========================

  stack.push({

    text:
      String(
        participant.dossard ??
        ""
      ).padStart(4, "0"),

    alignment: "center",

    bold: true,

    fontSize:
      layoutConfig.numberSize,

    margin:
      config.layout === 8
        ? [0, 3, 0, 3]
        : [0, 8, 0, 8],

  })


  // ==========================
  // QR Code
  // ==========================

  if (
    config.showQR &&
    qr
  ) {

    const size =
      layoutConfig.qrSize[
        config.qrSize
      ] ??
      layoutConfig.qrSize.medium

    stack.push({

      image: qr,

      width: size,

      alignment: "center",

      margin:
        config.layout === 8
          ? [0, 1, 0, 3]
          : [0, 3, 0, 8],

    })

  }


  // ==========================
  // Nom et prénom
  // ==========================

  if (config.showName) {

    const fullName =
      `${participant.nom ?? ""} ${
        participant.prenom ?? ""
      }`
        .trim()
        .toUpperCase()

    stack.push({

      text: fullName,

      alignment: "center",

      bold: true,

      fontSize:
        layoutConfig.nameSize,

      margin: [0, 4, 0, 2],

    })

  }


  // ==========================
  // Classe
  // ==========================

  if (config.showClass) {

    stack.push({

      text:
        `Classe : ${
          participant.classe ??
          "-"
        }`,

      alignment: "center",

      fontSize:
        layoutConfig.classSize,

      margin: [0, 2, 0, 0],

    })

  }


  // ==========================
  // Catégorie
  // ==========================

  if (
    config.showCategory
  ) {

    stack.push({

      text:
        `Catégorie : ${
          participant.categorie ??
          "-"
        }`,

      alignment: "center",

      fontSize:
        layoutConfig.classSize,

      color: "#64748b",

      margin: [0, 2, 0, 0],

    })

  }


  // ==========================
  // Carte finale
  // ==========================

  return {

    table: {

      widths: ["*"],

      body: [[

        {

          stack,

          margin:
            config.layout === 8
              ? [3, 3, 3, 3]
              : [8, 8, 8, 8],

        },

      ]],

    },

    layout: {

      hLineWidth:
        () => 0.8,

      vLineWidth:
        () => 0.8,

      hLineColor:
        () => "#94a3b8",

      vLineColor:
        () => "#94a3b8",

    },

  }

}


/*
==================================================
Cellule vide
==================================================
*/

function emptyCell() {

  return {

    text: "",

    border:
      [
        false,
        false,
        false,
        false,
      ],

  }

}