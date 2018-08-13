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
  // print welcome message to user
  if (io.engine.clientsCount == 1) {
    socket.emit('chat message', "You're the first one here, lucky you!");
  } else if (io.engine.clientsCount == 2) {
    socket.emit('chat message', "Hello! " + users.slice(0, -1) + " is already here!");
  } else {
    socket.emit('chat message', "Hello! " + users.slice(0, -1).join(" and ") + " are already here!");
  }

  // add user to AllPlayers room as well as their own individual room 
  socket.join("AllPlayers");
  socket.join("Player " + io.engine.clientsCount.toString());
    
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });

  // Message to everybody and individual messages to players
  if (io.engine.clientsCount == 4) {
    io.in('AllPlayers').emit('chat message', "Let's play some sharts!");
    io.to("Player 1").emit('chat message', "Hi Player 1");
    io.to("Player 2").emit('chat message', "Hi Player 2");
    io.to("Player 3").emit('chat message', "Hi Player 3");
    io.to("Player 4").emit('chat message', "Hi Player 4");
  }

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
    io.in('AllPlayers').emit('chat message', name + " just logged on!");
    users.push(name);
  });
});


http.listen(port, function(){
  console.log('listening on *:' + port);
});


// game logic, card shuffling, etc below
CARD_ORDER = {
    '2'     : 0,
    '3'     : 1,
    '4'     : 2,
    '5'     : 3,
    '6'     : 4,
    '7'     : 5,
    '8'     : 6,
    '9'     : 7,
    '10'    : 8,
    'Jack'  : 9,
    'Queen' : 10,
    'King'  : 11,
    'Ace'   : 12
};

function deal() {
  suits = ["Hearts", "Clubs", "Diamonds", "Spades"];
  faces = ["Jack", "Queen", "King", "Ace"];
  cards = [];
  for (i = 0; i < 4; i++) {
    for (j = 2; j < 11; j++) {
      newCard = [j.toString(), suits[i]];
      cards.push(newCard);
    }
    for (k = 0; k < 4; k++) {
      newCard = [faces[k], suits[i]];
      cards.push(newCard);
    }
  }
};

deal();
