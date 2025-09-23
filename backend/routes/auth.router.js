import { Router } from "express";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import passport from "../configs/passport"

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
        // redirect to frontend with token
        res.redirect(`${process.env.FRONTEND_LOGIN_ENDPOINT}?token=${token}`);
    }
)

export default router;
