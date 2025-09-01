<template>
  <div class="error-boundary">
    <div class="error-content">
      <div class="error-animation">
        <div class="error-cloud">☁️</div>
        <div class="error-lightning">⚡</div>
      </div>
      <h3>Weather Service Disrupted</h3>
      <p>{{ message || 'Unable to fetch weather data. The service may be temporarily unavailable.' }}</p>
      <button v-if="showRetry" @click="$emit('retry')" class="retry-button">
        <span class="retry-icon">🔄</span>
        Try Again
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  message?: string
  showRetry?: boolean
}

withDefaults(defineProps<Props>(), {
  showRetry: true
})

defineEmits<{
  retry: []
}>()
</script>

<style scoped>
.error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 20px;
}

.error-content {
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  padding: 48px;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  max-width: 450px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.error-animation {
  position: relative;
  display: inline-block;
  margin-bottom: 24px;
}

.error-cloud {
  font-size: 4rem;
  animation: shake 2s ease-in-out infinite;
}

.error-lightning {
  position: absolute;
  font-size: 2rem;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: flash 1.5s ease-in-out infinite;
}

.error-content h3 {
  color: white;
  margin: 0 0 16px 0;
  font-size: 1.5rem;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.error-content p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 32px 0;
  line-height: 1.6;
  font-size: 1rem;
}

.retry-button {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 16px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 16px rgba(255, 107, 107, 0.3);
}

.retry-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
}

.retry-icon {
  animation: spin 2s linear infinite;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
  20%, 40%, 60%, 80% { transform: translateX(2px); }
}

@keyframes flash {
  0%, 50%, 100% { opacity: 1; }
  25%, 75% { opacity: 0.3; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>