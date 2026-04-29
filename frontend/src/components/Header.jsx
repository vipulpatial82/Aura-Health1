import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { FaBell, FaCalendarAlt } from 'react-icons/fa'
import api from '../api/axiosInstance'

const allNavItems = [
  { name: 'Home',          path: '/',                  roles: ['patient', 'doctor', 'admin'] },
  { name: 'Dashboard',     path: '/dashboard',          roles: ['patient'] },
  { name: 'Hospitals',     path: '/nearby-hospitals',   roles: ['patient'] },
  { name: 'Appointments',  path: '/appointments',       roles: ['patient', 'doctor', 'admin'] },
  { name: 'Personal Data', path: '/personal-data',      roles: ['patient'] },
  { name: 'Chat AI',       path: '/chat-ai',            roles: ['patient'] },
  { name: 'Medications',   path: '/medication-tracker', roles: ['patient'] },
  { name: 'Admin Panel',   path: '/admin',              roles: ['doctor', 'admin'] },
  { name: 'Profile',       path: '/profile',            roles: ['patient', 'doctor', 'admin'] },
]

const Header = ({ isLoggedIn, onLogout, user }) => {
  const navigate  = useNavigate()
  const location  = useLocation()
  const [menuOpen, setMenuOpen]     = useState(false)
  const [upcoming, setUpcoming]     = useState([])
  const [showNotif, setShowNotif]   = useState(false)
  const notifRef = useRef(null)

  const role     = user?.role || 'patient'
  const navItems = allNavItems.filter(item => item.roles.includes(role))
  const isActive = (path) => location.pathname === path

  // Fetch upcoming appointments within 24h
  useEffect(() => {
    if (!isLoggedIn) return
    const url = (user?.role === 'admin' || user?.role === 'doctor') ? '/appointments' : '/appointments/my'
    api.get(url).then(({ data }) => {
      if (!data.success) return
      const now  = new Date()
      const soon = data.data.filter(a => {
        if (a.status === 'Cancelled' || a.status === 'Completed') return false
        const apptDate = new Date(`${a.date}T${a.time}`)
        const diffH = (apptDate - now) / 36e5
        return diffH >= 0 && diffH <= 24
      })
      setUpcoming(soon)
    }).catch(() => {})
  }, [isLoggedIn, user?.role, location.pathname])

  // Close mobile menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e) => {
      if (!e.target.closest('header')) setMenuOpen(false)
    }
    document.addEventListener('touchstart', handler)
    document.addEventListener('mousedown', handler)
    return () => {
      document.removeEventListener('touchstart', handler)
      document.removeEventListener('mousedown', handler)
    }
  }, [menuOpen])

  // Close notif dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="fixed w-full top-0 z-50">
      <div className="absolute inset-0 glass-effect border-b border-white/20 shadow-sm"></div>
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">

          <button onClick={() => navigate('/')} className="text-xl font-black text-slate-800 tracking-tight hover:opacity-75 transition-opacity">
            Aura<span className="text-gradient">Health</span>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button key={item.path} onClick={() => navigate(item.path)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-green-100/60 text-green-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-green-600'
                }`}>
                {item.name}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {/* Notification bell */}
            {isLoggedIn && (
              <div className="relative" ref={notifRef}>
                <button onClick={() => setShowNotif(s => !s)}
                  className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
                  <FaBell className="text-sm" />
                  {upcoming.length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
                {showNotif && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Upcoming (24h)</p>
                    </div>
                    {upcoming.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-5">No upcoming appointments</p>
                    ) : upcoming.map(a => (
                      <div key={a._id} className="px-4 py-3 hover:bg-slate-50 flex items-start gap-3 cursor-pointer"
                        onClick={() => { navigate('/appointments'); setShowNotif(false) }}>
                        <FaCalendarAlt className="text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-slate-700">{a.concern}</p>
                          <p className="text-xs text-slate-400">{a.date} · {a.time} · {a.department}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!isLoggedIn ? (
              <button onClick={() => navigate('/login')} className="btn-primary text-xs px-4 py-1.5">Login</button>
            ) : (
              <button onClick={onLogout} className="btn-secondary text-xs px-4 py-1.5 hover:bg-red-50 hover:text-red-600 hover:border-red-200">Logout</button>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
            {isLoggedIn && (
              <button onClick={() => { navigate('/appointments'); setMenuOpen(false) }}
                className="relative p-2 rounded-xl text-slate-500">
                <FaBell className="text-sm" />
                {upcoming.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
              </button>
            )}
            <button onClick={() => setMenuOpen(!menuOpen)} className="text-slate-600 hover:text-green-600 p-1.5 transition-colors">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden absolute w-full bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-lg z-50">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <button key={item.path} onClick={() => { navigate(item.path); setMenuOpen(false) }}
                className={`block w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-green-50 text-green-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-green-600'
                }`}>
                {item.name}
              </button>
            ))}
            {!isLoggedIn ? (
              <button onClick={() => { navigate('/login'); setMenuOpen(false) }}
                className="block w-full text-left px-3 py-2.5 text-green-600 font-bold bg-green-50 rounded-xl">
                Login
              </button>
            ) : (
              <button onClick={() => { onLogout(); setMenuOpen(false) }}
                className="block w-full text-left px-3 py-2.5 text-red-500 font-bold hover:bg-red-50 rounded-xl transition-colors">
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
