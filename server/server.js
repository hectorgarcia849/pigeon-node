require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const {mongoose} = require('./db/mongoose'); //connects to db

const {pigeonsRouter} = require('./routes/pigeons');
const {profileRouter} = require('./routes/profile');
const {usersRouter} = require('./routes/users');

const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.json());
app.use(cors());

app.use('/pigeons', pigeonsRouter);
app.use('/profile', profileRouter);
app.use('/users', usersRouter);

app.listen(port, ()=>  {
    console.log(`Started up at port ${port}`);
});

module.exports = {app};