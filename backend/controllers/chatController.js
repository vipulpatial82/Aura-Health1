import { sendChatMessage, getChatHistory } from '../services/aiService.js';
import { asyncHandler, AppError } from '../middleware/errorMiddleware.js';

export const chat = asyncHandler(async (req, res) => {
  const { message, sessionId } = req.body;
  if (!message?.trim()) throw new AppError('Message is required', 400);
  const userId = req.user?.id;

  const result = await sendChatMessage(userId, message, sessionId);
  res.json({ success: true, ...result });
});

export const getHistory = asyncHandler(async (req, res) => {
  const history = await getChatHistory(req.user.id);
  res.json({ success: true, data: history });
});
