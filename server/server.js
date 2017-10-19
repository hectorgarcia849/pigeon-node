require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const socketIO = require('socket.io');
const http = require('http');
const jwt = require('jsonwebtoken');
const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose'); //connects to db
const {pigeonsRouter} = require('./routes/pigeons');
const {profileRouter} = require('./routes/profile');
const {usersRouter} = require('./routes/users');
const {User, Chat, Messages, Message} = require('@softwaresamurai/pigeon-mongo-models');
// const {User} = require('./models/user');
//const {Chat, Messages, Message} = require('./models/chat');

const app = express();
var server = http.createServer(app);
var io = socketIO(server, {
    pingInterval: 10000,
    pingTimeout: 5000
});

const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());
app.use('/pigeons', pigeonsRouter);
app.use('/profile', profileRouter);
app.use('/users', usersRouter);

//socket server
io.use((socket, next) => {
    let token = socket.handshake.query.token;
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if(err){
            next(new Error('Not Authenticated'));
        }
        next();
    });
    next(new Error('authentication error'));
});

io.on('connection', (socket) => {
    const user = {userId: jwt.decode(socket.handshake.query.token)._id, socketId: socket.id};
    console.log(`User: ${user.userId} SockedId: ${user.socketId} connected`);

    socket.on('message', (body, callback) => {
        console.log(`User ${user.userId} sent message ${body.message}`);
        /*
         *   user sends the relevant messages._id, create a new message object,
         *   find and update the relevant messages,
         *   emit the message, send callback with confirmation
         */

        const message = {from: body.message.from, to: body.message.to, message: body.message.message, timestamp: new Date().getTime()};
        console.log(message);

        Messages.findByIdAndUpdate(ObjectID(body.messages_id), {$push: {messages: message}})
            .then(() => {
                io.to(body.chat_id).emit('message', message);
            })
            .catch((e) => console.log(e));
        callback('sent');
    });


    socket.on('newChat', (msg, callback) => {


    });

    socket.on('newMessage', (msg, callback) => {
        //newMessage implies a new room must be created, will create a new ChatRoomModel, store members, created, and all messages.
        const newRoom = new ObjectID();
        socket.join(newRoom.toHexString(), () => {
            console.log(`User: ${user.userId} created and joined room:  ${Object.keys(socket.rooms)}` );

            const messages = new Messages(
                {
                    _id: new ObjectID(),
                    messages:[{from: ObjectID(msg.from), to: ObjectID(msg.to), message: msg.message, timestamp: new Date().getTime()}]
                });
            const chat = new Chat({_id: newRoom, created: new Date().getTime(), members:[ObjectID(msg.from), ObjectID(msg.to)], messages:ObjectID(messages._id)});

            messages.save()
                .then((messages) => {
                    chat.save()
                        .then((chat) => {
                            console.log('--- messages, chat created ---', chat);
                            Messages.findById(ObjectID(chat.messages))
                                .then((messages) => {
                                    console.log(messages.message[0]);
                                    io.to(newRoom.toHexString())
                                        .emit('message', messages.messages[0], callback('sent', {chat_id: chat._id.toHexString(), messages_id: chat.messages.toHexString()}));
                        });
                    });
                })
                .catch((e) => {console.log(e, 'Error could not create chat');
                return callback('not sent');});
        })
    });

    socket.on('leave chat', () => {

    });

    socket.on('disconnect', () => {
        console.log(`User: ${user.userId} SockedId: ${user.socketId} disconnected`);
    });
});

server.listen(port, ()=>  {
    console.log(`Started up at port ${port}`);
});

module.exports = {app};