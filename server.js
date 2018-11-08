const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const connections_limit = 2;

var players = {};

var player1 = false;
var player2 = false;

app.use(express.static(__dirname));

app.get('/', function(req, res){
    res.sendFile('index.html');
});    

io.on('connect', function(socket){
    
    if (io.engine.clientsCount > connections_limit){
        console.log('Maximun players exceeded');
        console.log('Disconnecting...');
        socket.disconnect();
        return;
    }

    socket.on('playerConnected', function(){
        socket.on('disconnect', function(){
            socket.broadcast.emit('playerDisconnected', socket.id);
            delete players[socket.id];
            console.log('Player disconnected');
        });
        console.log("A player entered the game");
        socket.emit('connectedPlayers', players);   
        var playerNumber = 0;
        if (player1 === false){
            player1 = true;
            playerNumber = 1;
        }else if (player2 === false){
            player2 = true;
            playerNumber = 2;
        }else{
            player1 = true;
            player2 = false;
            playerNumber = 1;
        }
        players[socket.id] = {
            x: Math.floor(Math.random() * 500) + 15,
            y: Math.floor(Math.random() * 500) + 15,
            playerNumber: playerNumber,
            playerId: socket.id
        }; 

        io.sockets.emit('newPlayer', players[socket.id]);
        
    });

    
});

server.listen(8080, function(){
    console.log("Server on, listening to port 8080");
}); 