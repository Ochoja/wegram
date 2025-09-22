import mongoose from "mongoose";

const { Schema } = mongoose;

const UserSchema = new Schema({
    oauthProvider: { type: String, enum: ['x'], default : 'x'},
    oauthId: { type: String, index: true, sparse: true},
    username: { type: String, required: true, unique: true, index: true},
    handle: { type: String, required: true, unique: true, index: true},
    email: { type: String, unique: true, sparse: true },
    avatarUrl: { type: String },
    bio: { type: String },
    bookmarks: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    postsCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    settings: {
        notifications: {
            likes: { type: Boolean, default: true },
            comments: { type: Boolean, default: true },
            reposts: { type: Boolean, default: true },
            newFollowers: { type: Boolean, default: true },
            tags: { type: Boolean, default: true },
            whitelist: { type: Boolean, default: true },
        },
        privacy: {
            profileVisibility: { type: String, enum: ['public', 'private'], default: 'public' },
        },
        twoFactorEnabled: { type: Boolean, default: false}
    }
}, { timestamps: true });

// add post to bookmarks and increment bookmark count on post
UserSchema.methods.addorRemoveBookmark = async function(postId) {
    const Post = mongoose.model('Post');
    
    const addResult = await this.updateOne({
        $addToSet: { bookmarks: postId }
    });

    if (addResult.modifiedCount > 0) {
        // Bookmark was added, increment post's bookmark count
        await Post.findByIdAndUpdate(postId, {
            $inc: { bookmarksCount: 1 }
        });
    } else {
        // Bookmark already exists, remove it and decrement post's bookmark count
        await Promise.all([
            this.updateOne({
                $pull: { bookmarks: postId }
            }),
            Post.findByIdAndUpdate(postId, {
                $inc: { bookmarksCount: -1 }
            })
        ]);
    }
};

const User = mongoose.model('User', UserSchema);

export default User;
