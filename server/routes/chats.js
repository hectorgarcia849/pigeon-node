const express = require('express');
const chatsRouter = express.Router();
const {authenticate} = require('./../middleware/authenticate');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const {Chat, ChatProfile} = require('@softwaresamurai/pigeon-mongo-models');




chatsRouter.post('/profile', authenticate, (req, res) => {
    const decoded = jwt.decode(req.query.token);
    const chatProfile = new ChatProfile({_owner: decoded._id, chats: []});
    chatProfile.save()
        .then(
            (chatProfile) => {
                res.send(chatProfile);
                console.log(chatProfile);
        })
        .catch((e) => {
            res.status(400).send(e);
    });
});

chatsRouter.get('/profile', authenticate, (req, res) => {
    const decoded = jwt.decode(req.query.token);
    console.log('chatProfile get ', decoded);
    ChatProfile.findOne({_owner: decoded._id})
        .then((chats) => {
            res.send(chats);
        })
        .catch((e) => res.status(404).send(e));
});

module.exports = {chatsRouter};