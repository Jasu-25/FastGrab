import { Navigate, Route, Routes } from 'react-router-dom'
import LandingPage from './pages/LandingPage/LandingPage.jsx'
import RoleSelect from './pages/LandingPage/RoleSelect.jsx'
import CustomerLogin from './pages/Customer/CustomerLogin.jsx'
import CustomerSignup from './pages/Customer/CustomerSignup.jsx'
import CustomerLayout from './pages/Customer/layout/CustomerLayout.jsx'
import CheckoutLayout from './pages/Customer/layout/CheckoutLayout.jsx'
import Explore from './pages/Customer/Explore/Explore.jsx'
import Recommended from './pages/Customer/Recommended/Recommended.jsx'
import StoreDetails from './pages/Customer/Store/StoreDetails.jsx'
import Cart from './pages/Customer/Checkout/Cart.jsx'
import Pickup from './pages/Customer/Checkout/Pickup.jsx'
import Payment from './pages/Customer/Checkout/Payment.jsx'
import MyOrders from './pages/Customer/Orders/MyOrders.jsx'
import OrderDetails from './pages/Customer/Orders/OrderDetails.jsx'
import Settings from './pages/Customer/Settings/Settings.jsx'
import MerchantLogin from './pages/Merchant/MerchantLogin.jsx'
import MerchantSignup from './pages/Merchant/MerchantSignup.jsx'

function App() {
  return (
    <Routes>
      {/* Landing */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/get-started" element={<RoleSelect />} />

      {/* Customer auth */}
      <Route path="/customer/login" element={<CustomerLogin />} />
      <Route path="/customer/signup" element={<CustomerSignup />} />

      {/* Customer app (top nav + profile menu) */}
      <Route path="/customer" element={<CustomerLayout />}>
        <Route index element={<Navigate to="explore" replace />} />
        <Route path="explore" element={<Explore />} />
        <Route path="recommended" element={<Recommended />} />
        <Route path="store/:storeId" element={<StoreDetails />} />
        <Route path="orders" element={<MyOrders />} />
        <Route path="orders/:orderId" element={<OrderDetails />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Customer checkout (stepper header) */}
      <Route element={<CheckoutLayout />}>
        <Route path="/customer/cart" element={<Cart />} />
        <Route path="/customer/checkout/pickup" element={<Pickup />} />
        <Route path="/customer/checkout/payment" element={<Payment />} />
      </Route>

      {/* Merchant */}
      <Route path="/merchant/login" element={<MerchantLogin />} />
      <Route path="/merchant/signup" element={<MerchantSignup />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
