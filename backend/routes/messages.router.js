import { Router } from 'express';
import { MessageController } from '../controllers/messages.controller.js';
import { authRequired } from '../middleware/authenticate.js';

const router = Router();

// All message routes require authentication
router.use(authRequired);

// Get all conversations for the authenticated user
router.get('/conversations', MessageController.getConversations);

// Get messages in a specific conversation
router.get('/conversations/:conversationId/messages', MessageController.getMessages);

// Send a new message
router.post('/send', MessageController.sendMessage);

// Delete a message
router.delete('/:messageId', MessageController.deleteMessage);

// Mark messages in a conversation as read
router.put('/conversations/:conversationId/read', MessageController.markAsRead);

// Search users for messaging
router.get('/users/search', MessageController.searchUsers);

// Get online status of users
router.get('/users/online', (req, res) => {
    const { getOnlineUsers, isUserOnline } = require('../services/socket.js');
    const { userIds } = req.query;
    
    if (userIds) {
        const ids = Array.isArray(userIds) ? userIds : [userIds];
        const onlineStatus = ids.reduce((acc, userId) => {
            acc[userId] = isUserOnline(userId);
            return acc;
        }, {});
        return sendResponse(res, 200, 'Online status retrieved', onlineStatus);
    }
    
    const onlineUsers = getOnlineUsers();
    return sendResponse(res, 200, 'Online users retrieved', { onlineUsers, count: onlineUsers.length });
});

export default router;