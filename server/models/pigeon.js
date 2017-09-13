const mongoose = require('mongoose');
const {ObjectID} = require('mongodb');

var Pigeon = mongoose.model('Pigeon',
    {
        _creator: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        body: {
            type: String,
            required: true,
            minlength: 1,
            trim: true
        },
        created: {
            type: Number,
            required: true
        },
        encounterDate: {
            type: Number,
            required: true
        },
        from: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
            maxlength: 50,
            trim: true
        },
        to: {
            type: String,
            required: true
        }
    }
);

module.exports = {Pigeon};
