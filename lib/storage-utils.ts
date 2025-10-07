export const STORAGE_KEYS = {
  USER_PREFERENCES: 'coug_scheduler_preferences',
  SURVEY_COMPLETED: 'coug_scheduler_onboarded',
  SCHEDULE_ITEMS: 'coug_scheduler_schedule',
  NEXT_TASK_ID: 'coug_scheduler_next_id',
  CHAT_HISTORY: 'coug_scheduler_chat',
} as const

// localStorage utility functions
export function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.warn(`Failed to save to localStorage: ${key}`, error)
  }
}

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.warn(`Failed to load from localStorage: ${key}`, error)
    return defaultValue
  }
}

export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.warn(`Failed to remove from localStorage: ${key}`, error)
  }
}

export function clearAllStorage(): void {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key)
    })
  } catch (error) {
    console.warn('Failed to clear localStorage', error)
  }
}
