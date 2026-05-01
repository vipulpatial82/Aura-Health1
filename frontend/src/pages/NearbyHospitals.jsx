import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHospital, FaSearchLocation, FaMapSigns, FaLocationArrow, FaPhone, FaClock, FaMapMarkerAlt, FaWifi, FaMapPin, FaSearch } from 'react-icons/fa';
import api from '../api/axiosInstance';

export default function NearbyHospitals() {
  const [location, setLocation]         = useState('');
  const [mapQuery, setMapQuery]         = useState('Hospitals near me');
  const [hospitals, setHospitals]       = useState([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [locationSource, setLocationSource] = useState('');

  const handleSuccess = (data, loc, source) => {
    setHospitals(data.data || []);
    if (loc) {
      setLocation(loc);
      setMapQuery('Hospitals in ' + loc);
    }
    setLocationSource(source);
  };

  const searchByLocation = async () => {
    if (!location.trim()) return;
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/hospitals/search', { location }, { timeout: 35000 });
      if (data.success) handleSuccess(data, data.location || location, 'manual');
      else setError(data.message || 'No hospitals found');
    } catch (err) {
      setError(err.response?.data?.message || 'Search timed out. Please try again.');
    } finally { setLoading(false); }
  };

  const getAutoLocation = async () => {
    setLoading(true); setError('');
    try {
      const position = await new Promise((resolve, reject) =>
        navigator.geolocation
          ? navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 12000 })
          : reject(new Error('Geolocation not supported'))
      );
      const { latitude, longitude } = position.coords;
      const { data } = await api.post('/hospitals/nearby', { latitude, longitude });
      if (!data.success) throw new Error(data.message);
      const loc = `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`;
      handleSuccess(data, loc, 'device');
    } catch {
      try {
        const { data } = await api.get('/hospitals/auto-location');
        if (!data.success) throw new Error(data.message);
        handleSuccess(data, data.location, 'ip');
      } catch {
        setError('Could not detect location. Allow location permission or type your city.');
      }
    } finally { setLoading(false); }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') searchByLocation(); };

  return (
    <div className="p-4 md:p-6 min-h-[calc(100vh-56px)] bg-gradient-to-br from-slate-50 via-white to-green-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-green-200 rounded-full blur-3xl opacity-30 pointer-events-none animate-float" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-200 rounded-full blur-3xl opacity-30 pointer-events-none animate-pulse-slow" />

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-7">
          <div className="w-14 h-14 bg-white text-green-600 rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-md border border-green-100">
            <FaHospital className="text-xl" />
          </div>
          <h1 className="text-2xl md:text-3xl text-slate-800 font-extrabold mb-2 tracking-tight">Find Nearby Hospitals</h1>
          <p className="text-slate-500 text-sm">Locate healthcare facilities around you in seconds.</p>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="max-w-2xl mx-auto mb-8">
          <div className="card p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <FaSearchLocation className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input type="text" placeholder="Enter city or area..." value={location}
                  onChange={(e) => setLocation(e.target.value)} onKeyDown={handleKeyDown}
                  className="input-field w-full pl-11 py-3" />
              </div>
              <button onClick={searchByLocation} disabled={loading || !location.trim()}
                className="btn-primary py-3 px-6 sm:w-auto w-full">
                Search
              </button>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px bg-slate-200 flex-1" />
              <span className="text-xs font-bold text-slate-400 uppercase">or</span>
              <div className="h-px bg-slate-200 flex-1" />
            </div>
            <button onClick={getAutoLocation} disabled={loading}
              className="btn-secondary w-full py-3 text-green-600 hover:text-green-700 flex items-center justify-center gap-2">
              <FaLocationArrow /> Use Current Location
            </button>
            {locationSource && (
              <p className="text-center text-xs text-slate-400 mt-2 flex items-center justify-center gap-1.5">
                {locationSource === 'device' ? <FaMapPin className="text-green-500" /> : locationSource === 'ip' ? <FaWifi className="text-blue-400" /> : <FaSearch className="text-slate-400" />}
                {locationSource === 'device' ? 'Device GPS' : locationSource === 'ip' ? 'Network IP' : 'Manual search'}
              </p>
            )}
          </div>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-red-600 bg-red-50 p-4 rounded-xl max-w-2xl mx-auto border border-red-100 mb-6 text-sm text-center font-medium">
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center gap-3 mb-8 text-green-600">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600" />
            <span className="font-bold">Searching...</span>
          </div>
        )}

        {/* Map */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="mb-8 bg-white/80 backdrop-blur-xl p-2 rounded-2xl border border-white/60 shadow-xl">
          <iframe
            title="Google Maps"
            width="100%"
            className="h-[260px] sm:h-[340px] md:h-[420px] rounded-2xl"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://maps.google.com/maps?width=100%25&height=600&hl=en&q=${encodeURIComponent(mapQuery)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
          />
        </motion.div>

        {/* Hospital Cards */}
        <AnimatePresence>
          {hospitals.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                  <FaHospital className="text-rose-500" /> {hospitals.length} Hospitals Found
                </h2>
                <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">near {location}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {hospitals.map((hospital, index) => (
                  <motion.div key={hospital.id}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                    className="card p-5 flex flex-col justify-between group hover:-translate-y-1">
                    <div>
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                          <FaHospital />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-800 leading-tight">{hospital.name}</h3>
                          <div className="flex items-center gap-1 mt-1">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              hospital.emergency === '24/7 Emergency'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-slate-100 text-slate-500'
                            }`}>
                              {hospital.emergency}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5 mb-4">
                        {hospital.address && hospital.address !== 'Address not available' && (
                          <div className="flex items-start gap-2 text-xs text-slate-500">
                            <FaMapMarkerAlt className="text-slate-400 mt-0.5 flex-shrink-0" />
                            <span>{hospital.address}</span>
                          </div>
                        )}
                        {hospital.phone && hospital.phone !== 'Contact info not available' && (
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <FaPhone className="text-slate-400 flex-shrink-0" />
                            <span>{hospital.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <FaClock className="text-slate-400 flex-shrink-0" />
                          <span>{hospital.emergency === '24/7 Emergency' ? 'Open 24 hours' : 'Regular hours'}</span>
                        </div>
                      </div>
                    </div>

                    <button onClick={() => window.open(hospital.directionsUrl, '_blank')}
                      className="w-full bg-slate-800 text-white py-2.5 rounded-xl hover:bg-green-600 transition-colors font-bold text-sm flex items-center justify-center gap-2 group-hover:bg-green-600">
                      <FaMapSigns /> Get Directions
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {!loading && hospitals.length === 0 && locationSource && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-12 text-slate-400">
            <FaHospital className="text-4xl mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No hospitals found in this area.</p>
            <p className="text-sm mt-1">Try a different location or expand your search.</p>
          </motion.div>
        )}

      </div>
    </div>
  );
}
