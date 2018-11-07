export default class Game extends Phaser.Scene {
    
    constructor(){
        super({key: 'Game'});
        this.speed = 200;
    }
    
    preload(){
        this.load.spritesheet('fox', '/../assets/sprites/sprite_fox.png', {frameWidth: 32, frameHeight: 60});
        
    }
    
    create(){
        this.cursors = this.input.keyboard.createCursorKeys();
        this.fox = this.physics.add.sprite(100, 100, 'fox');
        
        this.fox.setCollideWorldBounds(true);

        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers('fox', { start: 8, end: 11 }),
            frameRate: 5,
            repeat: -1
        });
        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers('fox', { start: 0, end: 3 }),
            frameRate: 5,
            repeat: -1
        });
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('fox', { start: 12, end: 15 }),
            frameRate: 5,
            repeat: -1
        });
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('fox', { start: 4, end: 7 }),
            frameRate: 5,
            repeat: -1
        });
        this.anims.create({
            key: 'steady',
            frames: [{key:'fox', frame:0}],
            frameRate: 5,
            repeat: -1
        });
    }
    
    update(){
        this.fox.setVelocity(0);
        
        if (this.cursors.left.isDown){
            this.fox.setVelocityX(-this.speed);
            this.fox.anims.play('left', true);
        }else if (this.cursors.right.isDown){
            this.fox.setVelocityX(this.speed);
            this.fox.anims.play('right', true);
        }else if (this.cursors.up.isDown){
            this.fox.setVelocityY(-this.speed);
            this.fox.anims.play('down', true);
        }else if (this.cursors.down.isDown){
            this.fox.setVelocityY(this.speed);
            this.fox.anims.play('up', true);
        }else{
            this.fox.anims.play('steady', true);
        }
    }
}