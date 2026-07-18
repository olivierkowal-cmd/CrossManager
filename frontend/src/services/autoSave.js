const STORAGE_KEY = "crossmanager-autosave"

export function saveProject(data) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      date: new Date().toISOString(),
      data,
    }),
  )
}

export function loadProject() {
  const json = localStorage.getItem(STORAGE_KEY)

  if (!json) return null

  try {
    return JSON.parse(json)
  } catch {
    return null
  }
}

export function clearProject() {
  localStorage.removeItem(STORAGE_KEY)
}