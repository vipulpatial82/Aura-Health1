import React from 'react';
import { motion } from 'framer-motion';
import { FaLaptopMedical, FaRobot, FaPills, FaChartLine } from 'react-icons/fa';

const services = [
  { title: 'Online Bookings', description: 'Schedule appointments effortlessly with verified doctors.', icon: <FaLaptopMedical />, color: 'text-blue-500', bg: 'bg-blue-50' },
  { title: 'AI Health Chat', description: 'Get instant AI-guided health suggestions anywhere.', icon: <FaRobot />, color: 'text-green-500', bg: 'bg-green-50' },
  { title: 'Medication Tracker', description: 'Never miss a pill with our daily tracking dashboard.', icon: <FaPills />, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  { title: 'Vital Analytics', description: 'Input your vitals for a precise AI health score.', icon: <FaChartLine />, color: 'text-rose-500', bg: 'bg-rose-50' },
];

export default function ServicesSection() {
  return (
    <section className="py-14 md:py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-9">
          <p className="section-kicker">Our Services</p>
          <h3 className="section-title">Comprehensive Care Ecosystem</h3>
          <p className="section-desc">Hospital-grade digital care tools, designed with a clean and simple experience.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((service, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08, duration: 0.4 }}
              whileHover={{ y: -3 }}
              className="card p-5 rounded-2xl border border-slate-100/80 hover:border-green-100 transition-all cursor-pointer group h-full"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg mb-4 group-hover:scale-110 transition-transform ${service.bg} ${service.color}`}>
                {service.icon}
              </div>
              <h4 className="text-base font-bold text-slate-800 mb-1.5">{service.title}</h4>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
