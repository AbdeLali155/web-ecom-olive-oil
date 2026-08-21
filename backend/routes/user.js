const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../models/User');
const authenticateToken = require('../middleware/authToken');

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      id:        user._id,
      firstName: user.firstName,
      lastName:  user.lastName,
      email:     user.email,
      phone:     user.phone || '',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, email, phone } = req.body;

    if (!firstName || !lastName || !email) {
      return res.status(400).json({ 
        message: 'Le prénom, nom et email sont requis' 
      });
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: 'Format d\'email invalide' 
      });
    }

    if (phone && !/^[0-9+\-\s()]{10,}$/.test(phone)) {
      return res.status(400).json({ 
        message: 'Format de téléphone invalide' 
      });
    }
    const existingUser = await User.findOne({ email, _id: { $ne: userId } });

    var updatedUser = await User.findByIdAndUpdate(
      userId,
     { firstName, lastName, email, phone },
     { new: true, select: '-password' }
    );

    updatedUser = {
      id: userId,
      firstName,
      lastName,
      email,
      phone
    };

    res.json({
      message: 'Profil mis à jour avec succès',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du profil' });
  }
});

router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: 'Le mot de passe actuel et le nouveau mot de passe sont requis' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: 'Le nouveau mot de passe doit contenir au moins 6 caractères' 
      });
    }

    const user = await User.findById(userId);
    

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ 
        message: 'Le mot de passe actuel est incorrect' 
      });
    }

    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    await User.findByIdAndUpdate(userId, { password: hashedNewPassword });

    res.json({
      message: 'Mot de passe mis à jour avec succès'
    });

  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Erreur serveur lors du changement de mot de passe' });
  }
});


module.exports = router;
