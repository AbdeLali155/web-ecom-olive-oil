require('dotenv').config();
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per IP per window
  message: { msg: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const User = require('../models/User');
const { signupValidator, validate } = require('../middleware/validateSignup');

router.post('/signup', signupValidator, validate, async (req, res) => {
    const { firstName, lastName, email, phone, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'Email déjà utilisé' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user = new User({
            firstName,
            lastName,
            email,
            phone,
            password: hashedPassword,
        });

        await user.save();

       const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
});

        res.status(201).json({
            msg: 'Inscription réussie',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Erreur serveur' });
    }
});

const validateLogin = require('../middleware/validateLogin');

router.post('/login', loginLimiter, validateLogin, async (req, res)=> {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Utilisateur introuvable' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Mot de passe incorrect' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      msg: 'Connexion réussie',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Erreur serveur' });
  }
});


module.exports = router;
