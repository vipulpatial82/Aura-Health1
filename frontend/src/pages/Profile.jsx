import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaLock, FaCheckCircle } from 'react-icons/fa';
import api from '../api/axiosInstance';

export default function Profile({ user, onUpdate }) {
  const [name, setName]                   = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage]             = useState({ text: '', type: '' });
  const [loading, setLoading]             = useState(false);

  const showMsg = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return showMsg('Name cannot be empty.', 'error');
    if (newPassword && newPassword !== confirmPassword) return showMsg('New passwords do not match.', 'error');
    if (newPassword && newPassword.length < 8) return showMsg('New password must be at least 8 characters.', 'error');

    setLoading(true);
    try {
      const payload = { name };
      if (newPassword) { payload.currentPassword = currentPassword; payload.newPassword = newPassword; }

      const { data } = await api.put('/auth/profile', payload);
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.data));
        onUpdate(data.data);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        showMsg('Profile updated successfully!', 'success');
      }
    } catch (err) {
      showMsg(err.response?.data?.message || 'Update failed.', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="p-4 md:p-6 min-h-[calc(100vh-56px)] bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-72 h-72 bg-green-200 rounded-full blur-3xl opacity-20 pointer-events-none" />

      <div className="max-w-lg mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl mx-auto flex items-center justify-center mb-3 border border-green-100 text-2xl font-black">
            {user?.name?.charAt(0) || <FaUser />}
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800">Account Settings</h1>
          <p className="text-slate-500 text-sm mt-1">{user?.email}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  className="input-field pl-9 py-2.5 text-sm w-full" placeholder="Your full name" />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <p className="text-xs font-bold text-slate-500 uppercase mb-3">Change Password <span className="text-slate-400 font-normal normal-case">(leave blank to keep current)</span></p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Current Password</label>
                  <div className="relative">
                    <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                    <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                      className="input-field pl-9 py-2.5 text-sm w-full" placeholder="Enter current password" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">New Password</label>
                  <div className="relative">
                    <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                      className="input-field pl-9 py-2.5 text-sm w-full" placeholder="Min 8 characters" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Confirm New Password</label>
                  <div className="relative">
                    <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                      className="input-field pl-9 py-2.5 text-sm w-full" placeholder="Repeat new password" />
                  </div>
                </div>
              </div>
            </div>

            {message.text && (
              <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                message.type === 'success' ? 'bg-green-50 border border-green-100 text-green-700' : 'bg-red-50 border border-red-100 text-red-600'
              }`}>
                {message.type === 'success' && <FaCheckCircle />} {message.text}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 text-sm">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
