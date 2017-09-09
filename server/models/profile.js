const mongoose = require('mongoose');
const {ObjectID} = require('mongodb');


const Profile = mongoose.model('Profile',
    {
        _owner: {
            //type: mongoose.Schema.Types.ObjectId,
            //required: true,
            type: String,
            unique: true,
            default: null
        },
        username: {
            type: String,
            required: true,
            minlength: 1,
            unique: true,
            trim: true
        },
        firstName: {
            type: String,
            required: true,
            minlength: 1,
            trim: true
        },
        lastName: {
            type: String,
            required: true,
            minlength: 1,
            trim: true
        },
        created: {
            type: Number,
            required: true
        },
        descriptors: [{type:String}],
        locationTimes:[
            {
                country: String,
                city: String,
                place: String,
                fromDate: Number,
                toDate: Number
            }]
        // descriptors:{
        //     type: Array,
        //     required: true,
        //     default: []
        // },
        // locationTimes:{
        //     type: Array,
        //     required: true,
        //     default: []
        // }
    }
);

module.exports = {Profile};
