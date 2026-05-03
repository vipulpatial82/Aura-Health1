<div align="center">

<img src="https://img.shields.io/badge/AuraHealth-AI%20Healthcare%20Platform-10b981?style=for-the-badge&logoColor=white" alt="AuraHealth" />

# AuraHealth

**Next-Generation AI-Powered Healthcare Platform for India**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-aura--health1.vercel.app-10b981?style=flat-square&logo=vercel&logoColor=white)](https://aura-health1.vercel.app/)
[![Backend](https://img.shields.io/badge/Backend-Render-0467df?style=flat-square&logo=render&logoColor=white)](https://aura-health1.onrender.com)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-13aa52?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com/atlas)
[![License](https://img.shields.io/badge/License-MIT-f59e0b?style=flat-square)](LICENSE)

[View Live Demo](https://aura-health1.vercel.app/) &nbsp;&bull;&nbsp; [Report a Bug](https://github.com/vipulpatial82/Aura-Health1/issues) &nbsp;&bull;&nbsp; [Request a Feature](https://github.com/vipulpatial82/Aura-Health1/issues)

</div>

---

## Overview

AuraHealth is a full-stack healthcare platform I built to turn raw medical data into meaningful, personalized health insights. It uses Google Gemini AI to provide intelligent risk analysis, real-time hospital discovery, medication tracking, and appointment scheduling — all within a secure, role-based system designed for patients, doctors, and administrators.
---

## Features

### ![AI](https://img.shields.io/badge/-AI--Driven%20Health%20Analysis-10b981?style=flat-square) AI-Driven Health Analysis

- **Comprehensive Vitals Tracking** — Input and monitor BMI, blood pressure, blood sugar, cholesterol, heart rate, and SpO2.
- **Gemini AI Engine** — Processes vitals to generate a centralized Health Score (0–100) alongside actionable Risk Level evaluations (Low / Moderate / High).
- **Smart PDF Export** — Download a complete, AI-generated health report with a single click.
- **Historical Trend Visualization** — Track health changes over time through intuitive visual dashboards.

---

### ![Chat](https://img.shields.io/badge/-Intelligent%20AI%20Health%20Assistant-0ea5e9?style=flat-square) Intelligent AI Health Assistant

- Powered by **Gemini 2.5 Flash** for rapid, context-aware medical guidance.
- Retains conversational memory and references your existing health profile to deliver hyper-personalized advice.

---

### ![Medication](https://img.shields.io/badge/-Medication%20Management-8b5cf6?style=flat-square) Medication Management

- Intuitive scheduling for daily medications with dosage and timing controls.
- Visual dashboards distinguishing **Pending** vs. **Taken** prescriptions.
- Daily status resets to ensure consistent medication adherence.

---

### ![Hospital](https://img.shields.io/badge/-Smart%20Hospital%20Discovery-ef4444?style=flat-square) Smart Hospital Discovery

- **Geolocation-Aware** — Auto-detects user location via GPS or IP address.
- **Interactive Maps** — Embedded Google Maps integration for real-time proximity searches.
- **Emergency Routing** — Instant access to hospital contact information, emergency statuses, and turn-by-turn directions.

---

### ![Appointments](https://img.shields.io/badge/-Appointment%20Scheduling-f59e0b?style=flat-square) Seamless Appointment Scheduling

- **Patients** — Book consultations by department, preferred date, and medical concern.
- **Doctors & Admins** — Comprehensive dashboard to manage bookings, assign specialists, and progress statuses: `Pending` → `Upcoming` → `In Progress` → `Completed`.
- **Live Notifications** — 24-hour appointment reminders built directly into the UI.

---

### ![Security](https://img.shields.io/badge/-Authentication%20%26%20Administration-64748b?style=flat-square) Secure Authentication & Administration

- **Multi-Factor Entry** — Email/password, Google Sign-In via Firebase, and strict JWT rotation.
- **Role-Based Access Control** — Dedicated portals for Patients, Doctors, and Administrators.
- **Admin Command Center** — Full oversight of doctor management, patient registries, and platform analytics.

---

## Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Framer Motion, React Router v6, Axios, Firebase SDK, jsPDF |
| **Backend** | Node.js, Express, MongoDB, Mongoose, Firebase Admin, Google Gemini AI, JWT, Zod, Helmet |
| **Infrastructure** | Vercel (Frontend), Render (Backend), MongoDB Atlas (Database) |

---

## Getting Started

### Prerequisites

Before running AuraHealth locally, ensure you have the following:

- Node.js v18+
- MongoDB (local instance or Atlas cluster)
- Firebase project (for Google Authentication)
- Google Gemini API Key

### 1. Clone the Repository

```bash
git clone https://github.com/vipulpatial82/Aura-Health1.git
cd Aura-Health1
```

### 2. Configure & Run the Backend

```bash
cd backend
npm install
cp .env.example .env
# Populate your .env file (see Environment Variables below)
npm run dev
```

### 3. Configure & Run the Frontend

```bash
cd ../frontend
npm install
# Create a .env file and set VITE_API_URL=http://localhost:5003
npm run dev
```

The platform will be accessible at `http://localhost:3000`.

---

## Environment Variables

<details>
<summary><strong>Backend — <code>backend/.env</code></strong></summary>

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

</details>

<details>
<summary><strong>Frontend — <code>frontend/.env</code></strong></summary>

```env
VITE_API_URL=http://localhost:5003
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

</details>

---

## Live Deployment

| Service | Provider | URL |
|---|---|---|
| Frontend | Vercel (CI/CD enabled) | [aura-health1.vercel.app](https://aura-health1.vercel.app/) |
| Backend | Render | [aura-health1.onrender.com](https://aura-health1.onrender.com) |
| Database | MongoDB Atlas | Managed cluster |

---

## Security

AuraHealth is built with enterprise-grade security practices throughout:

- **JWT Rotation** — 7-day token expiry with secure refresh endpoints.
- **Password Encryption** — All passwords hashed using `bcrypt` (12 rounds).
- **Rate Limiting** — 10 requests per 15-minute window with account lockout after 5 failed attempts.
- **Input Sanitization** — Strict validation via `Zod` and hardened HTTP headers via `Helmet.js`.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
  Built by <a href="https://github.com/vipulpatial82"><strong>Vipul Patial</strong></a>
</div>
