<template>
  <div class="user-card" @click="$emit('click')">
    <div class="card-background"></div>
    <div class="card-content">
      <div class="user-info">
        <div class="user-avatar">
          {{ getInitials(user.name) }}
        </div>
        <div class="user-details">
          <h3 class="user-name">{{ user.name }}</h3>
          <p class="user-email">{{ user.email }}</p>
          <div class="user-location">
            <span class="location-icon">📍</span>
            <span class="coordinates">
              {{ user.latitude.toFixed(4) }}, {{ user.longitude.toFixed(4) }}
            </span>
          </div>
        </div>
        <div class="status-indicator" :class="{ active: user.weather }">
          <div class="status-dot"></div>
        </div>
      </div>
      <div class="weather-section">
        <WeatherCard :weather="user.weather" />
      </div>
    </div>
    <div class="card-shine"></div>
  </div>
</template>

<script setup lang="ts">
import type { UserWithWeather } from '../services/api'
import WeatherCard from './WeatherCard.vue'

interface Props {
  user: UserWithWeather
}

defineProps<Props>()
defineEmits<{
  click: []
}>()

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase()
}
</script>

<style scoped>
.user-card {
  position: relative;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.user-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.user-card:hover .card-shine {
  opacity: 1;
  transform: translateX(100%);
}

.card-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    rgba(255, 255, 255, 0.05) 100%);
  z-index: 0;
}

.card-content {
  position: relative;
  z-index: 1;
  padding: 24px;
}

.card-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(255, 255, 255, 0.2) 50%, 
    transparent 100%);
  opacity: 0;
  transition: all 0.6s ease;
  z-index: 2;
  pointer-events: none;
}

.user-info {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
}

.user-avatar {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  color: white;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
  flex-shrink: 0;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  margin: 0 0 6px 0;
  color: white;
  font-size: 1.3rem;
  font-weight: 700;
  line-height: 1.2;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-email {
  margin: 0 0 8px 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  font-weight: 500;
}

.user-location {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
  font-family: 'Courier New', monospace;
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 8px;
  border-radius: 8px;
  width: fit-content;
}

.location-icon {
  font-size: 0.8rem;
}

.coordinates {
  font-weight: 500;
}

.status-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 12px;
  height: 12px;
  flex-shrink: 0;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e74c3c;
  transition: all 0.3s ease;
}

.status-indicator.active .status-dot {
  background: #2ecc71;
  box-shadow: 0 0 12px rgba(46, 204, 113, 0.5);
  animation: pulse-green 2s infinite;
}

@keyframes pulse-green {
  0%, 100% { 
    transform: scale(1); 
    opacity: 1; 
  }
  50% { 
    transform: scale(1.2); 
    opacity: 0.8; 
  }
}

.weather-section {
  margin-top: 20px;
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .card-content {
    padding: 20px;
  }
  
  .user-info {
    gap: 12px;
  }
  
  .user-avatar {
    width: 48px;
    height: 48px;
    font-size: 1rem;
  }
  
  .user-name {
    font-size: 1.1rem;
  }
  
  .user-email {
    font-size: 0.85rem;
  }
}
</style>