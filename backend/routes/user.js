const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user');

router.post('/signup', userCtrl.signup); // Chiffre le mot de passe de l'utilisateur, ajoute l'utilisateur à la base de données

// Vérifie les informations d'identification de l'utilisateur, en renvoyant l'identifiant userID depuis la base de données et 
// un TokenWeb JSON signé(contenant également l'identifiant userID)
router.post('/login', userCtrl.login);

module.exports = router;