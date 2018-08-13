var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

var users = [];
numUsers = 0;

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
  console.log(io.engine.clientsCount);

  // add user to AllPlayers room as well as their own individual room 
  socket.join("AllPlayers");
  socket.join("Player " + io.engine.clientsCount.toString());
    
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });

  // Message to everybody and individual messages to players
  if ((io.engine.clientsCount == 4) && (users.length == 4)) {
    hands = deal();
    io.in('AllPlayers').emit('chat message', "Let's play some sharts!");
    io.to("Player 1").emit('chat message', hands['1']);
    io.to("Player 2").emit('chat message', hands['2']);
    io.to("Player 3").emit('chat message', hands['3']);
    io.to("Player 4").emit('chat message', hands['4']);
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

function Comparator(a, b) {
  return CARD_ORDER[a[0]] > CARD_ORDER[b[0]] ? 1 : -1;
}

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
  shuffleArray(cards);
  
  hands = {'1' : [], '2' : [], '3' : [], '4' : []};

  while (cards.length != 0) {
    hands['1'].push(cards.pop());
    hands['2'].push(cards.pop());
    hands['3'].push(cards.pop());
    hands['4'].push(cards.pop());
  }  

  for (i = 1; i < 5; i++) {
    hearts = [];
    clubs = [];
    diamonds = [];
    spades = [];
    for (j = 0; j < hands[i.toString()].length; j++) {
      currentCard = hands[i.toString()][j];
      if (currentCard[1] == "Hearts") hearts.push(currentCard);
      if (currentCard[1] == "Clubs") clubs.push(currentCard);
      if (currentCard[1] == "Diamonds") diamonds.push(currentCard);
      if (currentCard[1] == "Spades") spades.push(currentCard);
    }
    hearts.sort(Comparator);
    clubs.sort(Comparator);
    diamonds.sort(Comparator);
    spades.sort(Comparator);
    hands[i.toString()] = hearts.concat(clubs.concat(diamonds.concat(spades)));
  }
  return hands;
};

// i can't believe there's no built-in shuffle function in javascript?
// then again, i can
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

