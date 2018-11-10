
const tileWidth = 64;
const tileHeight = 64;

export default class Game extends Phaser.Scene {
    
    //TODO: mostrar explosiones en un rango, evitando a los objetos intestructibles

    constructor(){
        super({key: 'Game'});
        this.speed = 300;
        this.canPlantBomb = true;
        this.range = 1;
    }
    
    preload(){
        this.load.image('tiles',"assets/maps/2Gen's 64x64 Mixed Tileset.png");
        this.load.tilemapTiledJSON('map','assets/maps/map.json');
        this.load.spritesheet('player1', 'assets/sprites/player1.png', {frameWidth: 32, frameHeight: 60});
        this.load.spritesheet('player2', 'assets/sprites/player2.png', {frameWidth: 28, frameHeight: 54});
        this.load.spritesheet('bomb', 'assets/sprites/bombSprite.png', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('explosion_center', 'assets/sprites/explosion_center.png', {frameWidth: 64, frameHeight: 64});
        this.load.spritesheet('explosion_half', 'assets/sprites/explosion_half.png', {frameWidth: 64, frameHeight: 64});
        this.load.spritesheet('explosion_end', 'assets/sprites/explosion_end.png', {frameWidth: 64, frameHeight: 64});
        this.load.spritesheet('death', 'assets/sprites/deathSprite.png', {frameWidth: 64, frameHeight: 64});
    }

    create(){
        this.initialize();
    }

    initialize(){
        this.createMap();
        this.socket = io();
        this.cursors = this.input.keyboard.createCursorKeys();
        this.players = this.physics.add.group();
        this.bombs = this.physics.add.staticGroup();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.cooldown = this.add.text(16, 550, '',
            {font: "18px monospace"})
            .setScrollFactor(0);
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

        this.socket.on('bombPlaced', function(bombPlacementInformation){
            console.log("Bomb placed");
            var bomb = self.physics.add.sprite(bombPlacementInformation.x, bombPlacementInformation.y, 'bomb');
            bomb.anims.play('bomb_exploding_center', true);
            bomb.id = bombPlacementInformation.id;
            self.bombs.add(bomb);   
        });

        this.socket.on('enemyBombExploded', function(enemyBombId){
            self.bombs.getChildren().forEach(function(currentBomb){
                if (currentBomb.id === enemyBombId){
                    console.log("Destroying bomb...");
                    self.destroyThingsInRange(currentBomb);
                    currentBomb.destroy();
                    
                }
            });
        });

        this.socket.on('tileRemoved', function(tiledRemoved){
            self.map.removeTileAt(tiledRemoved.x, tiledRemoved.y, false, self.decor);
        });

        this.socket.on('playerKilled', function(playerId){
            if (playerId === self.socket.id){
                self.killThisPlayer();
            }else{
                self.players.getChildren().forEach(function(player){
                    if(player.playerId === playerId){
                        var x = player.x;
                        var y = player.y;
                        player.destroy();
                        player = self.physics.add.sprite(x, y, 'death');
                        player.anims.play('death', true);
                    }
                });
            }
            
        });
    }

    killThisPlayer(){
        var x = this.player.x;
        var y = this.player.y;
        this.player.destroy();
        this.player = this.physics.add.sprite(x, y, 'death');
        this.player.alive = false;
        this.player.anims.play('death', true);
    }

    destroyThingsInRange(bombInfo){
        var bombTile = this.map.getTileAtWorldXY(bombInfo.x, bombInfo.y, true, this.cameras.main, this.background);
        var self = this;
        this.background.forEachTile(function(currentTile){
            if (self.tileInRange(bombTile, currentTile, self.range)) {
                self.playExplosionAnimationAtTile(currentTile, currentTile.y != bombTile.y);
            }else if (self.distanceBetween(currentTile, bombTile) === self.range){
                self.playExplosionAtEnd(currentTile, bombTile.y != currentTile.y, bombTile.x >= currentTile.x);
            }
        });
        this.decor.forEachTile(function(currentTile){
            if (currentTile.properties.destroyable){
                if (self.tileInRange(bombTile, currentTile, self.range)){
                    self.map.removeTileAt(currentTile.x, currentTile.y, false, true, self.decor);
                    self.socket.emit('removeTileAt', {x: currentTile.x, y: currentTile.y});
                    self.playExplosionAnimationAtTile(currentTile, currentTile.y != bombTile.y);
                }else if (self.distanceBetween(currentTile, bombTile) === self.range){
                    self.map.removeTileAt(currentTile.x, currentTile.y, false, true, self.decor);
                    self.playExplosionAtEnd(currentTile, bombTile.y != currentTile.y, bombTile.x >= currentTile.x);
                }
            }
            
        });
        var explosion_center = this.physics.add.sprite(bombInfo.x, bombInfo.y, 'bomb');
        explosion_center.anims.play('explosion_center', true);
        this.physics.add.overlap(this.player, explosion_center, this.notifyPlayerKilled, null, this);
        explosion_center.on('animationcomplete', function(){
            explosion_center.destroy();
        });
    }   

    distanceBetween(tile1, tile2){
        return Math.sqrt(Math.pow(tile1.x - tile2.x, 2) + Math.pow(tile1.y - tile2.y, 2));
    }
    
    tileInRange(originTile, destinyTile, range){
        return  (destinyTile.y == originTile.y && destinyTile.x >= originTile.x - range + 1 && destinyTile.x <= originTile.x + range - 1) ||
                (destinyTile.x == originTile.x && destinyTile.y >= originTile.y - range + 1 && destinyTile.y <= originTile.y + range - 1);
    }

    playExplosionAnimationAtTile(tile, vertical){
        var x = tile.x*tileWidth + tileWidth/2;
        var y = tile.y*tileWidth + tileWidth/2;
        var explosion = this.physics.add.sprite(x, y, 'explosion_half');
        if (vertical === true){
            explosion.angle = 90;
        }
        explosion.anims.play('explosion_half', true);
        this.physics.add.overlap(this.player, explosion, this.notifyPlayerKilled, null, this);
        explosion.on('animationcomplete', function(){
            explosion.destroy();
        });
    }

    playExplosionAtEnd(tile, vertical, horizontal){
        var x = tile.x*tileWidth + tileWidth/2;
        var y = tile.y*tileWidth + tileWidth/2;
        var explosion = this.physics.add.sprite(x, y, 'explosion_end');
        if (vertical === true){
            explosion.angle = 90;
        }
        if (horizontal === true){
            explosion.flipX = true;
        }
        explosion.anims.play('explosion_end', true);
        this.physics.add.overlap(this.player, explosion, this.notifyPlayerKilled, null, this);
        explosion.on('animationcomplete', function(){
            explosion.destroy();
        });
    }

    notifyPlayerKilled(){
        this.socket.emit('playerKilledNotification', this.socket.id);
    }

    createMap(){
        this.map = this.make.tilemap({key:'map'});
        this.tileset = this.map.addTilesetImage("2Gen's 64x64 Mixed Tileset",'tiles');
        this.background = this.map.createStaticLayer('background', this.tileset, 0, 0);
        this.decor = this.map.createDynamicLayer('decor', this.tileset, 0, 0);
        this.decor.setCollisionByProperty({collides: true});
    }

    addPlayer(player){
        const playerNumber = player.playerNumber;
        this.createAnimations(playerNumber);
        if (player.playerId === this.socket.id){
            let spawnPoint = this.map.findObject("Objects", obj => obj.name === ('spawn' + playerNumber));
            this.player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, playerNumber);
            this.player.playerNumber = playerNumber;
            this.player.alive = true;
            this.physics.add.collider(this.player, this.decor);
            this.physics.add.collider(this.player, this.bombs);
            
            this.addCamera();
            this.socket.emit('movement', {x: this.player.x, y: this.player.y, animation: 'steady_down' + playerNumber});
            
        }else{
            const otherPlayer = this.physics.add.sprite(player.x, player.y, player.playerNumber);
            otherPlayer.playerId = player.playerId; 
            this.players.add(otherPlayer);
        }
    }   

    createAnimations(playerNumber){
        this.anims.create({
            key: 'bomb_exploding_center',
            frames: this.anims.generateFrameNumbers('bomb', {start: 0, end: 3}),
            frameRate: 2
        });
        this.anims.create({
            key: 'explosion_half',
            frames: this.anims.generateFrameNumbers('explosion_half', {start: 0, end: 6}),
            frameRate: 20
        });
        this.anims.create({
            key: 'explosion_center',
            frames: this.anims.generateFrameNumbers('explosion_center', {start: 0, end: 6}),
            frameRate: 20
        });
        this.anims.create({
            key: 'explosion_end',
            frames: this.anims.generateFrameNumbers('explosion_end', {start: 0, end: 6}),
            frameRate: 20
        });
        this.anims.create({
            key: 'death',
            frames: this.anims.generateFrameNumbers('death', {start: 0, end: 3}),
            frameRate: 10
        });
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
        this.cameras.main.setBounds(0, 0, 832, 832);
        this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
        this.cameras.main.setZoom(1);
    }
    
    update(){
        this.movePlayer();
        this.showCoolDown();
    }

    movePlayer(){
        if (this.player && this.player.alive === true)  {
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
            if (!this.bomb) {
                this.setBomb();
            } 
        }
        this.updateCanPlantBombs();
    }

    setBomb(){
        self = this;
        this.decor.forEachTile(function(tile){
            if (self.tileContainsPoint(tile, self.player.x, self.player.y)){
                const bomb_x = tile.x*tileWidth + tileWidth/2;
                const bomb_y = tile.y*tileHeight + tileHeight/2;
                self.socket.emit('bombPlacement', {x: bomb_x, y: bomb_y, id: self.socket.id});
            }
        });
        this.cooldown.setVisible(true);
        this.time.delayedCall(2000, function(){
            self.socket.emit('enemyBombExplosion', self.socket.id);
        }, [], this);
    }

    tileContainsPoint(tile, x, y){
        return x >= tile.x * tileWidth && x <= tile.x * tileWidth + tileWidth
               && y >= tile.y * tileHeight && y <= tile.y * tileHeight + tileHeight;
    }

    updateCanPlantBombs(){
        if (!this.bombEvent){
            this.cooldown.setVisible(true);
            this.event = this.bombEvent = this.time.delayedCall(3000, () => {
                delete this.event;
                this.canPlantBomb = true
                this.cooldown.setVisible(false);
            }, [], this);
        }else{
            delete this.bombEvent;
        }
    }

    showCoolDown(){
        if (this.event){
            let cooldown = Math.trunc(3 - this.event.getProgress()*3) + 1;
            this.cooldown.setText('Cooldown: ' + cooldown);
        }   
    }
    
}