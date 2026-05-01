import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHeartbeat, FaHome } from 'react-icons/fa';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md">
        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-green-100">
          <FaHeartbeat className="text-4xl" />
        </div>
        <h1 className="text-7xl font-black text-slate-800 mb-2">404</h1>
        <h2 className="text-xl font-bold text-slate-600 mb-3">Page Not Found</h2>
        <p className="text-slate-400 text-sm mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn-primary inline-flex px-8 py-3">
          <FaHome /> Back to Home
        </Link>
      </motion.div>
    </div>
  );
}
