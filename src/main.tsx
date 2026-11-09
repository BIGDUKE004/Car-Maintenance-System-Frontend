import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Restore the deep link when a static host served 404.html instead of index.html
try {
  const saved = sessionStorage.getItem('motora.redirect')
  if (saved && location.pathname === '/') { sessionStorage.removeItem('motora.redirect'); history.replaceState(null, '', saved) }
} catch {}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
