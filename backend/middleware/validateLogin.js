const { body, validationResult } = require('express-validator');

const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Email invalide'),

  body('password')
    .notEmpty()
    .withMessage('Mot de passe requis'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Optional: convert errors to a simpler format
      const formatted = errors.array().map(err => ({ field: err.param, msg: err.msg }));
      return res.status(400).json({ errors: formatted });
    }
    next();
  }
];

module.exports = validateLogin;