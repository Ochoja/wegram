import GameRun from '../models/gameRuns.js';
import GameReward from '../models/gameRewards.js';
import User from '../models/users.js';
import { toObjectId, validateObjectId, sanitizeInput } from '../services/utils.js';
import sendResponse from '../services/response.js';
import crypto from 'crypto';

// Rate limiting storage (in production, use Redis)
const rateLimitStore = new Map();

// Rate limiting middleware
const rateLimit = (maxRequests, windowMs, keyGenerator) => {
    return (req, res, next) => {
        const key = keyGenerator(req);
        const now = Date.now();
        const windowStart = now - windowMs;
        
        if (!rateLimitStore.has(key)) {
            rateLimitStore.set(key, []);
        }
        
        const requests = rateLimitStore.get(key);
        // Remove old requests outside the window
        const validRequests = requests.filter(time => time > windowStart);
        
        if (validRequests.length >= maxRequests) {
            return sendResponse(res, 429, 'Too many requests. Please try again later.');
        }
        
        validRequests.push(now);
        rateLimitStore.set(key, validRequests);
        
        next();
    };
};

export class GameController {
    // POST /game/run/start
    static startRun = [
        rateLimit(10, 60000, req => `start_${req.user._id}`), // 10 starts per minute per user
        async (req, res) => {
            try {
                const userId = req.user._id;
                const { gameType = 'runner', clientNonce, clientData = {} } = req.body;

                // Check for active runs
                const activeRun = await GameRun.findOne({
                    userId,
                    status: 'active',
                    createdAt: { $gte: new Date(Date.now() - 600000) } // 10 minutes
                });

                if (activeRun) {
                    return sendResponse(res, 400, 'You have an active game run. Please finish it first.');
                }

                // Generate secure identifiers
                const runId = crypto.randomUUID();
                const serverNonce = crypto.randomBytes(32).toString('hex');

                // Create new game run
                const gameRun = await GameRun.create({
                    runId,
                    userId,
                    gameType,
                    serverNonce,
                    clientNonce: sanitizeInput(clientNonce),
                    startTime: new Date(),
                    clientData: {
                        userAgent: sanitizeInput(clientData.userAgent),
                        screenResolution: sanitizeInput(clientData.screenResolution),
                        timezone: sanitizeInput(clientData.timezone)
                    }
                });

                return sendResponse(res, 201, 'Game run started successfully', {
                    runId: gameRun.runId,
                    serverNonce: gameRun.serverNonce,
                    startTime: gameRun.startTime
                });
            } catch (error) {
                console.error('Error starting game run:', error);
                return sendResponse(res, 500, 'Internal Server Error');
            }
        }
    ];

    // POST /game/run/finish
    static finishRun = [
        rateLimit(20, 60000, req => `finish_${req.user._id}`), // 20 finishes per minute per user
        async (req, res) => {
            try {
                const userId = req.user._id;
                const { 
                    runId, 
                    duration, 
                    score, 
                    distance, 
                    coinsCollected = 0, 
                    powerUpsUsed = 0,
                    clientNonce 
                } = req.body;

                if (!runId || !duration || score === undefined || distance === undefined) {
                    return sendResponse(res, 400, 'Missing required fields: runId, duration, score, distance');
                }

                // Find the active run
                const gameRun = await GameRun.findOne({
                    runId,
                    userId,
                    status: 'active'
                });

                if (!gameRun) {
                    return sendResponse(res, 404, 'Active game run not found');
                }

                // Validate client nonce if provided during start
                if (gameRun.clientNonce && clientNonce !== gameRun.clientNonce) {
                    return sendResponse(res, 400, 'Invalid client nonce');
                }

                // Validate the run completion
                const validation = gameRun.validateCompletion({
                    duration,
                    score,
                    distance,
                    coinsCollected
                });

                // Update game run
                gameRun.endTime = new Date();
                gameRun.duration = duration;
                gameRun.score = score;
                gameRun.distance = distance;
                gameRun.coinsCollected = coinsCollected;
                gameRun.powerUpsUsed = powerUpsUsed;
                gameRun.status = validation.isValid ? 'completed' : 'invalid';
                gameRun.isEligibleForReward = validation.isValid && score >= 100; // Minimum score for rewards

                if (validation.isValid) {
                    gameRun.rewardAmount = gameRun.calculateReward();
                }

                await gameRun.save();

                const response = {
                    runId: gameRun.runId,
                    status: gameRun.status,
                    score: gameRun.score,
                    distance: gameRun.distance,
                    duration: gameRun.duration,
                    isEligibleForReward: gameRun.isEligibleForReward,
                    rewardAmount: gameRun.rewardAmount
                };

                if (!validation.isValid) {
                    response.violations = validation.violations;
                }

                return sendResponse(res, 200, 'Game run completed', response);
            } catch (error) {
                console.error('Error finishing game run:', error);
                return sendResponse(res, 500, 'Internal Server Error');
            }
        }
    ];

    // POST /game/reward/claim
    static claimReward = [
        rateLimit(5, 60000, req => `claim_${req.user._id}`), // 5 claims per minute per user
        async (req, res) => {
            try {
                const userId = req.user._id;
                const { runId } = req.body;

                if (!runId) {
                    return sendResponse(res, 400, 'Run ID is required');
                }

                // Find the completed run
                const gameRun = await GameRun.findOne({
                    runId,
                    userId,
                    status: 'completed',
                    isEligibleForReward: true,
                    rewardClaimed: false
                });

                if (!gameRun) {
                    return sendResponse(res, 404, 'Eligible game run not found or reward already claimed');
                }

                // Check if reward was already created
                const existingReward = await GameReward.findOne({ runId, userId });
                if (existingReward) {
                    return sendResponse(res, 400, 'Reward already claimed for this run');
                }

                // Create reward entry
                const reward = await GameReward.create({
                    userId,
                    runId,
                    gameType: gameRun.gameType,
                    rewardType: 'tokens',
                    amount: gameRun.rewardAmount,
                    status: 'completed', // In production, this might be 'pending' until blockchain confirmation
                    metadata: {
                        score: gameRun.score,
                        distance: gameRun.distance,
                        duration: gameRun.duration
                    }
                });

                // Mark run as reward claimed
                gameRun.rewardClaimed = true;
                await gameRun.save();

                // In production, you would:
                // 1. Mint tokens to user's wallet
                // 2. Update user's token balance
                // 3. Create blockchain transaction
                // 4. Update reward status based on transaction result

                return sendResponse(res, 201, 'Reward claimed successfully', {
                    rewardId: reward._id,
                    amount: reward.amount,
                    rewardType: reward.rewardType,
                    status: reward.status,
                    claimedAt: reward.claimedAt
                });
            } catch (error) {
                console.error('Error claiming reward:', error);
                return sendResponse(res, 500, 'Internal Server Error');
            }
        }
    ];

    // GET /game/leaderboard
    static getLeaderboard = [
        rateLimit(30, 60000, req => `leaderboard_${req.ip}`), // 30 requests per minute per IP
        async (req, res) => {
            try {
                const page = Math.max(1, parseInt(req.query.page || '1', 10));
                const limit = Math.min(50, parseInt(req.query.limit || '10', 10));
                const timeframe = req.query.timeframe || 'all'; // all, daily, weekly, monthly

                let dateFilter = {};
                const now = new Date();
                
                switch (timeframe) {
                    case 'daily':
                        dateFilter = { createdAt: { $gte: new Date(now.setHours(0, 0, 0, 0)) } };
                        break;
                    case 'weekly':
                        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
                        dateFilter = { createdAt: { $gte: weekStart } };
                        break;
                    case 'monthly':
                        dateFilter = { createdAt: { $gte: new Date(now.getFullYear(), now.getMonth(), 1) } };
                        break;
                }

                const leaderboard = await GameRun.aggregate([
                    {
                        $match: {
                            status: 'completed',
                            ...dateFilter
                        }
                    },
                    {
                        $group: {
                            _id: '$userId',
                            bestScore: { $max: '$score' },
                            totalDistance: { $sum: '$distance' },
                            totalRuns: { $sum: 1 },
                            totalRewards: { $sum: '$rewardAmount' }
                        }
                    },
                    {
                        $lookup: {
                            from: 'users',
                            localField: '_id',
                            foreignField: '_id',
                            as: 'user'
                        }
                    },
                    {
                        $unwind: '$user'
                    },
                    {
                        $project: {
                            userId: '$_id',
                            username: '$user.displayName',
                            handle: '$user.handle',
                            avatar: '$user.avatarUrl',
                            bestScore: 1,
                            totalDistance: 1,
                            totalRuns: 1,
                            totalRewards: 1
                        }
                    },
                    {
                        $sort: { bestScore: -1 }
                    },
                    {
                        $skip: (page - 1) * limit
                    },
                    {
                        $limit: limit
                    }
                ]);

                const total = await GameRun.distinct('userId', { 
                    status: 'completed',
                    ...dateFilter 
                }).then(users => users.length);

                return sendResponse(res, 200, 'Leaderboard fetched successfully', {
                    leaderboard,
                    page,
                    limit,
                    total,
                    timeframe
                });
            } catch (error) {
                console.error('Error fetching leaderboard:', error);
                return sendResponse(res, 500, 'Internal Server Error');
            }
        }
    ];

    // GET /game/me
    static getPlayerStats = [
        rateLimit(60, 60000, req => `stats_${req.user._id}`), // 60 requests per minute per user
        async (req, res) => {
            try {
                const userId = req.user._id;

                // Get player statistics
                const stats = await GameRun.aggregate([
                    {
                        $match: {
                            userId: toObjectId(userId),
                            status: 'completed'
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalRuns: { $sum: 1 },
                            bestScore: { $max: '$score' },
                            totalDistance: { $sum: '$distance' },
                            totalCoins: { $sum: '$coinsCollected' },
                            averageScore: { $avg: '$score' },
                            totalPlayTime: { $sum: '$duration' }
                        }
                    }
                ]);

                // Get total rewards earned
                const rewardStats = await GameReward.aggregate([
                    {
                        $match: {
                            userId: toObjectId(userId),
                            status: 'completed'
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalRewards: { $sum: '$amount' },
                            totalClaims: { $sum: 1 }
                        }
                    }
                ]);

                // Get recent runs
                const recentRuns = await GameRun.find({
                    userId,
                    status: { $in: ['completed', 'invalid'] }
                })
                .select('runId score distance duration createdAt status isEligibleForReward rewardAmount')
                .sort({ createdAt: -1 })
                .limit(10)
                .lean();

                // Get player rank
                const betterPlayers = await GameRun.aggregate([
                    {
                        $match: { status: 'completed' }
                    },
                    {
                        $group: {
                            _id: '$userId',
                            bestScore: { $max: '$score' }
                        }
                    },
                    {
                        $match: {
                            bestScore: { $gt: stats[0]?.bestScore || 0 }
                        }
                    },
                    {
                        $count: 'count'
                    }
                ]);

                const playerRank = (betterPlayers[0]?.count || 0) + 1;

                const playerStats = {
                    totalRuns: stats[0]?.totalRuns || 0,
                    bestScore: stats[0]?.bestScore || 0,
                    totalDistance: stats[0]?.totalDistance || 0,
                    totalCoins: stats[0]?.totalCoins || 0,
                    averageScore: Math.round(stats[0]?.averageScore || 0),
                    totalPlayTime: stats[0]?.totalPlayTime || 0,
                    totalRewards: rewardStats[0]?.totalRewards || 0,
                    totalClaims: rewardStats[0]?.totalClaims || 0,
                    currentRank: playerRank,
                    recentRuns
                };

                return sendResponse(res, 200, 'Player stats fetched successfully', playerStats);
            } catch (error) {
                console.error('Error fetching player stats:', error);
                return sendResponse(res, 500, 'Internal Server Error');
            }
        }
    ];
}