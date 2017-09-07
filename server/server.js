require('./config/config');

const express = require('express');
const _ = require('lodash');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const cors = require('cors');

const {mongoose} = require('./db/mongoose');
const {Pigeon} = require('./models/pigeon');

var app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

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


app.listen(port, ()=>  {
    console.log(`Started up at port ${port}`);
});

module.exports = {app};