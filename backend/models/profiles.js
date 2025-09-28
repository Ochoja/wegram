import mongoose from 'mongoose';

const { Schema } = mongoose;

const ProfileSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    username: { 
        type: String, 
        required: true, 
        unique: true, 
        index: true,
        trim: true,
        minlength: 3,
        maxlength: 30,
        match: /^[a-zA-Z0-9_]+$/ // Only alphanumeric and underscore
    },
    about: { 
        type: String, 
        maxlength: 500,
        trim: true,
        default: ''
    },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Method to check if username is available
ProfileSchema.statics.isUsernameAvailable = async function(username, excludeUserId = null) {
    const query = { username: username.toLowerCase(), isActive: true };
    if (excludeUserId) {
        query.userId = { $ne: excludeUserId };
    }
    const existingProfile = await this.findOne(query);
    return !existingProfile;
};

// Pre-save middleware to lowercase username
ProfileSchema.pre('save', function(next) {
    if (this.username) {
        this.username = this.username.toLowerCase();
    }
    next();
});

const Profile = mongoose.model('Profile', ProfileSchema);

export default Profile;