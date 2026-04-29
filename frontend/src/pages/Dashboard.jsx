import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaHeartbeat, FaArrowRight, FaSearchPlus } from 'react-icons/fa';
import api from '../api/axiosInstance';

const riskColor = (level) => ({
  High:     'bg-red-100 text-red-700 border-red-200',
  Moderate: 'bg-amber-100 text-amber-700 border-amber-200',
})[level] ?? 'bg-green-100 text-green-700 border-green-200';

const metricColor = (val) => ({
  High:     'bg-red-50 border-red-100 text-red-600',
  Moderate: 'bg-amber-50 border-amber-100 text-amber-600',
})[val] ?? 'bg-green-50 border-green-100 text-green-600';

const Dashboard = ({ user }) => {
  const [formData, setFormData] = useState({ personalInfo: {}, medicalInfo: {} });
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    api.get('/health/data')
      .then(({ data }) => {
        if (data.success && data.data) {
          setFormData({
            personalInfo: data.data.personalInfo || {},
            medicalInfo:  data.data.medicalInfo  || {},
          });
          setAnalysis(data.data.analysis || null);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const stats = [
    { label: 'BMI',            value: analysis?.bmiValue ?? '—',  sub: analysis?.bmiStatus ?? 'No data', color: 'text-green-600' },
    { label: 'Weight',         value: formData.personalInfo.weight ? `${formData.personalInfo.weight} kg` : '—', sub: 'Current', color: 'text-blue-600' },
    { label: 'Heart Rate',     value: formData.medicalInfo.restingHeartRate ? `${formData.medicalInfo.restingHeartRate} bpm` : '—', sub: 'Resting', color: 'text-rose-600' },
    { label: 'Blood Pressure', value: (formData.medicalInfo.systolicBP && formData.medicalInfo.diastolicBP) ? `${formData.medicalInfo.systolicBP}/${formData.medicalInfo.diastolicBP}` : '—', sub: 'Latest', color: 'text-yellow-600' },
  ];

  return (
    <div className="p-4 md:p-6 min-h-[calc(100vh-56px)] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-72 h-72 bg-green-200/40 rounded-full blur-3xl opacity-30 pointer-events-none animate-float"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-200/40 rounded-full blur-3xl opacity-30 pointer-events-none animate-pulse-slow"></div>

      <div className="max-w-5xl mx-auto relative z-10">

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800">
              Welcome back{user ? `, ${user.name.split(' ')[0]}` : ''}
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">Your daily health overview.</p>
          </div>
          {!user && (
            <p className="text-yellow-700 py-1.5 px-4 rounded-xl border border-yellow-200 bg-yellow-50 font-semibold text-xs">
              Login for live data sync.
            </p>
          )}
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {stats.map((s, i) => (
                <div key={i} className="glass-panel p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{s.label}</p>
                  <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{s.sub}</p>
                </div>
              ))}
            </motion.div>

            {analysis ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                <div className="lg:col-span-2 glass-panel p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-extrabold flex items-center gap-2 text-slate-800">
                      <FaHeartbeat className="text-rose-500" /> AI Health Summary
                    </h2>
                    <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${riskColor(analysis.healthRiskLevel)}`}>
                      {analysis.healthRiskLevel} Risk
                    </span>
                  </div>

                  <div className="bg-white/80 rounded-xl p-4 border border-slate-100 mb-4 border-l-4 border-l-green-500">
                    <p className="text-sm font-semibold text-slate-700 leading-relaxed">{analysis.suggestedAction}</p>
                  </div>

                  {analysis.detailedAnalysis && (
                    <>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Risk Breakdown</p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {Object.entries(analysis.detailedAnalysis).map(([key, val]) => (
                          <div key={key} className={`p-3 rounded-xl border ${metricColor(val)}`}>
                            <span className="block text-[10px] font-bold uppercase tracking-wide mb-1 truncate text-slate-500">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <span className="block text-sm font-black">{val}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="glass-panel p-5 bg-gradient-to-br from-blue-500 to-indigo-600 border-none text-white">
                    <h3 className="text-sm font-bold mb-1">Update Vitals</h3>
                    <p className="text-blue-100 text-xs mb-4 leading-relaxed">Keep your analysis current with latest numbers.</p>
                    <Link to="/personal-data" className="btn-secondary w-full text-xs py-2 border-none text-indigo-700 bg-white/90 hover:bg-white shadow-none">
                      Update Data <FaArrowRight />
                    </Link>
                  </div>
                  <div className="glass-panel p-5 bg-gradient-to-br from-green-500 to-emerald-600 border-none text-white">
                    <h3 className="text-sm font-bold mb-1">AI Consult</h3>
                    <p className="text-green-100 text-xs mb-4 leading-relaxed">Discuss your risk factors with our medical AI.</p>
                    <Link to="/chat-ai" className="btn-secondary w-full text-xs py-2 border-none text-green-700 bg-white/90 shadow-none">
                      Start Chat <FaArrowRight />
                    </Link>
                  </div>
                </div>

              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-10 text-center">
                <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FaSearchPlus className="text-2xl" />
                </div>
                <h2 className="text-lg font-extrabold text-slate-800 mb-2">No Health Data Yet</h2>
                <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">Enter your medical data to get an AI-powered health risk analysis.</p>
                <Link to="/personal-data" className="btn-primary inline-flex text-sm px-6 py-2.5">
                  Add Health Data <FaArrowRight />
                </Link>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
