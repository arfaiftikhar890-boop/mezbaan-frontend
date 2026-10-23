import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useRevealOnScroll } from './hooks/useReveal'
import { SettingsProvider } from './context/SettingsContext'
import { CartProvider } from './context/CartContext'

import { AuthProvider, useAuth } from './context/AuthContext'
import Header from './components/Header'
import Footer from './components/Footer'
import OrderTypeModal from './components/OrderTypeModal'
import ContactDock from './components/ContactDock'
import Splash from './components/Splash'
import Home from './pages/Home'
import Menu from './pages/Menu'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import AdminLayout from './pages/admin/AdminLayout'
import Orders from './pages/admin/Orders'
import POS from './pages/admin/POS'
import Receipt from './pages/admin/Receipt'
import MenuManager from './pages/admin/MenuManager'
import Reports from './pages/admin/Reports'
import SettingsAdmin from './pages/admin/SettingsAdmin'
import Staff from './pages/admin/Staff'

function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      // e.g. /#story: wait a beat for the page to render, then glide to that section.
      const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 80)
      return () => clearTimeout(t)
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/order/:id" element={<OrderSuccess />} />
      <Route path="/admin" element={<AdminLayout />}>
      
        <Route index element={<Orders />} />
        <Route path="pos" element={<POS />} />
        <Route path="receipt/:id" element={<Receipt />} />
        <Route path="menu" element={<MenuManager />} />
        <Route
          path="reports"
          element={
            <AdminOnly>
              <Reports />
            </AdminOnly>
          }
        />
        <Route
          path="settings"
          element={
            <AdminOnly>
              <SettingsAdmin />
            </AdminOnly>
          }
        />
        <Route
          path="users"
          element={
            <AdminOnly>
              <Staff />
            </AdminOnly>
          }
        />
      </Route>
      <Route
        path="*"
        element={
          <div className="container section empty">
            <h1 className="page-title">Page not found</h1>
            <a className="btn" href="/">
              Back to home
            </a>
          </div>
        }
      />
    </Routes>
  )
}

// Everything inside the router: scroll reveals, a soft fade between pages, floating call buttons, intro.
function Shell() {
  const { pathname } = useLocation()
  useRevealOnScroll()
  return (
    <>
      <Splash />
      <ScrollToTop />
      <Header />
      <OrderTypeModal />
      <main className="page" key={pathname.startsWith('/admin') ? 'admin' : pathname}>
        <AppRoutes />
      </main>
      <Footer />
      <ContactDock />
    </>
  )
}

// Pages only the admin may open (cashiers are sent back to the orders list)
function AdminOnly({ children }) {
  const { isAdmin } = useAuth()
  return isAdmin ? children : <Navigate to="/admin" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <AuthProvider>
          <CartProvider>
            <Shell />
          </CartProvider>
        </AuthProvider>
      </SettingsProvider>
    </BrowserRouter>
  )
}
