import React from 'react';
import { Link } from 'react-router-dom';
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 py-10 md:py-12 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 mb-8">

          <div>
            <h3 className="text-lg md:text-xl font-extrabold bg-gradient-to-r from-green-400 to-yellow-400 bg-clip-text text-transparent mb-3">
              AuraHealth
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              AI-powered healthcare platform built for India. Empowering every citizen with smart health tools, risk analysis, and nearby hospital access.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 uppercase text-xs tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-sm font-medium">
              {[
                { label: 'Dashboard', path: '/dashboard' },
                { label: 'Nearby Hospitals', path: '/nearby-hospitals' },
                { label: 'Chat AI', path: '/chat-ai' },
                { label: 'Medications', path: '/medication-tracker' },
                { label: 'Appointments', path: '/appointments' },
              ].map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-slate-400 hover:text-green-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 uppercase text-xs tracking-wider">Contact</h4>
            <ul className="space-y-2.5 text-sm font-medium">
              <li className="flex items-start gap-2.5">
                <FaMapMarkerAlt className="text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-400">Hamirpur,Himachal Pradesh</span>
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
          <p className="text-xs sm:text-sm text-slate-500 text-center sm:text-left">
            &copy; {new Date().getFullYear()} AuraHealth India. All rights reserved.
          </p>
          <p className="text-xs sm:text-sm text-slate-600">
             Made By vipul patial
          </p>
        </div>
      </div>
    </footer>
  );
}
