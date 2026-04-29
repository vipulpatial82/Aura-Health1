import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'
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
        name: formData.name, email: formData.email, password: formData.password,
      })
      if (data.success) {
        localStorage.setItem('accessToken', data.data.accessToken)
        localStorage.setItem('user', JSON.stringify(data.data.user))
        onSignup(data.data.user)
        navigate('/dashboard', { replace: true })
      } else {
        setError(data.message || 'Signup failed')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Network error. Please try again.')
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

            <div className="flex items-center gap-2">
              <div className="flex-1 border-t border-slate-200"></div>
              <span className="text-xs text-slate-400 font-semibold">or continue with</span>
              <div className="flex-1 border-t border-slate-200"></div>
            </div>

            <a href={`${import.meta.env.VITE_API_URL || ''}/api/auth/google`}
              className="btn-secondary w-full py-2.5 text-sm flex items-center justify-center gap-2">
              <FcGoogle className="text-lg" /> Continue with Google
            </a>

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
