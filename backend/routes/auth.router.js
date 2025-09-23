import { Router } from "express";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import passport from "../configs/passport"
import sendResponse from "../services/response";

dotenv.config();

const router = Router();

// start twitter oauth
router.get("/twitter", passport.authenticate("twitter", {
    scope: ["tweet.read", "users.read", "offline.access"]
}));

// handle callback from twitter
router.get("/twitter/callback",
    passport.authenticate("twitter", { failureRedirect: process.env.FRONTEND_LOGIN_ENDPOINT } ),
    async (req, res) => {
        const user = req.user;
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'prod',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            sameSite: 'None'
        });
        sendResponse(res, 201, "User authenticated successfully", { token, user });
    }
)

export default router;
