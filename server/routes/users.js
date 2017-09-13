const express = require('express');
const usersRouter = express.Router();
const {authenticate} = require('./../middleware/authenticate');
const _ = require('lodash');
const jwt = require('jsonwebtoken');

const {User} = require('./../models/user');

//user requests, sign up and log in.  Sign out handled in the front end by removing token from local storage.

usersRouter.post('/', (req, res) => {
    const body = _.pick(req.body, ['email', 'password']); //middleware in the User model encrypts the password
    const user = new User(body);

    user.save()
        .then((user) => {res.header('x-auth', user.generateAuthToken()).send({user})})
        .catch((e) => res.status(400).send(e));
});

usersRouter.get('/me', authenticate, (req, res) => {
    const decoded = jwt.decode(req.query.token);
    User.findById(decoded._id)
        .then((user) => {
            res.send({user});
        });
});

usersRouter.post('/login', (req, res) => {
    const body = _.pick(req.body, ['email', 'password']);

    User.findByCredentials(body.email, body.password)
        .then((user) => {
            res.header('x-auth', user.generateAuthToken()).send({user})})
        .catch((e) => {
            res.status(400).send(e);
        });
});

module.exports = {usersRouter};