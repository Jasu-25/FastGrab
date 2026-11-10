import { Navigate, Route, Routes } from 'react-router-dom'
import LandingPage from './pages/LandingPage/LandingPage.jsx'
import RoleSelect from './pages/LandingPage/RoleSelect.jsx'
import CustomerLogin from './pages/Customer/CustomerLogin.jsx'
import CustomerSignup from './pages/Customer/CustomerSignup.jsx'
import MerchantLogin from './pages/Merchant/MerchantLogin.jsx'
import MerchantSignup from './pages/Merchant/MerchantSignup.jsx'

function App() {
  return (
    <Routes>
      {/* Landing */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/get-started" element={<RoleSelect />} />

      {/* Customer */}
      <Route path="/customer/login" element={<CustomerLogin />} />
      <Route path="/customer/signup" element={<CustomerSignup />} />

      {/* Merchant */}
      <Route path="/merchant/login" element={<MerchantLogin />} />
      <Route path="/merchant/signup" element={<MerchantSignup />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
