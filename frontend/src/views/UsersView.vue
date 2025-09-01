<template>
  <div class="users-view">
    <!-- Animated Background -->
    <div class="background-animation">
      <div class="cloud cloud-1"></div>
      <div class="cloud cloud-2"></div>
      <div class="cloud cloud-3"></div>
      <div class="sun"></div>
    </div>

    <!-- Header with Glass Effect -->
    <header class="page-header">
      <div class="header-content">
        <div class="header-icon">🌤️</div>
        <div class="header-text">
          <h1>Weather Dashboard</h1>
          <p>Real-time weather conditions for {{ users.length }} locations worldwide</p>
        </div>
        <div class="header-actions">
          <CacheStatus 
            :last-updated="userStore.lastUpdated"
            :cache-minutes="5"
            @refresh="refreshData"
          />
          <div class="stats-badge">
            <span class="stats-number">{{ userStore.usersWithWeather.length }}</span>
            <span class="stats-label">Active</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Loading State with Beautiful Animation -->
    <div v-if="loading" class="loading-container">
      <div class="loading-card">
        <div class="weather-loading-animation">
          <div class="loading-sun"></div>
          <div class="loading-cloud"></div>
        </div>
        <h3>Fetching Weather Data</h3>
        <p>Gathering conditions from around the globe...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-card">
        <div class="error-icon">⚠️</div>
        <h3>Weather Service Unavailable</h3>
        <p>{{ error }}</p>
        <button @click="refreshData" class="retry-button" :disabled="refreshing">
          <span class="button-icon">🔄</span>
          {{ refreshing ? 'Refreshing...' : 'Try Again' }}
        </button>
      </div>
    </div>

    <!-- Users Grid with Staggered Animation -->
    <div v-else class="users-container">
      <div class="users-grid">
        <!-- Show skeleton cards while loading -->
        <template v-if="loading">
          <SkeletonCard 
            v-for="n in 8" 
            :key="`skeleton-${n}`"
            :style="{ animationDelay: `${(n - 1) * 0.1}s` }"
            class="user-card-animated"
          />
        </template>
        
        <!-- Show actual user cards when loaded -->
        <template v-else>
          <UserCard 
            v-for="(user, index) in users" 
            :key="user.id" 
            :user="user"
            :style="{ animationDelay: `${index * 0.1}s` }"
            class="user-card-animated"
            @click="openUserDetail(user.id)"
          />
        </template>
      </div>
    </div>

    <!-- Enhanced Modal -->
    <UserDetailModal 
      :is-open="isModalOpen"
      :user-id="selectedUserId"
      @close="closeModal"
    />

    <!-- Floating Action Button -->
    <button class="fab" @click="refreshData" :class="{ spinning: refreshing }" title="Refresh Weather Data">
      <span class="fab-icon">🔄</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '../stores/userStore'
import UserCard from '../components/UserCard.vue'
import UserDetailModal from '../components/UserDetailModal.vue'
import SkeletonCard from '../components/SkeletonCard.vue'
import CacheStatus from '../components/CacheStatus.vue'

const userStore = useUserStore()
const isModalOpen = ref(false)
const selectedUserId = ref<number | null>(null)
const refreshing = ref(false)

// Use store state
const users = computed(() => userStore.users)
const loading = computed(() => userStore.loading)
const error = computed(() => userStore.error)

onMounted(() => {
  loadUsers()
})

async function loadUsers(forceRefresh = false) {
  await userStore.fetchUsers(forceRefresh)
}

async function refreshData() {
  refreshing.value = true
  try {
    await loadUsers(true) // Force refresh
  } finally {
    refreshing.value = false
  }
}

function openUserDetail(userId: number) {
  selectedUserId.value = userId
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  selectedUserId.value = null
}
</script>

<style scoped>
.users-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow-x: hidden;
}

/* Animated Background */
.background-animation {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.cloud {
  position: absolute;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50px;
  opacity: 0.6;
  animation: float 20s infinite ease-in-out;
}

.cloud-1 {
  width: 100px;
  height: 40px;
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.cloud-2 {
  width: 80px;
  height: 30px;
  top: 40%;
  right: 15%;
  animation-delay: -7s;
}

.cloud-3 {
  width: 120px;
  height: 50px;
  top: 60%;
  left: 70%;
  animation-delay: -14s;
}

.sun {
  position: absolute;
  width: 60px;
  height: 60px;
  background: radial-gradient(circle, #ffd700 0%, #ffed4e 100%);
  border-radius: 50%;
  top: 10%;
  right: 10%;
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
  animation: rotate 30s linear infinite;
}

@keyframes float {
  0%, 100% { transform: translateX(0px) translateY(0px); }
  33% { transform: translateX(30px) translateY(-10px); }
  66% { transform: translateX(-20px) translateY(10px); }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Enhanced Header */
.page-header {
  position: relative;
  z-index: 1;
  padding: 40px 20px;
  margin-bottom: 40px;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 32px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  gap: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.header-icon {
  font-size: 4rem;
  animation: bounce 2s infinite;
}

.header-text {
  flex: 1;
}

.header-text h1 {
  font-size: 3rem;
  margin: 0 0 8px 0;
  font-weight: 800;
  background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-text p {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

.header-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-end;
}

.stats-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 16px 24px;
  border-radius: 16px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.stats-number {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: white;
}

.stats-label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  text-transform: uppercase;
  letter-spacing: 1px;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}

/* Enhanced Loading */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  position: relative;
  z-index: 1;
}

.loading-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 48px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.weather-loading-animation {
  position: relative;
  width: 100px;
  height: 60px;
  margin: 0 auto 24px;
}

.loading-sun {
  position: absolute;
  width: 40px;
  height: 40px;
  background: #ffd700;
  border-radius: 50%;
  top: 0;
  left: 30px;
  animation: pulse 2s infinite;
}

.loading-cloud {
  position: absolute;
  width: 60px;
  height: 25px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 25px;
  bottom: 0;
  left: 20px;
  animation: float 3s infinite ease-in-out;
}

.loading-card h3 {
  color: white;
  font-size: 1.5rem;
  margin: 0 0 12px 0;
  font-weight: 600;
}

.loading-card p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

/* Enhanced Error State */
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  position: relative;
  z-index: 1;
}

.error-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 48px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  max-width: 400px;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 16px;
  display: block;
}

.error-card h3 {
  color: white;
  margin: 0 0 16px 0;
  font-size: 1.5rem;
}

.error-card p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 24px 0;
}

.retry-button {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 auto;
}

.retry-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);
}

.button-icon {
  animation: spin 2s linear infinite;
}

/* Users Container */
.users-container {
  position: relative;
  z-index: 1;
  padding: 0 20px 40px;
}

.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 32px;
  max-width: 1400px;
  margin: 0 auto;
}

.user-card-animated {
  opacity: 0;
  transform: translateY(30px);
  animation: slideInUp 0.6s ease forwards;
}

@keyframes slideInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Floating Action Button */
.fab {
  position: fixed;
  bottom: 32px;
  right: 32px;
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 8px 25px rgba(116, 185, 255, 0.3);
  z-index: 1000;
  transition: all 0.3s ease;
}

.fab:hover {
  transform: translateY(-4px) scale(1.1);
  box-shadow: 0 12px 35px rgba(116, 185, 255, 0.4);
}

.fab-icon {
  font-size: 1.5rem;
  color: white;
  transition: transform 0.3s ease;
}

.fab.spinning .fab-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .users-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .header-text h1 {
    font-size: 2.2rem;
  }
  
  .users-view {
    padding: 0;
  }
  
  .users-container {
    padding: 0 16px 40px;
  }
  
  .fab {
    bottom: 20px;
    right: 20px;
    width: 56px;
    height: 56px;
  }
}
</style>