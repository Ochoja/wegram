import { Router } from 'express';
import { UserPostController, PostController, PostInteractionController } from '../controllers/posts.controller';

const router = Router();


router.get('/feed', PostController.getFeed);
router.get('/posts/:id', PostController.getPostById);
router.get('/posts/:userId', PostController.getUserPosts);

// interaction routes - like, repost, bookmark
// all require authentication middleware to set req.user
router.post('/posts/:id/like', PostInteractionController.likeOrUnlikePost);
router.post('/posts/:id/repost', PostInteractionController.repostOrUndoRepost);
router.post('/posts/:id/bookmark', PostInteractionController.bookmarkOrRemoveBookmark);

// requires authentication middleware to set req.user
// user post management routes
router.post('/posts', UserPostController.createPost);
router.put('/posts/:id', UserPostController.updatePost);
router.delete('/posts/:id', UserPostController.deletePost);

export default router;
