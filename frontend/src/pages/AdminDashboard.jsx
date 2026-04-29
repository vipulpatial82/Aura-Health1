import React, { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaUserMd, FaSearch, FaEye, FaTimes, FaPlus, FaChartBar, FaBell, FaCrown } from 'react-icons/fa'
import api from '../api/axiosInstance'

const SPECIALIZATIONS = ['Cardiology', 'Neurology', 'General Physician', 'Pediatrics', 'Dermatology', 'Orthopedics']
const EMPTY_DOCTOR_FORM = { name: '', email: '', specialization: '', experience: '', workingHours: '' }

const TABS = [
  { id: 'overview',  label: 'Overview',          icon: FaChartBar },
  { id: 'doctors',   label: 'Doctor Management', icon: FaUserMd   },
  { id: 'patients',  label: 'Patients',          icon: FaUserMd   },
  { id: 'analytics', label: 'Analytics',         icon: FaChartBar },
]

function AvailabilityBadge({ isAvailable }) {
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
      {isAvailable ? 'Available' : 'Unavailable'}
    </span>
  )
}

function AddDoctorModal({ onClose, onSaved }) {
  const [form, setForm]   = useState(EMPTY_DOCTOR_FORM)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.specialization) {
      setError('Name, email and specialization are required.')
      return
    }
    setSaving(true)
    try {
      await api.post('/admin/doctors', form)
      onSaved()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add doctor.')
    } finally {
      setSaving(false)
    }
  }

  const fields = [
    { label: 'Full Name',        key: 'name',         type: 'text',   placeholder: 'Dr. Jane Smith' },
    { label: 'Email',            key: 'email',        type: 'email',  placeholder: 'jane@aurahealth.com' },
    { label: 'Experience (yrs)', key: 'experience',   type: 'number', placeholder: '5' },
    { label: 'Working Hours',    key: 'workingHours', type: 'text',   placeholder: '9:00 AM - 5:00 PM' },
  ]

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-slate-800">Add New Doctor</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <FaTimes className="text-slate-500" />
          </button>
        </div>

        {error && <p className="text-xs text-red-600 bg-red-50 border border-red-100 p-2.5 rounded-lg mb-4">{error}</p>}

        <div className="space-y-3.5">
          {fields.map(f => (
            <div key={f.key}>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{f.label}</label>
              <input type={f.type} value={form[f.key]} placeholder={f.placeholder}
                onChange={set(f.key)} className="input-field py-2.5 text-sm w-full" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Specialization</label>
            <select value={form.specialization} onChange={set('specialization')} className="input-field py-2.5 text-sm w-full">
              <option value="">Select specialization</option>
              {SPECIALIZATIONS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="btn-secondary flex-1 text-sm py-2.5">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="btn-primary flex-1 text-sm py-2.5">
            {saving ? 'Saving...' : 'Add Doctor'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function DoctorDetailModal({ doctor, onClose }) {
  const details = [
    { label: 'Specialization', value: doctor.specialization },
    { label: 'Experience',     value: `${doctor.experience} yrs` },
    { label: 'Patients',       value: doctor.totalPatients ?? 0 },
    { label: 'Status',         value: doctor.isAvailable ? 'Available' : 'Unavailable' },
    { label: 'Working Hours',  value: doctor.workingHours || '—' },
  ]

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-800">{doctor.userId?.name}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <FaTimes className="text-slate-500" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {details.map(item => (
            <div key={item.label} className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs font-bold text-slate-400 uppercase mb-0.5">{item.label}</p>
              <p className="text-sm font-bold text-slate-800">{item.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 bg-slate-50 rounded-xl p-3">
          <p className="text-xs font-bold text-slate-400 uppercase mb-0.5">Email</p>
          <p className="text-sm text-slate-700">{doctor.userId?.email}</p>
        </div>
      </motion.div>
    </div>
  )
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab]         = useState('overview')
  const [doctors, setDoctors]             = useState([])
  const [patients, setPatients]           = useState([])
  const [loading, setLoading]             = useState(true)
  const [searchTerm, setSearchTerm]       = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [showAddModal, setShowAddModal]   = useState(false)

  const fetchDoctors = () => {
    setLoading(true)
    api.get('/admin/doctors')
      .then(({ data }) => { if (data.success) setDoctors(data.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchDoctors()
    api.get('/admin/patients').then(({ data }) => { if (data.success) setPatients(data.data) }).catch(() => {})
  }, [])

  const filteredDoctors = useMemo(() =>
    doctors.filter(d =>
      (d.userId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.specialization || '').toLowerCase().includes(searchTerm.toLowerCase())
    ), [doctors, searchTerm])

  const toggleAvailability = async (id, current) => {
    setDoctors(prev => prev.map(d => d._id === id ? { ...d, isAvailable: !current } : d))
    try {
      await api.put(`/admin/doctors/${id}`, { isAvailable: !current })
    } catch {
      setDoctors(prev => prev.map(d => d._id === id ? { ...d, isAvailable: current } : d))
    }
  }

  const deleteDoctor = async (id) => {
    try {
      await api.delete(`/admin/doctors/${id}`)
      fetchDoctors()
    } catch {}
  }

  const availableCount   = doctors.filter(d => d.isAvailable).length
  const unavailableCount = doctors.filter(d => !d.isAvailable).length

  return (
    <div className="p-4 md:p-6 min-h-[calc(100vh-56px)] bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-72 h-72 bg-green-200 rounded-full blur-3xl opacity-20 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center border border-green-100">
            <FaCrown className="text-lg" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800">Admin Dashboard</h1>
            <p className="text-xs text-slate-500">Hospital management system</p>
          </div>
        </motion.div>

        {/* Tab bar */}
        <div className="flex gap-2 bg-white rounded-2xl p-1.5 border border-slate-100 shadow-sm mb-6 w-fit">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors
                ${activeTab === tab.id ? 'bg-green-100 text-green-700' : 'text-slate-600 hover:bg-slate-50'}`}>
              <tab.icon className="text-xs" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'Total Doctors', value: doctors.length,   color: 'text-blue-600'  },
                { label: 'Available',     value: availableCount,   color: 'text-green-600' },
                { label: 'Unavailable',   value: unavailableCount, color: 'text-slate-500' },
              ].map(stat => (
                <div key={stat.label} className="glass-panel p-4 rounded-2xl">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{stat.label}</p>
                  <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div className="card p-5">
                <h3 className="text-base font-bold text-slate-900 mb-4">Quick Actions</h3>
                <div className="space-y-2.5">
                  <button onClick={() => { setActiveTab('doctors'); setShowAddModal(true) }} className="btn-primary w-full justify-start text-sm py-2.5">
                    <FaPlus /> Add New Doctor
                  </button>
                  <button onClick={() => setActiveTab('analytics')} className="btn-secondary w-full justify-start text-sm py-2.5">
                    <FaChartBar /> View Analytics
                  </button>
                </div>
              </div>

              <div className="card p-5">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <FaBell className="text-green-600" /> Doctor Summary
                </h3>
                {loading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600" />
                  </div>
                ) : doctors.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No doctors added yet.</p>
                ) : (
                  <div className="space-y-2">
                    {doctors.slice(0, 4).map(d => (
                      <div key={d._id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{d.userId?.name}</p>
                          <p className="text-xs text-slate-500">{d.specialization}</p>
                        </div>
                        <AvailabilityBadge isAvailable={d.isAvailable} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Doctors tab */}
        {activeTab === 'doctors' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Doctor Management</h2>
                <p className="text-xs text-slate-500">Add, view and manage doctors</p>
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                  <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search..." className="input-field pl-8 py-2 text-sm w-48" />
                </div>
                <button onClick={() => setShowAddModal(true)} className="btn-primary text-sm py-2 px-4">
                  <FaPlus /> Add Doctor
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
              </div>
            ) : filteredDoctors.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                {doctors.length === 0 ? 'No doctors added yet. Click "Add Doctor" to get started.' : 'No doctors match your search.'}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredDoctors.map(doc => (
                  <div key={doc._id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center text-sm">
                          <FaUserMd />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">{doc.userId?.name}</h3>
                          <p className="text-xs text-slate-500">{doc.specialization}</p>
                        </div>
                      </div>
                      <AvailabilityBadge isAvailable={doc.isAvailable} />
                    </div>

                    <div className="space-y-1.5 mb-3 text-xs">
                      <div className="flex justify-between"><span className="text-slate-500">Experience</span><span className="font-semibold">{doc.experience} yrs</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Patients</span><span className="font-semibold">{doc.totalPatients ?? 0}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Hours</span><span className="font-semibold">{doc.workingHours || '—'}</span></div>
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => setSelectedDoctor(doc)} className="btn-secondary flex-1 text-xs py-1.5"><FaEye /> View</button>
                      <button
                        onClick={() => toggleAvailability(doc._id, doc.isAvailable)}
                        className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition-colors
                          ${doc.isAvailable ? 'border-amber-200 text-amber-600 hover:bg-amber-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}>
                        {doc.isAvailable ? 'Deactivate' : 'Activate'}
                      </button>
                      <button onClick={() => deleteDoctor(doc._id)} className="text-xs px-3 py-1.5 rounded-xl border border-red-100 text-red-500 hover:bg-red-50 transition-colors">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Patients tab */}
        {activeTab === 'patients' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Registered Patients</h2>
            <p className="text-xs text-slate-500 mb-5">{patients.length} total patients</p>
            {patients.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-8">No patients registered yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs text-slate-500 uppercase tracking-wider">
                      <th className="text-left py-2 pr-4 font-bold">#</th>
                      <th className="text-left py-2 pr-4 font-bold">Name</th>
                      <th className="text-left py-2 pr-4 font-bold">Email</th>
                      <th className="text-left py-2 pr-4 font-bold">Joined</th>
                      <th className="text-left py-2 font-bold">Last Login</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((p, i) => (
                      <tr key={p._id} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="py-2.5 pr-4 text-slate-400 text-xs">{i + 1}</td>
                        <td className="py-2.5 pr-4 font-semibold text-slate-900">{p.name}</td>
                        <td className="py-2.5 pr-4 text-slate-600">{p.email}</td>
                        <td className="py-2.5 pr-4 text-slate-500 text-xs">{new Date(p.createdAt).toLocaleDateString()}</td>
                        <td className="py-2.5 text-slate-500 text-xs">{p.lastLogin ? new Date(p.lastLogin).toLocaleDateString() : 'Never'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* Analytics tab */}
        {activeTab === 'analytics' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div className="card p-5">
              <h3 className="text-base font-bold text-slate-900 mb-4">Doctor Overview</h3>
              {doctors.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">No doctors added yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-xs text-slate-500 uppercase tracking-wider">
                        <th className="text-left py-2 pr-4 font-bold">Doctor</th>
                        <th className="text-left py-2 pr-4 font-bold">Specialization</th>
                        <th className="text-left py-2 pr-4 font-bold">Experience</th>
                        <th className="text-left py-2 font-bold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doctors.map(doc => (
                        <tr key={doc._id} className="border-b border-slate-50">
                          <td className="py-2.5 pr-4 font-semibold text-slate-900">{doc.userId?.name}</td>
                          <td className="py-2.5 pr-4 text-slate-600">{doc.specialization}</td>
                          <td className="py-2.5 pr-4 text-slate-600">{doc.experience} yrs</td>
                          <td className="py-2.5"><AvailabilityBadge isAvailable={doc.isAvailable} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="card p-5">
              <h3 className="text-base font-bold text-slate-900 mb-4">Specialization Breakdown</h3>
              {doctors.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">No data available.</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(
                    doctors.reduce((acc, d) => {
                      const key = d.specialization || 'Unknown'
                      acc[key] = (acc[key] || 0) + 1
                      return acc
                    }, {})
                  ).sort((a, b) => b[1] - a[1]).map(([spec, count]) => (
                    <div key={spec} className="flex items-center gap-3">
                      <span className="text-xs text-slate-600 w-36 flex-shrink-0 truncate">{spec}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(count / doctors.length) * 100}%` }} />
                      </div>
                      <span className="text-xs font-bold text-slate-700 w-4 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {showAddModal   && <AddDoctorModal onClose={() => setShowAddModal(false)} onSaved={fetchDoctors} />}
      {selectedDoctor && <DoctorDetailModal doctor={selectedDoctor} onClose={() => setSelectedDoctor(null)} />}
    </div>
  )
}
