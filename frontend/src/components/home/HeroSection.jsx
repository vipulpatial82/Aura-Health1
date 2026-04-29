import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaShieldAlt, FaUserMd, FaHeartbeat } from 'react-icons/fa';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay },
});

export default function HeroSection({ isLoggedIn }) {
  return (
    <section className="relative pt-20 pb-12 lg:pt-28 lg:pb-20 overflow-hidden bg-slate-50">
      <div className="absolute top-[-10%] right-[-5%] w-72 h-72 bg-green-200 rounded-full blur-3xl opacity-30 pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] left-[-5%] w-64 h-64 bg-yellow-100 rounded-full blur-3xl opacity-40 pointer-events-none z-0" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center gap-10">

        {/* Left — text content */}
        <div className="lg:w-1/2 text-center lg:text-left">
          <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-100 text-green-700 font-bold text-xs mb-4 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            AuraHealth #1 Trusted Platform
          </motion.div>

          <motion.h1 {...fadeUp(0.1)} className="text-3xl lg:text-5xl font-black text-slate-800 tracking-tight leading-tight mb-4">
            Modern <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-400">Healthcare</span> at your fingertips.
          </motion.h1>

          <motion.p {...fadeUp(0.2)} className="text-sm text-slate-500 mb-6 max-w-lg mx-auto lg:mx-0 font-medium leading-relaxed">
            Track your vitals with AI analysis, manage medications, and find nearby hospitals — all from one dashboard.
          </motion.p>

          <motion.div {...fadeUp(0.3)} className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <Link to={isLoggedIn ? '/dashboard' : '/login'} className="btn-primary px-6 py-2.5 text-sm">
              {isLoggedIn ? 'Go to Dashboard' : 'Get Started'} <FaArrowRight />
            </Link>
            <Link to="/dashboard" className="btn-secondary px-6 py-2.5 text-sm">
              View Dashboard
            </Link>
          </motion.div>
        </div>

        {/* Right — floating illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="lg:w-1/2 relative"
        >
          <div className="relative w-full aspect-square max-w-sm mx-auto">
            <div className="absolute inset-0 bg-gradient-to-tr from-green-500 to-yellow-400 rounded-full opacity-10 animate-spin-slow" />

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-[10%] left-[5%] bg-white p-3 rounded-xl shadow-lg border border-slate-100 flex items-center gap-3 z-20"
            >
              <div className="w-8 h-8 rounded-full bg-green-50 flex justify-center items-center">
                <FaShieldAlt className="text-green-500 text-sm" />
              </div>
              <div>
                <p className="text-slate-800 font-bold text-xs">100% Secure</p>
                <p className="text-slate-400 text-xs">Data Privacy</p>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 14, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-[40%] right-[-5%] bg-white p-3 rounded-xl shadow-lg border border-slate-100 flex flex-col items-center gap-1 z-20"
            >
              <div className="w-10 h-10 rounded-full bg-yellow-50 flex justify-center items-center">
                <FaUserMd className="text-yellow-500 text-lg" />
              </div>
              <p className="text-slate-800 font-bold text-xs">Top Doctors</p>
            </motion.div>

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute bottom-[10%] left-[20%] bg-green-600 p-4 rounded-2xl shadow-lg text-white z-20"
            >
              <div className="flex items-center gap-3">
                <FaHeartbeat className="text-white text-base" />
                <span className="font-extrabold text-sm">AI Health</span>
              </div>
            </motion.div>

            <div className="absolute inset-8 rounded-full border-[16px] border-white shadow-2xl backdrop-blur-xl bg-gradient-to-br from-green-50 to-slate-50 flex items-center justify-center">
              <img src="/favicon.png" alt="AuraHealth" className="w-28 h-28 object-contain opacity-80" />
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
