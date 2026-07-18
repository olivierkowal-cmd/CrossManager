export function normalizeQr(rawValue) {

  if (rawValue === null || rawValue === undefined) {

    return null

  }

  const value = String(rawValue).trim()

  if (!value.length) {

    return null

  }

  const id = Number(value)

  if (Number.isNaN(id)) {

    return null

  }

  return id

}

export function validateQr(rawValue) {

  const id = normalizeQr(rawValue)

  if (id === null) {

    return {

      valid: false,

      message: "QR Code invalide"

    }

  }

  return {

    valid: true,

    id

  }

}

export function formatElapsed(milliseconds) {

  if (!milliseconds) {

    return "00:00"

  }

  const totalSeconds = Math.floor(milliseconds / 1000)

  const hours = Math.floor(totalSeconds / 3600)

  const minutes = Math.floor((totalSeconds % 3600) / 60)

  const seconds = totalSeconds % 60

  if (hours > 0) {

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`

  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`

}

export function formatClock(timestamp) {

  if (!timestamp) {

    return "--:--:--"

  }

  return new Date(timestamp).toLocaleTimeString()

}

export function isDuplicate(scannerStore, participantId) {

  return scannerStore.arrivals.some(

    arrival => Number(arrival.participant.id) === Number(participantId)

  )

}