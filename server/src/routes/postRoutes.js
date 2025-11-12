const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { 
  createPost, 
  getPosts, 
  getPost, 
  updatePost, 
  deletePost,
  addComment,
  likePost
} = require('../controllers/postController');
const { 
  postValidationRules, 
  commentValidationRules,
  idValidationRule 
} = require('../middleware/validators');

// Public routes
router.get('/', getPosts);
router.get('/:id', idValidationRule(), getPost);

// Protected routes (require authentication)
router.post('/', authenticate, postValidationRules(), createPost);
router.put('/:id', authenticate, idValidationRule(), postValidationRules(), updatePost);
router.delete('/:id', authenticate, idValidationRule(), deletePost);
router.post('/:id/comments', authenticate, idValidationRule(), commentValidationRules(), addComment);
router.post('/:id/like', authenticate, idValidationRule(), likePost);

module.exports = router;
