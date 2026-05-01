import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCalendarPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const DEPARTMENTS = ['General Physician', 'Cardiology', 'Neurology', 'Orthopedics', 'Dermatology', 'Pediatrics'];

export default function AppointmentForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', concern: '', department: 'General Physician', date: '', time: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.date < today) { alert('Please select a future date.'); return; }
    sessionStorage.setItem('pendingAppointment', JSON.stringify(form));
    navigate('/appointments');
  };

  return (
    <section className="py-14 md:py-16 bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-b from-green-600 to-emerald-500 transform skew-x-12 translate-x-32 hidden lg:block z-0"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

        <div>
          <h3 className="text-2xl lg:text-4xl font-black text-slate-800 leading-tight mb-3">
            Ready to take <span className="text-green-600">control</span> of your health?
          </h3>
          <p className="text-sm md:text-base text-slate-500 font-medium max-w-sm">
            Secure your digital consultation in less than 60 seconds.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="card p-5 sm:p-6 rounded-3xl border border-slate-100/80"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-yellow-100 text-yellow-600 flex items-center justify-center text-base">
              <FaCalendarPlus />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Book Visit</h3>
          </div>

          <form className="space-y-3.5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                <input name="name" type="text" value={form.name} onChange={handleChange}
                  required className="input-field py-2.5 text-sm" placeholder="e.g. Rahul Sharma" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</label>
                <input name="phone" type="text" value={form.phone} onChange={handleChange}
                  required className="input-field py-2.5 text-sm" placeholder="+91 98765 43210" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Reason</label>
              <input name="concern" type="text" value={form.concern} onChange={handleChange}
                required className="input-field py-2.5 text-sm" placeholder="e.g. Fever, checkup" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Department</label>
              <select name="department" value={form.department} onChange={handleChange}
                className="input-field py-2.5 text-sm appearance-none">
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date</label>
                <input name="date" type="date" value={form.date} onChange={handleChange}
                  required min={today} className="input-field py-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Time</label>
                <input name="time" type="time" value={form.time} onChange={handleChange}
                  required className="input-field py-2.5 text-sm" />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full py-3 text-sm mt-1">
              Confirm Appointment
            </button>
          </form>
        </motion.div>

      </div>
    </section>
  );
}
