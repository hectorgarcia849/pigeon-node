const {Pigeon} = require('./../../models/pigeon');
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

module.exports = {
    pigeons, populatePigeons
};