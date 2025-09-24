import mongoose from 'mongoose';

const { Schema } = mongoose;

const MessageSchema = new Schema({
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    content: { type: String, required: true, maxlength: 1000 },
    messageType: { type: String, enum: ['text', 'image', 'file'], default: 'text' },
    media: {
        url: { type: String },
        mimeType: { type: String },
        size: { type: Number }
    },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    conversationId: { type: String, required: true, index: true }
}, { timestamps: true });

// Create compound index for efficient conversation queries
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ sender: 1, recipient: 1 });

// Method to mark message as read
MessageSchema.methods.markAsRead = async function() {
    if (!this.isRead) {
        this.isRead = true;
        this.readAt = new Date();
        await this.save();
    }
};

// Method to soft delete message
MessageSchema.methods.softDelete = async function() {
    this.isDeleted = true;
    this.deletedAt = new Date();
    await this.save();
};

// Static method to generate conversation ID
MessageSchema.statics.generateConversationId = function(userId1, userId2) {
    const ids = [userId1.toString(), userId2.toString()].sort();
    return `${ids[0]}_${ids[1]}`;
};

const Message = mongoose.model('Message', MessageSchema);

export default Message;