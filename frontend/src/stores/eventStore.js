import { defineStore } from "pinia"
import { ref } from "vue"

export const useEventStore = defineStore("eventStore", () => {

  const events = ref([])

  function addEvent(type, message, data = null) {

    events.value.unshift({

      id: crypto.randomUUID(),

      type,

      message,

      data,

      time: new Date(),

    })

    if (events.value.length > 200) {

      events.value.length = 200

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