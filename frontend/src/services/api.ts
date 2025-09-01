import { serviceWorkerManager } from '../utils/serviceWorker'

const API_BASE_URL = 'http://localhost/api'

export interface User {
  id: number
  name: string
  email: string
  latitude: number
  longitude: number
  weather?: Weather
}

export interface Weather {
  temperature: number
  description: string
  humidity: number
  wind_speed: number
  icon: string
  fetched_at: string
}

export interface UserWithWeather extends User {
  weather?: Weather | null
}

class ApiService {
  private cache = new Map<string, { data: any; timestamp: number }>()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION
  }

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data as T
    }
    return null
  }

  private setCachedData<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  private async request<T>(endpoint: string, useCache = true): Promise<T> {
    const cacheKey = `api_${endpoint}`
    
    // Check cache first
    if (useCache) {
      const cachedData = this.getCachedData<T>(cacheKey)
      if (cachedData) {
        console.log(`Cache hit for ${endpoint}`)
        return cachedData
      }
    }

    try {
      console.log(`Fetching ${endpoint}`)
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // Cache the response
      if (useCache) {
        this.setCachedData(cacheKey, data)
      }

      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  async getUsers(useCache = true): Promise<{ users: UserWithWeather[] }> {
    return this.request<{ users: UserWithWeather[] }>('/users', useCache)
  }

  async getUser(id: number, useCache = true): Promise<{ user: User; weather: Weather | null }> {
    return this.request<{ user: User; weather: Weather | null }>(`/users/${id}`, useCache)
  }

  // Clear cache manually
  async clearCache(): Promise<void> {
    this.cache.clear()
    
    // Also clear service worker cache if available
    if (serviceWorkerManager.isRegistered) {
      await serviceWorkerManager.clearCache()
    }
    
    console.log('All caches cleared')
  }

  // Get cache status
  async getCacheInfo(): Promise<{ size: number; keys: string[]; serviceWorker?: any }> {
    const info = {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      serviceWorker: undefined as any
    }
    
    // Add service worker cache info if available
    if (serviceWorkerManager.isRegistered) {
      info.serviceWorker = await serviceWorkerManager.getCacheInfo()
    }
    
    return info
  }
}

export const apiService = new ApiService()