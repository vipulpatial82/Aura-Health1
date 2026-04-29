import AIHistory from '../models/AIHistory.js';
import HealthData from '../models/HealthData.js';
import { AppError } from '../middleware/errorMiddleware.js';
import { v4 as uuidv4 } from 'uuid';
import { callGemini } from '../utils/gemini.js';

const buildSystemPrompt = (healthContext) => {
  if (!healthContext) {
    return `You are a knowledgeable and empathetic medical AI assistant for AuraHealth.
Provide accurate, evidence-based health information. Always recommend consulting a doctor for serious concerns.
Keep responses concise, clear, and actionable. Never diagnose — only inform and guide.`;
  }

  const { personalInfo, medicalInfo, analysis } = healthContext;
  return `You are a personalized medical AI assistant for AuraHealth.

PATIENT PROFILE:
- Name: ${personalInfo?.fullName || 'User'}
- Age: ${personalInfo?.age || 'Unknown'}, Blood Group: ${personalInfo?.bloodGroup || 'Unknown'}
- BMI: ${analysis?.bmiValue || 'Unknown'} (${analysis?.bmiStatus || 'Unknown'})
- Health Risk Level: ${analysis?.healthRiskLevel || 'Unknown'}
- Health Score: ${analysis?.healthScore || 'Unknown'}/100

KEY METRICS:
- Fasting Sugar: ${medicalInfo?.diabetes || 'N/A'} mg/dL
- HbA1c: ${medicalInfo?.hba1c || 'N/A'}%
- Blood Pressure: ${medicalInfo?.systolicBP || 'N/A'}/${medicalInfo?.diastolicBP || 'N/A'} mmHg
- Heart Rate: ${medicalInfo?.restingHeartRate || 'N/A'} bpm
- SpO2: ${medicalInfo?.oxygenSaturation || 'N/A'}%
- Cholesterol: ${medicalInfo?.totalCholesterol || 'N/A'} mg/dL

Use this patient context to give PERSONALIZED, specific advice. Reference their actual numbers when relevant.
Never diagnose. Always recommend professional consultation for serious concerns.`;
};

export const sendChatMessage = async (userId, message, sessionId) => {
  if (!process.env.GEMINI_API_KEY) throw new AppError('AI service not configured', 503);
  if (!message?.trim()) throw new AppError('Message cannot be empty', 400);

  let session = null;

  if (userId) {
    const healthData = await HealthData.findOne({ userId }).sort({ createdAt: -1 });
    session = await AIHistory.findOne({ userId, sessionId });
    if (!session) {
      session = await AIHistory.create({
        userId,
        sessionId: sessionId || uuidv4(),
        messages: [],
        healthContextSnapshot: healthData
          ? { personalInfo: healthData.personalInfo, medicalInfo: healthData.medicalInfo, analysis: healthData.analysis }
          : null,
      });
    }
  }

  const recentMessages = session ? session.messages.slice(-10) : [];
  const systemPrompt = buildSystemPrompt(session?.healthContextSnapshot ?? null);

  const contents = [
    { role: 'user', parts: [{ text: systemPrompt }] },
    { role: 'model', parts: [{ text: 'Understood. I am ready to assist with personalized health guidance.' }] },
    ...recentMessages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
    { role: 'user', parts: [{ text: message }] },
  ];

  const aiResponse = await callGemini(contents, { maxOutputTokens: 1024, temperature: 0.7 }, process.env.GEMINI_API_KEY);

  if (session) {
    session.messages.push({ role: 'user', content: message });
    session.messages.push({ role: 'assistant', content: aiResponse });
    await session.save();
  }

  return { response: aiResponse, sessionId: session?.sessionId ?? null };
};

export const getChatHistory = async (userId, limit = 20) => {
  return AIHistory.find({ userId })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .select('sessionId messages updatedAt');
};
