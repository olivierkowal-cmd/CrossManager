import { defineStore } from "pinia"
import { ref, computed } from "vue"

export const useAppStore = defineStore("app", () => {

  // =====================================================
  // MODE DE L'APPLICATION
  // master | scanner | tv
  // =====================================================

  const savedMode =
    localStorage.getItem("crossmanager_mode")

  const mode = ref(
    savedMode || "master"
  )


  // =====================================================
  // SCANNER UTILISÉ
  // =====================================================

  const savedScannerId =
    Number(
      localStorage.getItem(
        "crossmanager_scanner_id"
      )
    )

  const scannerId = ref(
    Number.isInteger(savedScannerId) &&
    savedScannerId >= 1 &&
    savedScannerId <= 4
      ? savedScannerId
      : 1
  )


  // =====================================================
  // NOM AFFICHÉ
  // =====================================================

  const deviceName = computed(() => {

    switch (mode.value) {

      case "master":
        return "Téléphone maître"

      case "tv":
        return "Écran TV"

      case "scanner":
        return `Scanner ${scannerId.value}`

      default:
        return "CrossManager"

    }

  })


  // =====================================================
  // ÉTAT RÉSEAU
  // =====================================================

  const connected = ref(true)


  // =====================================================
  // CHANGER DE MODE
  // =====================================================

  function setMode(newMode) {

    mode.value = newMode

    localStorage.setItem(
      "crossmanager_mode",
      newMode
    )

  }


  // =====================================================
  // CHOISIR UN SCANNER
  // =====================================================

  function setScanner(id) {

    scannerId.value = id

    mode.value = "scanner"


    localStorage.setItem(
      "crossmanager_scanner_id",
      String(id)
    )

    localStorage.setItem(
      "crossmanager_mode",
      "scanner"
    )

  }


  // =====================================================
  // MODE MASTER
  // =====================================================

  function setMaster() {

    mode.value = "master"

    localStorage.setItem(
      "crossmanager_mode",
      "master"
    )

  }


  // =====================================================
  // MODE TV
  // =====================================================

  function setTv() {

    mode.value = "tv"

    localStorage.setItem(
      "crossmanager_mode",
      "tv"
    )

  }


  return {

    mode,
    scannerId,
    deviceName,
    connected,

    setMode,
    setScanner,
    setMaster,
    setTv,

  }

})