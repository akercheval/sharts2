var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

var users = [];

app.get('/', function(req, res){
  res.sendFile(__dirname + '/login.html');
});

app.get('/home', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  if (io.engine.clientsCount == 1) {
    io.emit('chat message', "You're the first one here, lucky you!");
  } else {
    io.emit('chat message', "Hello! " + users.slice(0, -1).join(" and ") + " are already here!");
  }
  
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });

  // This fires at weird times. Try uncommenting it and look at the console when you use the page.
  // Also, every time it fires it reduces io.engine.clientsCount by one (I think?) which screws up
  // the ability to tell how many people are online, which we need
  /*
  socket.on('disconnect', function() {
    console.log("disconnection");
    io.sockets.emit('chat message', "somebody logged off!");
    io.sockets.emit('chat message', "There are now " + io.engine.clientsCount + " people online.");
  });
  */
  
  socket.on('name', function(name) {
    io.emit('chat message', name + " just logged on!");
    users.push(name);
    io.emit('chat message', "There are now " + io.engine.clientsCount + " people online.");
  });
});


http.listen(port, function(){
  console.log('listening on *:' + port);
});
