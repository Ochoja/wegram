import { Router } from 'express';
import { GameController } from '../controllers/game.controller.js';
import { authRequired } from '../middleware/authenticate.js';

const router = Router();

// All game routes require authentication
router.use(authRequired);

// Game run management
router.post('/run/start', ...GameController.startRun);
router.post('/run/finish', ...GameController.finishRun);

// Reward system
router.post('/reward/claim', ...GameController.claimReward);

// Statistics and leaderboard
router.get('/leaderboard', ...GameController.getLeaderboard);
router.get('/me', ...GameController.getPlayerStats);

export default router;