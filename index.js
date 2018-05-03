// Setup basic express server
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log('Server listening at Port %d', port);
  //console.log("Visit - " + "http://localhost:3000/");
});

// Routing
app.use(express.static(path.join(__dirname, 'public')));

// Chatroom
var numOfUsers = 0;

io.on('connection', (socket) => {

  var addedUser = false;

  // when the client emits 'new message', this listens and executes
  socket.on('new message', (data) => {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', (username) => {
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    ++numOfUsers;
    addedUser = true;
    socket.emit('login', {
      numOfUsers: numOfUsers
    });
    // echo globally (all clients) that a person has connected

    socket.broadcast.emit('user joined', {
      username: socket.username,
      numOfUsers: numOfUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', () => {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', () => {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', () => {
    if (addedUser) {
      --numOfUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numOfUsers: numOfUsers
      });
    }
  });
});