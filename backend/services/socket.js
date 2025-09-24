import jwt from 'jsonwebtoken';
import User from '../models/users.js';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const connectedUsers = new Map(); // userId -> socketId mapping

// Socket authentication middleware
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.userId);
    
    if (!user) {
      return next(new Error('Invalid token'));
    }

    socket.userId = user._id.toString();
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
};

export const initializeSocket = (io) => {
  // Apply authentication middleware
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.displayName} connected: ${socket.id}`);
    
    // Store user connection
    connectedUsers.set(socket.userId, socket.id);
    
    // Join user to their personal room for notifications
    socket.join(`user_${socket.userId}`);

    // Handle joining conversation rooms
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conversation_${conversationId}`);
      console.log(`User ${socket.userId} joined conversation ${conversationId}`);
    });

    // Handle leaving conversation rooms
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation_${conversationId}`);
      console.log(`User ${socket.userId} left conversation ${conversationId}`);
    });

    // Handle typing indicators
    socket.on('typing_start', ({ conversationId, recipientId }) => {
      socket.to(`conversation_${conversationId}`).emit('user_typing', {
        userId: socket.userId,
        username: socket.user.displayName,
        conversationId
      });
    });

    socket.on('typing_stop', ({ conversationId }) => {
      socket.to(`conversation_${conversationId}`).emit('user_stopped_typing', {
        userId: socket.userId,
        conversationId
      });
    });

    // Handle message read receipts
    socket.on('message_read', ({ conversationId, messageId }) => {
      socket.to(`conversation_${conversationId}`).emit('message_read_receipt', {
        messageId,
        readBy: socket.userId,
        readAt: new Date()
      });
    });

    // Handle user status updates
    socket.on('status_update', (status) => {
      // Broadcast status to user's contacts/followers
      socket.broadcast.emit('user_status_changed', {
        userId: socket.userId,
        status,
        timestamp: new Date()
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User ${socket.user.displayName} disconnected: ${socket.id}`);
      connectedUsers.delete(socket.userId);
      
      // Notify contacts that user went offline
      socket.broadcast.emit('user_offline', {
        userId: socket.userId,
        timestamp: new Date()
      });
    });
  });
};

// Helper function to emit message to specific user
export const emitToUser = (io, userId, event, data) => {
  const socketId = connectedUsers.get(userId);
  if (socketId) {
    io.to(socketId).emit(event, data);
    return true;
  }
  return false;
};

// Helper function to emit to conversation
export const emitToConversation = (io, conversationId, event, data, excludeUserId = null) => {
  const room = `conversation_${conversationId}`;
  if (excludeUserId) {
    const excludeSocketId = connectedUsers.get(excludeUserId);
    if (excludeSocketId) {
      io.to(room).except(excludeSocketId).emit(event, data);
    } else {
      io.to(room).emit(event, data);
    }
  } else {
    io.to(room).emit(event, data);
  }
};

// Helper function to check if user is online
export const isUserOnline = (userId) => {
  return connectedUsers.has(userId);
};

// Helper function to get online users count
export const getOnlineUsersCount = () => {
  return connectedUsers.size;
};

// Helper function to get all online users
export const getOnlineUsers = () => {
  return Array.from(connectedUsers.keys());
};