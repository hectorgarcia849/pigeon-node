require('./config/config');

const express = require('express');
const _ = require('lodash');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const cors = require('cors');

const {mongoose} = require('./db/mongoose');
const {Pigeon} = require('./models/pigeon');
const {Profile} = require('./models/profile');

var app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());


//PIGEON REQUESTS

app.post('/pigeons', (req, res) => {
    var pigeon = new Pigeon({
        body: req.body.body,
        created: new Date().getTime(),
        _creator: null,
        encounterDate: req.body.encounterDate,
        title: req.body.title,
        to: req.body.to
    });

    pigeon.save()
        .then((pigeon) => {
            res.send({pigeon})
        }).catch((e) => {
            res.status(400).send(e);
    });
});

app.get('/pigeons', (req, res) => {

    Pigeon.find()
        .then((pigeons) => {
            res.send({pigeons});
        })
        .catch((e) => res.status(404).send(e));
});

app.get('/pigeons/:id', (req, res) => {
    var id = req.params.id;

    if(!ObjectID.isValid(id)){
        return res.status(400).send();
    }

    Pigeon.findOne({_id:id})
        .then((pigeon) => {
            if(!pigeon){
               return res.status(404).send();
            }
            res.send({pigeon});
        })
        .catch((err) => res.status(404).send(e));
});


//delete
app.delete('/pigeons/:id', (req, res) => {
    var id = req.params.id;

    if(!ObjectID.isValid(id)){
        return res.status(400).send();
    }

    Pigeon.findOneAndRemove({_id:id})
        .then((pigeon) => {
            if(!pigeon){
                return res.status(404).send();
            }
            res.send({pigeon});
    }).catch((e) => {res.status(400).send()});

});

//patch
app.patch('/pigeons/:id', (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['body', 'encounterDate', 'title', 'to']);

    if (!ObjectID.isValid(id)) {
        return res.status(400).send();
    }

    Pigeon.findOneAndUpdate({_id: id}, {$set: body}, {new: true})
        .then((pigeon) => {
            if (!pigeon) {
                return res.status(404).send();
            }
            res.send({pigeon});
        }).catch((e) => res.status(400).send(e));
});


//PROFILE REQUESTS

app.post('/profile', (req, res) => {
    const profile = new Profile({
        _owner: req.body._owner,
        username: req.body.username,
        created: req.body.created,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        descriptors: req.body.descriptors,
        locationTimes: req.body.locationTimes
    });
    profile.save()
        .then((profile) => res.send({profile}))
        .catch((e) => res.status(400).send(e));
});

//how do we get the correct profile?  Profiles will be referenced by the '_owner' -- so when requesting, :id field will be the _owner.

app.get('/profile/:id', (req, res) => {
    const id = req.params.id;

    Profile.findOne({_owner:id})
        .then((profile) => {
            res.send({profile});
        }).catch((e) => res.status(404).send(e));

});

app.patch('/profile/:id', (req, res) => {
    const id = req.params.id;
    const body = _.pick(req.body, ['username', 'created', 'firstName', 'lastName', 'locationTimes', 'descriptors']);

    Profile.findOneAndUpdate({_owner:id}, {$set: body}, {new:true})
        .then((profile) => {
            if(!profile) {
                return res.status(404).send();
            }
            res.send({profile});
        })
        .catch((e) => res.send(e));
});

app.delete('/profile/:id', (req, res) => {
    const id = req.params.id;

    Profile.findOneAndRemove({_owner:id})
        .then((profile) => {
            if(!profile){
                return res.status(404).send();
            }
            res.send({profile});
        })
        .catch((e) => res.send(e));
});

app.listen(port, ()=>  {
    console.log(`Started up at port ${port}`);
});

module.exports = {app};