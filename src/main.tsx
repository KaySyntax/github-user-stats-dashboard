import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { TokenProvider } from './context/TokenContext'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TokenProvider>
      <App />
    </TokenProvider>
  </StrictMode>,
)
