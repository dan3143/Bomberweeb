export default class Game extends Phaser.Scene {
    
      

    constructor(){
        super({key: 'Game'});
        this.state = 0;
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
        
    }

    initialize(){
        this.socket = io();
        this.socket.emit('playerConnected');
        this.cursors = this.input.keyboard.createCursorKeys();
        this.createAnimations();
        this.players = this.physics.add.group();
        
        var self = this;
        this.socket.on('newPlayer', function(player){
            console.log('Adding new player...');
            self.addPlayer(player);
        });

        this.socket.on('connectedPlayers', function(players){
            console.log('Adding new players...');
            Object.keys(players).forEach(function(id){
                self.addPlayer(players[id]);
            });
        });

        this.socket.on('newPlayer', function(player){
            self.addPlayer(player);
        });

        this.socket.on('playerDisconnected', function(playerToDeleteId){
            self.players.getChildren().forEach(function(currentPlayer){
                if (currentPlayer.playerId === playerToDeleteId) {
                    console.log('Player '+ currentPlayer.playerNumber +': destroying...');
                    currentPlayer.destroy();
                }
            })
        });
    }

    addPlayer(player){
        if (player.playerId === this.socket.id){
            console.log('It\'s me');
            this.add.text(20, 10, "Player " + player.playerNumber, { font: "20px Courier", fill: "#AED7F1" });
        }
        const otherPlayer = this.physics.add.sprite(player.x, player.y, player.playerNumber == 1 ? 'player1' : 'player2');
        otherPlayer.playerId = player.playerId; 
        otherPlayer.playerNumber = player.playerNumber;
        otherPlayer.setCollideWorldBounds(true);
        this.players.add(otherPlayer);
    }

    createAnimations(){
        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers('player', { start: 8, end: 11 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('player', { start: 12, end: 15 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player', { start: 4, end: 7 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'steady_up',
            frames: [{key:'player', frame:8}],
            frameRate: 5,
        });
        this.anims.create({
            key: 'steady_down',
            frames: [{key:'player', frame:0}],
            frameRate: 5,
        });
        this.anims.create({
            key: 'steady_left',
            frames: [{key:'player', frame:12}],
            frameRate: 5,
        });
        this.anims.create({
            key: 'steady_right',
            frames: [{key:'player', frame:4}],
            frameRate: 5,
        });
    }

    move(){
        this.player.setVelocity(0);
        if (this.cursors.left.isDown){
            this.player.setVelocityX(-this.speed);
            this.player.anims.play('left', true);
            this.state = 2;
        }else if (this.cursors.right.isDown){
            this.player.setVelocityX(this.speed);
            this.player.anims.play('right', true);
            this.state = 3;
        }else if (this.cursors.up.isDown){
            this.player.setVelocityY(-this.speed);
            this.player.anims.play('up', true);
            this.state = 0;
        }else if (this.cursors.down.isDown){
            this.player.setVelocityY(this.speed);
            this.player.anims.play('down', true);
            this.state = 1;
        }else{
            switch(this.state){
                case 0:{
                    this.player.anims.play('steady_up', true);
                    break;
                }
                case 1:{
                    this.player.anims.play('steady_down', true);
                    break;
                }
                case 2:{
                    this.player.anims.play('steady_left', true);
                    break;
                }
                case 3:{
                    this.player.anims.play('steady_right', true);
                    break;
                }
            }
        }
    }
}