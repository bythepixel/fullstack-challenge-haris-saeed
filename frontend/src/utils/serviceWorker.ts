// Service Worker Registration and Management

export interface CacheInfo {
  staticCache: number
  apiCache: number
  total: number
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null
  private isSupported = 'serviceWorker' in navigator

  async register(): Promise<boolean> {
    if (!this.isSupported) {
      console.log('Service Worker not supported')
      return false
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      console.log('Service Worker registered successfully:', this.registration.scope)

      // Handle updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration?.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('New Service Worker available')
              this.notifyUpdate()
            }
          })
        }
      })

      return true
    } catch (error) {
      console.error('Service Worker registration failed:', error)
      return false
    }
  }

  async clearCache(): Promise<boolean> {
    if (!this.registration || !this.registration.active) {
      return false
    }

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel()
      
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.success)
      }

      this.registration!.active!.postMessage(
        { type: 'CLEAR_CACHE' },
        [messageChannel.port2]
      )
    })
  }

  async getCacheInfo(): Promise<CacheInfo | null> {
    if (!this.registration || !this.registration.active) {
      return null
    }

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel()
      
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data)
      }

      this.registration!.active!.postMessage(
        { type: 'GET_CACHE_INFO' },
        [messageChannel.port2]
      )
    })
  }

  private notifyUpdate() {
    // You can implement a notification system here
    // For now, just log to console
    console.log('A new version of the app is available. Refresh to update.')
    
    // Optionally show a toast notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Weather Dashboard Update', {
        body: 'A new version is available. Refresh to update.',
        icon: '/favicon.ico'
      })
    }
  }

  async update(): Promise<void> {
    if (this.registration) {
      await this.registration.update()
    }
  }

  get isRegistered(): boolean {
    return this.registration !== null
  }

  get isControlled(): boolean {
    return navigator.serviceWorker.controller !== null
  }
}

// Export singleton instance
export const serviceWorkerManager = new ServiceWorkerManager()

// Auto-register on import in production
if (import.meta.env.PROD) {
  serviceWorkerManager.register().then(success => {
    if (success) {
      console.log('✅ Service Worker enabled for offline support')
    }
  })
}