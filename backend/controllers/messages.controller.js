import Message from '../models/messages.js';
import Conversation from '../models/conversations.js';
import User from '../models/users.js';
import { toObjectId, validateObjectId, sanitizeInput } from '../services/utils.js';
import sendResponse from '../services/response.js';

export class MessageController {
    // Get all conversations for a user
    static async getConversations(req, res) {
        try {
            const userId = req.user._id;
            const page = Math.max(1, parseInt(req.query.page || '1', 10));
            const limit = Math.min(50, parseInt(req.query.limit || '20', 10));

            const conversations = await Conversation.find({
                participants: userId,
                isActive: true
            })
            .populate('participants', 'displayName handle avatarUrl')
            .populate('lastMessage.sender', 'displayName handle')
            .sort({ 'lastMessage.timestamp': -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

            const total = await Conversation.countDocuments({
                participants: userId,
                isActive: true
            });

            // Format conversations for frontend
            const formattedConversations = conversations.map(conv => {
                const otherParticipant = conv.participants.find(
                    p => p._id.toString() !== userId.toString()
                );
                
                return {
                    id: conv._id,
                    conversationId: conv.conversationId,
                    participant: otherParticipant,
                    lastMessage: conv.lastMessage,
                    unreadCount: conv.unreadCount?.get(userId.toString()) || 0,
                    updatedAt: conv.updatedAt
                };
            });

            return sendResponse(res, 200, 'Conversations fetched successfully', {
                conversations: formattedConversations,
                page,
                limit,
                total
            });
        } catch (error) {
            console.error('Error fetching conversations:', error);
            return sendResponse(res, 500, 'Internal Server Error');
        }
    }

    // Get messages in a conversation
    static async getMessages(req, res) {
        try {
            const userId = req.user._id;
            const { conversationId } = req.params;
            const page = Math.max(1, parseInt(req.query.page || '1', 10));
            const limit = Math.min(100, parseInt(req.query.limit || '50', 10));

            if (!conversationId) {
                return sendResponse(res, 400, 'Conversation ID is required');
            }

            // Verify user is part of this conversation
            const conversation = await Conversation.findOne({
                conversationId,
                participants: userId
            });

            if (!conversation) {
                return sendResponse(res, 404, 'Conversation not found or access denied');
            }

            const messages = await Message.find({
                conversationId,
                isDeleted: false
            })
            .populate('sender', 'displayName handle avatarUrl')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

            const total = await Message.countDocuments({
                conversationId,
                isDeleted: false
            });

            // Mark messages as read
            await Message.updateMany(
                {
                    conversationId,
                    recipient: userId,
                    isRead: false
                },
                {
                    isRead: true,
                    readAt: new Date()
                }
            );

            // Update conversation unread count
            await conversation.markAsRead(userId);

            return sendResponse(res, 200, 'Messages fetched successfully', {
                messages: messages.reverse(), // Reverse to show oldest first
                page,
                limit,
                total
            });
        } catch (error) {
            console.error('Error fetching messages:', error);
            return sendResponse(res, 500, 'Internal Server Error');
        }
    }

    // Send a new message
    static async sendMessage(req, res) {
        try {
            const senderId = req.user._id;
            const { recipientId, content, messageType = 'text', media } = req.body;

            if (!recipientId || !content?.trim()) {
                return sendResponse(res, 400, 'Recipient ID and content are required');
            }

            if (!validateObjectId(recipientId)) {
                return sendResponse(res, 400, 'Invalid recipient ID');
            }

            const recipientObjectId = toObjectId(recipientId);
            
            // Check if recipient exists
            const recipient = await User.findById(recipientObjectId);
            if (!recipient) {
                return sendResponse(res, 404, 'Recipient not found');
            }

            // Generate conversation ID
            const conversationId = Message.generateConversationId(senderId, recipientObjectId);

            // Create message
            const message = await Message.create({
                sender: senderId,
                recipient: recipientObjectId,
                content: sanitizeInput(content),
                messageType,
                media,
                conversationId
            });

            // Find or create conversation
            let conversation = await Conversation.findOne({ conversationId });
            
            if (!conversation) {
                conversation = await Conversation.create({
                    participants: [senderId, recipientObjectId],
                    conversationId,
                    unreadCount: new Map()
                });
            }

            // Update conversation with last message
            await conversation.updateLastMessage(content, senderId);

            // Populate sender info for response
            await message.populate('sender', 'displayName handle avatarUrl');

            return sendResponse(res, 201, 'Message sent successfully', message);
        } catch (error) {
            console.error('Error sending message:', error);
            return sendResponse(res, 500, 'Internal Server Error');
        }
    }

    // Delete a message
    static async deleteMessage(req, res) {
        try {
            const userId = req.user._id;
            const { messageId } = req.params;

            if (!validateObjectId(messageId)) {
                return sendResponse(res, 400, 'Invalid message ID');
            }

            const message = await Message.findById(messageId);
            if (!message) {
                return sendResponse(res, 404, 'Message not found');
            }

            // Only sender can delete their message
            if (message.sender.toString() !== userId.toString()) {
                return sendResponse(res, 403, 'You can only delete your own messages');
            }

            await message.softDelete();

            return sendResponse(res, 200, 'Message deleted successfully');
        } catch (error) {
            console.error('Error deleting message:', error);
            return sendResponse(res, 500, 'Internal Server Error');
        }
    }

    // Mark messages as read
    static async markAsRead(req, res) {
        try {
            const userId = req.user._id;
            const { conversationId } = req.params;

            if (!conversationId) {
                return sendResponse(res, 400, 'Conversation ID is required');
            }

            // Update messages
            await Message.updateMany(
                {
                    conversationId,
                    recipient: userId,
                    isRead: false
                },
                {
                    isRead: true,
                    readAt: new Date()
                }
            );

            // Update conversation
            const conversation = await Conversation.findOne({
                conversationId,
                participants: userId
            });

            if (conversation) {
                await conversation.markAsRead(userId);
            }

            return sendResponse(res, 200, 'Messages marked as read');
        } catch (error) {
            console.error('Error marking messages as read:', error);
            return sendResponse(res, 500, 'Internal Server Error');
        }
    }

    // Search users for messaging
    static async searchUsers(req, res) {
        try {
            const { query } = req.query;
            const userId = req.user._id;

            if (!query || query.trim().length < 2) {
                return sendResponse(res, 400, 'Search query must be at least 2 characters');
            }

            const users = await User.find({
                _id: { $ne: userId }, // Exclude current user
                $or: [
                    { displayName: { $regex: query, $options: 'i' } },
                    { handle: { $regex: query, $options: 'i' } }
                ],
                isActive: true
            })
            .select('displayName handle avatarUrl')
            .limit(20)
            .lean();

            return sendResponse(res, 200, 'Users found', users);
        } catch (error) {
            console.error('Error searching users:', error);
            return sendResponse(res, 500, 'Internal Server Error');
        }
    }
}