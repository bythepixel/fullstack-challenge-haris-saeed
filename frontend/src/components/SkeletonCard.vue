<template>
  <div class="skeleton-card">
    <div class="skeleton-content">
      <div class="skeleton-header">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-info">
          <div class="skeleton-line skeleton-name"></div>
          <div class="skeleton-line skeleton-email"></div>
          <div class="skeleton-line skeleton-location"></div>
        </div>
        <div class="skeleton-status"></div>
      </div>
      <div class="skeleton-weather">
        <div class="skeleton-weather-header">
          <div class="skeleton-icon"></div>
          <div class="skeleton-temp"></div>
        </div>
        <div class="skeleton-weather-info">
          <div class="skeleton-line skeleton-description"></div>
          <div class="skeleton-metrics">
            <div class="skeleton-metric"></div>
            <div class="skeleton-metric"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-card {
  position: relative;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.skeleton-content {
  padding: 24px;
}

.skeleton-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
}

.skeleton-avatar {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.1) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-line {
  height: 16px;
  border-radius: 8px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.1) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-name {
  width: 70%;
  height: 20px;
}

.skeleton-email {
  width: 85%;
}

.skeleton-location {
  width: 60%;
  height: 14px;
}

.skeleton-status {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.1) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-weather {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 20px;
}

.skeleton-weather-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.skeleton-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.1) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-temp {
  width: 80px;
  height: 48px;
  border-radius: 8px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.1) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-weather-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-description {
  width: 60%;
}

.skeleton-metrics {
  display: flex;
  gap: 20px;
}

.skeleton-metric {
  flex: 1;
  height: 60px;
  border-radius: 12px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.1) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .skeleton-content {
    padding: 20px;
  }
  
  .skeleton-header {
    gap: 12px;
  }
  
  .skeleton-avatar {
    width: 48px;
    height: 48px;
  }
  
  .skeleton-weather {
    padding: 16px;
  }
  
  .skeleton-metrics {
    gap: 12px;
  }
}
</style>