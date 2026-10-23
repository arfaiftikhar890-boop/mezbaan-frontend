import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './motion.css'
import './polish.css'
import App from './App.jsx'

// "motion" turns on the scroll-reveal styles; "has-splash" delays the hero until the intro curtain has lifted.
const root = document.documentElement
root.classList.add('motion')
try {
  if (!sessionStorage.getItem('splash-seen') && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) root.classList.add('has-splash')
} catch {
  /* storage blocked: no intro */
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
