const {Pigeon} = require('./../../models/pigeon');
const {Profile} = require('./../../models/profile');
const {ObjectID} = require('mongodb');

const pigeons = [
    new Pigeon(
        {
            _id: new ObjectID(),
            body: 'This is the story of a man named Hurricane',
            created: new Date().getTime(),
            encounterDate: 1476057600,
            title: "Just another pigeon in the wind",
            to: "Hurricane"
        }),
    new Pigeon(
        {
            _id: new ObjectID(),
            body: 'This is the story of a woman named Tsunami',
            created: new Date().getTime(),
            encounterDate: 1476060600,
            title: "Just another pigeon in the storm",
            to: "Tsunami"
        }
    )
];

const populatePigeons = (done) => {
    Pigeon.remove({})
        .then(() => Pigeon.insertMany(pigeons))
        .then(() => done());
};

const profiles = [
    new Profile({
        _owner: "Placeholder owner1",
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
        _owner: "Placeholder owner2",
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

const populateProfiles = (done) => {
    Profile.remove({})
    .then(() => Profile.insertMany(profiles))
    .then(() => done())
};

module.exports = {
    pigeons, populatePigeons, profiles, populateProfiles
};