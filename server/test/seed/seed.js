const {Pigeon} = require('./../../models/pigeon');
const {Profile} = require('./../../models/profile');
const {ObjectID} = require('mongodb');
const {User} = require('./../../models/user');
const jwt = require('jsonwebtoken');


const users = [new User({email: 'hectorino@gmail.com', password: 'password1'}), new User({email: 'hectorious@gmail.com', password: 'password2'})];
const tokens =  [users[0].generateAuthToken(), users[1].generateAuthToken()];

const userOneId = users[0]._id;
const userTwoId = users[1]._id;

const populateUsers = (done) => {
    User.remove({}).then(() => {
        //add users in a way that hashes passwords
        var userOne = new User(users[0]).save();
        var userTwo = new User(users[1]).save();

        //to make sure both save promises succeed before proceeding
        return Promise.all([userOne, userTwo]);
    }).then(() => done());
};

const profiles = [
    new Profile({
        _owner: userOneId,
        username: "Hectorious",
        firstName: "Hector",
        lastName: "Garcia",
        created: new Date().getTime(),
        descriptors: ['blonde', 'tall', 'shy', 'clever'],
        locationTimes:[{
            country: 'Canada',
            city: 'Toronto',
            place: 'The Junction',
            fromDate: Number,
            toDate: Number
        }]
    }),
    new Profile({
        _owner: userTwoId,
        username: "Riktassium Hectoxide",
        firstName: "Riktor",
        lastName: "Singlecia",
        created: new Date().getTime(),
        descriptors: ['blonde', 'tall', 'outgoing', 'clever'],
        locationTimes:[{
            country: 'Canada',
            city: 'The 6ix',
            place: 'The Junction',
            fromDate: Number,
            toDate: Number
        }]
    })
];

const pigeons = [
    new Pigeon(
        {
            _creator: userOneId,
            body: 'This is the story of a man named Hurricane',
            created: new Date().getTime(),
            encounterDate: 1476057600,
            title: "Just another pigeon in the wind",
            from: profiles[0].username,
            to: "Hurricane"
        }),
    new Pigeon(
        {
            _creator: userTwoId,
            body: 'This is the story of a woman named Tsunami',
            created: new Date().getTime(),
            encounterDate: 1476060600,
            title: "Just another pigeon in the storm",
            from: profiles[1].username,
            to: "Tsunami"
        }
    )
];

const populatePigeons = (done) => {
    Pigeon.remove({})
        .then(() => Pigeon.insertMany(pigeons))
        .then(() => done())
        .catch((e) => done(e));
};

const populateProfiles = (done) => {
    Profile.remove({})
    .then(() => Profile.insertMany(profiles))
    .then(() => done())
};

module.exports = {
    pigeons, populatePigeons, profiles, populateProfiles, users, populateUsers, tokens
};