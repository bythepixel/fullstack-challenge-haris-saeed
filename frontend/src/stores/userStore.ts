import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { UserWithWeather, User, Weather } from '../services/api'
import { apiService } from '../services/api'

export const useUserStore = defineStore('users', () => {
  // State
  const users = ref<UserWithWeather[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastFetch = ref<Date | null>(null)

  // Getters
  const getUserById = computed(() => {
    return (id: number): UserWithWeather | undefined => {
      return users.value.find(user => user.id === id)
    }
  })

  const usersWithWeather = computed(() => {
    return users.value.filter(user => user.weather !== null)
  })

  const totalUsers = computed(() => users.value.length)

  // Actions
  async function fetchUsers(forceRefresh = false) {
    // If we have recent data and not forcing refresh, return early
    if (!forceRefresh && users.value.length > 0 && lastFetch.value) {
      const timeSinceLastFetch = Date.now() - lastFetch.value.getTime()
      if (timeSinceLastFetch < 2 * 60 * 1000) { // 2 minutes
        console.log('Using cached user data')
        return
      }
    }

    loading.value = true
    error.value = null

    try {
      const response = await apiService.getUsers(!forceRefresh)
      users.value = response.users
      lastFetch.value = new Date()
      console.log(`Loaded ${users.value.length} users`)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch users'
      console.error('Error fetching users:', err)
    } finally {
      loading.value = false
    }
  }

  async function refreshUser(userId: number) {
    try {
      const response = await apiService.getUser(userId, false) // Force fresh data
      const userIndex = users.value.findIndex(u => u.id === userId)
      
      if (userIndex !== -1) {
        // Update the user in the store
        users.value[userIndex] = {
          ...response.user,
          weather: response.weather
        }
        console.log(`Refreshed user ${userId}`)
      }
    } catch (err) {
      console.error(`Error refreshing user ${userId}:`, err)
      throw err
    }
  }

  function clearCache() {
    apiService.clearCache()
    users.value = []
    lastFetch.value = null
    error.value = null
    console.log('User store cache cleared')
  }

  return {
    // State
    users,
    loading,
    error,
    lastFetch,
    
    // Getters
    getUserById,
    usersWithWeather,
    totalUsers,
    
    // Actions
    fetchUsers,
    refreshUser,
    clearCache
  }
})