// Service Worker for Weather Dashboard
// Provides offline caching and improved performance

const CACHE_NAME = 'weather-dashboard-v1'
const STATIC_CACHE = 'static-v1'
const API_CACHE = 'api-v1'

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json'
]

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/users',
  '/api/users/'
]

// Install event - cache static files
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Service Worker: Caching static files')
        return cache.addAll(STATIC_FILES)
      })
      .then(() => {
        console.log('Service Worker: Static files cached')
        return self.skipWaiting()
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...')
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== API_CACHE) {
              console.log('Service Worker: Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('Service Worker: Activated')
        return self.clients.claim()
      })
  )
})

// Fetch event - handle requests with caching strategy
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)
  
  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request))
    return
  }
  
  // Handle static files
  if (request.method === 'GET') {
    event.respondWith(handleStaticRequest(request))
    return
  }
})

// API request handler - Cache First with Network Fallback
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE)
  const cachedResponse = await cache.match(request)
  
  // Return cached response if available and fresh
  if (cachedResponse) {
    const cacheDate = new Date(cachedResponse.headers.get('date'))
    const now = new Date()
    const cacheAge = (now - cacheDate) / 1000 / 60 // minutes
    
    // Use cached response if less than 5 minutes old
    if (cacheAge < 5) {
      console.log('Service Worker: Serving from cache:', request.url)
      return cachedResponse
    }
  }
  
  try {
    // Fetch from network
    console.log('Service Worker: Fetching from network:', request.url)
    const networkResponse = await fetch(request)
    
    // Cache successful responses
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone()
      cache.put(request, responseClone)
      console.log('Service Worker: Cached API response:', request.url)
    }
    
    return networkResponse
  } catch (error) {
    console.log('Service Worker: Network failed, serving stale cache:', request.url)
    
    // Return stale cache if network fails
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline response
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'No network connection available',
        cached: false
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Static request handler - Cache First
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE)
  const cachedResponse = await cache.match(request)
  
  if (cachedResponse) {
    console.log('Service Worker: Serving static from cache:', request.url)
    return cachedResponse
  }
  
  try {
    console.log('Service Worker: Fetching static from network:', request.url)
    const networkResponse = await fetch(request)
    
    // Cache successful responses
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone()
      cache.put(request, responseClone)
      console.log('Service Worker: Cached static file:', request.url)
    }
    
    return networkResponse
  } catch (error) {
    console.log('Service Worker: Failed to fetch static file:', request.url)
    
    // Return a basic offline page for navigation requests
    if (request.mode === 'navigate') {
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Weather Dashboard - Offline</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 50px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              min-height: 100vh;
              margin: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-direction: column;
            }
            .offline-container {
              background: rgba(255, 255, 255, 0.1);
              padding: 40px;
              border-radius: 20px;
              backdrop-filter: blur(10px);
            }
            h1 { margin: 0 0 20px 0; }
            .icon { font-size: 4rem; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="offline-container">
            <div class="icon">🌤️</div>
            <h1>Weather Dashboard</h1>
            <p>You're currently offline</p>
            <p>Please check your internet connection and try again.</p>
            <button onclick="location.reload()" style="
              background: #74b9ff; 
              color: white; 
              border: none; 
              padding: 12px 24px; 
              border-radius: 8px; 
              cursor: pointer;
              font-size: 16px;
              margin-top: 20px;
            ">Retry</button>
          </div>
        </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      })
    }
    
    throw error
  }
}

// Handle messages from the main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('Service Worker: Clearing all caches')
    
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      )
    }).then(() => {
      console.log('Service Worker: All caches cleared')
      event.ports[0].postMessage({ success: true })
    }).catch(error => {
      console.error('Service Worker: Error clearing caches:', error)
      event.ports[0].postMessage({ success: false, error: error.message })
    })
  }
  
  if (event.data && event.data.type === 'GET_CACHE_INFO') {
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => cache.keys()),
      caches.open(API_CACHE).then(cache => cache.keys())
    ]).then(([staticKeys, apiKeys]) => {
      event.ports[0].postMessage({
        staticCache: staticKeys.length,
        apiCache: apiKeys.length,
        total: staticKeys.length + apiKeys.length
      })
    })
  }
})