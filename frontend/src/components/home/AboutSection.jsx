import React from 'react';
import { motion } from 'framer-motion';
import { FaCheckCircle } from 'react-icons/fa';

const bullets = [
  '24/7 Availability of Medical AI',
  'Verified and Expert Doctors',
  'Strict Data Encryption',
  'Tailored Health Dashboards',
];

export default function AboutSection() {
  return (
    <section className="py-14 md:py-16 bg-slate-50 overflow-hidden relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 md:gap-10 items-center">

        <motion.div
          initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
          className="relative md:col-span-1 lg:col-span-5"
        >
          <div className="w-full aspect-[4/3] rounded-3xl bg-gradient-to-tr from-green-600 to-yellow-400 p-1 transform -rotate-2 overflow-hidden shadow-xl">
            <div className="w-full h-full bg-slate-900 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#4ADE80 2px, transparent 2px)', backgroundSize: '24px 24px' }}></div>
              <div className="z-10 text-center">
                <p className="text-green-400 font-bold uppercase tracking-widest text-xs">AuraHealth</p>
                <p className="text-white text-sm font-semibold mt-2">AI-Powered Healthcare</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
          className="md:col-span-1 lg:col-span-7"
        >
          <p className="section-kicker">About AuraHealth</p>
          <h3 className="section-title leading-tight">Pioneering the future of digital health.</h3>
          <p className="text-slate-500 text-sm md:text-base mb-5 font-medium leading-relaxed">
            Our mission is to bridge the gap between world-class medical professionals and daily health tracking — delivering a personalised medical experience straight from your home.
          </p>

          <div className="space-y-2.5 mb-6">
            {bullets.map((point, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <FaCheckCircle className="text-green-500 text-sm flex-shrink-0" />
                <span className="text-slate-700 font-semibold text-sm break-words">{point}</span>
              </div>
            ))}
          </div>

          <button className="btn-primary px-6 py-2.5 text-sm">Explore Platform</button>
        </motion.div>

      </div>
    </section>
  );
}
