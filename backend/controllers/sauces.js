const Thing = require('../models/Thing');
const fs = require('fs');
// ObjectID = require('mongodb').ObjectID;

// Creation d'une sauce

exports.createSauce = (req, res, next) => {
    const thingObject = JSON.parse(req.body.sauce); //Récupération du coprs de la requete
    delete thingObject._id; // Supression d'une ID envoyé par erreur 
    const thing = new Thing({ // Creation d'un model de sauce
        ...thingObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    thing.save() // Sauvegarde des informations
        .then(() => res.status(201).json({ message: 'Objet enregistré !' }))
        .catch(error => res.status(400).json({ error }));
};

// Recuperation d'une sauce avec son Id

exports.getOneSauce = (req, res, next) => {
    Thing.findOne({    // recherche d'un element en fonction des paramètres utilisés
        _id: req.params.id  // paramètre Id de la sauce
    }).then(
        (thing) => {
            res.status(200).json(thing);   // retour des informations de la sauce en fonction de l'id selectionné en objet
        }
    ).catch(  // retour d'une erreur si pas de sauce trouvée avec l'id recherché
        (error) => {
            res.status(404).json({
                error: error
            });
        }
    );
};

exports.modifySauce = (req, res, next) => {
    let updatedThing;

    // Vérification d'une nouvelle image dans la requete
    if (req.file) {
        Thing.findOne({ _id: req.params.id }) // récupération du bon produit via la comparaison des ID 
            .then(thing => {
                // Récupération du nom de l'image
                const filename = thing.imageUrl.split('/images/')[1];

                // Suppression de l'ancienne image
                fs.unlink(`images/${filename}`, function (error) {
                    if (error) throw error;
                });
            })
            .catch(error => res.status(500).json({ error }));

        // on récupère les informations sur l'objet
        let bodyThing = JSON.parse(req.body.sauce);

        // on construit l'objet qui sera mis à jour avec la nouvelle image
        updatedThing = {
            name: bodyThing.name,
            manufacturer: bodyThing.manufacturer,
            description: bodyThing.description,
            mainPepper: bodyThing.mainPepper,
            heat: bodyThing.heat,
            userId: bodyThing.userId,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        }
    } else {

        // on construit l'objet qui sera mis à jour avec la même image
        updatedThing = {
            name: req.body.name,
            manufacturer: req.body.manufacturer,
            description: req.body.description,
            mainPepper: req.body.mainPepper,
            heat: req.body.heat,
            userId: req.body.userId
        }
    };

    // Mise a jour de la sauce avec les éléments recu par la requete
    Thing.updateOne({ _id: req.params.id }, { ...updatedThing, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'La sauce a été modifié avec succés !' }))
        .catch(error => res.status(400).json({ error }));
};

// Supression d'une sauce via son ID
exports.deleteSauce = (req, res, next) => {
    Thing.findOne({ _id: req.params.id })  // recherche d'un element en fonction des paramètres utilisés
        .then(thing => {   // si la sauce est trouvée

            const filename = thing.imageUrl.split('/images/')[1]; // récuperation du fichier image de la sauce

            fs.unlink(`images/${filename}`, () => {  // supression de l'image récupéré
                Thing.deleteOne({ _id: req.params.id })  // supression des données en BDD de la sauce en fonction de son ID
                    .then(() => res.status(200).json({ message: 'Objet supprimé !' }))   //OK
                    .catch(error => res.status(400).json({ error }));     // erreur
            });
        });
};

//recupération de toutes les sauces
exports.getAllSauces = (req, res, next) => {
    Thing.find().then( // recherche de toutes les informations dans la BDD
        (thing) => { // si information trouvées
            res.status(200).json(thing); // retour des informations en objets
        }
    ).catch(  // si pas de sauces trouvées
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
};

// like or dislike 
exports.usersLike = (req, res, next) => {
    //Mise en place de constante pour la suite de la fonction
    const userId = req.body.userId;
    const like = req.body.like;
    const thingId = req.params.id;
    if (like == 1) {  // like de la sauce pouce vert cliquer
        Thing.updateOne( // 
            { _id: thingId }, // Paramétres de recherche pour mettre a jour la valeur des like et le tableau des Users qui like la sauce
            {
                $inc: { likes: 1 }, // ajout de 1 au nombre de likes
                $push: { usersLiked: userId } // ajout du userId au tableau des usersLiked
            }
        )
            .then(
                () => {
                    res.status(200).json({ message: 'L\' utilisateur aime la sauce' });
                }
            ).catch(
                (error) => {
                    res.status(404).json({
                        error: error
                    });
                }
            );
    } else if (like == -1) { // dislike de la sauce pouce rouge cliquer
        Thing.updateOne(
            { _id: thingId }, // Paramètre de recherche pour mettre à jour la valeur des dislikes et le tableau des Users qui n'aiment pas la sauce
            {
                $inc: { dislikes: 1 }, // ajout de 1 au nombre de dislikes
                $push: { usersDisliked: userId } // ajout du userId au tableau des usersDisliked
            }
        )
            .then(
                () => {
                    res.status(200).json({ message: 'L\' utilisateur n\' aime pas la sauce' });
                }
            ).catch(
                (error) => {
                    res.status(404).json({
                        error: error
                    });
                }
            );
    } else { // unlike or undislike ? Pouce vert ou rouge recliquer pour retirer son choix
        Thing.findOne({ _id: req.params.id })
            .then(
                (thing) => {
                    if (thing.usersDisliked.includes(userId)) { // verification du statut de l'utilisateur, dans le tableau like/dislike de la bdd
                        Thing.updateOne(
                            { _id: thingId },
                            {
                                $inc: { dislikes: -1 }, // suppression de 1 au nombre de dislikes
                                $pull: { usersDisliked: userId } // suppression du userId au tableau des usersDisliked
                            }
                        )
                            .then(
                                () => {
                                    res.status(200).json({ message: 'L\' utilisateur n\' aimais pas la sauce et il a changer d\' avis' });
                                }
                            ).catch(
                                (error) => {
                                    res.status(404).json({ error: error });
                                }
                            );
                    } else {
                        Thing.updateOne(
                            { _id: thingId },
                            {
                                $inc: { likes: -1 }, // suppression de 1 au nombre de likes
                                $pull: { usersLiked: userId } // suppression du userId au tableau des usersLiked
                            }
                        )
                            .then(() => {
                                res.status(200).json({ message: 'L\' utilisateur aimais la sauce et il a changer d\' avis' });
                            })
                            .catch((error) => {
                                res.status(404).json({ error: error });
                            });
                    }
                })
            .catch(
                (error) => { // erreur si pas de sauces trouvé
                    res.status(404).json({ error: error });
                }
            );
    };
};