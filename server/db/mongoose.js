var  mongoose = require('mongoose');

mongoose.Promise = global.Promise; //need to let mongoose know that you want to use default promises that come with es6
mongoose.connect(process.env.MONGODB_URI, {useMongoClient: true})
    .then(() => console.log('Connected to Database'))
    .catch((e) => console.log('db Connection Error', e));

module.exports = { mongoose };
