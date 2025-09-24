import jwt from "jsonwebtoken";
import User from "../models/users.js";
import dotenv from 'dotenv';
import sendResponse from "../services/response.js";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
}

export default function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    let token;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    } else {
        token = req.cookies?.jwt;
    }
    
    if (!token) {
        next(); // Proceed without authentication
        return;
    }

    jwt.verify(token, JWT_SECRET, async (err, payload) => {
        if (err) return next(); // Invalid token, proceed without authentication

        try {
            const user = await User.findById(payload.userId);
            if (!user) {
                return next(); // Invalid or expired token, proceed without authentication
            }
            req.user = user; // Attach user to request object
            next();
        } catch (error) {
            console.error("Error in authentication middleware:", error);
            return sendResponse(res, 500, "Internal server error");
        }
    });
}

export function authRequired(req, res, next) {
    if (!req.user) {
        return sendResponse(res, 401, "Unauthorized: Authentication required");
    }
    next();
}
