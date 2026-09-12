import { defineStore } from "pinia"
import { ref } from "vue"

import { useRaceStore } from "./raceStore"
import { useRaceManagerStore } from "./raceManagerStore"
import { useEventStore } from "./eventStore"

import {
  registerArrivalFirestore,
  finishRaceFirestore,
} from "../services/raceService"


export const useScannerStore = defineStore(
  "scanner",
  () => {

    const raceStore = useRaceStore()
    const raceManager = useRaceManagerStore()
    const eventStore = useEventStore()


    // =====================================================
    // HISTORIQUE LOCAL DU SCANNER
    // =====================================================

    const arrivals = ref([])
    const lastArrival = ref(null)


    // =====================================================
    // ÉTAT DES SCANNERS
    // =====================================================

    const scannerStatus = ref({

      "Scanner 1": {
        connected: false,
        scans: 0,
        lastScan: null,
        heartbeat: null,
        battery: 100,
        network: "Wi-Fi",
      },

      "Scanner 2": {
        connected: false,
        scans: 0,
        lastScan: null,
        heartbeat: null,
        battery: 100,
        network: "Wi-Fi",
      },

      "Scanner 3": {
        connected: false,
        scans: 0,
        lastScan: null,
        heartbeat: null,
        battery: 100,
        network: "Wi-Fi",
      },

      "Scanner 4": {
        connected: false,
        scans: 0,
        lastScan: null,
        heartbeat: null,
        battery: 100,
        network: "Wi-Fi",
      },

    })


    // =====================================================
    // HEARTBEAT
    // =====================================================

    function heartbeat(scanner) {

      if (!scannerStatus.value[scanner]) {
        return
      }

      const status =
        scannerStatus.value[scanner]

      const firstConnection =
        !status.connected

      status.connected = true

      status.heartbeat =
        Date.now()

      if (firstConnection) {

        eventStore.addEvent(
          "scanner",
          `${scanner} connecté`
        )

      }
    }


    // =====================================================
    // INFORMATIONS SCANNER
    // =====================================================

    function updateScannerInfo(
      scanner,
      battery,
      network
    ) {

      if (!scannerStatus.value[scanner]) {
        return
      }

      scannerStatus.value[scanner].battery =
        battery

      scannerStatus.value[scanner].network =
        network
    }


    // =====================================================
    // SCAN PARTICIPANT
    // =====================================================

    async function scanParticipant(
      participantId,
      scanner = "Scanner 1"
    ) {

      const code =
        String(participantId).trim()

      heartbeat(scanner)


      // ===================================================
      // RECHERCHE DU PARTICIPANT
      // ===================================================

      const participant =
        raceStore.participants.find(
          (p) =>
            String(p.qr).trim() === code ||
            String(p.dossard).trim() === code ||
            String(p.id).trim() === code
        )


      if (!participant) {

        eventStore.addEvent(
          "error",
          `Participant ${code} introuvable`
        )

        return {
          success: false,
          message:
            "Participant introuvable",
        }
      }


      // ===================================================
      // RÉCUPÉRATION DE LA COURSE
      // ===================================================

      const race =
        raceManager.getRace(
          participant.categorie
        )


      if (!race) {

        return {
          success: false,
          message:
            "Course introuvable",
        }
      }


      // ===================================================
      // VÉRIFICATION DOUBLON
      // ===================================================
      //
      // IMPORTANT :
      //
      // Le doublon est vérifié AVANT l'état de la course.
      //
      // Ainsi, même si la course est terminée,
      // un deuxième scan du même participant
      // retourne bien :
      //
      // "Participant déjà scanné"
      //
      // et non :
      //
      // "La course n'est pas démarrée"
      // ===================================================

      const duplicate =
        Array.isArray(race.results)
          ? race.results.find(
              (arrival) =>
                String(
                  arrival?.participant?.id
                ) ===
                String(
                  participant.id
                )
            )
          : null


      if (duplicate) {

        eventStore.addEvent(
          "warning",
          `${participant.nom} déjà scanné`
        )

        return {
          success: false,
          duplicate: true,
          participant,
          arrival: duplicate,
          message:
            "Participant déjà scanné",
        }
      }


      // ===================================================
      // VÉRIFICATION COURSE EN COURS
      // ===================================================

      if (
        race.status !== "running"
      ) {

        return {
          success: false,
          message:
            "La course n'est pas démarrée",
        }
      }


      // ===================================================
      // CRÉATION DE L'ARRIVÉE
      // ===================================================

      const result =
        raceManager.registerArrival(
          participant,
          scanner
        )


      if (!result.success) {
        return result
      }


      // ===================================================
      // ENREGISTREMENT FIRESTORE
      // ===================================================

      try {

        await registerArrivalFirestore(
          participant.categorie,
          result.arrival
        )

        console.log(
          "✅ Arrivée enregistrée dans Firestore :",
          result.arrival
        )

      } catch (error) {

        console.error(
          "❌ Erreur Firestore arrivée :",
          error
        )


        // -----------------------------------------------
        // Annulation de la modification locale
        // -----------------------------------------------

        if (race.arrivals > 0) {
          race.arrivals--
        }


        if (
          race.results.length > 0 &&
          race.results[
            race.results.length - 1
          ] === result.arrival
        ) {

          race.results.pop()
        }


        return {
          success: false,
          message:
            "Impossible d'enregistrer l'arrivée dans Firestore",
        }
      }


      // ===================================================
      // HISTORIQUE LOCAL DU SCANNER
      // ===================================================

      arrivals.value.push(
        result.arrival
      )

      lastArrival.value =
        result.arrival


      // ===================================================
      // STATISTIQUES DU SCANNER
      // ===================================================

      scannerStatus.value[
        scanner
      ].scans++

      scannerStatus.value[
        scanner
      ].lastScan =
        Date.now()


      // ===================================================
      // ÉVÉNEMENT D'ARRIVÉE
      // ===================================================

      eventStore.addEvent(
        "arrival",
        `${participant.nom} ${participant.prenom}`
      )


      // ===================================================
      // FIN AUTOMATIQUE DE LA COURSE
      // ===================================================
      //
      // Si tous les participants de cette catégorie
      // sont arrivés, la course est automatiquement
      // terminée.
      // ===================================================

      const totalParticipants =
        raceStore.participants.filter(
          (p) =>
            p.categorie ===
            participant.categorie
        ).length


      if (
        totalParticipants > 0 &&
        race.arrivals >= totalParticipants &&
        race.status === "running"
      ) {

        console.log(
          "🏁 Tous les participants sont arrivés :",
          participant.categorie
        )


        try {

          await finishRaceFirestore(
            participant.categorie
          )

          raceManager.finishRace(
            participant.categorie
          )

          eventStore.addEvent(
            "finish",
            `Fin ${race.label} - tous les participants sont arrivés`
          )

          console.log(
            "🏁 Course terminée automatiquement :",
            participant.categorie
          )

        } catch (error) {

          console.error(
            "❌ Impossible de terminer automatiquement la course :",
            error
          )
        }
      }


      // ===================================================
      // RÉSULTAT
      // ===================================================

      return result
    }


    // =====================================================
    // RESET SCANNER
    // =====================================================

    function resetScanner() {

      arrivals.value = []
      lastArrival.value = null


      Object.values(
        scannerStatus.value
      ).forEach(
        (scanner) => {

          scanner.connected = false
          scanner.scans = 0
          scanner.lastScan = null
          scanner.heartbeat = null

        }
      )
    }


    // =====================================================
    // SURVEILLANCE DES HEARTBEATS
    // =====================================================

    setInterval(
      () => {

        const now =
          Date.now()


        Object.entries(
          scannerStatus.value
        ).forEach(
          ([name, scanner]) => {

            if (
              scanner.connected &&
              scanner.heartbeat &&
              now - scanner.heartbeat > 10000
            ) {

              scanner.connected = false

              eventStore.addEvent(
                "scanner",
                `${name} déconnecté`
              )
            }
          }
        )

      },
      2000
    )


    // =====================================================
    // API DU STORE
    // =====================================================

    return {

      arrivals,
      lastArrival,
      scannerStatus,

      heartbeat,
      updateScannerInfo,
      scanParticipant,
      resetScanner,

    }
  }
)