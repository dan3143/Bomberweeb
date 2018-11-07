const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

app.use(express.static(__dirname));

app.get('/', function(req, res){
    res.sendFile('index.html');
});    

server.listen(8080, function(){
    console.log("Server on, listening to port 8080");
}); 