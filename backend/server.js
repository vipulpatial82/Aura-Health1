import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import logger from './config/logger.js';
import passport from './config/passport.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import hospitalRoutes from './routes/hospitalRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import medicationRoutes from './routes/medicationRoutes.js';
import { seedDefaultAccounts } from './services/authService.js';

connectDB().then(() => seedDefaultAccounts());

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://localhost:5173',
].filter(Boolean);

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(passport.initialize());
app.use('/api', apiLimiter);

app.use('/api/auth',      authRoutes);
app.use('/api/health',    healthRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/chat',      chatRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin',        adminRoutes);
app.use('/api/doctors',      doctorRoutes);
app.use('/api/medications',  medicationRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use(errorHandler);

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));

export { app };
