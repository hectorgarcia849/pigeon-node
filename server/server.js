require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const socketIO = require('socket.io');
const http = require('http');

const {mongoose} = require('./db/mongoose'); //connects to db
const {pigeonsRouter} = require('./routes/pigeons');
const {profileRouter} = require('./routes/profile');
const {usersRouter} = require('./routes/users');

const app = express();
var server = http.createServer(app);
var io = socketIO(server);

const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());
app.use('/pigeons', pigeonsRouter);
app.use('/profile', profileRouter);
app.use('/users', usersRouter);

io.on('connection', (socket) => {
    console.log('New user connected');

    socket.on('newMessage', (message, callback) => {
        console.log('newMessage', message);
        //callback('sent');
    });

    //socket.emit('newMessage', generateMessage('Hector','Rikki','Heyyy!'));


    // socket.on('newMessage', (message, callback) => {
    //     socket.emit('newMessage', generateMessage('Hector','Rikki','Heyyy!'));
    //
    // });
});

server.listen(port, ()=>  {
    console.log(`Started up at port ${port}`);
});

module.exports = {app};