<template>
  <div class="weather-card" :class="weatherTheme">
    <div v-if="weather" class="weather-content">
      <div class="weather-header">
        <div class="weather-icon-container">
          <img 
            v-if="weather.icon" 
            :src="`https://openweathermap.org/img/wn/${weather.icon}@2x.png`"
            :alt="weather.description"
            class="weather-icon"
          />
          <div class="icon-glow"></div>
        </div>
        <div class="temperature-section">
          <div class="temperature">{{ Math.round(weather.temperature) }}°</div>
          <div class="temperature-unit">C</div>
        </div>
      </div>
      
      <div class="weather-info">
        <div class="description">{{ weather.description }}</div>
        
        <div class="weather-metrics">
          <div class="metric">
            <div class="metric-icon">💧</div>
            <div class="metric-value">{{ weather.humidity }}%</div>
            <div class="metric-label">Humidity</div>
          </div>
          
          <div class="metric">
            <div class="metric-icon">💨</div>
            <div class="metric-value">{{ weather.wind_speed }}</div>
            <div class="metric-label">Wind m/s</div>
          </div>
        </div>
        
        <div class="last-updated">
          <span class="update-icon">🕒</span>
          {{ formatTime(weather.fetched_at) }}
        </div>
      </div>
    </div>
    
    <div v-else class="weather-unavailable">
      <div class="unavailable-icon">🌫️</div>
      <div class="unavailable-text">Weather data unavailable</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Weather } from '../services/api'

interface Props {
  weather: Weather | null
}

const props = defineProps<Props>()

function formatTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const weatherTheme = computed(() => {
  if (!props.weather) return 'theme-unavailable'
  
  const temp = props.weather.temperature
  const icon = props.weather.icon
  
  if (icon?.includes('01')) return 'theme-sunny'
  if (icon?.includes('02') || icon?.includes('03')) return 'theme-cloudy'
  if (icon?.includes('04')) return 'theme-overcast'
  if (icon?.includes('09') || icon?.includes('10')) return 'theme-rainy'
  if (icon?.includes('11')) return 'theme-stormy'
  if (icon?.includes('13')) return 'theme-snowy'
  if (icon?.includes('50')) return 'theme-misty'
  
  if (temp > 25) return 'theme-hot'
  if (temp < 0) return 'theme-cold'
  
  return 'theme-mild'
})
</script>

<style scoped>
.weather-card {
  border-radius: 20px;
  padding: 20px;
  color: white;
  min-height: 140px;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.weather-card:hover {
  transform: scale(1.02);
}

/* Weather Themes */
.theme-sunny {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  box-shadow: 0 8px 32px rgba(240, 147, 251, 0.3);
}

.theme-cloudy {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  box-shadow: 0 8px 32px rgba(79, 172, 254, 0.3);
}

.theme-overcast {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
}

.theme-rainy {
  background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
  box-shadow: 0 8px 32px rgba(116, 185, 255, 0.3);
}

.theme-stormy {
  background: linear-gradient(135deg, #2d3436 0%, #636e72 100%);
  box-shadow: 0 8px 32px rgba(45, 52, 54, 0.3);
}

.theme-snowy {
  background: linear-gradient(135deg, #ddd6fe 0%, #a78bfa 100%);
  box-shadow: 0 8px 32px rgba(167, 139, 250, 0.3);
}

.theme-misty {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  box-shadow: 0 8px 32px rgba(252, 182, 159, 0.3);
}

.theme-hot {
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
  box-shadow: 0 8px 32px rgba(255, 154, 158, 0.3);
}

.theme-cold {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  box-shadow: 0 8px 32px rgba(168, 237, 234, 0.3);
}

.theme-mild {
  background: linear-gradient(135deg, #d299c2 0%, #fef9d7 100%);
  box-shadow: 0 8px 32px rgba(210, 153, 194, 0.3);
}

.theme-unavailable {
  background: linear-gradient(135deg, #636e72 0%, #2d3436 100%);
  box-shadow: 0 8px 32px rgba(99, 110, 114, 0.3);
}

.weather-content {
  position: relative;
  z-index: 2;
}

.weather-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.weather-icon-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.weather-icon {
  width: 64px;
  height: 64px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
  animation: float 3s ease-in-out infinite;
}

.icon-glow {
  position: absolute;
  width: 80px;
  height: 80px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

.temperature-section {
  display: flex;
  align-items: flex-start;
  gap: 4px;
}

.temperature {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.temperature-unit {
  font-size: 1.2rem;
  font-weight: 600;
  margin-top: 4px;
  opacity: 0.8;
}

.weather-info {
  position: relative;
  z-index: 2;
}

.description {
  font-size: 1.1rem;
  font-weight: 600;
  text-transform: capitalize;
  margin-bottom: 16px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.weather-metrics {
  display: flex;
  gap: 20px;
  margin-bottom: 12px;
}

.metric {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.15);
  padding: 8px 12px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  flex: 1;
}

.metric-icon {
  font-size: 1.2rem;
}

.metric-value {
  font-size: 0.9rem;
  font-weight: 700;
}

.metric-label {
  font-size: 0.7rem;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.last-updated {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  opacity: 0.8;
  background: rgba(255, 255, 255, 0.1);
  padding: 6px 10px;
  border-radius: 8px;
  width: fit-content;
}

.update-icon {
  font-size: 0.7rem;
}

.weather-unavailable {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 100%;
  text-align: center;
}

.unavailable-icon {
  font-size: 2.5rem;
  opacity: 0.6;
}

.unavailable-text {
  font-size: 0.9rem;
  opacity: 0.8;
  font-weight: 500;
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .weather-card {
    padding: 16px;
    min-height: 120px;
  }
  
  .weather-icon {
    width: 56px;
    height: 56px;
  }
  
  .temperature {
    font-size: 2.5rem;
  }
  
  .weather-metrics {
    gap: 12px;
  }
  
  .metric {
    padding: 6px 8px;
  }
}
</style>