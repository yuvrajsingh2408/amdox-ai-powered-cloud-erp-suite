import { Router } from 'express';
import aiController from '../controllers/aiController';
import { protect } from '../middleware/auth.middleware';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiter specifically for AI queries to prevent abuse/high token consumption
const queryLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // max 20 queries per minute per client
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Rate limit exceeded: Please wait a minute before sending another prompt.',
    statusCode: 429,
    data: null,
    error: 'AI query rate limit exceeded',
  },
});

// All AI Copilot routes require authentication
router.use(protect);

// 1. Natural Language Query & Summaries
router.post('/query', queryLimiter, aiController.processQuery);
router.get('/summary/:module', aiController.generateSummary);
router.get('/history-logs', aiController.getHistoryLogs);

// 2. Proactive Recommendations & Action Alerts
router.get('/recommendations', aiController.getRecommendations);
router.post('/recommendations/:id/resolve', aiController.resolveRecommendation);

// 3. Conversation Thread History
router.route('/conversations')
  .get(aiController.getConversations)
  .post(aiController.createConversation);

router.route('/conversations/:id')
  .get(aiController.getConversation)
  .delete(aiController.deleteConversation);

router.patch('/conversations/:id/pin', aiController.togglePin);
router.patch('/conversations/:id/favorite', aiController.toggleFavorite);
router.post('/conversations/:id/messages/:messageId/feedback', aiController.setMessageFeedback);

// 4. Prompt Templates Library
router.route('/prompts')
  .get(aiController.getTemplates)
  .post(aiController.createTemplate);

router.post('/prompts/:id/favorite', aiController.favoriteTemplate);

export default router;
export { router };
