const express = require('express');
const router = express.Router();
const product_auth = require('../middleware/product-auth');

// Ajout des middleweares

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

// Ajout du controllers

const stuffCtrl = require('../controllers/sauces');

router.get('/', auth, stuffCtrl.getAllThing); // Renvoie le tableau de toutes les sauces dans la base de données

// Capture et enregistre l'image, analyse la sauce en utilisant une chaîne de caractères et l'enregistre dans la base de données, en définissant correctement son image URL.
// Remet les sauces aimées et celles détestées à 0, et les sauces usersliked et celles usersdisliked aux tableaux vides.
router.post('/', auth, multer, stuffCtrl.createThing);

router.get('/:id', auth, stuffCtrl.getOneThing); // Renvoie la sauce avec l'ID fourni

// Met à jour la sauce avec l'identifiant fourni. Si une image est téléchargée, capturez-la et mettez à jour l'imageURL des sauces. 
//Si aucun fichier n'est fourni, les détails de la sauce figurent directement dans le corps de la demande(req.body.name,req.body.heat etc).
//Si un fichier est fourni, la sauce avec chaîne est en req.body.sauce.
router.put('/:id', auth, multer, stuffCtrl.modifyThing);

router.delete('/:id', auth, stuffCtrl.deleteThing); // Supprime la sauce avec l'ID fourni.

// Définit le statut "j'aime" pour userID fourni.
//Si j'aime = 1,l'utilisateur aime la sauce. Si j'aime = 0,l'utilisateur annule ce qu'il aime ou ce qu'il n'aime pas. Si j'aime =-1, l'utilisateur n'aime pas la sauce.
//L'identifiant de l'utilisateur doit être ajouté ou supprimé du tableau approprié, engardant une trace de ses préférences et en l'empêchant d'aimer ou de ne pas aimer la même sauce plusieurs fois.
//Nombre total de "j'aime" et de "je n'aime pas" à mettre à jour avec chaque "j'aime".
router.post('/:id/like', auth, stuffCtrl.usersLike);

module.exports = router;