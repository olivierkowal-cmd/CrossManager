import { defineStore } from "pinia"
import { ref } from "vue"

export const useEventStore = defineStore("events", () => {

  const events = ref([])

  function addEvent(type, message) {

    events.value.unshift({

      id: crypto.randomUUID(),

      time: new Date(),

      type,

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