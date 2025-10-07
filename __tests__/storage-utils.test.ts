import {
  saveToStorage,
  loadFromStorage,
  removeFromStorage,
  clearAllStorage,
  STORAGE_KEYS,
} from '../lib/storage-utils'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('Storage Utils', () => {
  beforeEach(() => {
    localStorageMock.clear()
    jest.clearAllMocks()
  })

  describe('saveToStorage', () => {
    it('should save data to localStorage', () => {
      const testData = { name: 'John', age: 30 }
      saveToStorage('test-key', testData)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'test-key',
        JSON.stringify(testData)
      )
    })

    it('should handle localStorage errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('localStorage error')
      })

      saveToStorage('test-key', { data: 'test' })

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to save to localStorage: test-key',
        expect.any(Error)
      )
      consoleSpy.mockRestore()
    })
  })

  describe('loadFromStorage', () => {
    it('should load data from localStorage', () => {
      const testData = { name: 'Jane', age: 25 }
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(testData))

      const result = loadFromStorage('test-key', {})

      expect(localStorageMock.getItem).toHaveBeenCalledWith('test-key')
      expect(result).toEqual(testData)
    })

    it('should return default value when key does not exist', () => {
      const defaultValue = { default: true }
      localStorageMock.getItem.mockReturnValueOnce(null)

      const result = loadFromStorage('non-existent-key', defaultValue)

      expect(result).toEqual(defaultValue)
    })

    it('should return default value when JSON parsing fails', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      const defaultValue = { default: true }
      localStorageMock.getItem.mockReturnValueOnce('invalid json')

      const result = loadFromStorage('test-key', defaultValue)

      expect(result).toEqual(defaultValue)
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('removeFromStorage', () => {
    it('should remove item from localStorage', () => {
      removeFromStorage('test-key')

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('test-key')
    })

    it('should handle removal errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      localStorageMock.removeItem.mockImplementationOnce(() => {
        throw new Error('Remove error')
      })

      removeFromStorage('test-key')

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('clearAllStorage', () => {
    it('should clear all app-specific storage keys', () => {
      clearAllStorage()

      Object.values(STORAGE_KEYS).forEach((key) => {
        expect(localStorageMock.removeItem).toHaveBeenCalledWith(key)
      })
    })

    it('should handle clear errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('Clear error')
      })

      clearAllStorage()

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('STORAGE_KEYS', () => {
    it('should have all required storage keys', () => {
      expect(STORAGE_KEYS.USER_PREFERENCES).toBe('coug_scheduler_preferences')
      expect(STORAGE_KEYS.SURVEY_COMPLETED).toBe('coug_scheduler_onboarded')
      expect(STORAGE_KEYS.SCHEDULE_ITEMS).toBe('coug_scheduler_schedule')
      expect(STORAGE_KEYS.NEXT_TASK_ID).toBe('coug_scheduler_next_id')
      expect(STORAGE_KEYS.CHAT_HISTORY).toBe('coug_scheduler_chat')
    })
  })
})
