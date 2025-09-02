<template>
  <div class="cache-status" :class="{ 'cache-fresh': isFresh, 'cache-stale': !isFresh }">
    <span class="cache-icon">{{ isFresh ? '🟢' : '🟡' }}</span>
    <span class="cache-text">{{ statusText }}</span>
    <button v-if="showRefresh" @click="$emit('refresh')" class="refresh-btn" title="Refresh data">
      🔄
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  lastUpdated?: string
  cacheMinutes?: number
  showRefresh?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  cacheMinutes: 5,
  showRefresh: true
})

defineEmits<{
  refresh: []
}>()

const isFresh = computed(() => {
  if (!props.lastUpdated) return false
  const lastUpdate = new Date(props.lastUpdated)
  const now = new Date()
  const diffMinutes = (now.getTime() - lastUpdate.getTime()) / (1000 * 60)
  return diffMinutes < props.cacheMinutes
})

const statusText = computed(() => {
  if (!props.lastUpdated) return 'No data'
  
  const lastUpdate = new Date(props.lastUpdated)
  const now = new Date()
  const diffMinutes = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60))
  
  if (diffMinutes < 1) return 'Just updated'
  if (diffMinutes === 1) return '1 min ago'
  if (diffMinutes < 60) return `${diffMinutes} mins ago`
  
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours === 1) return '1 hour ago'
  return `${diffHours} hours ago`
})
</script>

<style scoped>
.cache-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.cache-fresh {
  background: rgba(46, 204, 113, 0.1);
  color: #27ae60;
  border: 1px solid rgba(46, 204, 113, 0.2);
}

.cache-stale {
  background: rgba(243, 156, 18, 0.1);
  color: #f39c12;
  border: 1px solid rgba(243, 156, 18, 0.2);
}

.cache-icon {
  font-size: 0.6rem;
}

.cache-text {
  white-space: nowrap;
}

.refresh-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  font-size: 0.7rem;
  opacity: 0.7;
  transition: all 0.2s ease;
}

.refresh-btn:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.1);
}
</style>