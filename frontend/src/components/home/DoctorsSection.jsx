import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserMd, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import api from '../../api/axiosInstance';

const CARD_COLORS = [
  { bg: 'bg-blue-100',   text: 'text-blue-600'   },
  { bg: 'bg-green-100',  text: 'text-green-600'  },
  { bg: 'bg-yellow-100', text: 'text-yellow-600' },
  { bg: 'bg-purple-100', text: 'text-purple-600' },
  { bg: 'bg-rose-100',   text: 'text-rose-600'   },
];

const PER_PAGE = 3;

export default function DoctorsSection() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(0);
  const [slideDir, setSlideDir] = useState(1);

  useEffect(() => {
    api.get('/doctors')
      .then(({ data }) => { if (data.success) setDoctors(data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.max(0, doctors.length - PER_PAGE + 1);
  const hasPrev    = page > 0;
  const hasNext    = page + PER_PAGE < doctors.length;

  const goBack = () => { if (hasPrev) { setSlideDir(-1); setPage(p => p - 1); } };
  const goNext = () => { if (hasNext) { setSlideDir(1);  setPage(p => p + 1); } };

  const visibleDoctors = doctors.slice(page, page + PER_PAGE);

  const ArrowButton = ({ onClick, disabled, children }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex-shrink-0 w-10 h-10 rounded-full border flex items-center justify-center transition-all
        ${disabled
          ? 'border-slate-200 text-slate-300 cursor-not-allowed'
          : 'border-green-500 text-green-600 hover:bg-green-500 hover:text-white shadow-sm'}`}
    >
      {children}
    </button>
  );

  return (
    <section className="py-16 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-72 h-72 bg-green-100 rounded-full blur-3xl opacity-30 pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-100 rounded-full blur-3xl opacity-30 pointer-events-none translate-x-1/2 translate-y-1/2" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        <div className="text-center mb-10">
          <p className="text-green-600 font-bold tracking-widest uppercase text-xs mb-1">Our Specialists</p>
          <h3 className="text-2xl font-extrabold text-slate-800">Meet Our Top Doctors</h3>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            <FaUserMd className="mx-auto mb-2 text-2xl" />
            No doctors available yet.
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <ArrowButton onClick={goBack} disabled={!hasPrev}>
                <FaChevronLeft className="text-sm" />
              </ArrowButton>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
                <AnimatePresence mode="popLayout" initial={false}>
                  {visibleDoctors.map((doctor, i) => {
                    const color = CARD_COLORS[(page + i) % CARD_COLORS.length];
                    const name  = doctor.userId?.name || 'Doctor';
                    return (
                      <motion.div
                        key={doctor._id}
                        initial={{ opacity: 0, x: slideDir * 60 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: slideDir * -60 }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                        className="bg-slate-50 border border-slate-100 rounded-2xl p-6 hover:shadow-xl transition-all group text-center flex flex-col items-center"
                      >
                        <div className={`w-20 h-20 rounded-full mb-4 ${color.bg} ${color.text} flex items-center justify-center text-2xl font-black group-hover:scale-105 transition-transform shadow-sm`}>
                          {name.charAt(0)}
                        </div>
                        <h4 className="text-base font-bold text-slate-800 mb-0.5">{name}</h4>
                        <p className="text-green-600 font-semibold text-sm mb-3">{doctor.specialization}</p>
                        {doctor.experience > 0 && (
                          <p className="text-xs text-slate-500 mb-4 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                            {doctor.experience} yrs experience
                          </p>
                        )}
                        <div className="w-full pt-3 border-t border-slate-100">
                          <p className="text-xs text-slate-400">{doctor.workingHours || '9:00 AM – 5:00 PM'}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              <ArrowButton onClick={goNext} disabled={!hasNext}>
                <FaChevronRight className="text-sm" />
              </ArrowButton>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-1.5 mt-8">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setSlideDir(i > page ? 1 : -1); setPage(i); }}
                    className={`h-1.5 rounded-full transition-all ${i === page ? 'w-6 bg-green-500' : 'w-1.5 bg-slate-300'}`}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
