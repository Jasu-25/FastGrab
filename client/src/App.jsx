import { Suspense, lazy, useLayoutEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
// Landing + auth pages load immediately (first thing visitors see).
import LandingPage from './pages/LandingPage/LandingPage.jsx'
import RoleSelect from './pages/LandingPage/RoleSelect.jsx'
import CustomerLogin from './pages/Customer/CustomerLogin.jsx'
import CustomerSignup from './pages/Customer/CustomerSignup.jsx'
import MerchantLogin from './pages/Merchant/MerchantLogin.jsx'
import MerchantSignup from './pages/Merchant/MerchantSignup.jsx'

// The customer app and the shop dashboard are split into separate chunks
// and only downloaded when someone opens them.
const CustomerLayout = lazy(() => import('./pages/Customer/layout/CustomerLayout.jsx'))
const CheckoutLayout = lazy(() => import('./pages/Customer/layout/CheckoutLayout.jsx'))
const Explore = lazy(() => import('./pages/Customer/Explore/Explore.jsx'))
const Recommended = lazy(() => import('./pages/Customer/Recommended/Recommended.jsx'))
const StoreDetails = lazy(() => import('./pages/Customer/Store/StoreDetails.jsx'))
const Cart = lazy(() => import('./pages/Customer/Checkout/Cart.jsx'))
const Pickup = lazy(() => import('./pages/Customer/Checkout/Pickup.jsx'))
const Payment = lazy(() => import('./pages/Customer/Checkout/Payment.jsx'))
const MyOrders = lazy(() => import('./pages/Customer/Orders/MyOrders.jsx'))
const OrderDetails = lazy(() => import('./pages/Customer/Orders/OrderDetails.jsx'))
const Settings = lazy(() => import('./pages/Customer/Settings/Settings.jsx'))

const MerchantLayout = lazy(() => import('./pages/Merchant/layout/MerchantLayout.jsx'))
const Dashboard = lazy(() => import('./pages/Merchant/Dashboard/Dashboard.jsx'))
const ActiveOrders = lazy(() => import('./pages/Merchant/Orders/ActiveOrders.jsx'))
const AllOrders = lazy(() => import('./pages/Merchant/Orders/AllOrders.jsx'))
const MerchantOrderDetails = lazy(() => import('./pages/Merchant/Orders/MerchantOrderDetails.jsx'))
const Inventory = lazy(() => import('./pages/Merchant/Inventory/Inventory.jsx'))
const AddItem = lazy(() => import('./pages/Merchant/Inventory/AddItem.jsx'))
const PickupSlots = lazy(() => import('./pages/Merchant/Slots/PickupSlots.jsx'))
const Offers = lazy(() => import('./pages/Merchant/Offers/Offers.jsx'))
const PromoteOffer = lazy(() => import('./pages/Merchant/Offers/PromoteOffer.jsx'))
const ShopSettings = lazy(() => import('./pages/Merchant/Settings/ShopSettings.jsx'))
const Payments = lazy(() => import('./pages/Merchant/Payments/Payments.jsx'))

// Admin console: reached only by typing /admin/login (not linked from Get Started).
const AdminLogin = lazy(() => import('./pages/Admin/AdminLogin.jsx'))
const AdminLayout = lazy(() => import('./pages/Admin/layout/AdminLayout.jsx'))
const AdminOverview = lazy(() => import('./pages/Admin/Overview.jsx'))
const AdminApprovals = lazy(() => import('./pages/Admin/Approvals.jsx'))
const AdminShops = lazy(() => import('./pages/Admin/Shops.jsx'))
const AdminShopDetail = lazy(() => import('./pages/Admin/ShopDetail.jsx'))
const AdminUsers = lazy(() => import('./pages/Admin/Users.jsx'))
const AdminUserDetail = lazy(() => import('./pages/Admin/UserDetail.jsx'))
const AdminTransactions = lazy(() => import('./pages/Admin/Transactions.jsx'))
const AdminManagement = lazy(() => import('./pages/Admin/AdminManagement.jsx'))

function PageLoader() {
  return (
    <div className="page-loader" role="status" aria-label="Loading">
      <span />
    </div>
  )
}

/** Every page opens at the top (React Router keeps the old scroll position otherwise). */
function ScrollToTop() {
  const { pathname } = useLocation()
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ScrollToTop />
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

        {/* Merchant auth */}
        <Route path="/merchant/login" element={<MerchantLogin />} />
        <Route path="/merchant/signup" element={<MerchantSignup />} />

        {/* Merchant dashboard (sidebar layout) */}
        <Route path="/merchant" element={<MerchantLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="active-orders" element={<ActiveOrders />} />
          <Route path="orders" element={<AllOrders />} />
          <Route path="orders/:orderId" element={<MerchantOrderDetails />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="inventory/new" element={<AddItem />} />
          <Route path="inventory/:itemId" element={<AddItem />} />
          <Route path="slots" element={<PickupSlots />} />
          <Route path="offers" element={<Offers />} />
          <Route path="offers/new" element={<PromoteOffer />} />
          <Route path="payments" element={<Payments />} />
          <Route path="settings" element={<ShopSettings />} />
        </Route>

        {/* Admin console (guarded: redirects to /admin/login when signed out) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<AdminOverview />} />
          <Route path="approvals" element={<AdminApprovals />} />
          <Route path="shops" element={<AdminShops />} />
          <Route path="shops/:shopId" element={<AdminShopDetail />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="users/:userId" element={<AdminUserDetail />} />
          <Route path="transactions" element={<AdminTransactions />} />
          <Route path="admins" element={<AdminManagement />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App
