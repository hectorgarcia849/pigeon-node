const express = require('express');
const profileRouter = express.Router();
const {authenticate} = require('./../middleware/authenticate');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const {Profile} = require('@softwaresamurai/pigeon-mongo-models');


//PROFILE REQUESTS

profileRouter.post('/', authenticate, (req, res) => {
    const decoded = jwt.decode(req.query.token);
    const profile = new Profile({
        _owner: decoded._id,
        username: req.body.username,
        created: new Date().getTime(),
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        descriptors: req.body.descriptors,
        locationTimes: req.body.locationTimes
    });
    profile.save()
        .then((profile) => res.send({profile}))
        .catch((e) => res.status(400).send(e));
});

profileRouter.get('/me', authenticate, (req, res) => {
    const decoded = jwt.decode(req.query.token);
    Profile.findOne({_owner:decoded._id})
        .then((profile) => {
            if(!profile){
                return res.status(404).send();
            }
            res.send({profile});
        }).catch((e) => res.status(400).send(e));

});

profileRouter.patch('/me', authenticate, (req, res) => {

    const decoded = jwt.decode(req.query.token);
    const body = _.pick(req.body, ['username', 'created', 'firstName', 'lastName', 'locationTimes', 'descriptors']);

    Profile.findOneAndUpdate({_owner:decoded._id}, {$set: body}, {new:true})
        .then((profile) => {
            if(profile) {
                return res.send({profile});
            }
            res.status(404).send();
        })
        .catch((e) => res.send(e));
});

profileRouter.delete('/me', authenticate, (req, res) => {

    const decoded = jwt.decode(req.query.token);
    Profile.findOneAndRemove({_owner:decoded._id})
        .then((profile) => {
            if(!profile){
                return res.status(404).send();
            }
            res.send({profile});
        })
        .catch((e) => res.send(e));
});

module.exports = {profileRouter};