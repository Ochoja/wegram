import Post from "../models/posts";
import User from "../models/users";
import { toObjectId } from "../services/utils";
import sendResponse from "../services/response";


export class UserPostController {
    // auth required
    static async createPost(req, res) {
        try {
            const authorId = req.user._id;
            const { content, media = [] } = req.body;

            if (!content && (!Array.isArray(media) || media.length === 0)) {
                return sendResponse(res, 400, 'Post must have content or media');
            }

            const newPost = await Post.create({
                author: authorId,
                content,
                media,
            });
            return sendResponse(res, 201, 'Post created successfully', newPost);
        } catch (error) {
            console.error("Error while creating post", error);
            return sendResponse(res, 500, 'Internal Server Error');
        }
    }

    // auth required
    static async updatePost(req, res) {
        try {
            const authorId = req.user._id;
            const { id } = req.params;
            const { content, media } = req.body;

            const _id = toObjectId(id);
            if (!_id) {
                return sendResponse(res, 400, 'Invalid post ID');
            }

            const post = await Post.findById(_id);
            if (!post) return sendResponse(res, 404, 'Post not found');
            if (post.author.toString() !== authorId.toString()) {
                return sendResponse(res, 403, 'You are not authorized to update this post');
            }

            if (content !== undefined) post.content = content;
            if (media !== undefined) post.media = media; // use validator to ensure media is an array

            await post.save();
            return sendResponse(res, 200, 'Post updated successfully', post);
        }
        catch (error) {
            console.error("Error while updating post", error);
            return sendResponse(res, 500, 'Internal Server Error');
        }
    }

    //auth required
    static async deletePost(req, res) {
        try {
            const authorId = req.user._id;
            const { id } = req.params;

            const _id = toObjectId(id);
            if (!_id) {
                return sendResponse(res, 400, 'Invalid post ID');
            }

            const post = await Post.findById(_id);
            if (!post) return sendResponse(res, 404, 'Post not found');
            if (post.author.toString() !== authorId.toString()) {
                return sendResponse(res, 403, 'You are not authorized to delete this post');
            }
            await post.remove();
            return sendResponse(res, 200, 'Post deleted successfully');
        }
        catch (error) {
            console.error("Error while deleting post", error);
            return sendResponse(res, 500, 'Internal Server Error');
        }
    }
}


export class PostController {

    static async getFeed(req, res) {
        try {
            const page = Math.max(1, parseInt(req.query.page || '1', 10));
            const limit = Math.min(100, parseInt(req.query.limit || '20', 10));
            const sortBy = req.query.sortBy === 'trending' ? { trendingScore: -1, createdAt: -1 } : { createdAt: -1 };

            const posts = await Post.find()
                .sort(sortBy)
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('author', 'username handle avatarUrl')
                .populate('media', 'url')
                .lean();
            
            const total = await Post.countDocuments();

            // Add isLiked and isReposted properties manually for lean objects
            const currentUserId = req.user ? req.user._id : null;
            const postsWithStatus = posts.map(post => ({
                ...post,
                isLiked: currentUserId ? post.likes.includes(currentUserId.toString()) : false,
                isReposted: currentUserId ? post.reposts.includes(currentUserId.toString()) : false
            }));

            return sendResponse(res, 200, 'Feed fetched successfully', { postsWithStatus, page, limit, total });
        }
        catch (error) {
            console.error("Error while fetching feed", error);
            return sendResponse(res, 500, 'Internal Server Error');
        }
    }

    static async getPostById(req, res) {
        try {
            const { id } = req.params;
            const _id = toObjectId(id);
            if (!_id) {
                return sendResponse(res, 400, 'Invalid post ID');
            }

            const post = await Post.findById(_id).populate('author', 'username handle avatar').lean();
            if (!post) return sendResponse(res, 404, 'Post not found');

            // Add isLiked property manually for lean objects
            const userId = req.user ? req.user._id : null;
            post.isLiked = userId ? post.likes.includes(userId.toString()) : false;
            post.isReposted = userId ? post.reposts.includes(userId.toString()) : false;

            return sendResponse(res, 200, 'Post fetched successfully', post);
        }
        catch (error) {
            console.error("Error while fetching post by ID", error);
            return sendResponse(res, 500, 'Internal Server Error');
        }
    }

    static async getUserPosts(req, res) {
        try {
            const { userId } = req.params;
            const page = Math.max(1, parseInt(req.query.page || '1', 10));
            const limit = Math.min(100, parseInt(req.query.limit || '20', 10));

            const _id = toObjectId(userId);
            if (!_id) {
                return sendResponse(res, 400, 'Invalid user ID');
            }

            const posts = await Post.find({ author: _id })
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('author', 'username handle avatarUrl')
                .populate('media', 'url')
                .lean();
            
            const total = await Post.countDocuments({ author: _id });

            // Add isLiked property manually for lean objects
            const currentUserId = req.user ? req.user._id : null;
            const postsWithStatus = posts.map(post => ({
                ...post,
                isLiked: currentUserId ? post.likes.includes(currentUserId.toString()) : false,
                isReposted: currentUserId ? post.reposts.includes(currentUserId.toString()) : false
            }));

            return sendResponse(res, 200, 'User posts fetched successfully', { postsWithStatus, page, limit, total });
        }
        catch (error) {
            console.error("Error while fetching user posts", error);
            return sendResponse(res, 500, 'Internal Server Error');
        }
    }
}


export class PostInteractionController {
    // auth required
    static async likeOrUnlikePost(req, res) {
        try {
            const userId = req.user._id;
            const { id } = req.params;

            const postId = toObjectId(id);
            if (!postId) {
                return sendResponse(res, 400, 'Invalid post ID');
            }

            const post = await Post.findById(postId);
            if (!post) return sendResponse(res, 404, 'Post not found');
            const likesCount = post.likesCount;

            await post.addorRemoveLike(userId);
            return sendResponse(res, 200, 'Post like status toggled successfully', {
                likesCount: post.likesCount,
                liked: post.likesCount > likesCount
            });
        } catch (error) {
            console.error("Error while liking/unliking post", error);
            return sendResponse(res, 500, 'Internal Server Error');
        }
    }

    // auth required
    static async repostOrUndoRepost(req, res) {
        try {
            const userId = req.user._id;
            const { id } = req.params;

            const postId = toObjectId(id);
            if (!postId) {
                return sendResponse(res, 400, 'Invalid post ID');
            }

            const post = await Post.findById(postId);
            if (!post) return sendResponse(res, 404, 'Post not found');
            const repostsCount = post.repostsCount;

            await post.addorRemoveRepost(userId);
            return sendResponse(res, 200, 'Post repost status toggled successfully', {
                repostsCount: post.repostsCount,
                reposted: post.repostsCount > repostsCount
            });
        } catch (error) {
            console.error("Error while reposting/undoing repost", error);
            return sendResponse(res, 500, 'Internal Server Error');
        }
    }

    // auth required
    static async bookmarkOrRemoveBookmark(req, res) {
        try {
            const userId = req.user._id;
            const { id } = req.params;

            const postId = toObjectId(id);
            if (!postId) {
                return sendResponse(res, 400, 'Invalid post ID');
            }

            const post = await Post.findById(postId);
            if (!post) return sendResponse(res, 404, 'Post not found');
            const user = await User.findById(userId);
            if (!user) return sendResponse(res, 404, 'User not found');
            const bookmarksCount = post.bookmarksCount;

            await user.addorRemoveBookmark(postId);
            return sendResponse(res, 200, 'Post bookmark status toggled successfully', {
                bookmarksCount: post.bookmarksCount,
                bookmarked: post.bookmarksCount > bookmarksCount
            });
        } catch (error) {
            console.error("Error while bookmarking/removing bookmark", error);
            return sendResponse(res, 500, 'Internal Server Error');
        }
    }
}
