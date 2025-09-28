import mongoose from 'mongoose';

const { Schema } = mongoose;

const GameRunSchema = new Schema({
    runId: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    gameType: { type: String, enum: ['runner'], default: 'runner' },
    serverNonce: { type: String, required: true },
    clientNonce: { type: String },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    duration: { type: Number }, // in milliseconds
    score: { type: Number, default: 0 },
    distance: { type: Number, default: 0 },
    coinsCollected: { type: Number, default: 0 },
    powerUpsUsed: { type: Number, default: 0 },
    status: { 
        type: String, 
        enum: ['active', 'completed', 'abandoned', 'invalid'], 
        default: 'active' 
    },
    isEligibleForReward: { type: Boolean, default: false },
    rewardClaimed: { type: Boolean, default: false },
    rewardAmount: { type: Number, default: 0 },
    suspiciousActivity: {
        speedViolations: { type: Number, default: 0 },
        impossibleMoves: { type: Number, default: 0 },
        timeInconsistencies: { type: Number, default: 0 }
    },
    clientData: {
        userAgent: { type: String },
        screenResolution: { type: String },
        timezone: { type: String }
    }
}, { timestamps: true });

// Compound indexes for efficient queries
GameRunSchema.index({ userId: 1, createdAt: -1 });
GameRunSchema.index({ status: 1, isEligibleForReward: 1 });
GameRunSchema.index({ score: -1, createdAt: -1 }); // For leaderboard

// Method to validate run completion
GameRunSchema.methods.validateCompletion = function(submittedData) {
    const { duration, score, distance, coinsCollected } = submittedData;
    
    // Basic validation rules
    const minDuration = 1000; // 1 second minimum
    const maxDuration = 600000; // 10 minutes maximum
    const maxScore = 1000000; // Maximum possible score
    const maxSpeed = 50; // Maximum units per second
    
    let isValid = true;
    const violations = [];
    
    // Duration checks
    if (duration < minDuration || duration > maxDuration) {
        isValid = false;
        violations.push('Invalid duration');
        this.suspiciousActivity.timeInconsistencies += 1;
    }
    
    // Speed checks (distance vs time)
    const averageSpeed = distance / (duration / 1000);
    if (averageSpeed > maxSpeed) {
        isValid = false;
        violations.push('Impossible speed detected');
        this.suspiciousActivity.speedViolations += 1;
    }
    
    // Score consistency checks
    const expectedMaxScore = Math.floor(distance * 10 + coinsCollected * 50);
    if (score > expectedMaxScore * 1.2) { // 20% tolerance
        isValid = false;
        violations.push('Score inconsistent with gameplay');
        this.suspiciousActivity.impossibleMoves += 1;
    }
    
    // Time consistency with server
    const serverDuration = Date.now() - this.startTime.getTime();
    const timeDifference = Math.abs(serverDuration - duration);
    if (timeDifference > 5000) { // 5 second tolerance
        isValid = false;
        violations.push('Time inconsistency with server');
        this.suspiciousActivity.timeInconsistencies += 1;
    }
    
    return { isValid, violations };
};

// Method to calculate reward eligibility
GameRunSchema.methods.calculateReward = function() {
    if (!this.isEligibleForReward || this.rewardClaimed) {
        return 0;
    }
    
    // Base reward calculation
    let reward = 0;
    
    // Score-based rewards
    if (this.score >= 1000) reward += 10;
    if (this.score >= 5000) reward += 25;
    if (this.score >= 10000) reward += 50;
    
    // Distance-based rewards
    if (this.distance >= 100) reward += 5;
    if (this.distance >= 500) reward += 15;
    if (this.distance >= 1000) reward += 30;
    
    // Bonus for clean runs (no suspicious activity)
    const totalViolations = this.suspiciousActivity.speedViolations + 
                           this.suspiciousActivity.impossibleMoves + 
                           this.suspiciousActivity.timeInconsistencies;
    
    if (totalViolations === 0) {
        reward = Math.floor(reward * 1.2); // 20% bonus for clean play
    }
    
    return Math.min(reward, 100); // Cap at 100 tokens per run
};

const GameRun = mongoose.model('GameRun', GameRunSchema);

export default GameRun;