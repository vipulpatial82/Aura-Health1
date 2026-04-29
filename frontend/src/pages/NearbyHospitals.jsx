import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaHospital, FaSearchLocation, FaMapSigns, FaLocationArrow } from 'react-icons/fa';
import api from '../api/axiosInstance';

export default function NearbyHospitals() {
  const [location, setLocation] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handleApiCall = async (method, url, body = null) => {
    setLoading(true);
    setError('');
    try {
      const { data } = method === 'get'
        ? await api.get(url)
        : await api.post(url, body);
      if (data.success) {
        setHospitals(data.data);
        if (data.location) setLocation(data.location);
      } else {
        setError(data.message || 'Failed to fetch hospitals');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Network error. Please try again.');
    }
    setLoading(false);
  };

  const searchByLocation = () => {
    if (!location.trim()) return;
    handleApiCall('post', '/hospitals/search', { location });
  };

  const getAutoLocation = () => {
    handleApiCall('get', '/hospitals/auto-location');
  };

  return (
    <div className="p-4 md:p-6 min-h-[calc(100vh-56px)] bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-green-200 rounded-full blur-3xl opacity-40 pointer-events-none animate-float"></div>
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-yellow-200 rounded-full blur-3xl opacity-40 pointer-events-none animate-pulse-slow"></div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto text-center mb-6 relative z-10"
      >
        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl mx-auto flex items-center justify-center mb-3 shadow-sm border border-green-100">
          <FaHospital className="text-xl" />
        </div>
        <h1 className="text-2xl text-slate-800 font-extrabold mb-2 tracking-tight">
          Find Nearby Hospitals
        </h1>
        <p className="text-slate-500 text-sm">Locate healthcare facilities around you.</p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="max-w-2xl mx-auto mb-8 relative z-10"
      >
        <div className="card p-5 relative">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaSearchLocation className="text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Enter your city or area..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="input-field w-full pl-11 pr-4 py-3.5"
              />
            </div>
            <button
              onClick={searchByLocation}
              disabled={loading}
              className="btn-primary py-3.5 px-8 flex items-center justify-center gap-2"
            >
              Search
            </button>
          </div>
          
          <div className="flex items-center justify-center mb-4">
             <div className="h-px bg-slate-200 w-full"></div>
             <span className="px-4 text-xs font-bold text-slate-400 uppercase">OR</span>
             <div className="h-px bg-slate-200 w-full"></div>
          </div>

          <button
            onClick={getAutoLocation}
            disabled={loading}
            className="btn-secondary border-green-500 text-green-600 hover:text-green-700 w-full py-3.5 flex items-center justify-center gap-2"
          >
            <FaLocationArrow /> Use Current Location
          </button>
        </div>
      </motion.div>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-red-500 bg-red-50 p-4 rounded-xl max-w-2xl mx-auto border border-red-100 mb-8 font-medium">
          {error}
        </motion.div>
      )}

      {loading && (
        <div className="text-center text-green-600 flex items-center justify-center gap-3 mb-8 relative z-10">
           <svg className="animate-spin h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
           </svg>
           <span className="text-lg font-bold">Searching...</span>
        </div>
      )}

      {/* Google Maps Embed Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-6xl mx-auto mb-8 relative z-10 bg-white/70 backdrop-blur-xl p-2 rounded-2xl border border-white/50 shadow-xl"
      >
        <iframe
            title="Google Maps"
            width="100%"
            height="300"
            style={{ border: 0, borderRadius: '1.5rem' }}
            className="md:!h-[450px]"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://maps.google.com/maps?width=100%25&height=600&hl=en&q=${encodeURIComponent(location ? 'Hospitals in ' + location : 'Hospitals near me')}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
        ></iframe>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto relative z-10"
      >
        {hospitals.map((hospital, index) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            key={hospital.id} 
            className="card text-center p-5 flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                 <FaHospital />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1 leading-tight">{hospital.name}</h3>
              <p className="text-slate-500 mb-3 text-xs px-2">{hospital.address}</p>
            </div>
            <div>
               <div className="inline-block px-3 py-1 bg-rose-50 border border-rose-100 rounded-full mb-3">
                 <p className="text-rose-600 font-bold text-xs">{hospital.emergency}</p>
               </div>
               <button 
                 onClick={() => window.open(hospital.directionsUrl, '_blank')}
                 className="w-full bg-slate-800 text-white py-2 rounded-xl hover:bg-green-600 transition-colors font-bold text-sm shadow-md flex items-center justify-center gap-2 group-hover:bg-green-600"
               >
                 <FaMapSigns /> Get Directions
               </button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
