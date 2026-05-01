# 🌿 AuraHealth — AI-Powered Healthcare Platform

<div align="center">

![AuraHealth Banner](https://img.shields.io/badge/AuraHealth-AI%20Healthcare-green?style=for-the-badge&logo=heart&logoColor=white)

[![Live Demo](https://img.shields.io/badge/Live%20Demo-aura--health--chi.vercel.app-brightgreen?style=flat-square&logo=vercel)](https://aura-health-chi.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Render-blue?style=flat-square&logo=render)](https://aura-health1.onrender.com)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-green?style=flat-square&logo=mongodb)](https://mongodb.com/atlas)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

**A full-stack AI-powered healthcare platform built for India — empowering patients with smart health tools, risk analysis, medication tracking, and nearby hospital discovery.**

[Live Demo](https://aura-health-chi.vercel.app) · [Report Bug](https://github.com/vipulpatial82/Aura-Health1/issues) · [Request Feature](https://github.com/vipulpatial82/Aura-Health1/issues)

</div>

---

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Screenshots](#-screenshots)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)

---

## 🏥 About

AuraHealth is a modern, full-stack healthcare web application that combines **AI analysis**, **real-time health tracking**, and **hospital discovery** into one seamless platform. Built with React, Node.js, and Google Gemini AI — it provides personalized health insights based on your actual medical data.

---

## ✨ Features

### 👤 Authentication
- Email/password signup & login
- **Google Sign-In** via Firebase Authentication
- JWT access tokens + refresh token rotation
- Account lockout after 5 failed login attempts
- Role-based access control (Patient / Doctor / Admin)

### 🧠 AI Health Analysis
- Enter vitals: BMI, blood pressure, sugar, cholesterol, heart rate, SpO2
- **Gemini AI** analyzes all metrics and returns:
  - Health Score (0–100)
  - Risk Level (Low / Moderate / High)
  - Detailed risk breakdown per metric
  - Personalized AI insights
  - Actionable recommendations
- Export full health report as **PDF**
- Health history tracking

### 💬 Chat with AI
- Personalized medical AI chat powered by **Gemini 2.5 Flash**
- AI knows your health data and gives context-aware advice
- Chat session history saved per user
- Suggested quick questions

### 💊 Medication Tracker
- Add medications with name, dosage, and time
- Mark medications as taken / pending
- Reset daily medication status
- Visual summary cards (Total / Taken / Pending)

### 🏥 Nearby Hospitals
- Search hospitals by city/area
- Auto-detect location via **Device GPS** or **IP geolocation**
- Interactive **Google Maps** embed
- Hospital cards with name, address, phone, emergency status, directions

### 📅 Appointments
- **Patients**: Book appointments with department, date, time, concern
- **Doctors/Admins**: View all appointments, assign doctors, add notes, track consultation time
- Real-time status updates (Pending → Upcoming → In Progress → Completed)
- 24h appointment notifications in header

### 👨‍⚕️ Admin Dashboard
- Doctor management (Add, View, Activate/Deactivate, Delete)
- Patient registry with join date and last login
- Analytics with specialization breakdown
- Quick actions panel

### 👤 Profile
- Update display name
- Change password with current password verification

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 | UI Framework |
| Vite | Build Tool |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| React Router v6 | Routing |
| Axios | HTTP Client |
| Firebase SDK | Google Authentication |
| jsPDF | PDF Export |
| React Icons | Icon Library |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express | Server Framework |
| MongoDB + Mongoose | Database |
| Firebase Admin SDK | Token Verification |
| Google Gemini AI | AI Analysis & Chat |
| JWT | Authentication Tokens |
| bcrypt | Password Hashing |
| Helmet | Security Headers |
| Winston | Logging |
| Zod | Input Validation |
| express-rate-limit | Rate Limiting |

### Infrastructure
| Service | Purpose |
|---------|---------|
| Vercel | Frontend Hosting |
| Render | Backend Hosting |
| MongoDB Atlas | Cloud Database |
| Firebase | Google Auth |
| OpenStreetMap / Overpass API | Hospital Data |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Firebase project with Google Auth enabled
- Google Gemini API key

### 1. Clone the repository
```bash
git clone https://github.com/vipulpatial82/Aura-Health1.git
cd Aura-Health1
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values (see Environment Variables section)
npm run dev
```

### 3. Setup Frontend
```bash
cd frontend
npm install
# Create .env file with VITE_API_URL
npm run dev
```

### 4. Open in browser
```
Frontend: http://localhost:3000
Backend:  http://localhost:5003
```

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
```env
PORT=5003
NODE_ENV=development
CLIENT_URL=http://localhost:3000

MONGODB_URI=mongodb://localhost:27017/aurahealth

JWT_SECRET=your_jwt_secret_min_32_chars

ADMIN_EMAIL=admin@yourdomain.com
SEED_PASSWORD=YourAdminPassword@123

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key
GEMINI_HEALTH_KEY=your_gemini_health_key

# Firebase Admin SDK
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"..."}
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5003

VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## 📡 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login with email/password |
| POST | `/api/auth/firebase-login` | Login with Firebase token |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/profile` | Get user profile |
| PUT | `/api/auth/profile` | Update profile |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/health/save` | Save health data + run AI analysis |
| GET | `/api/health/data` | Get latest health data |
| GET | `/api/health/history` | Get health history |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Send message to AI |
| GET | `/api/chat/history` | Get chat sessions |

### Medications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/medications` | Get all medications |
| POST | `/api/medications` | Add medication |
| PATCH | `/api/medications/:id/toggle` | Toggle taken status |
| DELETE | `/api/medications/:id` | Delete medication |
| POST | `/api/medications/reset` | Reset all to pending |

### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/appointments` | Book appointment |
| GET | `/api/appointments/my` | Get my appointments |
| GET | `/api/appointments` | Get all (admin/doctor) |
| PATCH | `/api/appointments/:id` | Update appointment |
| PATCH | `/api/appointments/:id/cancel` | Cancel appointment |

### Hospitals
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/hospitals/search` | Search by city/area |
| POST | `/api/hospitals/nearby` | Search by GPS coords |
| GET | `/api/hospitals/auto-location` | Auto-detect via IP |

---

## 🌐 Deployment

### Frontend → Vercel
1. Push code to GitHub
2. Import repo on [vercel.com](https://vercel.com)
3. Set **Root Directory** to `frontend`
4. Add environment variables
5. Deploy

### Backend → Render
1. Create **Web Service** on [render.com](https://render.com)
2. Set **Root Directory** to `backend`
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `node server.js`
5. Add all environment variables including `FIREBASE_SERVICE_ACCOUNT`
6. Deploy

### Database → MongoDB Atlas
1. Create free M0 cluster on [mongodb.com/atlas](https://mongodb.com/atlas)
2. Add `0.0.0.0/0` to Network Access
3. Copy connection string to `MONGODB_URI`

---

## 📁 Project Structure

```
Aura-Health/
├── backend/
│   ├── config/          # DB, Logger config
│   ├── controllers/     # Route handlers
│   ├── middleware/       # Auth, error, rate limit
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routes
│   ├── services/        # Business logic, AI, Firebase
│   ├── utils/           # JWT, Gemini helpers
│   ├── validators/      # Zod schemas
│   └── server.js        # Entry point
│
├── frontend/
│   ├── public/          # Static assets
│   └── src/
│       ├── api/         # Axios instance, Firebase config
│       ├── components/  # Reusable UI components
│       │   └── home/    # Landing page sections
│       └── pages/       # Route pages
│           ├── Dashboard.jsx
│           ├── PersonalData.jsx
│           ├── ChatWithAI.jsx
│           ├── MedicationTracker.jsx
│           ├── NearbyHospitals.jsx
│           ├── Appointments.jsx
│           ├── AdminDashboard.jsx
│           ├── Profile.jsx
│           └── NotFound.jsx
│
└── README.md
```

---

## 🔒 Security Features

- JWT tokens with 7-day expiry + refresh rotation
- Passwords hashed with bcrypt (12 rounds)
- Rate limiting on auth routes (10 req/15min)
- Helmet.js security headers
- CORS restricted to allowed origins
- Input validation with Zod
- Account lockout after 5 failed attempts
- Firebase token verification for Google auth

---

## 👨‍💻 Author

**Vipul Patial**

[![GitHub](https://img.shields.io/badge/GitHub-vipulpatial82-black?style=flat-square&logo=github)](https://github.com/vipulpatial82)

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">
  <p>Built with ❤️ in India 🇮🇳</p>
  <p><strong>AuraHealth</strong> — Your health, powered by AI.</p>
</div>
