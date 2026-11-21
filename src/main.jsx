import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import './assets/Styles/Common.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { LanguageProvider } from './assets/i18n/LanguageContext'
import { AuthProvider } from './assets/auth/AuthContext.jsx'
import './index.css'
import './assets/Styles/Common.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>
)