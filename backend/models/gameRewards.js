import mongoose from 'mongoose';

const { Schema } = mongoose;

const GameRewardSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    runId: { type: String, required: true, index: true },
    gameType: { type: String, enum: ['runner'], default: 'runner' },
    rewardType: { type: String, enum: ['tokens', 'nft', 'badge'], default: 'tokens' },
    amount: { type: Number, required: true },
    transactionHash: { type: String }, // For blockchain transactions
    status: { 
        type: String, 
        enum: ['pending', 'completed', 'failed'], 
        default: 'pending' 
    },
    claimedAt: { type: Date, default: Date.now },
    metadata: {
        score: { type: Number },
        distance: { type: Number },
        duration: { type: Number }
    }
}, { timestamps: true });

// Compound indexes
GameRewardSchema.index({ userId: 1, createdAt: -1 });
GameRewardSchema.index({ status: 1, createdAt: -1 });

const GameReward = mongoose.model('GameReward', GameRewardSchema);

export default GameReward;