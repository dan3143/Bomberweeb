export default class Game extends Phaser.Scene {
    
    constructor(){
        super({key: 'Game'});
        this.speed = 300;
        this.state = 0;
    }
    
    preload(){
        this.load.spritesheet('fox', 'assets/sprites/sprite_fox.png', {frameWidth: 32, frameHeight: 60});    
    }
    
    create(){
        this.cursors = this.input.keyboard.createCursorKeys();
        this.player = this.physics.add.sprite(100, 100, 'fox');
        
        this.player.setCollideWorldBounds(true);

        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers('fox', { start: 8, end: 11 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers('fox', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('fox', { start: 12, end: 15 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('fox', { start: 4, end: 7 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'steady_up',
            frames: [{key:'fox', frame:8}],
            frameRate: 5,
        });
        this.anims.create({
            key: 'steady_down',
            frames: [{key:'fox', frame:0}],
            frameRate: 5,
        });
        this.anims.create({
            key: 'steady_left',
            frames: [{key:'fox', frame:12}],
            frameRate: 5,
        });
        this.anims.create({
            key: 'steady_right',
            frames: [{key:'fox', frame:4}],
            frameRate: 5,
        });
    }
    
    update(){
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