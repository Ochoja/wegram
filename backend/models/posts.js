import mongoose from 'mongoose';

const { Schema } = mongoose;

const MediaSchema = new Schema({
    url: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true }, // size in bytes
}, { _id: false });


const PostSchema = new Schema({
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    content: { type: String, maxlength: 2000 },
    media: [MediaSchema],
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    reposts: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    repostsCount: { type: Number, default: 0 },
    bookmarksCount: { type: Number, default: 0 },
    trendingScore: { type: Number, default: 0, index: true },
}, { timestamps: true });

// add/remove user to likes and increment/decrement likesCount
PostSchema.methods.addorRemoveLike = async function(userId) {
    const addResult = await this.updateOne({
        $addToSet: { likes: userId },
        $inc: { likesCount: 1 }
    });

    if (addResult.modifiedCount === 0) {
        await this.updateOne({
            $pull: { likes: userId },
            $inc: { likesCount: -1 }
        });
    }
};

// add/remove repost and increment/decrement repostsCount
PostSchema.methods.addorRemoveRepost = async function(userId) {
    const addResult = await this.updateOne({
        $addToSet: { reposts: userId },
        $inc: { repostsCount: 1 }
    });

    if (addResult.modifiedCount === 0) {
        await this.updateOne({
            $pull: { reposts: userId },
            $inc: { repostsCount: -1 }
        });
    }
};

PostSchema.post('deleteOne', { document: true, query: false }, async function(doc) {
    // remove post from all users bookmarks on delete
    const User = mongoose.model('User');
    await User.updateMany(
        { bookmarks: doc._id },
        { $pull: { bookmarks: doc._id } }
    );
    // remove comments associated with this post
    const Comment = mongoose.model('Comment');
    await Comment.deleteMany(
        { post: doc._id },
    );
});

const Post = mongoose.model('Post', PostSchema);

export default Post;

