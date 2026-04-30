import React, { useState, useCallback } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import api from './api/axiosInstance'
import Header from './components/Header'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import NearbyHospitals from './pages/NearbyHospitals'
import PersonalData from './pages/PersonalData'
import ChatWithAI from './pages/ChatWithAI'
import MedicationTracker from './pages/MedicationTracker'
import Appointments from './pages/Appointments'
import AdminDashboard from './pages/AdminDashboard'
import Profile from './pages/Profile'
import LoginForm from './components/LoginForm'
import SignupForm from './components/SignupForm'

const PageLayout = ({ isLoggedIn, onLogout, user, children }) => (
  <div className="flex flex-col min-h-screen">
    <Header isLoggedIn={isLoggedIn} onLogout={onLogout} user={user} />
    <main className="flex-grow pt-14">{children}</main>
    <Footer />
  </div>
)

const App = () => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored) : null
    } catch {
      localStorage.removeItem('user')
      return null
    }
  })

  const isLoggedIn = !!user

  const handleLogin = useCallback((userData) => {
    setUser(userData)
  }, [])

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  const layout = (children) => (
    <PageLayout isLoggedIn={isLoggedIn} onLogout={handleLogout} user={user}>
      {children}
    </PageLayout>
  )

  const protectedLayout = (children) => (
    <ProtectedRoute isLoggedIn={isLoggedIn}>
      {layout(children)}
    </ProtectedRoute>
  )

  return (
    <Routes>
      <Route path="/" element={layout(<Home />)} />
      <Route path="/dashboard" element={
        (user?.role === 'doctor' || user?.role === 'admin')
          ? <Navigate to="/admin" replace />
          : protectedLayout(<Dashboard user={user} />)
      } />
      <Route path="/nearby-hospitals"  element={protectedLayout(<NearbyHospitals />)} />
      <Route path="/personal-data"     element={protectedLayout(<PersonalData />)} />
      <Route path="/chat-ai"           element={protectedLayout(<ChatWithAI />)} />
      <Route path="/medication-tracker" element={protectedLayout(<MedicationTracker />)} />
      <Route path="/appointments"        element={protectedLayout(<Appointments user={user} />)} />
      <Route path="/admin"               element={protectedLayout(<AdminDashboard user={user} />)} />
      <Route path="/profile"              element={protectedLayout(<Profile user={user} onUpdate={handleLogin} />)} />
      <Route path="/login"  element={layout(<LoginForm onLogin={handleLogin} />)} />
      <Route path="/signup" element={layout(<SignupForm onSignup={handleLogin} />)} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
