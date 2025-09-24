import mongoose from 'mongoose';

export const toObjectId = (id) => {
    try {
        return new mongoose.Types.ObjectId(id);
    } catch {
        return null;
    }
};

export const validateObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

export const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input.trim().replace(/[<>]/g, '');
};