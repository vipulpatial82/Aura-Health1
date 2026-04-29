import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from './models/User.js';
import Doctor from './models/Doctor.js';
import Appointment from './models/Appointment.js';
import HealthData from './models/HealthData.js';
import AIHistory from './models/AIHistory.js';

const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || 'doctor@aurahealth.com';
const SEED_PASSWORD  = process.env.SEED_PASSWORD  || 'Doctor@123';

async function resetDB() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  await Promise.all([
    User.deleteMany({}),
    Doctor.deleteMany({}),
    Appointment.deleteMany({}),
    HealthData.deleteMany({}),
    AIHistory.deleteMany({}),
  ]);
  console.log('All collections wiped');

  const adminHash = await bcrypt.hash(SEED_PASSWORD, 12);
  await User.create({ name: 'Admin', email: ADMIN_EMAIL, password: adminHash, role: 'admin' });
  console.log(`Admin seeded: ${ADMIN_EMAIL}`);

  const doctorSeeds = [
    { name: 'Dr. Sarah Jenkins', email: 'sarah@aurahealth.com',  specialization: 'Cardiologist',    experience: 12, rating: 4.9, workingHours: '9:00 AM - 5:00 PM' },
    { name: 'Dr. Marcus Chen',   email: 'marcus@aurahealth.com', specialization: 'Neurologist',     experience: 9,  rating: 4.8, workingHours: '10:00 AM - 6:00 PM' },
    { name: 'Dr. Emily Rostova', email: 'emily@aurahealth.com',  specialization: 'General Surgeon', experience: 15, rating: 5.0, workingHours: '8:00 AM - 4:00 PM' },
  ];

  for (const seed of doctorSeeds) {
    const hash = await bcrypt.hash(SEED_PASSWORD, 12);
    const user = await User.create({ name: seed.name, email: seed.email, password: hash, role: 'doctor' });
    await Doctor.create({ userId: user._id, specialization: seed.specialization, experience: seed.experience, rating: seed.rating, workingHours: seed.workingHours, isAvailable: true });
    console.log(`Doctor seeded: ${seed.email}`);
  }

  console.log('\nDatabase reset complete!');
  process.exit(0);
}

resetDB().catch(err => { console.error(err); process.exit(1); });
