import React from 'react'
import HomePage from './pages/HomePage'
import Chatbot from './components/Chatbot'
import TripPage from './pages/TripPage'
import SeatPage from './pages/SeatPage'
import { Routes, Route, useLocation } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import ProfilePage from './pages/ProfilePage'
import CheckoutPage from './pages/CheckoutPage'
import PaymentPage from './pages/PaymentPage'
import AdminDashboard from './pages/Admin/AdminDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import { TripProvider } from './context/TripContext'

const App = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <TripProvider>
      <div>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<TripPage />} />
          <Route path="/seats" element={<SeatPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/payment/bkash" element={<PaymentPage />} />
          <Route path="/admin" element={
            <ProtectedRoute roleRequired="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
        </Routes>

        {!isAdminRoute && <Chatbot />}
      </div>
    </TripProvider>
  )
}

export default App;