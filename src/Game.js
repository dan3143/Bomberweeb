export default class Game extends Phaser.Scene {
    
    constructor(){
        super({key: 'Game'});
        this.speed = 300;
    }
    
    preload(){
        this.load.image('tiles',"assets/maps/2Gen's 64x64 Mixed Tileset.png");
        this.load.tilemapTiledJSON('map','assets/maps/map.json');
        this.load.spritesheet('player1', 'assets/sprites/player1.png', {frameWidth: 32, frameHeight: 60});
        this.load.spritesheet('player2', 'assets/sprites/player2.png', {frameWidth: 28, frameHeight: 54});
    }
    createMap(){
        this.map = this.make.tilemap({key:'map'});
        this.tileset = this.map.addTilesetImage("2Gen's 64x64 Mixed Tileset",'tiles');
        this.decor = this.map.createStaticLayer('decor', this.tileset, 0, 0);
        this.decor.setCollisionByProperty({collides: true});
    }
    create(){
        this.initialize();
    }

    update(){
        this.movePlayer();
    }

    initialize(){
        this.createMap();
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
            const spawnPoint = this.map.findObject("Objects", obj => obj.name === ('spawn' + playerNumber));
            this.player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, playerNumber);
            this.player.playerNumber = playerNumber;
            this.physics.add.collider(this.player, this.decor);
            this.addCamera();
            this.socket.emit('movement', {x: this.player.x, y: this.player.y, animation: 'steady_down' + playerNumber});
            
        }else{
            
            const otherPlayer = this.physics.add.sprite(player.x, player.y, player.playerNumber);
            otherPlayer.playerId = player.playerId; 
            otherPlayer.setCollideWorldBounds(true);
            this.players.add(otherPlayer);
        }
    }   

    addCamera(){
        this.cameras.main.setBounds(0, 0, 1923, 1923);
        this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
        this.cameras.main.setZoom(0.409);
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