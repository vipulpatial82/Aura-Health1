import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUserMd, FaHeartbeat, FaRobot, FaCheckCircle, FaHistory, FaFilePdf } from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import api from '../api/axiosInstance';

const riskColor = (v) =>
  v === 'High' ? 'bg-red-50 border-red-100 text-red-600' :
  v === 'Moderate' ? 'bg-amber-50 border-amber-100 text-amber-600' :
  v === 'Low' ? 'bg-green-50 border-green-100 text-green-600' :
  'bg-slate-50 border-slate-100 text-slate-400';

// Field definitions with validation ranges
const MEDICAL_FIELDS = [
  { key: 'diabetes',         label: 'Fasting Sugar (mg/dL)', placeholder: 'e.g. 95',  min: 30,  max: 600  },
  { key: 'hba1c',            label: 'HbA1c (%)',             placeholder: 'e.g. 5.4', min: 2,   max: 20   },
  { key: 'systolicBP',       label: 'Systolic BP',           placeholder: 'e.g. 120', min: 60,  max: 250  },
  { key: 'diastolicBP',      label: 'Diastolic BP',          placeholder: 'e.g. 80',  min: 40,  max: 150  },
  { key: 'restingHeartRate', label: 'Heart Rate (bpm)',       placeholder: 'e.g. 72',  min: 30,  max: 220  },
  { key: 'oxygenSaturation', label: 'Oxygen Saturation (%)', placeholder: 'e.g. 98',  min: 50,  max: 100  },
  { key: 'totalCholesterol', label: 'Total Cholesterol',     placeholder: 'e.g. 180', min: 50,  max: 600  },
  { key: 'ldlCholesterol',   label: 'LDL Cholesterol',       placeholder: 'e.g. 100', min: 10,  max: 400  },
  { key: 'hdlCholesterol',   label: 'HDL Cholesterol',       placeholder: 'e.g. 60',  min: 10,  max: 150  },
  { key: 'triglycerides',    label: 'Triglycerides',         placeholder: 'e.g. 130', min: 20,  max: 1000 },
];

function validate(personalInfo, medicalInfo) {
  const errors = {};
  if (!personalInfo.fullName?.trim()) errors.fullName = 'Name is required';
  if (!personalInfo.age || personalInfo.age < 1 || personalInfo.age > 120) errors.age = 'Age must be 1–120';
  if (personalInfo.weight && (personalInfo.weight < 10 || personalInfo.weight > 300)) errors.weight = 'Weight must be 10–300 kg';
  if (personalInfo.height && (personalInfo.height < 50 || personalInfo.height > 250)) errors.height = 'Height must be 50–250 cm';

  MEDICAL_FIELDS.forEach(({ key, label, min, max }) => {
    const val = medicalInfo[key];
    if (val !== '' && val !== undefined && val !== null) {
      if (Number(val) < min || Number(val) > max) errors[key] = `${label} must be ${min}–${max}`;
    }
  });
  return errors;
}

function Field({ label, value, onChange, placeholder, type = 'number', error }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`input-field py-2.5 text-sm ${error ? 'border-red-300 focus:ring-red-400' : ''}`}
      />
      {error && <p className="text-red-500 text-xs mt-0.5">{error}</p>}
    </div>
  );
}

export default function PersonalData() {
  const [personalInfo, setPersonalInfo] = useState({ fullName: '', age: '', bloodGroup: '', weight: '', height: '' });
  const [medicalInfo, setMedicalInfo]   = useState({
    diabetes: '', hba1c: '', systolicBP: '', diastolicBP: '',
    restingHeartRate: '', oxygenSaturation: '',
    totalCholesterol: '', ldlCholesterol: '', hdlCholesterol: '', triglycerides: '',
    additionalNotes: '',
  });
  const [analysis, setAnalysis]   = useState(null);
  const [history, setHistory]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [message, setMessage]     = useState({ text: '', type: '' });
  const [errors, setErrors]       = useState({});
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    api.get('/health/data').then(({ data }) => {
      if (data.success && data.data) {
        if (data.data.personalInfo) setPersonalInfo(prev => ({ ...prev, ...data.data.personalInfo }));
        if (data.data.medicalInfo)  setMedicalInfo(prev => ({ ...prev, ...data.data.medicalInfo }));
        if (data.data.analysis)     setAnalysis(data.data.analysis);
      }
    }).catch(() => {});

    api.get('/health/history').then(({ data }) => {
      if (data.success) setHistory(data.data);
    }).catch(() => {});
  }, []);

  const setP = (field) => (val) => setPersonalInfo(prev => ({ ...prev, [field]: val }));
  const setM = (field) => (val) => setMedicalInfo(prev => ({ ...prev, [field]: val }));

  const handleSubmit = async () => {
    const validationErrors = validate(personalInfo, medicalInfo);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setMessage({ text: 'Please fix the errors before submitting.', type: 'error' });
      return;
    }
    setErrors({});
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      const { data } = await api.post('/health/save', { personalInfo, medicalInfo });
      if (data.success) {
        setAnalysis(data.data.analysis);
        setMessage({ text: 'AI analysis complete!', type: 'success' });
        api.get('/health/history').then(({ data }) => { if (data.success) setHistory(data.data); }).catch(() => {});
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Analysis failed. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (score) => score >= 75 ? 'text-green-600' : score >= 50 ? 'text-amber-500' : 'text-red-500';

  const exportPDF = () => {
    if (!analysis) return;
    const doc = new jsPDF();
    const { fullName, age, weight, height, bloodGroup } = personalInfo;
    let y = 20;
    const line = (text, size = 11, bold = false) => {
      doc.setFontSize(size);
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.text(text, 20, y);
      y += size * 0.6 + 4;
    };
    const gap = (n = 4) => { y += n; };

    line('AuraHealth — Personal Health Report', 16, true);
    line(`Generated: ${new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}`, 9);
    gap();
    line('Patient Information', 13, true);
    line(`Name: ${fullName || '—'}   Age: ${age || '—'}   Blood Group: ${bloodGroup || '—'}`);
    line(`Weight: ${weight ? weight + ' kg' : '—'}   Height: ${height ? height + ' cm' : '—'}`);
    gap();
    line('Analysis Summary', 13, true);
    line(`BMI: ${analysis.bmiValue ?? '—'} (${analysis.bmiStatus ?? '—'})`);
    line(`Health Score: ${analysis.healthScore ?? '—'} / 100`);
    line(`Overall Risk: ${analysis.healthRiskLevel ?? '—'}`);
    gap();
    if (analysis.aiInsight) {
      line('AI Insight', 13, true);
      const wrapped = doc.splitTextToSize(analysis.aiInsight, 170);
      doc.setFontSize(11); doc.setFont('helvetica', 'normal');
      doc.text(wrapped, 20, y); y += wrapped.length * 7;
      gap();
    }
    if (analysis.allRecommendations?.length) {
      line('Recommendations', 13, true);
      analysis.allRecommendations.forEach((r, i) => line(`${i + 1}. ${r}`));
    }
    doc.save(`AuraHealth_Report_${fullName || 'Patient'}.pdf`);
  };

  return (
    <div className="p-4 md:p-6 min-h-[calc(100vh-56px)] bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-green-200 rounded-full blur-3xl opacity-20 pointer-events-none animate-float" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-yellow-200 rounded-full blur-3xl opacity-20 pointer-events-none animate-pulse-slow" />

      <div className="max-w-6xl mx-auto relative z-10">

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl mx-auto flex items-center justify-center mb-3 border border-green-100">
            <FaRobot className="text-xl" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 mb-1">Personal Health Data</h1>
          <p className="text-slate-500 text-sm">Fill in your health metrics — AI will analyze everything</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* Personal Info */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="card p-6">
            <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FaUserMd className="text-green-600" /> Personal Information
            </h2>
            <div className="space-y-4">
              <Field label="Full Name"    value={personalInfo.fullName}   onChange={setP('fullName')}   placeholder="e.g. John Doe" type="text" error={errors.fullName} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Age"         value={personalInfo.age}        onChange={setP('age')}        placeholder="e.g. 30"  error={errors.age} />
                <Field label="Blood Group" value={personalInfo.bloodGroup} onChange={setP('bloodGroup')} placeholder="e.g. O+"  type="text" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Weight (kg)" value={personalInfo.weight}     onChange={setP('weight')}     placeholder="e.g. 70"  error={errors.weight} />
                <Field label="Height (cm)" value={personalInfo.height}     onChange={setP('height')}     placeholder="e.g. 175" error={errors.height} />
              </div>
            </div>
          </motion.div>

          {/* Medical Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="card p-6">
            <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FaHeartbeat className="text-rose-500" /> Medical Information
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {MEDICAL_FIELDS.map(f => (
                <Field key={f.key} label={f.label} value={medicalInfo[f.key]} onChange={setM(f.key)} placeholder={f.placeholder} error={errors[f.key]} />
              ))}
            </div>
            <div className="mt-3">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Additional Notes</label>
              <textarea
                value={medicalInfo.additionalNotes}
                onChange={e => setM('additionalNotes')(e.target.value)}
                placeholder="Any conditions, allergies, medications..."
                className="input-field text-sm resize-none h-16"
              />
            </div>
          </motion.div>
        </div>

        {/* Submit */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex justify-center mb-6">
          <button onClick={handleSubmit} disabled={loading} className="btn-primary px-10 py-3.5 text-base flex items-center gap-3">
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                AI is analyzing your data...
              </>
            ) : (
              <><FaRobot /> Run Health Analysis</>
            )}
          </button>
        </motion.div>

        {message.text && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className={`mb-6 p-3.5 rounded-xl text-sm font-medium text-center flex items-center justify-center gap-2 ${
              message.type === 'success' ? 'bg-green-50 border border-green-100 text-green-700' : 'bg-red-50 border border-red-100 text-red-600'
            }`}>
            {message.type === 'success' && <FaCheckCircle />} {message.text}
          </motion.div>
        )}

        {/* Health History */}
        {history.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-5 mb-6">
            <button onClick={() => setShowHistory(!showHistory)} className="w-full flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <FaHistory className="text-green-600" /> Health Score History ({history.length} records)
              </h2>
              <span className="text-xs text-slate-400">{showHistory ? 'Hide' : 'Show'}</span>
            </button>
            {showHistory && (
              <div className="mt-4 space-y-2">
                {history.map((record, i) => (
                  <div key={record._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 w-4">{i + 1}</span>
                      <div>
                        <p className="text-xs font-semibold text-slate-700">{new Date(record.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        <p className="text-xs text-slate-400">BMI: {record.analysis?.bmiValue ?? '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        record.analysis?.healthRiskLevel === 'High' ? 'bg-red-100 text-red-700' :
                        record.analysis?.healthRiskLevel === 'Moderate' ? 'bg-amber-100 text-amber-700' :
                        'bg-green-100 text-green-700'
                      }`}>{record.analysis?.healthRiskLevel}</span>
                      <span className={`text-lg font-black ${scoreColor(record.analysis?.healthScore)}`}>
                        {record.analysis?.healthScore ?? '—'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6 mb-8">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <FaRobot className="text-green-600" /> AI Health Analysis Results
            </h2>
            <button onClick={exportPDF}
              className="btn-secondary text-xs px-4 py-2 mb-6 flex items-center gap-2 w-fit">
              <FaFilePdf className="text-red-500" /> Download PDF Report
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">BMI</p>
                <p className="text-3xl font-black text-slate-800">{analysis.bmiValue ?? '—'}</p>
                <p className="text-sm font-semibold text-green-600 mt-1">{analysis.bmiStatus}</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Overall Risk</p>
                <span className={`inline-block px-4 py-1.5 rounded-full text-lg font-black mt-1 ${
                  analysis.healthRiskLevel === 'High' ? 'bg-red-100 text-red-700' :
                  analysis.healthRiskLevel === 'Moderate' ? 'bg-amber-100 text-amber-700' :
                  'bg-green-100 text-green-700'
                }`}>{analysis.healthRiskLevel}</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Health Score</p>
                <p className="text-3xl font-black text-slate-800">{analysis.healthScore ?? '—'}<span className="text-base font-bold text-slate-400">/100</span></p>
              </div>
            </div>

            {analysis.detailedAnalysis && (
              <div className="mb-6">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Detailed Risk Breakdown</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {Object.entries(analysis.detailedAnalysis).map(([key, value]) => (
                    value && value !== 'Unknown' && (
                      <div key={key} className={`p-3.5 rounded-2xl border ${riskColor(value)}`}>
                        <span className="block text-xs font-bold uppercase tracking-wide mb-1 text-slate-500">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="block text-base font-black">{value}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {analysis.aiInsight && (
              <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl mb-6">
                <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <FaRobot /> AI Personalized Insight
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">{analysis.aiInsight}</p>
              </div>
            )}

            {analysis.allRecommendations?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Recommendations</p>
                <div className="space-y-2">
                  {analysis.allRecommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <FaCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-slate-700 font-medium">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
