import { defineStore } from "pinia"
import { ref } from "vue"

export const useEventStore = defineStore("events", () => {

  const events = ref([])

  function addEvent(type, message, level = "info") {

  events.value.unshift({

    id: Date.now() + Math.random(),

    timestamp: Date.now(),

    type,

    level,

    message,

  })

  if (events.value.length > 200) {

    events.value.pop()

  }

}
  function clearEvents() {

    events.value = []

  }

  return {

    events,

    addEvent,

    clearEvents,

  }

})