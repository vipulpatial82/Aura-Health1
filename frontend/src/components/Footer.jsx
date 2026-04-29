import React from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-10 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

          <div>
            <h3 className="text-lg font-extrabold bg-gradient-to-r from-green-400 to-yellow-400 bg-clip-text text-transparent mb-3">
              AuraHealth
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              AI-powered healthcare platform built for India. Empowering every citizen with smart health tools, risk analysis, and nearby hospital access.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 uppercase text-xs tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-xs font-medium">
              {['Dashboard', 'Nearby Hospitals', 'Chat AI', 'Medications', 'Appointments'].map((link) => (
                <li key={link}><a href="#" className="text-slate-400 hover:text-green-400 transition-colors">{link}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 uppercase text-xs tracking-wider">Contact</h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li className="flex items-start gap-2.5">
                <FaMapMarkerAlt className="text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-400">New Delhi, India – 110001</span>
              </li>
              <li className="flex items-center gap-2.5">
                <FaPhone className="text-green-400 flex-shrink-0" />
                <span className="text-slate-400">+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2.5">
                <FaEnvelope className="text-green-400 flex-shrink-0" />
                <span className="text-slate-400">support@aurahealth.in</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-800 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} AuraHealth India. All rights reserved.
          </p>
          <p className="text-xs text-slate-600">
            🇮🇳 Made in India
          </p>
        </div>
      </div>
    </footer>
  );
}
