const express = require('express');
const usersRouter = express.Router();
const {authenticate} = require('./../middleware/authenticate');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const {User} = require('@softwaresamurai/pigeon-mongo-models');

//user requests, sign up and log in.  Sign out handled in the front end by removing token from local storage.

usersRouter.post('/', (req, res) => {
    const body = _.pick(req.body, ['email', 'password']); //middleware in the User model encrypts the password
    const user = new User(body);
    const token = user.generateAuthToken();
    user.save()
        .then((user) => {res.header('x-auth', user.generateAuthToken()).send({user, token})})
        .catch((e) => res.status(400).send(e));
});

usersRouter.get('/me', authenticate, (req, res) => {
    const decoded = jwt.decode(req.query.token);
    User.findById(decoded._id)
        .then((user) => {
            if(user) {
                res.send({user});
            } else {
                res.status(404).send();
            }
        });
});

usersRouter.post('/login', (req, res) => {
    const body = _.pick(req.body, ['email', 'password']);
    User.findByCredentials(body.email, body.password)
        .then((user) => {
            const token = user.generateAuthToken();
            res.header('x-auth', token).send({user, token})})
        .catch((e) => {
            res.status(404).send(e);
        });
});

module.exports = {usersRouter};