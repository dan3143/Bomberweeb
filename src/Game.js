export default class Game extends Phaser.Scene {
    
    constructor(){
        super({key: 'Game'});
        this.speed = 300;
    }
    
    preload(){
        this.load.spritesheet('player1', 'assets/sprites/player1.png', {frameWidth: 32, frameHeight: 60});
        this.load.spritesheet('player2', 'assets/sprites/player2.png', {frameWidth: 28, frameHeight: 54});
    }
    
    create(){
        this.initialize();
    }

    update(){
        this.movePlayer();
    }

    initialize(){
        this.socket = io();
        this.cursors = this.input.keyboard.createCursorKeys();
        this.players = this.physics.add.group();
        var self = this;

        this.socket.emit('playerConnected');
        
        this.socket.on('newPlayer', function(player){
            self.addPlayer(player);
        });

        this.socket.on('connectedPlayers', function(players){
            Object.keys(players).forEach(function(id){
                self.addPlayer(players[id]);
            });
        });

        this.socket.on('playerDisconnected', function(playerToDeleteId){
            self.players.getChildren().forEach(function(currentPlayer){
                if (currentPlayer.playerId === playerToDeleteId) {
                    currentPlayer.destroy();
                }
            })
        });

        this.socket.on('playerMoved', function(movementInformation){
            self.players.getChildren().forEach(function(currentPlayer){
                if (currentPlayer.playerId === movementInformation.playerId){
                    currentPlayer.x = movementInformation.x;
                    currentPlayer.y = movementInformation.y;
                    currentPlayer.anims.play(movementInformation.animation, true);
                }
            });
        });
    }

    addPlayer(player){
        const playerNumber = player.playerNumber;
        this.createAnimations(playerNumber);
        if (player.playerId === this.socket.id){
            this.player = this.physics.add.sprite(player.x, player.y, playerNumber);
            this.player.playerNumber = playerNumber;
        }else{
            const otherPlayer = this.physics.add.sprite(player.x, player.y, player.playerNumber);
            otherPlayer.playerId = player.playerId; 
            otherPlayer.setCollideWorldBounds(true);
            this.players.add(otherPlayer);
        }
    }   

    createAnimations(playerNumber){
        this.anims.create({
            key: 'up' + playerNumber,
            frames: this.anims.generateFrameNumbers(playerNumber, { start: 8, end: 11 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'down' + playerNumber,
            frames: this.anims.generateFrameNumbers(playerNumber, { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'left' + playerNumber,
            frames: this.anims.generateFrameNumbers(playerNumber, { start: 12, end: 15 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'right' + playerNumber,
            frames: this.anims.generateFrameNumbers(playerNumber, { start: 4, end: 7 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'steady_up' + playerNumber,
            frames: [{key:playerNumber, frame:8}],
            frameRate: 5,
        });
        this.anims.create({
            key: 'steady_down' + playerNumber,
            frames: [{key:playerNumber, frame:0}],
            frameRate: 5,
        });
        this.anims.create({
            key: 'steady_left' + playerNumber,
            frames: [{key:playerNumber, frame:12}],
            frameRate: 5,
        });
        this.anims.create({
            key: 'steady_right' + playerNumber,
            frames: [{key:playerNumber, frame:4}],
            frameRate: 5,
        });
    }

    movePlayer(){
        if (this.player) {
            if (!this.player.direction) this.player.direction = 'steady_down' + this.player.playerNumber;
            var animation = 'steady_down' + this.player.playerNumber;
            this.player.setVelocity(0);
            
            if (this.cursors.left.isDown){
                this.player.setVelocityX(-this.speed);
                animation = 'left' + this.player.playerNumber;
                this.player.direction = 'steady_left' + this.player.playerNumber;
            }else if (this.cursors.right.isDown){
                this.player.setVelocityX(this.speed);
                animation = 'right' + this.player.playerNumber;
                this.player.direction = 'steady_right' + this.player.playerNumber;
            }else if (this.cursors.up.isDown){
                this.player.setVelocityY(-this.speed);
                animation = 'up' + this.player.playerNumber;
                this.player.direction = 'steady_up' + this.player.playerNumber;
            }else if (this.cursors.down.isDown){
                this.player.setVelocityY(this.speed);
                animation = 'down' + this.player.playerNumber;
                this.player.direction = 'steady_down' + this.player.playerNumber;
            }else{
                animation = this.player.direction;
            }
            this.player.anims.play(animation, true);
            this.socket.emit('movement', {x: this.player.x, y: this.player.y, animation: animation});
        }
    }     
}