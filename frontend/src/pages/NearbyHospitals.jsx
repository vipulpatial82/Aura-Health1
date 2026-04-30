import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaHospital, FaSearchLocation, FaMapSigns, FaLocationArrow } from 'react-icons/fa';
import api from '../api/axiosInstance';

export default function NearbyHospitals() {
  const [location, setLocation] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationSource, setLocationSource] = useState('');

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
        setLocationSource(method === 'get' ? 'ip' : locationSource);
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
    setLocationSource('manual');
    handleApiCall('post', '/hospitals/search', { location });
  };

  const getBrowserLocation = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported on this device/browser.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 300000,
      });
    });

  const getAutoLocation = async () => {
    setLoading(true);
    setError('');
    try {
      // Use device GPS first (best for iPhone/Android), then fallback to backend IP location.
      const position = await getBrowserLocation();
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      const { data } = await api.post('/hospitals/nearby', { latitude, longitude });
      if (!data.success) throw new Error(data.message || 'Could not detect location');

      setHospitals(data.data);
      setLocation(`Lat ${latitude.toFixed(3)}, Lng ${longitude.toFixed(3)}`);
      setLocationSource('device');
    } catch (geoErr) {
      try {
        const { data } = await api.get('/hospitals/auto-location');
        if (!data.success) throw new Error(data.message || 'Could not detect location');
        setHospitals(data.data);
        if (data.location) setLocation(data.location);
        setLocationSource('ip');
      } catch (ipErr) {
        setError(
          'Could not detect location. Allow browser location permission and try again, or type your city manually.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 min-h-[calc(100vh-56px)] bg-gradient-to-b from-slate-50 to-emerald-50/40 relative overflow-hidden">
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-green-200 rounded-full blur-3xl opacity-35 pointer-events-none animate-float"></div>
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-yellow-200 rounded-full blur-3xl opacity-35 pointer-events-none animate-pulse-slow"></div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto text-center mb-7 relative z-10"
      >
        <div className="w-14 h-14 bg-white text-green-600 rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-md border border-green-100">
          <FaHospital className="text-xl" />
        </div>
        <h1 className="text-2xl md:text-3xl text-slate-800 font-extrabold mb-2 tracking-tight">
          Find Nearby Hospitals
        </h1>
        <p className="text-slate-500 text-sm md:text-base">Locate healthcare facilities around you in seconds.</p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="max-w-2xl mx-auto mb-8 relative z-10"
      >
        <div className="card p-4 sm:p-5 md:p-6 relative">
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
                className="btn-primary py-3.5 px-8 flex items-center justify-center gap-2 sm:w-auto w-full"
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
          {locationSource && (
            <p className="text-center text-xs text-slate-500 mt-3">
              Location source: {locationSource === 'device' ? 'Device GPS' : locationSource === 'ip' ? 'Network IP' : 'Manual search'}
            </p>
          )}
        </div>
      </motion.div>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-red-600 bg-red-50 p-4 rounded-xl max-w-2xl mx-auto border border-red-100 mb-8 font-medium text-sm">
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
        className="max-w-6xl mx-auto mb-8 relative z-10 bg-white/80 backdrop-blur-xl p-2 rounded-2xl border border-white/60 shadow-xl"
      >
        <iframe
            title="Google Maps"
            width="100%"
            height="280"
            style={{ border: 0, borderRadius: '1.5rem' }}
            className="h-[280px] sm:h-[320px] md:!h-[450px]"
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
            className="card text-center p-5 flex flex-col justify-between group h-full"
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
