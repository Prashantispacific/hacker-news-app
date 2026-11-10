import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App'
import { registerSW } from 'virtual:pwa-register'

// Auto-register service worker for offline PWA capabilities
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('New content available, auto-updating.')
  },
  onOfflineReady() {
    console.log('App ready to work offline.')
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
