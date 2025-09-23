import jwt from "jsonwebtoken";
import User from "../models/users";
import dotenv from 'dotenv';
import sendResponse from "../services/response"

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
        token = req.cookies?.token;
    }
    
    if (!token) {
        return sendResponse(res, 401, "Authentication token missing");
    }

    jwt.verify(token, JWT_SECRET, async (err, payload) => {
        if (err) return sendResponse(res, 401, "Invalid or expired token");

        try {
            const user = await User.findById(payload.userId);
            if (!user) {
                return sendResponse(res, 401, "Invalid or expired token");
            }
            req.user = user; // Attach user to request object
            next();
        } catch (error) {
            console.error("Error in authentication middleware:", error);
            return sendResponse(res, 500, "Internal server error");
        }
    })
}
