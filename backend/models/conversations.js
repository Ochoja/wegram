import mongoose from 'mongoose';

const { Schema } = mongoose;

const ConversationSchema = new Schema({
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    conversationId: { type: String, required: true, unique: true, index: true },
    lastMessage: {
        content: { type: String },
        sender: { type: Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date }
    },
    unreadCount: {
        type: Map,
        of: Number,
        default: new Map()
    },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Method to update last message
ConversationSchema.methods.updateLastMessage = async function(messageContent, senderId) {
    this.lastMessage = {
        content: messageContent,
        sender: senderId,
        timestamp: new Date()
    };
    
    // Increment unread count for all participants except sender
    this.participants.forEach(participantId => {
        if (participantId.toString() !== senderId.toString()) {
            const currentCount = this.unreadCount.get(participantId.toString()) || 0;
            this.unreadCount.set(participantId.toString(), currentCount + 1);
        }
    });
    
    await this.save();
};

// Method to mark conversation as read for a user
ConversationSchema.methods.markAsRead = async function(userId) {
    this.unreadCount.set(userId.toString(), 0);
    await this.save();
};

const Conversation = mongoose.model('Conversation', ConversationSchema);

export default Conversation;