import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

// Store centralisé pour la gestion de la course et des arrivées.
export const useRaceStore = defineStore('race', () => {
  const started = ref(false)
  const paused = ref(false)
  const officialStartTime = ref(null)
  const elapsed = ref(0)
  const participants = ref([
    { id: 1, name: 'Alice Martin', bib: '101', category: 'Senior', status: 'En attente' },
    { id: 2, name: 'Benoit Leroux', bib: '102', category: 'Senior', status: 'En attente' },
    { id: 3, name: 'Camille Dubois', bib: '103', category: 'Junior', status: 'En attente' },
    { id: 4, name: 'Dina Morel', bib: '104', category: 'Senior', status: 'En attente' },
  ])
  const arrivals = ref([
    { id: 1, bib: '101', name: 'Alice Martin', time: '00:12:34' },
  ])

  const arrivalCount = computed(() => arrivals.value.length)
  const participantCount = computed(() => participants.value.length)

  function startRace() {
    started.value = true
    paused.value = false
    officialStartTime.value = Date.now()
    elapsed.value = 0
  }

  function pauseRace() {
    if (!started.value) return
    paused.value = true
  }

  function stopRace() {
    started.value = false
    paused.value = false
    officialStartTime.value = null
    elapsed.value = 0
  }

  function resetRace() {
    started.value = false
    paused.value = false
    officialStartTime.value = null
    elapsed.value = 0
    participants.value = participants.value.map((participant) => ({ ...participant, status: 'En attente' }))
    arrivals.value = []
  }

  function tick() {
    if (started.value && !paused.value) {
      elapsed.value += 1
    }
  }

  function markArrival(bib) {
    const participant = participants.value.find((item) => item.bib === bib)
    if (!participant) return

    const existing = arrivals.value.find((item) => item.bib === bib)
    if (existing) return

    participant.status = 'Arrivé'
    arrivals.value.unshift({
      id: Date.now(),
      bib,
      name: participant.name,
      time: formatTime(elapsed.value),
    })
  }

  function formatTime(totalSeconds) {
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
    const seconds = String(totalSeconds % 60).padStart(2, '0')
    return `${hours}:${minutes}:${seconds}`
  }

  return {
    started,
    paused,
    officialStartTime,
    elapsed,
    participants,
    arrivals,
    arrivalCount,
    participantCount,
    startRace,
    pauseRace,
    stopRace,
    resetRace,
    tick,
    markArrival,
    formatTime,
  }
})
