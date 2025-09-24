import mongoose from "mongoose";

const { Schema } = mongoose;

const CommentSchema = new Schema({
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, maxlength: 2000 },
    parent: { type: Schema.Types.ObjectId, ref: 'Comment', default: null },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    likesCount: { type: Number, default: 0 },
}, { timestamps: true });

// add/remove user to likes and increment/decrement likesCount
CommentSchema.methods.addorRemoveLike = async function(userId) {
    if (!this.likes.includes(userId)) {
        this.likes.push(userId);
        this.likesCount += 1;
        await this.save();
    } else {
        this.likes.pull(userId);
        this.likesCount -= 1;
        await this.save();
    }
};

CommentSchema.post('save', async function(doc) {
    // Increment commentsCount on the associated post
    const Post = mongoose.model('Post');
    await Post.findByIdAndUpdate(doc.post, { $inc: { commentsCount: 1 } });
});
CommentSchema.post('deleteOne', { document: true, query: false }, async function(doc) {
    // Decrement commentsCount on the associated post
    const Post = mongoose.model('Post');
    await Post.findByIdAndUpdate(doc.post, { $inc: { commentsCount: -1 } });
});

const Comment = mongoose.model('Comment', CommentSchema);

export default Comment;
