require('./config/config');

const express = require('express');
const _ = require('lodash');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const cors = require('cors');

const {mongoose} = require('./db/mongoose');
const {Pigeon} = require('./models/pigeon');
const {Profile} = require('./models/profile');
const {User} = require('./models/user');
const {authenticate} = require('./middleware/authenticate');

var app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.json());
app.use(cors());


//PIGEON REQUESTS

app.post('/pigeons', authenticate, (req, res) => {
    var pigeon = new Pigeon({
        body: req.body.body,
        created: new Date().getTime(),
        _creator: req.user._id,
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

app.get('/pigeons', authenticate, (req, res) => {

    Pigeon.find({})
        .then((pigeons) => {
            res.send({pigeons});
        })
        .catch((e) => res.status(404).send(e));
});

app.get('/pigeons/owner/:id', authenticate, (req, res) => {

    const id = req.params.id;

    Pigeon.find({_creator: id})
        .then((pigeons) => {
            res.send({pigeons});
        })
        .catch((e) => res.status(404).send(e));
});

app.get('/pigeons/:id', authenticate, (req, res) => {
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

app.delete('/pigeons/:id', authenticate, (req, res) => {
    const id = req.params.id;

    if(!ObjectID.isValid(id)){
        return res.status(400).send();
    }

    Pigeon.findOneAndRemove({_id:id, _creator: req.user._id})
        .then((pigeon) => {
            if(!pigeon){
                return res.status(404).send();
            }
            res.status(200).send({pigeon});
    }).catch((e) => {res.status(400).send(e)});

});

//patch
app.patch('/pigeons/:id', authenticate, (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['body', 'encounterDate', 'title', 'to']);

    if (!ObjectID.isValid(id)) {
        return res.status(400).send();
    }

    Pigeon.findOneAndUpdate({_id: id, _creator: req.user._id}, {$set: body}, {new: true})
        .then((pigeon) => {
            if (!pigeon) {
                return res.status(404).send();
            }
            res.send({pigeon});
        }).catch((e) => res.status(400).send(e));
});


//PROFILE REQUESTS

app.post('/profile', authenticate, (req, res) => {

    const profile = new Profile({
        _owner: req.user._id,
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

app.get('/profile/me', authenticate, (req, res) => {

    Profile.findOne({_owner:req.user._id})
        .then((profile) => {
            res.send({profile});
        }).catch((e) => res.status(404).send(e));

});

app.patch('/profile/me', authenticate, (req, res) => {

    const body = _.pick(req.body, ['username', 'created', 'firstName', 'lastName', 'locationTimes', 'descriptors']);

    Profile.findOneAndUpdate({_owner:req.user._id}, {$set: body}, {new:true})
        .then((profile) => {
            if(!profile) {
                return res.status(404).send();
            }
            res.send({profile});
        })
        .catch((e) => res.send(e));
});

app.delete('/profile/me', authenticate, (req, res) => {

    Profile.findOneAndRemove({_owner:req.user._id})
        .then((profile) => {
            if(!profile){
                return res.status(404).send();
            }
            res.send({profile});
        })
        .catch((e) => res.send(e));
});


//user requests

app.post('/users', (req, res) => {
    const body = _.pick(req.body, ['email', 'password']);
    var user = new User(body);

    user.save()
        .then(() => {
            return user.generateAuthToken()})
        .then((token) => {res.header('x-auth', token).send({user});})
        .catch((e) => {
            res.status(400).send(e);
        })
});

app.get('/users/me', authenticate, (req, res) => {
    res.send({user: req.user});
});

app.post('/users/login', (req, res) => {
   var body = _.pick(req.body, ['email', 'password']);
   User.findByCredentials(body.email, body.password).then((user) => {
      return user.generateAuthToken().then((token) => {
          res.header('x-auth', token).send({user});
      }).catch((e) => {
          res.status(400).send(e);
      })
   });
});

//removes token, this is a logout
app.delete('/users/me/token', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
       res.status(200).send();
    }).catch((e) => {
        res.status(400).send(e);
    });
});

app.delete('/users/me', authenticate, (req, res) => {
    User.findOneAndRemove({_id:req.user._id}).then((user) => {
        res.status(200).send({user});
    }).catch((e) => {
        res.status(400).send(e);
    });
});

app.listen(port, ()=>  {
    console.log(`Started up at port ${port}`);
});

module.exports = {app};