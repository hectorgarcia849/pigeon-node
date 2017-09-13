const express = require('express');
const {ObjectID} = require('mongodb');
const pigeonsRouter = express.Router();
const {authenticate} = require('./../middleware/authenticate');
const _ = require('lodash');
const jwt = require('jsonwebtoken');

const {Pigeon} = require('./../models/pigeon');

pigeonsRouter.post('/', authenticate, (req, res) =>
{
    const decoded = jwt.decode(req.query.token);
    const pigeon = new Pigeon({
        body: req.body.body,
        created: new Date().getTime(),
        _creator: decoded._id,
        encounterDate: req.body.encounterDate,
        title: req.body.title,
        to: req.body.to,
        from: req.body.from
    });

    pigeon.save()
        .then((pigeon) => {
            res.send({pigeon})
        }).catch((e) => {
        res.status(400).send(e);
    });
});

pigeonsRouter.get('/', authenticate, (req, res) => {

    Pigeon.find({})
        .then((pigeons) => {
            res.send({pigeons});
        })
        .catch((e) => res.status(404).send(e));
});


//need to implement a version that allows for a search using query params
// pigeonsRouter.get('/owner/:id', authenticate, (req, res) => {
//
//     const id = req.params.id;
//
//     Pigeon.find({_creator: id})
//         .then((pigeons) => {
//             res.send({pigeons});
//         })
//         .catch((e) => res.status(404).send(e));
// });

pigeonsRouter.get('/:id', authenticate, (req, res) => {
    const id = req.params.id;

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

//pigeon can only be deleted if it belongs to the user.
pigeonsRouter.delete('/:id', authenticate, (req, res) => {

    const decoded = jwt.decode(req.query.token);
    const id = req.params.id;

    if(!ObjectID.isValid(id)){
        return res.status(400).send();
    }

    Pigeon.findOneAndRemove({_id:id, _creator: decoded._id})
        .then((pigeon) => {
            if(!pigeon){
                return res.status(404).send();
            }
            res.status(200).send({pigeon});
        }).catch((e) => {res.status(400).send(e)});

});

//patch, can only update if _id in token equals creator i.e. patch can only be updated if it belongs to the user.
pigeonsRouter.patch('/:id', authenticate, (req, res) => {
    const decoded = jwt.decode(req.query.token);
    const id = req.params.id;
    const body = _.pick(req.body, ['body', 'encounterDate', 'title', 'to']);

    if (!ObjectID.isValid(id)) {
        return res.status(400).send();
    }

    Pigeon.findOneAndUpdate({_id: id, _creator: decoded._id}, {$set: body}, {new: true})
        .then((pigeon) => {
            if (!pigeon) {
                return res.status(404).send();
            }
            res.send({pigeon});
        }).catch((e) => res.status(400).send(e));
});

module.exports = {pigeonsRouter};