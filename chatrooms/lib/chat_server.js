var socketio = require('socket.io');

var io;
var guestNumber = 1;
var nickNames = {};
var namesUsed = [];
var currentRoom = {};

exports.listen = function(server) {
    io = socketio.listen(server);
    io.set('log level', 1);

    io.sockets.on('connection', function(socket) {
        guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);
        joinRoom(socket, 'Lobby');

        handleMessageBroadcasting(socket, nickNames);
        handleNameChangeAttempts(socket, nickNames, namesUsed);
        handleRoomJoining(socket);

        socket.on('rooms', function() {
            socket.emit('rooms', io.sockets.manager.rooms);
        });

        handleClientDisconnection(socket, nickNames, namesUsed);
    });
};

function assignGuestName(socket, guestNumber, nickNames, namesUsed) {
    var name = 'Guest' + guestNumber;
    nickNames[socket.id] = name;
    socket.emit('nameResult', {
        success: true,
        name: name
    });
    namesUsed.push(name);
    return 1 + guestNumber;
}

function buildUsersInRoomSummary(room, usersInRoom, socket) {
    var usersInRoomSummary = 'Users currently in ' + room + ':';
    for (var index in usersInRoom) {
        var userSocketId = usersInRoom[index].id;

        if (socket.id = userSocketId)
            continue;
        if (index > 0)
            usersInRoomSummary += ', ';

        usersInRoomSummary += nickNames[userSocketId];
    }
    usersInRoomSummary += '.';

    return usersInRoomSummary;
}

function joinRoom(socket, room) {
    socket.join(room);
    currentRoom[socket.id] = room;

    socket.emit('joinResult', {room: room});
    socket.broadcast.to(room).emit('message', {
        text: nickNames[socket.id] + ' has joined ' + room + '.'
    });

    var usersInRoom = io.sockets.clients(room);
    if (usersInRoom.length > 1) {
        socket.emit('message', {
            text: buildUsersInRoomSummary(room, usersInRoom, socket)
        });
    }
}

function savePreviousNames(nickNames, socket, namesUsed, name) {
    var previousName = nickNames[socket.id];
    var previousNameIndex = namesUsed.indexOf(previousName);

    namesUsed.push(name);
    nickNames[socket.id] = name;
    delete namesUsed[previousNameIndex];

    return previousName;
}

function handleNameChangeAttempts(socket, nickNames, namesUsed) {
    socket.on('nameAttempt', function(name) {
        if (name.indexOf('Guest') == 0) {
            emitNameFail(socket, 'Names cannot begin with Guest');
            return;
        }

        if (namesUsed.indexOf(name) == -1) {
            var previousName = savePreviousNames(nickNames, socket, namesUsed, name);
            emitNameSuccess(socket, name);
            socket.broadcast.to(currentRoom[socket.id]).emit('message', {
                text: previousName + ' is known as ' + name + '.'
            });
        } else {
            emitNameFail(socket, 'That name is already in use');
        }
    });
}

function emitNameFail(socket, message) {
    socket.emit('nameResult', {
        success: false,
        message: message
    });
}

function emitNameSuccess(socket, name) {
    socket.emit('nameResult', {
        success: true,
        name: name
    });
}

function handleMessageBroadcasting(socket) {
    socket.on('message', function(message) {
        socket.broadcast.to(message.room).emit('message', {
            text: nickNames[socket.id] + ': ' + message.text
        });
    });
}

function handleRoomJoining(socket) {
    socket.on('join', function(room) {
        socket.leave(currentRoom[socket.id]);
        joinRoom(socket, room.newRoom);
    });
}

function handleClientDisconnection(socket) {
    socket.on('disconnect', function() {
        var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
        delete namesUsed[nameIndex];
        delete nickNames[socket.id];
    });
}