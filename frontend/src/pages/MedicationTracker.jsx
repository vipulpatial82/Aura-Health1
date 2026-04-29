import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPills, FaClock, FaCheckCircle, FaPlus, FaCalendarAlt, FaTrash } from 'react-icons/fa';
import api from '../api/axiosInstance';

const EMPTY_MED = { name: '', dosage: '', time: '', type: 'General' };

function AddMedicationModal({ onSave, onClose }) {
  const [form, setForm] = useState(EMPTY_MED);
  const [loading, setLoading] = useState(false);
  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSave = async () => {
    if (!form.name || !form.time) return;
    setLoading(true);
    await onSave(form);
    setLoading(false);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="max-w-md w-full rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Gradient header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-400 px-6 py-5">
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            <FaPills /> New Medication
          </h2>
          <p className="text-green-100 text-xs mt-0.5">Fill in your medication details below</p>
        </div>

        {/* Body */}
        <div className="bg-white px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Medication Name</label>
            <input type="text" value={form.name} onChange={set('name')} placeholder="e.g. Vitamin C"
              className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Dosage</label>
              <input type="text" value={form.dosage} onChange={set('dosage')} placeholder="e.g. 1 Pill"
                className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Time</label>
              <input type="time" value={form.time} onChange={set('time')} className="input-field text-slate-700" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 flex gap-3 border-t border-slate-100">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={loading} className="flex-1 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-600 hover:to-emerald-500 transition-all disabled:opacity-60 shadow-md">
            {loading ? 'Saving...' : 'Save Medication'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function MedicationTracker() {
  const [medications, setMedications] = useState([]);
  const [showModal, setShowModal]     = useState(false);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    api.get('/medications').then(({ data }) => {
      if (data.success) setMedications(data.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const addMedication = async (form) => {
    const { data } = await api.post('/medications', form);
    if (data.success) setMedications(prev => [...prev, data.data]);
  };

  const toggleTaken = async (id) => {
    const { data } = await api.patch(`/medications/${id}/toggle`);
    if (data.success) setMedications(prev => prev.map(m => m._id === id ? data.data : m));
  };

  const deleteMedication = async (id) => {
    await api.delete(`/medications/${id}`);
    setMedications(prev => prev.filter(m => m._id !== id));
  };

  const resetAll = async () => {
    await api.post('/medications/reset');
    setMedications(prev => prev.map(m => ({ ...m, status: 'pending' })));
  };

  const takenCount   = medications.filter(m => m.status === 'taken').length;
  const pendingCount = medications.filter(m => m.status === 'pending').length;

  const summaryCards = [
    { label: 'Total Today', value: medications.length, icon: FaCalendarAlt, iconBg: 'bg-blue-50 text-blue-500',  numColor: 'text-blue-600'  },
    { label: 'Taken',       value: takenCount,          icon: FaCheckCircle, iconBg: 'bg-green-50 text-green-500', numColor: 'text-green-600' },
    { label: 'Pending',     value: pendingCount,        icon: FaClock,       iconBg: 'bg-amber-50 text-amber-500', numColor: 'text-amber-600' },
  ];

  return (
    <div className="p-4 md:p-6 min-h-[calc(100vh-80px)] bg-gradient-to-br from-slate-50 via-white to-green-50 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-green-200 rounded-full blur-3xl opacity-40 pointer-events-none z-0 animate-float" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-yellow-200 rounded-full blur-3xl opacity-40 pointer-events-none z-0 animate-pulse-slow" />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between mb-5 gap-3">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shadow-sm border border-green-100">
                <FaPills className="text-lg" />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-800 dark:text-green-500 tracking-tight">MedTracker</h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Your daily medication schedule.</p>
          </div>
          <div className="flex gap-2">
            {takenCount > 0 && (
              <button onClick={resetAll} className="btn-secondary text-xs px-4 py-2.5">Reset Day</button>
            )}
            <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 px-5 py-2.5">
              <FaPlus /> Add Medication
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {summaryCards.map(({ label, value, icon: Icon, iconBg, numColor }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBg}`}>
                <Icon className="text-lg" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
                <h3 className={`text-2xl font-black ${numColor}`}>{value}</h3>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FaCalendarAlt className="text-green-500" /> Today's Schedule
          </h2>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {medications.map((med, idx) => (
                  <motion.div
                    key={med._id}
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => toggleTaken(med._id)}
                    className={`p-4 md:p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group cursor-pointer
                      ${med.status === 'taken' ? 'bg-green-50 border-green-100' : 'bg-white border-slate-200 hover:border-green-300 hover:shadow-md'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors
                        ${med.status === 'taken' ? 'bg-green-500 text-white shadow-green-200 shadow-lg' : 'bg-slate-50 text-slate-400 group-hover:text-green-500 border border-slate-200'}`}>
                        {med.status === 'taken' ? <FaCheckCircle className="text-xl" /> : <FaPills className="text-xl" />}
                      </div>
                      <div>
                        <h3 className={`text-lg font-bold transition-colors ${med.status === 'taken' ? 'text-green-800 line-through opacity-60' : 'text-slate-800'}`}>
                          {med.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full border border-slate-200">{med.dosage}</span>
                          <span className="text-xs font-semibold text-slate-400">{med.type}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto mt-2 md:mt-0 pl-16 md:pl-0">
                      <div className={`flex items-center gap-2 text-sm font-semibold ${med.status === 'taken' ? 'text-green-600/70' : 'text-slate-500'}`}>
                        {med.status === 'taken' ? <FaCheckCircle /> : <FaClock />}
                        {med.time}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleTaken(med._id); }}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all
                          ${med.status === 'taken' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg'}`}
                      >
                        {med.status === 'taken' ? 'Undo' : 'Mark as Taken'}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteMedication(med._id); }}
                        className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {medications.length === 0 && (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-green-50 text-green-400 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FaCheckCircle className="text-2xl" />
                  </div>
                  <p className="text-slate-400 font-medium">No medications added yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showModal && <AddMedicationModal onSave={addMedication} onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </div>
  );
}
