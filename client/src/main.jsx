import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './App.css'
import App from './App.jsx'
import CustomerProvider from './context/CustomerProvider.jsx'
import MerchantProvider from './context/MerchantProvider.jsx'
import PlatformProvider from './context/PlatformProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* basename keeps routes working when the app lives under /FastGrab/ on GitHub Pages */}
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <PlatformProvider>
        <CustomerProvider>
          <MerchantProvider>
            <App />
          </MerchantProvider>
        </CustomerProvider>
      </PlatformProvider>
    </BrowserRouter>
  </StrictMode>,
)
