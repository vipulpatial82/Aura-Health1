import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaEnvelope, FaLock, FaUserPlus } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'
import api from '../api/axiosInstance'

const LoginForm = ({ onLogin }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const from = location.state?.from?.pathname || '/dashboard'

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (searchParams.get('error') === 'oauth_failed') {
      setError('Google sign-in failed. Please try again.')
    }
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.email || !formData.password) { setError('All fields required'); return }

    setIsLoading(true)
    try {
      const { data } = await api.post('/auth/login', formData)
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.data.user))
        onLogin(data.data.user)
        navigate(from, { replace: true })
      } else {
        setError(data.message || 'Login failed')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error')
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

            <button type="button" onClick={() => navigate('/signup')} className="btn-secondary w-full py-2.5 text-sm">
              <FaUserPlus className="text-slate-400" /> Create Account
            </button>

            <div className="flex items-center gap-2">
              <div className="flex-1 border-t border-slate-200"></div>
              <span className="text-xs text-slate-400 font-semibold">or continue with</span>
              <div className="flex-1 border-t border-slate-200"></div>
            </div>

            <a href="/api/auth/google"
              className="btn-secondary w-full py-2.5 text-sm flex items-center justify-center gap-2">
              <FcGoogle className="text-lg" /> Continue with Google
            </a>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

export default LoginForm
