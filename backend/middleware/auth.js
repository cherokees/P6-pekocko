const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try { // essai des instructions suivante
        const token = req.headers.authorization.split(' ')[1]; // recupération du token ([0]Bearer / [1]token en fonction du USerID)
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_KEY'); // Clé de crytage du tokken pour décodage
        const userId = decodedToken.userId; //mise en memoire du token decryté
        if (req.body.userId && req.body.userId !== userId) { // vérification du tokken 
            throw 'Invalid user ID';  // mauvais token
        } else {
            next(); // bon token on passe a la suite
        }
    } catch (err) { // si erreur dans les instructions du try
        console.log("IN AUTH CATCH", err);
        res.status(401).json({
            error: new Error('Invalid request!')
        });
    }
};