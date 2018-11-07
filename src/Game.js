export default class Game extends Phaser.Scene {
    
    constructor(){
        super({key: 'Game'});
        this.speed = 300;
        this.state = 0;
    }
    
    preload(){
<<<<<<< HEAD
        this.load.spritesheet('fox', 'assets/sprites/sprite_fox.png', {frameWidth: 32, frameHeight: 60});
        this.load.spritesheet('girl', 'assets/sprites/player2.png',{frameWidth:19,frameHeight:29});
        
=======
        this.load.spritesheet('fox', 'assets/sprites/sprite_fox.png', {frameWidth: 32, frameHeight: 60});    
>>>>>>> f103fdf4a246dc7f365a5738cc45b44d8545a3e7
    }
    
    create(){
        this.cursors = this.input.keyboard.createCursorKeys();
<<<<<<< HEAD
        this.fox = this.physics.add.sprite(100, 100, 'fox');
        this.girl = this.physics.add.sprite(500, 500, 'girl');
        
        this.fox.setCollideWorldBounds(true);
        this.girl.setCollideWorldBounds(true);
        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers('girl', { start: 6, end: 8 }),
            frameRate: 5,
            repeat: -1
        });
        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers('girl', { start: 3, end: 5 }),
            frameRate: 5,
            repeat: -1
        });
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('girl', { start: 0, end: 2 }),
            frameRate: 5,
            repeat: -1
        });
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('girl', { start: 9, end: 11 }),
            frameRate: 5,
            repeat: -1
        });
        this.anims.create({
            key: 'steady',
            frames: [{key:'fox', frame:6}],
            frameRate: 5,
            repeat: -1
        });
  
=======
        this.player = this.physics.add.sprite(100, 100, 'fox');
        
        this.player.setCollideWorldBounds(true);

>>>>>>> f103fdf4a246dc7f365a5738cc45b44d8545a3e7
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
<<<<<<< HEAD
            this.fox.anims.play('steady', true);
        

        this.girl.setVelocity(0);
        
        if (this.cursors.left.isDown){
            this.girl.setVelocityX(-this.speed);
            this.girl.anims.play('left', true);
        }else if (this.cursors.right.isDown){
            this.girl.setVelocityX(this.speed);
            this.girl.anims.play('right', true);
        }else if (this.cursors.up.isDown){
            this.girl.setVelocityY(-this.speed);
            this.girl.anims.play('up', true);
        }else if (this.cursors.down.isDown){
            this.girl.setVelocityY(this.speed);
            this.girl.anims.play('down', true);
        }else{
            this.fox.anims.play('steady', true);
=======
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
>>>>>>> f103fdf4a246dc7f365a5738cc45b44d8545a3e7
        }
    }
}