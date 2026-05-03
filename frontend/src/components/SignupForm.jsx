import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider, firebaseProjectInfo } from '../api/firebase'
import api from '../api/axiosInstance'

const SignupForm = ({ onSignup }) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return }
    setIsLoading(true)
    setError('')
    try {
      const { data } = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })
      
      if (data.success) {
        localStorage.setItem('accessToken', data.data.accessToken)
        localStorage.setItem('refreshToken', data.data.refreshToken || '')
        localStorage.setItem('user', JSON.stringify(data.data.user))
        onSignup(data.data.user)
        navigate('/dashboard', { replace: true })
      } else {
        setError(data.message || 'Signup failed')
      }
    } catch (err) {
      console.error('Signup error:', err)
      if (err.code === 'ERR_NETWORK') {
        const apiUrl = import.meta.env.VITE_API_URL || 'https://aura-health-7f0s.onrender.com'
        setError(`Cannot reach server. Check backend/CORS for ${apiUrl}.`)
      } else {
        setError(err.response?.data?.message || err.message || 'Network error. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Google Sign-Up
  const handleGoogleSignUp = async () => {
    setIsLoading(true)
    setError('')
    try {
      // Sign in with Google popup directly to avoid Safari popup blockers
      const result = await signInWithPopup(auth, googleProvider)
      const idToken = await result.user.getIdToken()
      const name = result.user.displayName || formData.name || result.user.email?.split('@')[0]

      const { data } = await api.post('/auth/firebase-login', { idToken, name })
      
      if (data.success) {
        localStorage.setItem('accessToken', data.data.accessToken)
        localStorage.setItem('refreshToken', data.data.refreshToken || '')
        localStorage.setItem('user', JSON.stringify(data.data.user))
        onSignup(data.data.user)
        navigate('/dashboard', { replace: true })
      } else {
        setError(data.message || 'Google sign-up failed')
      }
    } catch (err) {
      console.error('Google sign-up error:', err)
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-up popup was closed. Please try again.')
      } else if (err.code === 'auth/unauthorized-domain') {
        const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'your-domain'
        setError(`Domain "${currentDomain}" is not authorized in Firebase Auth. Add it in Firebase Console > Authentication > Settings > Authorized domains.`)
      } else if (err.code === 'auth/operation-not-allowed') {
        const projectHint = firebaseProjectInfo.projectId || firebaseProjectInfo.authDomain || 'unknown-project'
        setError(`Google login is disabled for Firebase project "${projectHint}". Check deployed Firebase env values.`)
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        setError('An account already exists with this email using a different login method.')
      } else {
        setError(err.response?.data?.message || err.message || 'Google sign-up failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const fields = [
    { id: 'name',            label: 'Full Name',        type: 'text',     icon: FaUser,     placeholder: 'Your full name',    autoComplete: 'name' },
    { id: 'email',           label: 'Email',            type: 'email',    icon: FaEnvelope, placeholder: 'Your email',         autoComplete: 'email' },
    { id: 'password',        label: 'Password',         type: 'password', icon: FaLock,     placeholder: 'Create a password', autoComplete: 'new-password' },
    { id: 'confirmPassword', label: 'Confirm Password', type: 'password', icon: FaLock,     placeholder: 'Confirm password',  autoComplete: 'new-password' },
  ]

  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-72 h-72 bg-green-200 rounded-full blur-3xl opacity-40 pointer-events-none animate-float"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-72 h-72 bg-yellow-200 rounded-full blur-3xl opacity-40 pointer-events-none animate-pulse-slow"></div>

      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="max-w-sm w-full relative z-10"
      >
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-slate-800 mb-1">Join AuraHealth</h1>
          <p className="text-slate-500 text-sm">Create your account to get started</p>
        </div>

        <div className="glass-panel p-6">
          <div className="bg-blue-50 border border-blue-200 text-blue-700 p-2.5 rounded-lg text-xs font-medium text-center mb-4">
            ℹ️ Create an account to access all AuraHealth features
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-2.5 rounded-lg text-xs font-medium text-center mb-4">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {fields.map(({ id, label, type, icon: Icon, placeholder, autoComplete }) => (
              <div key={id}>
                <label htmlFor={id} className="block text-xs font-bold text-slate-700 mb-1">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none z-10" />
                  <input id={id} name={id} type={type} required value={formData[id]}
                    onChange={handleChange} autoComplete={autoComplete} className="input-field pl-9 py-2.5 text-sm" placeholder={placeholder} />
                </div>
              </div>
            ))}

            <button type="submit" disabled={isLoading} className="btn-primary w-full py-2.5 text-sm mt-1">
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>

            {/* Google Sign-Up Button */}
            <button 
              type="button" 
              onClick={handleGoogleSignUp} 
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 flex items-center justify-center gap-3"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {isLoading ? 'Signing Up...' : 'Sign up with Google'}
            </button>

            <p className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
              Already have an account?{' '}
              <Link to="/login" className="text-green-600 font-bold hover:underline">Log in</Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

export default SignupForm
