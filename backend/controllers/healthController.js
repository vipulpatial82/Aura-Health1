import HealthData from '../models/HealthData.js';
import { asyncHandler, AppError } from '../middleware/errorMiddleware.js';
import AIHistory from '../models/AIHistory.js';
import { callGemini } from '../utils/gemini.js';

const analyzeWithAI = async (personalInfo, medicalInfo) => {
  const { fullName, age, bloodGroup, weight, height } = personalInfo || {};
  const {
    diabetes, hba1c, systolicBP, diastolicBP,
    restingHeartRate, oxygenSaturation,
    totalCholesterol, ldlCholesterol, hdlCholesterol, triglycerides,
  } = medicalInfo || {};

  let bmiValue = null;
  if (weight && height) {
    const h = height / 100;
    bmiValue = parseFloat((weight / (h * h)).toFixed(1));
  }

  const prompt = `You are a medical AI. Analyze the patient data and return ONLY a valid JSON object with no markdown, no code blocks, no extra text.

Patient: ${fullName || 'Patient'}, Age: ${age || 'unknown'}
BMI: ${bmiValue || 'unknown'}, Blood Group: ${bloodGroup || 'unknown'}
Fasting Sugar: ${diabetes || 'unknown'} mg/dL, HbA1c: ${hba1c || 'unknown'}%
BP: ${systolicBP || 'unknown'}/${diastolicBP || 'unknown'} mmHg, HR: ${restingHeartRate || 'unknown'} bpm
SpO2: ${oxygenSaturation || 'unknown'}%, Cholesterol: ${totalCholesterol || 'unknown'} mg/dL
LDL: ${ldlCholesterol || 'unknown'}, HDL: ${hdlCholesterol || 'unknown'}, TG: ${triglycerides || 'unknown'} mg/dL

Return ONLY this JSON with real values (keep all string values under 100 characters):
{
  "bmiValue": ${bmiValue ?? 0},
  "bmiStatus": "Normal weight",
  "healthRiskLevel": "Low",
  "healthScore": 85,
  "suggestedAction": "one short sentence",
  "allRecommendations": ["rec 1", "rec 2", "rec 3"],
  "aiInsight": "one short sentence with actual numbers",
  "detailedAnalysis": {
    "diabetes": "Low",
    "hba1c": "Low",
    "bloodPressure": "Low",
    "heartRate": "Low",
    "oxygenSaturation": "Low",
    "cholesterol": "Low",
    "ldl": "Low",
    "hdl": "Low",
    "triglycerides": "Low"
  }
}
Use only Low/Moderate/High for risk fields. Keep all strings short. Do not include any thinking or explanation, return ONLY the JSON object.`;

  const text = await callGemini(
    [{ role: 'user', parts: [{ text: prompt }] }],
    { maxOutputTokens: 8192, temperature: 0.1, thinkingConfig: { thinkingBudget: 0 } },
    process.env.GEMINI_HEALTH_KEY
  );

  // Strip markdown code fences if Gemini wraps response in ```json ... ```
  const cleaned = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  const start = cleaned.indexOf('{');
  const end   = cleaned.lastIndexOf('}');

  if (start === -1 || end === -1 || end <= start) {
    throw new AppError('AI returned invalid analysis format', 502);
  }

  const jsonStr = cleaned.slice(start, end + 1);

  try {
    return JSON.parse(jsonStr);
  } catch {
    throw new AppError('AI returned invalid analysis format', 502);
  }
};

export const saveHealthData = asyncHandler(async (req, res) => {
  const { personalInfo, medicalInfo } = req.body;
  const userId = req.user.id;

  const analysis = await analyzeWithAI(personalInfo, medicalInfo);

  // Save as a new record every time to keep history
  const healthData = await HealthData.create({ userId, personalInfo, medicalInfo, analysis });

  await AIHistory.updateMany(
    { userId },
    { $set: { healthContextSnapshot: { personalInfo, medicalInfo, analysis } } }
  );

  res.json({ success: true, data: healthData });
});

export const getHealthData = asyncHandler(async (req, res) => {
  // Return latest record
  const [healthData] = await HealthData.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(1);
  if (!healthData) return res.json({ success: true, data: null });
  res.json({ success: true, data: healthData });
});

export const getHealthHistory = asyncHandler(async (req, res) => {
  const history = await HealthData.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('analysis.healthScore analysis.healthRiskLevel analysis.bmiValue createdAt');
  res.json({ success: true, data: history });
});
