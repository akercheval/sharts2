var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

var users = 0;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  users += 1;
  io.emit('chat message', "somebody else has joined!");
  io.emit('chat message', "There are now " + io.engine.clientsCount + " people online.");
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
  socket.on('disconnect', function() {
    io.sockets.emit('chat message', "somebody logged off :(");
    io.sockets.emit('chat message', "There are now " + io.engine.clientsCount + "people online.");
  });
});


http.listen(port, function(){
  console.log('listening on *:' + port);
});
