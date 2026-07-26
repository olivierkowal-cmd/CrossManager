import { defineStore } from "pinia"
import { ref, computed } from "vue"

export const useAppStore = defineStore("app", () => {

  // Mode de l'application
  // master | scanner | tv
  const mode = ref("master")

  // Scanner utilisé
  const scannerId = ref(
  Number(localStorage.getItem("crossmanager-scanner-id")) || 1
)

  // Nom affiché
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

  // Etat réseau (prévu pour la V3)
  const connected = ref(true)

  function setMode(newMode) {

    mode.value = newMode

  }

  function setScanner(id) {

  scannerId.value = Number(id)

  localStorage.setItem(
    "crossmanager-scanner-id",
    String(scannerId.value)
  )

  mode.value = "scanner"

}

  function setMaster() {

    mode.value = "master"

  }

  function setTv() {

    mode.value = "tv"

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