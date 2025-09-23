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
            console.log("Access Token:\n\t", accessToken);
            console.log("Refresh Token:\n\t", refreshToken);
            console.log("Twitter profile\n\t:", profile);
            // find or create a user in our database
            let user = await User.findOne({ oauthProvider: 'x', oauthId: profile.id });
            if (!user) {
                user = new User({
                    oauthProvider: 'x',
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

export default passport;
