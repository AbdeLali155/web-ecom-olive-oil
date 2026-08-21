const { check, validationResult } = require('express-validator');

exports.signupValidator = [
    check('firstName').notEmpty().withMessage('Prénom est requis'),
    check('lastName').notEmpty().withMessage('Nom est requis'),
    check('email').isEmail().withMessage('Email invalide'),
    check('password').isLength({ min: 6 }).withMessage('Mot de passe minimum 6 caractères'),
];

exports.validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};
