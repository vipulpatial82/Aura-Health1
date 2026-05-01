import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaEnvelope, FaLock, FaUserPlus } from 'react-icons/fa'
import { signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth'
import { auth, googleProvider, firebaseProjectInfo } from '../api/firebase'
import api from '../api/axiosInstance'

const LoginForm = ({ onLogin }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const from = location.state?.from?.pathname || '/dashboard'

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

  useEffect(() => {
    if (searchParams.get('error') === 'oauth_failed') {
      setError('Google sign-in failed. Please try again.')
    }
    // Handle redirect result on mobile after returning from Google
    getRedirectResult(auth).then(async (result) => {
      if (!result) return
      const idToken = await result.user.getIdToken()
      const { data } = await api.post('/auth/firebase-login', { idToken })
      if (data.success) {
        localStorage.setItem('accessToken', data.data.accessToken)
        localStorage.setItem('user', JSON.stringify(data.data.user))
        onLogin(data.data.user)
        navigate(from, { replace: true })
      }
    }).catch(() => {})
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  // Handle email/password login
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.email || !formData.password) { setError('All fields required'); return }

    setIsLoading(true)
    try {
      // Send directly to backend local login (bypasses Firebase for admin)
      const { data } = await api.post('/auth/login', { 
        email: formData.email, 
        password: formData.password 
      })
      
      if (data.success) {
        localStorage.setItem('accessToken', data.data.accessToken)
        localStorage.setItem('refreshToken', data.data.refreshToken || '')
        localStorage.setItem('user', JSON.stringify(data.data.user))
        onLogin(data.data.user)
        navigate(from, { replace: true })
      } else {
        setError(data.message || 'Login failed')
      }
    } catch (err) {
      console.error('Login error:', err)
      if (err.code === 'ERR_NETWORK') {
        const apiUrl = import.meta.env.VITE_API_URL || 'https://aura-health-7f0s.onrender.com'
        setError(`Cannot reach server. Check backend/CORS for ${apiUrl}.`)
      } else {
        setError(err.response?.data?.message || err.message || 'Invalid credentials or server error')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError('')
    try {
      // Clear any previous auth state
      await auth.signOut()
      
      // Sign in with Google popup
      if (isMobile) { await signInWithRedirect(auth, googleProvider); return }
      const result = await signInWithPopup(auth, googleProvider)
      
      // Get the ID token
      const idToken = await result.user.getIdToken()

      // Send to backend
      const { data } = await api.post('/auth/firebase-login', { idToken })
      
      if (data.success) {
        localStorage.setItem('accessToken', data.data.accessToken)
        localStorage.setItem('refreshToken', data.data.refreshToken || '')
        localStorage.setItem('user', JSON.stringify(data.data.user))
        onLogin(data.data.user)
        navigate(from, { replace: true })
      } else {
        setError(data.message || 'Google sign-in failed')
      }
    } catch (err) {
      console.error('Google sign-in error:', err)
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed. Please try again.')
      } else if (err.code === 'auth/unauthorized-domain') {
        const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'your-domain'
        setError(`Domain "${currentDomain}" is not authorized in Firebase Auth. Add it in Firebase Console > Authentication > Settings > Authorized domains.`)
      } else if (err.code === 'auth/operation-not-allowed') {
        const projectHint = firebaseProjectInfo.projectId || firebaseProjectInfo.authDomain || 'unknown-project'
        setError(`Google login is disabled for Firebase project "${projectHint}". Check deployed Firebase env values.`)
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        setError('An account already exists with this email using a different login method.')
      } else {
        setError(err.response?.data?.message || err.message || 'Google sign-in failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-green-200 rounded-full blur-3xl opacity-40 pointer-events-none animate-float"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-72 h-72 bg-yellow-200 rounded-full blur-3xl opacity-40 pointer-events-none animate-pulse-slow"></div>

      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="max-w-sm w-full relative z-10"
      >
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-slate-800 mb-1">Welcome Back</h1>
          <p className="text-slate-500 text-sm">Sign in to your AuraHealth account</p>
        </div>

        <div className="glass-panel p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none z-10" />
                <input name="email" type="email" value={formData.email} onChange={handleChange}
                  autoComplete="email" className="input-field pl-9 py-2.5 text-sm" placeholder="Enter your email" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none z-10" />
                <input name="password" type="password" value={formData.password} onChange={handleChange}
                  autoComplete="current-password" className="input-field pl-9 py-2.5 text-sm" placeholder="Enter your password" />
              </div>
            </div>

            {error && <p className="text-red-500 bg-red-50 p-2.5 rounded-lg text-xs font-medium text-center border border-red-100">{error}</p>}

            <button type="submit" disabled={isLoading} className="btn-primary w-full py-2.5 text-sm mt-1">
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>

            {/* Google Sign-In Button */}
            <button 
              type="button" 
              onClick={handleGoogleSignIn} 
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 flex items-center justify-center gap-3"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {isLoading ? 'Signing In...' : 'Continue with Google'}
            </button>

            <button type="button" onClick={() => navigate('/signup')} className="btn-secondary w-full py-2.5 text-sm">
              <FaUserPlus className="text-slate-400" /> Create Account
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

export default LoginForm
