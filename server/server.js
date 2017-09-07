require('./config/config');

const express = require('express');
const _ = require('lodash');
const bodyParser = require('body-parser');

const {mongoose} = require('./db/mongoose');
const {Pigeon} = require('./models/pigeon');

var app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

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
            res.send(pigeon)
        }).catch((e) => {
            res.status(400).send(e);
    });
});


app.listen(port, ()=>  {
    console.log(`Started up at port ${port}`);
});

module.exports = {app};