const { body, param } = require('express-validator');

// User validation rules
exports.userValidationRules = () => {
  return [
    body('username')
      .trim()
      .isLength({ min: 3 })
      .withMessage('Username must be at least 3 characters long'),
    
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .normalizeEmail(),
    
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
  ];
};

// Login validation rules
exports.loginValidationRules = () => {
  return [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .normalizeEmail(),
    
    body('password')
      .exists()
      .withMessage('Password is required')
  ];
};

// Post validation rules
exports.postValidationRules = () => {
  return [
    body('title')
      .trim()
      .isLength({ min: 5, max: 100 })
      .withMessage('Title must be between 5 and 100 characters'),
    
    body('content')
      .trim()
      .isLength({ min: 10 })
      .withMessage('Content must be at least 10 characters long'),
    
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array of strings')
  ];
};

// Comment validation rules
exports.commentValidationRules = () => {
  return [
    body('text')
      .trim()
      .isLength({ min: 3 })
      .withMessage('Comment must be at least 3 characters long')
  ];
};

// ID validation rule
exports.idValidationRule = (idName = 'id') => {
  return [
    param(idName)
      .isMongoId()
      .withMessage('Invalid ID format')
  ];
};
