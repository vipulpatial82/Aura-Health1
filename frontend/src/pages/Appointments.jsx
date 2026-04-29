import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { FaCalendarAlt, FaCheckCircle, FaUserInjured } from 'react-icons/fa'
import api from '../api/axiosInstance'

const DEPARTMENTS = ['General Physician', 'Cardiology', 'Neurology', 'Orthopedics', 'Dermatology', 'Pediatrics']

const STATUS_STYLES = {
  Upcoming:      'bg-blue-50 text-blue-700 border-blue-100',
  Pending:       'bg-amber-50 text-amber-700 border-amber-100',
  Completed:     'bg-green-50 text-green-700 border-green-100',
  Cancelled:     'bg-red-50 text-red-700 border-red-100',
  'In Progress': 'bg-purple-50 text-purple-700 border-purple-100',
}

const EMPTY_FORM = { name: '', phone: '', concern: '', department: 'General Physician', date: '', time: '' }

function StatusBadge({ status }) {
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${STATUS_STYLES[status] || ''}`}>
      {status}
    </span>
  )
}

function EmptyState({ message }) {
  return (
    <div className="border border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-sm">
      <FaUserInjured className="mx-auto mb-2 text-xl" /> {message}
    </div>
  )
}

export default function Appointments({ user }) {
  const isAdminOrDoctor = user?.role === 'admin' || user?.role === 'doctor'

  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors]           = useState([])
  const [loading, setLoading]           = useState(true)
  const [form, setForm]                 = useState({ ...EMPTY_FORM, name: user?.name || '' })
  const [error, setError]               = useState('')
  const [success, setSuccess]           = useState(false)
  const [filters, setFilters]           = useState({ status: 'All', doctorId: 'All', date: '' })
  const [confirmId, setConfirmId]       = useState(null)

  const fetchAppointments = useCallback(async () => {
    try {
      const url = isAdminOrDoctor ? '/appointments' : '/appointments/my'
      const { data } = await api.get(url)
      if (data.success) setAppointments(data.data)
    } catch {}
    finally { setLoading(false) }
  }, [isAdminOrDoctor])

  useEffect(() => {
    fetchAppointments()
    api.get('/doctors').then(({ data }) => { if (data.success) setDoctors(data.data) }).catch(() => {})
  }, [fetchAppointments])

  // Pick up appointment submitted from home page form
  useEffect(() => {
    const pending = sessionStorage.getItem('pendingAppointment')
    if (!pending) return
    const data = JSON.parse(pending)
    setForm(prev => ({ ...prev, ...data }))
    sessionStorage.removeItem('pendingAppointment')
  }, [])

  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.phone || !form.date || !form.time || !form.concern) {
      setError('Please fill in all fields.')
      return
    }
    try {
      await api.post('/appointments', form)
      setForm({ ...EMPTY_FORM, name: user?.name || '' })
      setError('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      fetchAppointments()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment.')
    }
  }

  const updateAppointment = async (id, changes) => {
    try {
      await api.patch(`/appointments/${id}`, changes)
      fetchAppointments()
    } catch {}
  }

  const cancelAppointment = async (id) => {
    try {
      await api.patch(`/appointments/${id}/cancel`)
      fetchAppointments()
    } catch {}
    setConfirmId(null)
  }

  const assignDoctor = (id, doctorId) => {
    const doctor = doctors.find(d => d._id === doctorId)
    updateAppointment(id, { assignedDoctorId: doctorId, assignedDoctorName: doctor?.userId?.name || '', status: 'Upcoming' })
  }

  const startConsultation = (id) => updateAppointment(id, { consultationStart: new Date().toISOString(), status: 'In Progress' })

  const endConsultation = (id) => {
    const apt = appointments.find(a => a._id === id)
    if (!apt?.consultationStart) return
    const durationMinutes = Math.max(0, Math.round((new Date() - new Date(apt.consultationStart)) / 60000))
    updateAppointment(id, { consultationEnd: new Date().toISOString(), durationMinutes, status: 'Completed' })
  }

  const setFilter = (key) => (e) => setFilters(prev => ({ ...prev, [key]: e.target.value }))

  const visibleAppointments = useMemo(() => {
    let list = appointments
    if (filters.status !== 'All')   list = list.filter(a => a.status === filters.status)
    if (filters.doctorId !== 'All') list = list.filter(a => String(a.assignedDoctorId) === String(filters.doctorId))
    if (filters.date)               list = list.filter(a => a.date === filters.date)
    return list
  }, [appointments, filters])

  const doctorStats = useMemo(() => {
    const active    = appointments.filter(a => a.status !== 'Cancelled')
    const completed = active.filter(a => a.status === 'Completed')
    const totalMins = completed.reduce((sum, a) => sum + (a.durationMinutes || 0), 0)
    const thisWeek  = active.filter(a => {
      const daysAgo = Math.floor((new Date() - new Date(a.date)) / 86400000)
      return daysAgo >= 0 && daysAgo <= 7
    }).length
    return {
      total:   active.length,
      hours:   (totalMins / 60).toFixed(1),
      avgTime: completed.length ? `${Math.round(totalMins / completed.length)}m` : '—',
      week:    thisWeek,
    }
  }, [appointments])

  return (
    <div className="p-4 md:p-6 min-h-[calc(100vh-56px)] bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-72 h-72 bg-green-200 rounded-full blur-3xl opacity-30 pointer-events-none" />
      <div className="max-w-6xl mx-auto relative z-10">

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center border border-green-100">
                <FaCalendarAlt />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-800">
                  {isAdminOrDoctor ? 'Appointment Hub' : 'Appointment Booking'}
                </h1>
                <p className="text-slate-500 text-xs">
                  {isAdminOrDoctor ? 'Manage and track all appointments.' : 'Book and track your appointments.'}
                </p>
              </div>
            </div>
            <span className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-slate-500 shadow-sm w-fit">
              {visibleAppointments.length} request{visibleAppointments.length !== 1 ? 's' : ''}
            </span>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
          </div>
        ) : isAdminOrDoctor ? (
          <AdminDoctorView
            appointments={visibleAppointments}
            doctors={doctors}
            stats={doctorStats}
            filters={filters}
            setFilter={setFilter}
            onAssign={assignDoctor}
            onStart={startConsultation}
            onEnd={endConsultation}
            onNoteChange={(id, val) => updateAppointment(id, { notes: val })}
            onStatusChange={(id, status) => updateAppointment(id, { status })}
          />
        ) : (
          <>
            {confirmId && (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-6 max-w-sm w-full">
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-2">Cancel Appointment?</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">This action cannot be undone. Are you sure you want to cancel this appointment?</p>
                  <div className="flex gap-3">
                    <button onClick={() => setConfirmId(null)} className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm">Keep It</button>
                    <button onClick={() => cancelAppointment(confirmId)} className="flex-1 py-2.5 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors text-sm">Yes, Cancel</button>
                  </div>
                </div>
              </div>
            )}
            <PatientView
            appointments={visibleAppointments}
            form={form}
            error={error}
            success={success}
            onChange={handleFormChange}
            onSubmit={handleSubmit}
            onCancel={(id) => setConfirmId(id)}
          />
          </>
        )}
      </div>
    </div>
  )
}

function AdminDoctorView({ appointments, doctors, stats, filters, setFilter, onAssign, onStart, onEnd, onNoteChange, onStatusChange }) {
  const statCards = [
    { label: 'Total Patients',   value: stats.total,   color: 'text-slate-800'  },
    { label: 'Total Hours',      value: stats.hours,   color: 'text-green-600'  },
    { label: 'Avg Consultation', value: stats.avgTime, color: 'text-blue-600'   },
    { label: 'This Week',        value: stats.week,    color: 'text-violet-600' },
  ]

  // Keep notes in local state so typing doesn't trigger API on every keystroke
  const [localNotes, setLocalNotes] = useState({})
  const debounceRef = useRef({})

  // Sync local notes when appointments load/change (only for ones not being edited)
  useEffect(() => {
    setLocalNotes(prev => {
      const updated = { ...prev }
      appointments.forEach(apt => {
        if (!(apt._id in updated)) updated[apt._id] = apt.notes || ''
      })
      return updated
    })
  }, [appointments])

  const handleNoteChange = (id, value) => {
    // Update local state immediately so typing feels instant
    setLocalNotes(prev => ({ ...prev, [id]: value }))
    // Debounce the API call — save 1 second after user stops typing
    clearTimeout(debounceRef.current[id])
    debounceRef.current[id] = setTimeout(() => {
      onNoteChange(id, value)
    }, 1000)
  }

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statCards.map(card => (
          <div key={card.label} className="glass-panel p-4">
            <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">{card.label}</p>
            <p className={`text-2xl font-black ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">Appointment Queue</h2>
            <p className="text-xs text-slate-500">All patient appointments in real-time.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select value={filters.status} onChange={setFilter('status')} className="input-field py-2 text-xs">
              <option value="All">All Status</option>
              {['Pending', 'Upcoming', 'In Progress', 'Completed', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
            </select>
            <select value={filters.doctorId} onChange={setFilter('doctorId')} className="input-field py-2 text-xs">
              <option value="All">All Doctors</option>
              {doctors.map(d => <option key={d._id} value={d._id}>{d.userId?.name}</option>)}
            </select>
            <input type="date" value={filters.date} onChange={setFilter('date')} className="input-field py-2 text-xs" />
          </div>
        </div>

        <div className="space-y-4">
          {appointments.length === 0 ? (
            <EmptyState message="No appointments yet." />
          ) : appointments.map(apt => (
            <div key={apt._id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 shadow-sm">
              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr] items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <p className="text-sm font-semibold text-slate-900">{apt.patientName}</p>
                    <StatusBadge status={apt.status} />
                  </div>
                  <p className="text-xs text-slate-600 mb-2">{apt.concern}</p>
                  <div className="grid gap-1.5 sm:grid-cols-2 text-xs text-slate-600">
                    <div>Time: <span className="font-semibold text-slate-800">{apt.date} · {apt.time}</span></div>
                    <div>Doctor: <span className="font-semibold text-slate-800">{apt.assignedDoctorName || 'Unassigned'}</span></div>
                    <div>Dept: <span className="font-semibold text-slate-800">{apt.department}</span></div>
                    <div>Phone: <span className="font-semibold text-slate-800">{apt.phone}</span></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase">Assign Doctor</label>
                  <select value={apt.assignedDoctorId || ''} onChange={e => onAssign(apt._id, e.target.value)} className="input-field py-2 text-xs w-full">
                    <option value="">Unassigned</option>
                    {doctors.map(d => <option key={d._id} value={d._id}>{d.userId?.name}</option>)}
                  </select>
                  <button onClick={() => onStatusChange(apt._id, apt.status === 'Cancelled' ? 'Pending' : 'Cancelled')} className="btn-secondary w-full py-1.5 text-xs">
                    {apt.status === 'Cancelled' ? 'Reinstate' : 'Cancel'}
                  </button>
                </div>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="bg-white rounded-xl p-3 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Consultation Timer</p>
                  <p className="text-xs text-slate-700">{apt.durationMinutes ? `${apt.durationMinutes} min` : 'Not started'}</p>
                  <div className="mt-2 flex gap-2">
                    {apt.status !== 'Completed' && apt.status !== 'In Progress' && (
                      <button onClick={() => onStart(apt._id)} className="btn-primary py-1.5 text-xs flex-1">Start</button>
                    )}
                    {apt.status === 'In Progress' && (
                      <button onClick={() => onEnd(apt._id)} className="btn-secondary py-1.5 text-xs flex-1">End</button>
                    )}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-3 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Notes</p>
                  <textarea value={localNotes[apt._id] ?? apt.notes ?? ''} onChange={e => handleNoteChange(apt._id, e.target.value)}
                    className="input-field mt-1 min-h-[80px] text-xs w-full" placeholder="Write notes..." />
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </>
  )
}

function PatientView({ appointments, form, error, success, onChange, onSubmit, onCancel }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card p-5">
        <h2 className="text-base font-bold text-slate-900 mb-1">Book an Appointment</h2>
        <p className="text-xs text-slate-500 mb-4">Fill in the details and submit your request.</p>

        <form onSubmit={onSubmit} className="space-y-3">
          {[
            { label: 'Name',   name: 'name',    placeholder: 'Your name' },
            { label: 'Phone',  name: 'phone',   placeholder: 'Phone number' },
            { label: 'Reason', name: 'concern', placeholder: 'e.g. Fever, checkup' },
          ].map(f => (
            <div key={f.name}>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{f.label}</label>
              <input name={f.name} type="text" value={form[f.name]} onChange={onChange}
                className="input-field py-2.5 text-sm w-full" placeholder={f.placeholder} />
            </div>
          ))}

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Department</label>
            <select name="department" value={form.department} onChange={onChange} className="input-field py-2.5 text-sm w-full">
              {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date</label>
              <input name="date" type="date" value={form.date} onChange={onChange} className="input-field py-2.5 text-sm w-full" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Time</label>
              <input name="time" type="time" value={form.time} onChange={onChange} className="input-field py-2.5 text-sm w-full" />
            </div>
          </div>

          {error   && <p className="text-red-500 text-xs bg-red-50 border border-red-100 p-2.5 rounded-xl">{error}</p>}
          {success && <p className="text-green-700 text-xs bg-green-50 border border-green-100 p-2.5 rounded-xl flex items-center gap-2"><FaCheckCircle /> Appointment booked successfully.</p>}

          <button type="submit" className="btn-primary w-full py-2.5 text-sm">Request Appointment</button>
        </form>
      </motion.div>

      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card p-5">
        <h2 className="text-base font-bold text-slate-900 mb-1">Your Appointments</h2>
        <p className="text-xs text-slate-500 mb-4">Your requests and their statuses.</p>

        <div className="space-y-3">
          {appointments.length === 0 ? (
            <EmptyState message="No appointment requests yet." />
          ) : appointments.map(apt => (
            <div key={apt._id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{apt.date} · {apt.time}</p>
                  <p className="text-xs text-slate-600">{apt.concern}</p>
                </div>
                <StatusBadge status={apt.status} />
              </div>
              <div className="mt-2 grid gap-1 sm:grid-cols-2 text-xs text-slate-600">
                <div>Dept: <span className="font-semibold text-slate-800">{apt.department}</span></div>
                <div>Doctor: <span className="font-semibold text-slate-800">{apt.assignedDoctorName || 'Pending'}</span></div>
              </div>
              {apt.notes && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">Doctor's Notes</p>
                  <p className="text-xs text-slate-700 leading-relaxed">{apt.notes}</p>
                </div>
              )}
              {(apt.status === 'Pending' || apt.status === 'Upcoming') && (
                <button onClick={() => onCancel(apt._id)}
                  className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                  Cancel Request
                </button>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
