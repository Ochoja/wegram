import mongoose from 'mongoose';

export const toObjectId = (id) => {
    try {
        return mongoose.Types.ObjectId(id);
    } catch {
        return null;
    }
}