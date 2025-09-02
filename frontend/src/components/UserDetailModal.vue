<template>
  <Transition name="modal">
    <div v-if="isOpen" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <!-- Background Effects -->
        <div class="modal-background"></div>
        <div class="modal-glow"></div>
        
        <!-- Header -->
        <div class="modal-header">
          <div class="user-header">
            <div class="user-avatar-large">
              {{ user ? getInitials(user.name) : '?' }}
            </div>
            <div class="user-title">
              <h2>{{ user?.name || 'Loading...' }}</h2>
              <p class="user-subtitle">Weather Details</p>
            </div>
          </div>
          <div class="header-actions">
            <button class="refresh-button" @click="refreshUserWeather" :disabled="refreshing" title="Refresh Weather">
              <span class="refresh-icon" :class="{ spinning: refreshing }">🔄</span>
            </button>
            <button class="close-button" @click="closeModal">
              <span class="close-icon">✕</span>
            </button>
          </div>
        </div>
        
        <!-- Loading State -->
        <div v-if="loading" class="modal-loading">
          <div class="loading-animation">
            <div class="loading-weather-icon">🌤️</div>
            <div class="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          <h3>Fetching Weather Details</h3>
          <p>Getting the latest conditions...</p>
        </div>
        
        <!-- Content -->
        <div v-else-if="user" class="modal-body">
          <!-- User Information Card -->
          <div class="info-card">
            <h3 class="section-title">
              <span class="title-icon">👤</span>
              User Information
            </h3>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Email Address</div>
                <div class="info-value">{{ user.email }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Coordinates</div>
                <div class="info-value coordinates">
                  <span class="coord-part">{{ user.latitude.toFixed(6) }}</span>
                  <span class="coord-separator">,</span>
                  <span class="coord-part">{{ user.longitude.toFixed(6) }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Weather Information Card -->
          <div class="weather-card-detailed" :class="weatherTheme">
            <h3 class="section-title">
              <span class="title-icon">🌤️</span>
              Weather Report
            </h3>
            
            <div v-if="weather" class="weather-content-detailed">
              <!-- Main Weather Display -->
              <div class="weather-hero">
                <div class="weather-icon-section">
                  <img 
                    v-if="weather.icon" 
                    :src="`https://openweathermap.org/img/wn/${weather.icon}@4x.png`"
                    :alt="weather.description"
                    class="hero-weather-icon"
                  />
                  <div class="icon-backdrop"></div>
                </div>
                <div class="temperature-display">
                  <div class="main-temperature">{{ Math.round(weather.temperature) }}</div>
                  <div class="temperature-unit">°C</div>
                </div>
              </div>
              
              <!-- Weather Description -->
              <div class="weather-description">
                {{ weather.description }}
              </div>
              
              <!-- Weather Metrics Grid -->
              <div class="metrics-grid">
                <div class="metric-card">
                  <div class="metric-icon">💧</div>
                  <div class="metric-info">
                    <div class="metric-value">{{ weather.humidity }}%</div>
                    <div class="metric-label">Humidity</div>
                  </div>
                </div>
                
                <div class="metric-card">
                  <div class="metric-icon">💨</div>
                  <div class="metric-info">
                    <div class="metric-value">{{ weather.wind_speed }} m/s</div>
                    <div class="metric-label">Wind Speed</div>
                  </div>
                </div>
                
                <div class="metric-card">
                  <div class="metric-icon">🕒</div>
                  <div class="metric-info">
                    <div class="metric-value">{{ formatTime(weather.fetched_at) }}</div>
                    <div class="metric-label">Last Updated</div>
                  </div>
                </div>
                
                <div class="metric-card">
                  <div class="metric-icon">📍</div>
                  <div class="metric-info">
                    <div class="metric-value">Live</div>
                    <div class="metric-label">Status</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-else class="no-weather-detailed">
              <div class="no-weather-icon">🌫️</div>
              <h4>Weather Unavailable</h4>
              <p>Weather data is currently unavailable for this location.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { User, Weather } from '../services/api'
import { useUserStore } from '../stores/userStore'

interface Props {
  isOpen: boolean
  userId: number | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const userStore = useUserStore()
const loading = ref(false)
const refreshing = ref(false)

// Get user data from store
const user = computed(() => {
  if (!props.userId) return null
  return userStore.getUserById(props.userId)
})

const weather = computed(() => user.value?.weather || null)

// Only load if user is not in store (shouldn't happen with our setup)
watch(() => props.userId, async (newUserId) => {
  if (newUserId && props.isOpen && !user.value) {
    await loadUserDetails(newUserId)
  }
})

watch(() => props.isOpen, async (isOpen) => {
  if (isOpen && props.userId && !user.value) {
    await loadUserDetails(props.userId)
  }
})

async function loadUserDetails(userId: number) {
  loading.value = true
  try {
    await userStore.refreshUser(userId)
  } catch (error) {
    console.error('Failed to load user details:', error)
  } finally {
    loading.value = false
  }
}

async function refreshUserWeather() {
  if (!props.userId) return
  
  refreshing.value = true
  try {
    await userStore.refreshUser(props.userId)
  } catch (error) {
    console.error('Failed to refresh user weather:', error)
  } finally {
    refreshing.value = false
  }
}

function closeModal() {
  emit('close')
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString()
}

function formatTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase()
}

const weatherTheme = computed(() => {
  if (!weather.value) return 'theme-unavailable'
  
  const icon = weather.value.icon
  
  if (icon?.includes('01')) return 'theme-sunny'
  if (icon?.includes('02') || icon?.includes('03')) return 'theme-cloudy'
  if (icon?.includes('04')) return 'theme-overcast'
  if (icon?.includes('09') || icon?.includes('10')) return 'theme-rainy'
  if (icon?.includes('11')) return 'theme-stormy'
  if (icon?.includes('13')) return 'theme-snowy'
  if (icon?.includes('50')) return 'theme-misty'
  
  return 'theme-mild'
})
</script>

<style scoped>
/* Modal Transitions */
.modal-enter-active, .modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.8) translateY(20px);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  position: relative;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(30px);
  border-radius: 32px;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.modal-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    rgba(255, 255, 255, 0.05) 100%);
  border-radius: 32px;
}

.modal-glow {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(135deg, #667eea, #764ba2, #f093fb, #f5576c);
  border-radius: 32px;
  z-index: -1;
  opacity: 0.3;
  filter: blur(8px);
}

/* Header */
.modal-header {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32px 32px 0 32px;
  margin-bottom: 32px;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-avatar-large {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.8rem;
  color: white;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
}

.user-title h2 {
  margin: 0 0 4px 0;
  color: white;
  font-size: 2rem;
  font-weight: 800;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.user-subtitle {
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.refresh-button,
.close-button {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 48px;
  height: 48px;
  border-radius: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.refresh-button:hover,
.close-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.refresh-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.refresh-icon,
.close-icon {
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
}

.refresh-icon.spinning {
  animation: spin 1s linear infinite;
}

/* Loading State */
.modal-loading {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 32px;
  text-align: center;
}

.loading-animation {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.loading-weather-icon {
  font-size: 4rem;
  animation: bounce 2s infinite;
}

.loading-dots {
  display: flex;
  gap: 8px;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

.loading-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.loading-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

.modal-loading h3 {
  color: white;
  font-size: 1.5rem;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.modal-loading p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

/* Content */
.modal-body {
  position: relative;
  z-index: 2;
  padding: 0 32px 32px 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Info Card */
.info-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0 0 20px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.title-icon {
  font-size: 1.5rem;
}

.info-grid {
  display: grid;
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 1.1rem;
  color: white;
  font-weight: 600;
}

.coordinates {
  font-family: 'Courier New', monospace;
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 12px;
  border-radius: 8px;
  width: fit-content;
}

.coord-part {
  color: #74b9ff;
}

.coord-separator {
  color: rgba(255, 255, 255, 0.5);
  margin: 0 4px;
}

/* Weather Card */
.weather-card-detailed {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

/* Weather Themes for Modal */
.theme-sunny::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(240, 147, 251, 0.2) 0%, rgba(245, 87, 108, 0.2) 100%);
  border-radius: 20px;
}

.theme-cloudy::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.2) 0%, rgba(0, 242, 254, 0.2) 100%);
  border-radius: 20px;
}

.theme-rainy::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(116, 185, 255, 0.2) 0%, rgba(9, 132, 227, 0.2) 100%);
  border-radius: 20px;
}

.weather-content-detailed {
  position: relative;
  z-index: 2;
}

.weather-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.weather-icon-section {
  position: relative;
}

.hero-weather-icon {
  width: 120px;
  height: 120px;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.2));
  animation: float 4s ease-in-out infinite;
}

.icon-backdrop {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 140px;
  height: 140px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  animation: pulse 3s ease-in-out infinite;
}

.temperature-display {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.main-temperature {
  font-size: 5rem;
  font-weight: 900;
  color: white;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  line-height: 1;
}

.temperature-unit {
  font-size: 2rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 8px;
}

.weather-description {
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
  text-transform: capitalize;
  text-align: center;
  margin-bottom: 32px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
}

.metric-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-4px);
  background: rgba(255, 255, 255, 0.2);
}

.metric-icon {
  font-size: 2rem;
}

.metric-info {
  text-align: center;
}

.metric-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: white;
  margin-bottom: 4px;
}

.metric-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* No Weather State */
.no-weather-detailed {
  text-align: center;
  padding: 40px;
  position: relative;
  z-index: 2;
}

.no-weather-icon {
  font-size: 4rem;
  margin-bottom: 16px;
  opacity: 0.6;
}

.no-weather-detailed h4 {
  color: white;
  font-size: 1.3rem;
  margin: 0 0 8px 0;
}

.no-weather-detailed p {
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

/* Animations */
@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-content {
    margin: 10px;
    max-height: 95vh;
    border-radius: 24px;
  }
  
  .modal-header {
    padding: 24px 24px 0 24px;
  }
  
  .modal-body {
    padding: 0 24px 24px 24px;
  }
  
  .user-header {
    gap: 16px;
  }
  
  .user-avatar-large {
    width: 64px;
    height: 64px;
    font-size: 1.4rem;
  }
  
  .user-title h2 {
    font-size: 1.5rem;
  }
  
  .weather-hero {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .hero-weather-icon {
    width: 100px;
    height: 100px;
  }
  
  .main-temperature {
    font-size: 4rem;
  }
  
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>