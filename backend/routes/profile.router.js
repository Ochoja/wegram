import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller.js';
import { authRequired } from '../middleware/authenticate.js';

const router = Router();

// Get my profile (requires auth)
router.get('/me', authRequired, ProfileController.getMyProfile);

// Update my profile (requires auth)
router.put('/me', authRequired, ProfileController.updateMyProfile);

// Check username availability (requires auth)
router.get('/check-username/:username', authRequired, ProfileController.checkUsernameAvailability);

// Get profile by username (public)
router.get('/:username', ProfileController.getProfileByUsername);

export default router;