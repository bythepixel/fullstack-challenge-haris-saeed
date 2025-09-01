<template>
  <div class="loading-spinner" :class="{ small: size === 'small' }">
    <div class="spinner-container">
      <div class="weather-spinner">
        <div class="sun"></div>
        <div class="cloud cloud-1"></div>
        <div class="cloud cloud-2"></div>
      </div>
    </div>
    <p v-if="message" class="message">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  message?: string
  size?: 'normal' | 'small'
}

withDefaults(defineProps<Props>(), {
  size: 'normal'
})
</script>

<style scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.loading-spinner.small {
  padding: 20px 10px;
}

.spinner-container {
  position: relative;
  width: 80px;
  height: 80px;
}

.loading-spinner.small .spinner-container {
  width: 60px;
  height: 60px;
}

.weather-spinner {
  position: relative;
  width: 100%;
  height: 100%;
  animation: float 3s ease-in-out infinite;
}

.sun {
  position: absolute;
  width: 30px;
  height: 30px;
  background: radial-gradient(circle, #ffd700 0%, #ffed4e 100%);
  border-radius: 50%;
  top: 10px;
  right: 10px;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
  animation: rotate 4s linear infinite;
}

.loading-spinner.small .sun {
  width: 24px;
  height: 24px;
  top: 8px;
  right: 8px;
}

.cloud {
  position: absolute;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  animation: drift 6s ease-in-out infinite;
}

.cloud::before,
.cloud::after {
  content: '';
  position: absolute;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
}

.cloud-1 {
  width: 40px;
  height: 16px;
  bottom: 20px;
  left: 5px;
  animation-delay: 0s;
}

.cloud-1::before {
  width: 20px;
  height: 20px;
  top: -10px;
  left: 5px;
}

.cloud-1::after {
  width: 16px;
  height: 16px;
  top: -8px;
  right: 5px;
}

.cloud-2 {
  width: 30px;
  height: 12px;
  bottom: 15px;
  right: 8px;
  animation-delay: -2s;
}

.cloud-2::before {
  width: 16px;
  height: 16px;
  top: -8px;
  left: 3px;
}

.cloud-2::after {
  width: 12px;
  height: 12px;
  top: -6px;
  right: 3px;
}

.loading-spinner.small .cloud-1 {
  width: 32px;
  height: 12px;
  bottom: 16px;
  left: 4px;
}

.loading-spinner.small .cloud-1::before {
  width: 16px;
  height: 16px;
  top: -8px;
  left: 4px;
}

.loading-spinner.small .cloud-1::after {
  width: 12px;
  height: 12px;
  top: -6px;
  right: 4px;
}

.loading-spinner.small .cloud-2 {
  width: 24px;
  height: 10px;
  bottom: 12px;
  right: 6px;
}

.loading-spinner.small .cloud-2::before {
  width: 12px;
  height: 12px;
  top: -6px;
  left: 2px;
}

.loading-spinner.small .cloud-2::after {
  width: 10px;
  height: 10px;
  top: -5px;
  right: 2px;
}

.message {
  margin-top: 24px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  font-weight: 500;
  text-align: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.loading-spinner.small .message {
  margin-top: 16px;
  font-size: 0.9rem;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes drift {
  0%, 100% { transform: translateX(0px); }
  33% { transform: translateX(4px); }
  66% { transform: translateX(-4px); }
}
</style>