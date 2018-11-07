export default class Game extends Phaser.Scene {
    constructor(){
        super({key: 'Game'});
    }
    
    preload(){
        this.load.spritesheet('fox', 'assets/sprites/sprite_fox.png', {frameWidth: 32, frameHeight: 60});
    }
    
    create(){
        this.fox = this.physics.add.sprite('fox', 0, 0);
    }

    update(){
        
    }
}