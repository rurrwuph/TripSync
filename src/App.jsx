import React from 'react'
import HomePage from './pages/HomePage'
import Chatbot from './components/Chatbot'
import TripPage from './pages/TripPage'
import SeatPage from './pages/SeatPage'
import { Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import ProfilePage from './pages/ProfilePage'
import CheckoutPage from './pages/CheckoutPage'
import { TripProvider } from './context/TripContext'

const App = () => {
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
        </Routes>

        <Chatbot />
      </div>
    </TripProvider>
  )
}

export default App;