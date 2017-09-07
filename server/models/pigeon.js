const mongoose = require('mongoose');

var Pigeon = mongoose.model('Pigeon',
    {
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
        _creator: {
            type: mongoose.Schema.Types.ObjectId,
            //required: true
            default: null
        },
        encounterDate: {
            type: Number,
            required: true
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
