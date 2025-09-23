import passport from "passport";
import dotenv from 'dotenv';
import User from "../models/users";

import { Strategy as TwitterStrategy } from "@superfaceai/passport-twitter-oauth2";

dotenv.config();

passport.use(new TwitterStrategy(
    {
        clientID: process.env.TWITTER_CLIENT_ID,
        clientSecret: process.env.TWITTER_CLIENT_SECRET,
        callbackURL: process.env.TWITTER_CALLBACK_URL,
        clientType: 'confidential',
    },
    // the verify callback
    async (accessToken, refreshToken, profile, done) => {
        try {
            // find or create a user in our database
            let user = await User.findOne({ oauthProvider: 'twitter', oauthId: profile.id });
            if (!user) {
                user = new User({
                    oauthProvider: 'twitter',
                    oauthId: profile.id,
                    displayName: profile.displayName || profile.username,
                    handle: profile.username,
                    avatarUrl: profile._json.profile_image_url,
                    bio: profile._json.description
                })
                await user.save();
            }
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }
)
)

// Serialize and deserialize user for session management
passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

export default passport;
