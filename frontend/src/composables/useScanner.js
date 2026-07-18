import { ref } from "vue"
import { useScannerStore } from "../stores/scannerStore"
import { useAppStore } from "../stores/appStore"

export function useScanner() {

  const scannerStore = useScannerStore()
  const app = useAppStore()

  const message = ref("")
  const messageType = ref("success")

  function beep(duration = 120, frequency = 900) {

    try {

      const ctx = new AudioContext()

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.frequency.value = frequency
      gain.gain.value = 0.15

      osc.start()
      osc.stop(ctx.currentTime + duration / 1000)

    } catch {}

  }

  function vibrate(duration = 80) {

    if (navigator.vibrate) {

      navigator.vibrate(duration)

    }

  }

  function clearMessage() {

    setTimeout(() => {

      message.value = ""

    }, 1800)

  }

  async function scan(code) {

    const result = await scannerStore.scanParticipant(

      code,

      app.deviceName

    )

    if (result.success) {

      beep()

      vibrate()

      message.value = "✓ Arrivée enregistrée"

      messageType.value = "success"

    }

    else if (result.duplicate) {

      beep(300, 500)

      vibrate(300)

      message.value = "Participant déjà scanné"

      messageType.value = "warning"

    }

    else {

      beep(500, 250)

      message.value = result.message

      messageType.value = "error"

    }

    clearMessage()

    return result

  }

  return {

    scan,

    message,

    messageType,

  }

}