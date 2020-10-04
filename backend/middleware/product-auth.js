const Thing = require('../models/Thing');

module.exports = (req, res, next) => {
    console.log("IN PRD AUTH");
    Thing.findOne({ _id: req.params.id })
        .then((thing) => {
            if (req.body.userId == thing.userId) {
                next();
            } else {
                res.status(403).json({
                    error: new Error('Invalid request!')
                });
            }

        })
        .catch(error => res.status(400).json({ error }));
};
