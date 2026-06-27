import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const appRunKey = Date.now()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App key={appRunKey} />
  </StrictMode>,
)
