const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { 
  register, 
  login, 
  getProfile, 
  updateProfile 
} = require('../controllers/userController');
const { 
  userValidationRules, 
  loginValidationRules 
} = require('../middleware/validators');

// Public routes
router.post('/register', userValidationRules(), register);
router.post('/login', loginValidationRules(), login);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, userValidationRules(), updateProfile);

module.exports = router;
