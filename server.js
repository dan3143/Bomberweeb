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

        socket.on('movement', function(movementInfo){
            players[socket.id].x = movementInfo.x;
            players[socket.id].y = movementInfo.y;
            socket.broadcast.emit('playerMoved', {
                x: movementInfo.x, 
                y: movementInfo.y, 
                animation: movementInfo.animation, 
                playerId: socket.id
            });
        });
        
        console.log("A player entered the game");
        socket.emit('connectedPlayers', players);   
        
        players[socket.id] = {
            x: Math.floor(Math.random() * 500) + 15,
            y: Math.floor(Math.random() * 500) + 15,
            playerNumber: getPlayerNumber(),
            playerId: socket.id
        }; 
        io.sockets.emit('newPlayer', players[socket.id]);
    });
});

function getPlayerNumber(){
    if (player1 === false){
        player1 = true;
        return 1;
    }else if (player2 === false){
        player2 = true;
        return 2;
    }else{
        player1 = true;
        player2 = false;
        return 1;
    }
}

server.listen(8080, function(){
    console.log("Server on, listening to port 8080");
}); 