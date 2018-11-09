const tile_width = 64;
const tile_height = 64;

export default class Game extends Phaser.Scene {
    

    constructor(){
        super({key: 'Game'});
        this.speed = 300;
        this.canPlantBomb = true;
    }
    
    preload(){
        this.load.image('tiles',"assets/maps/2Gen's 64x64 Mixed Tileset.png");
        this.load.image('bomb', 'assets/sprites/bomb.png');
        this.load.tilemapTiledJSON('map','assets/maps/map.json');
        this.load.spritesheet('player1', 'assets/sprites/player1.png', {frameWidth: 32, frameHeight: 60});
        this.load.spritesheet('player2', 'assets/sprites/player2.png', {frameWidth: 28, frameHeight: 54});
    }

    create(){
        this.initialize();
    }

    initialize(){
        this.createMap();
        this.socket = io();
        this.cursors = this.input.keyboard.createCursorKeys();
        this.players = this.physics.add.group();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
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
    
    createMap(){
        this.map = this.make.tilemap({key:'map'});
        this.tileset = this.map.addTilesetImage("2Gen's 64x64 Mixed Tileset",'tiles');
        this.decor = this.map.createStaticLayer('decor', this.tileset, 0, 0);
        this.decor.setCollisionByProperty({collides: true});
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

    addCamera(){
        this.cameras.main.setBounds(0, 0, 1923, 1923);
        this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
        this.cameras.main.setZoom(0.409);
    }
    
    update(){
        this.movePlayer();
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
            if(this.spaceKey.isDown){
                this.createBomb();
            }
            this.player.anims.play(animation, true);
            this.socket.emit('movement', {x: this.player.x, y: this.player.y, animation: animation});
        }
    } 

    createBomb(){
        if (this.canPlantBomb){
            this.canPlantBomb = false;
            if (!this.image) {
                this.setBomb();
            } 
        }
        this.updateCanPlantBombs();
    }

    setBomb(){
        self = this;
        this.decor.forEachTile(function(tile){
            if (self.tileContainsPoint(tile, self.player.x, self.player.y)){
                const bomb_x = tile.x*tile_width+tile_width/2;
                const bomb_y = tile.y*tile_height+tile_height/2;
                self.socket.emit('bombPlacement', {x: bomb_x, y: bomb_y});
                self.image = self.physics.add.image(bomb_x, bomb_y, 'bomb').setScale(0.3);        
            }
        });
        this.time.delayedCall(2000, function(){
            self.socket.emit('enemyBombExploded');
            this.image.destroy();
            delete this.image;
        }, [], this);
    }

    tileContainsPoint(tile, x, y){
        return x >= tile.x * tile_width && x <= tile.x * tile_width + tile_width
               && y >= tile.y * tile_height && y <= tile.y * tile_height + tile_height;
    }

    updateCanPlantBombs(){
        if (!this.bombEvent){
            this.bombEvent = this.time.delayedCall(3000, () => this.canPlantBomb = true, [], this);
        }else{
            delete this.bombEvent;
        }
    }

    
}