const express = require('express');
const router = express.Router();
const messagingController = require('../controllers/messagingController');
const authMiddleware = require('../middlewares/authMiddleware');
const { requireSchool, filterBySchool } = require('../middlewares/schoolMiddleware');

// Apply authentication and school middleware to all routes
router.use(authMiddleware.protect);
router.use(requireSchool);
router.use(filterBySchool);

// Thread routes
router.get('/threads', messagingController.getThreads);
router.get('/threads/:threadId', messagingController.getThread);
router.post('/threads', messagingController.createThread);
router.post('/threads/:threadId/archive', messagingController.archiveThread);

// Message routes
router.post('/threads/:threadId/messages', messagingController.sendMessage);
router.post('/messages/:messageId/read', messagingController.markAsRead);
router.delete('/messages/:messageId', messagingController.deleteMessage);

// Utility routes
router.get('/unread-count', messagingController.getUnreadCount);
router.get('/search-users', messagingController.searchUsers);

module.exports = router;
