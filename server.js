const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const connections_limit = 2;
const port=process.env.PORT || 3000

var players = {};
var numberOfPLayers = 0;
var numberOfPLayersWaiting = 0;
var player1 = false;
var player2 = false;


app.use(express.static(__dirname));

app.get('/', function(req, res){
    res.sendFile('index.html');
});    

io.on('connect', function(socket){

    socket.on('playerWaiting', function(){
        numberOfPLayersWaiting++;
        console.log('numberOfPlayersWaiting: ' + numberOfPLayersWaiting);
        if (numberOfPLayersWaiting > 2){
            console.log("Sorry fam, we're complete");
            numberOfPLayersWaiting--;
            socket.disconnect();
            return;
        }
        socket.on('disconnect', function(){
            numberOfPLayersWaiting--;
            console.log('numberOfPlayersWaiting: ' + numberOfPLayersWaiting);   
            io.sockets.emit('notAllPlayersReady');
        });
        socket.on('ready', function(){
            socket.broadcast.emit('go');
        });
        if (numberOfPLayersWaiting == 2){
            io.sockets.emit('allPlayersReady');
        }
    });
    
    socket.on('playerConnected', function(){
        numberOfPLayers++;
        console.log("A player entered the game");
        console.log("Number of players: " + numberOfPLayers + "\n");
        if (numberOfPLayers > connections_limit){
            numberOfPLayers--;
            console.log('Maximun players exceeded');
            console.log('Disconnecting...');
            console.log('Number of players: ' + numberOfPLayers + "\n");
            socket.disconnect();
            
            return;
        }

        numberOfPLayersWaiting = 0;
        socket.on('disconnect', function(){
            numberOfPLayers--;
            socket.broadcast.emit('playerDisconnected', socket.id);
            console.log('Number of players: ' + numberOfPLayers + "\n");
            for (var id in players){
                if (id !== socket.id){
                    io.sockets.emit('winner', players[id].playerNumber);
                    break;
                }
            }
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
        
        socket.on('bombPlacement', function(bombPlacementInformation){
            io.sockets.emit('bombPlaced', bombPlacementInformation);
        });

        socket.on('enemyBombExplosion', function(enemyBombId){
            io.sockets.emit('enemyBombExploded', enemyBombId);
        });

        socket.on('removeTileAt', function(tilePosition){
            socket.broadcast.emit('tileRemoved', tilePosition);
        });

        socket.on('playerKilledNotification', function(playerId){
            io.sockets.emit('playerKilled', playerId);
            
            for (var id in players){
                if (id !== playerId){
                    io.sockets.emit('winner', players[id].playerNumber);
                    break;
                }
            }
        });

        socket.on('winnerOpened', function(){
            players = {};
        });
        
        socket.emit('connectedPlayers', players);   
        
        players[socket.id] = {
            x: 0,
            y: 0,
            playerNumber: getPlayerNumber(),
            playerId: socket.id
        };
        
        io.sockets.emit('newPlayer', players[socket.id]);
    });
});

function getPlayerNumber(){
    if (player1 === false){
        player1 = true;
        return 'player1';
    }else if (player2 === false){
        player2 = true;
        return 'player2';
    }else{
        player1 = true;
        player2 = false;
        return 'player1';
    }
}

server.listen(port, function(){
    console.log("Server on, listening to port " + port);
}); 