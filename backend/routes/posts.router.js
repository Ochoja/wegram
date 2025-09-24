import { Router } from 'express';
import { UserPostController, PostController, PostInteractionController } from '../controllers/posts.controller.js';
import { authRequired } from '../middleware/authenticate.js';

const router = Router();


router.get('/feed', PostController.getFeed);
router.get('/:id', PostController.getPostById);
router.get('/user/:userId', PostController.getUserPosts);

// interaction routes - like, repost, bookmark
// all require authentication
router.post('/:id/like', authRequired, PostInteractionController.likeOrUnlikePost);
router.post('/:id/repost', authRequired, PostInteractionController.repostOrUndoRepost);
router.post('/:id/bookmark', authRequired, PostInteractionController.bookmarkOrRemoveBookmark);

// requires authentication
// user post management routes
router.post('/', authRequired, UserPostController.createPost);
router.put('/:id', authRequired, UserPostController.updatePost);
router.delete('/:id', authRequired, UserPostController.deletePost);

export default router;
