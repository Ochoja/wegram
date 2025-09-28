import Profile from '../models/profiles.js';
import User from '../models/users.js';
import { sanitizeInput } from '../services/utils.js';
import sendResponse from '../services/response.js';

export class ProfileController {
    // GET /api/v1/profile/me
    static async getMyProfile(req, res) {
        try {
            const userId = req.user._id;

            let profile = await Profile.findOne({ userId, isActive: true });
            
            // If no profile exists, create one with default values from User model
            if (!profile) {
                const user = await User.findById(userId);
                if (!user) {
                    return sendResponse(res, 404, 'User not found');
                }

                // Generate unique username from handle or displayName
                let baseUsername = user.handle || user.displayName.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
                let username = baseUsername;
                let counter = 1;

                // Ensure username is unique
                while (!(await Profile.isUsernameAvailable(username))) {
                    username = `${baseUsername}${counter}`;
                    counter++;
                }

                profile = await Profile.create({
                    userId,
                    username,
                    about: user.bio || ''
                });
            }

            return sendResponse(res, 200, 'Profile fetched successfully', {
                username: profile.username,
                about: profile.about,
                createdAt: profile.createdAt,
                updatedAt: profile.updatedAt
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            return sendResponse(res, 500, 'Internal Server Error');
        }
    }

    // PUT /api/v1/profile/me
    static async updateMyProfile(req, res) {
        try {
            const userId = req.user._id;
            const { username, about } = req.body;

            // Validation
            if (!username && about === undefined) {
                return sendResponse(res, 400, 'At least one field (username or about) is required');
            }

            // Find existing profile
            let profile = await Profile.findOne({ userId, isActive: true });
            if (!profile) {
                return sendResponse(res, 404, 'Profile not found. Please create a profile first.');
            }

            // Validate username if provided
            if (username !== undefined) {
                if (!username || username.trim().length === 0) {
                    return sendResponse(res, 400, 'Username cannot be empty');
                }

                const trimmedUsername = username.trim();

                // Check length
                if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
                    return sendResponse(res, 400, 'Username must be between 3 and 30 characters');
                }

                // Check format (alphanumeric and underscore only)
                if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
                    return sendResponse(res, 400, 'Username can only contain letters, numbers, and underscores');
                }

                // Check if username is available (excluding current user)
                const isAvailable = await Profile.isUsernameAvailable(trimmedUsername, userId);
                if (!isAvailable) {
                    return sendResponse(res, 400, 'Username is already taken');
                }

                profile.username = trimmedUsername;
            }

            // Validate about if provided
            if (about !== undefined) {
                const sanitizedAbout = sanitizeInput(about);
                
                if (sanitizedAbout.length > 500) {
                    return sendResponse(res, 400, 'About section cannot exceed 500 characters');
                }

                profile.about = sanitizedAbout;
            }

            await profile.save();

            return sendResponse(res, 200, 'Profile updated successfully', {
                username: profile.username,
                about: profile.about,
                updatedAt: profile.updatedAt
            });
        } catch (error) {
            console.error('Error updating profile:', error);
            
            // Handle MongoDB duplicate key error
            if (error.code === 11000) {
                return sendResponse(res, 400, 'Username is already taken');
            }
            
            return sendResponse(res, 500, 'Internal Server Error');
        }
    }

    // GET /api/v1/profile/check-username/:username
    static async checkUsernameAvailability(req, res) {
        try {
            const { username } = req.params;
            const userId = req.user._id;

            if (!username || username.trim().length === 0) {
                return sendResponse(res, 400, 'Username is required');
            }

            const trimmedUsername = username.trim();

            // Check length
            if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
                return sendResponse(res, 400, 'Username must be between 3 and 30 characters');
            }

            // Check format
            if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
                return sendResponse(res, 400, 'Username can only contain letters, numbers, and underscores');
            }

            const isAvailable = await Profile.isUsernameAvailable(trimmedUsername, userId);

            return sendResponse(res, 200, 'Username availability checked', {
                username: trimmedUsername,
                available: isAvailable
            });
        } catch (error) {
            console.error('Error checking username availability:', error);
            return sendResponse(res, 500, 'Internal Server Error');
        }
    }

    // GET /api/v1/profile/:username
    static async getProfileByUsername(req, res) {
        try {
            const { username } = req.params;

            if (!username || username.trim().length === 0) {
                return sendResponse(res, 400, 'Username is required');
            }

            const profile = await Profile.findOne({ 
                username: username.toLowerCase(), 
                isActive: true 
            }).populate('userId', 'displayName avatarUrl createdAt');

            if (!profile) {
                return sendResponse(res, 404, 'Profile not found');
            }

            return sendResponse(res, 200, 'Profile fetched successfully', {
                username: profile.username,
                about: profile.about,
                displayName: profile.userId.displayName,
                avatarUrl: profile.userId.avatarUrl,
                memberSince: profile.userId.createdAt,
                profileCreatedAt: profile.createdAt
            });
        } catch (error) {
            console.error('Error fetching profile by username:', error);
            return sendResponse(res, 500, 'Internal Server Error');
        }
    }
}