import MainMenu from './MainMenu.js';

export default class EndScene extends Phaser.Scene {
    
    constructor(){
        super({key: 'EndScene'});
    }

    init(data){
        this.winnerPlayer = data.player;
    }

    preload(){
    }

    create(){
        
        this.socket = io();
        this.socket.emit('winnerOpened');
        this.graphics = this.add.graphics({fillStyle: {color: 0x000000}});
        var rect = new Phaser.Geom.Rectangle(0, 0, 700, 600);
        this.graphics.fillRectShape(rect);
        this.add.text(200, 200, "Ganó " + this.winnerPlayer, { font: "40px Monospace", fill: "#FFFFFF" }),
        this.again = this.add.text(245, 265, "Jugar otra vez", {font:"20px Monospace", fill: "#FFFFFF"}).setInteractive({ useHandCursor: true  } );
        var self = this;
        this.again.on('pointerover', function(){
            self.again.setText("> Jugar otra vez <");
            self.again.x-=25;
        });

        this.again.on('pointerout', function(){
            self.again.setText("Jugar otra vez");
            self.again.x+=25;
            self.again.setColor("#FFFFFF");
        });

        this.again.on('pointerdown', function(){
            self.again.setColor("#000000");
            self.scene.stop('Game');
            self.scene.start('MainMenu');
            self.socket.disconnect();
        });

        this.again.on('pointerup', function(){
            self.again.setColor("#FFFFFF");
        });
    }

    update(){

    }

}