import { Router } from 'express';
import { UserPostController, PostController, PostInteractionController } from '../controllers/posts.controller';
import authenticate from '../middleware/authenticate';

const router = Router();


router.get('/feed', PostController.getFeed);
router.get('/:id', PostController.getPostById);
router.get('/:userId', PostController.getUserPosts);

// interaction routes - like, repost, bookmark
// all require authentication
router.post('/:id/like', authenticate, PostInteractionController.likeOrUnlikePost);
router.post('/:id/repost', authenticate, PostInteractionController.repostOrUndoRepost);
router.post('/:id/bookmark', authenticate, PostInteractionController.bookmarkOrRemoveBookmark);

// requires authentication
// user post management routes
router.post('/', authenticate, UserPostController.createPost);
router.put('/:id', authenticate, UserPostController.updatePost);
router.delete('/:id', authenticate, UserPostController.deletePost);

export default router;
