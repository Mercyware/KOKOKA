const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const { protect } = require('../middlewares/authMiddleware');
const { requireSchool } = require('../middlewares/schoolMiddleware');

// All routes require authentication
router.use(protect);
router.use(requireSchool);

// Conversation routes
router.get('/conversations', chatbotController.getUserConversations);
router.get('/conversations/:id', chatbotController.getConversation);
router.post('/conversations/:id?/messages', chatbotController.sendMessage);
router.post('/conversations/:id?/stream', chatbotController.streamMessage);
router.put('/conversations/:id/close', chatbotController.closeConversation);

// Message feedback
router.put('/messages/:id/feedback', chatbotController.rateMessage);

// Suggestions and search
router.get('/suggestions', chatbotController.getSuggestedQuestions);
router.get('/knowledge-base/search', chatbotController.searchKnowledgeBase);

// Knowledge base management (admin only - add role check if needed)
router.post('/knowledge-base', chatbotController.createKBEntry);
router.get('/knowledge-base/category/:category', chatbotController.getKBByCategory);

// Analytics (admin only - add role check if needed)
router.get('/analytics', chatbotController.getAnalytics);

module.exports = router;
